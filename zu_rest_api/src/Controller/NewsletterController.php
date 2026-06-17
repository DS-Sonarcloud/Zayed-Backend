<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\zu_public_user\Entity\PublicUser;
use Drupal\Component\Utility\Html;
use Drupal\Core\Session\UserSession;

/**
 * Handles Newsletter subscription via PublicUser entity.
 */
class NewsletterController extends ControllerBase {

  /**
   * POST: Subscribe a PublicUser to newsletter.
   */
  public function postNewsletter(Request $request): JsonResponse {
    $jwtUser = $request->attributes->get('jwt_user');

    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: Invalid or missing JWT token.',
      ], 401);
    }

    $uid = $jwtUser->user_id;

    // Load PublicUser
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $current_user = $storage->load($uid);
    /** @var \Drupal\zu_public_user\Entity\PublicUser $current_user */
    if (!$current_user || !$current_user->get('status')->value) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found or inactive.',
      ], 403);
    }

    $data = json_decode($request->getContent(), TRUE);
    $email = strtolower(trim($data['email'] ?? $current_user->get('email')->value));
    $fcm_token = $data['fcm_token'] ?? '';

    if (empty($email) || !\Drupal::service('email.validator')->isValid($email)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'A valid email address is required.',
      ], 400);
    }

    // Check if email already exists
    $uids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('email', $email)
      ->execute();

    $user = !empty($uids) ? $storage->load(reset($uids)) : NULL;
    $is_new_user = FALSE;

    /**
     * CREATE NEW PUBLIC_USER IF NOT EXIST
     */
    if (!$user) {
      $is_new_user = TRUE;

      // Unique username
      $username_base = explode('@', $email)[0];
      $username = $username_base;
      $counter = 1;

      while ($storage->getQuery()->accessCheck(FALSE)->condition('name', $username)->execute()) {
        $username = $username_base . '_' . $counter++;
      }

      $password = $this->generatePassword(8);
      $password_service = \Drupal::service('password');
      
      $user = PublicUser::create([
        'email' => $email,
        'name' => $username,
        'password' => $password_service->hash($password),
        'status' => 1,
        'fcm_token' => $fcm_token,
        'is_verified' => 0,
      ]);
      $user->save();

      // Send welcome email (Twig)
      $this->sendWelcomeEmail($email, $username, $password);
    }
    else {
      /** @var \Drupal\zu_public_user\Entity\PublicUser $user */
      if ($fcm_token) {
        $user->set('fcm_token', $fcm_token);
        $user->save();
      }
    }

    /**
     * FLAGGING (public_user based)
     */
    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('newsletter_subscribe');

    if (!$flag) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Newsletter flag not found.',
      ], 500);
    }

    // Acting user = same PublicUser
    $acting_user = new UserSession([
      'uid' => $user->id(),
      'name' => $user->get('name')->value,
    ]);

    $flagging = $flagService->getFlagging($flag, $user, $acting_user);

    if (!$flagging) {
      // Subscribe
      $flagService->flag($flag, $user, $acting_user);
      $this->sendSubscribeEmail($email, $user->get('name')->value);
      $message = 'You have successfully subscribed to the newsletter.';
    }
    else {
      $message = 'You are already subscribed to the newsletter.';
    }

    return new JsonResponse([
      'status' => 'success',
      'message' => $message,
      'subscriber' => [
        'id' => $user->id(),
        'email' => $email,
        'fcm_token' => $user->get('fcm_token')->value,
        'is_new_user' => $is_new_user,
      ],
    ]);
  }

  /**
   * DELETE: Unsubscribe from newsletter.
   */
  public function deleteNewsletter(Request $request): JsonResponse {
    $jwtUser = $request->attributes->get('jwt_user');

    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: Invalid or missing JWT.',
      ], 401);
    }

    $uid = $jwtUser->user_id;
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $user = $storage->load($uid);
    /** @var \Drupal\zu_public_user\Entity\PublicUser $user */
    if (!$user || !$user->get('status')->value) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found or inactive.',
      ], 403);
    }

    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('newsletter_subscribe');

    if (!$flag) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Newsletter flag not found.',
      ], 500);
    }

    $acting_user = new UserSession([
      'uid' => $user->id(),
      'name' => $user->get('name')->value,
    ]);

    $flagging = $flagService->getFlagging($flag, $user, $acting_user);

    if (!$flagging) {
      return new JsonResponse([
        'status' => 'success',
        'message' => 'You are not subscribed to the newsletter.',
      ]);
    }

    // Unsubscribe
    $flagService->unflag($flag, $user, $acting_user);

    // Send unsubscribe email
    $this->sendUnsubscribeEmail($user->get('email')->value, $user->get('name')->value);

    return new JsonResponse([
      'status' => 'success',
      'message' => 'You have been unsubscribed successfully.',
      'data' => [
        'id' => $uid,
        'email' => $user->get('email')->value,
      ],
    ]);
  }

  /**
   * Generate strong password.
   */
  protected function generatePassword($length = 8): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    $max = strlen($chars) - 1;
    $pass = '';
    for ($i = 0; $i < $length; $i++) {
      $pass .= $chars[random_int(0, $max)];
    }
    return $pass;
  }

  /**
   * Send welcome email using Twig template.
   */
  protected function sendWelcomeEmail($email, $name, $password) {
    $mailManager = \Drupal::service('plugin.manager.mail');
    $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();

    $params = [
      'subject' => 'Your Newsletter subscriber account has been created',
      'name' => $name,
      'password' => $password,
    ];

    $mailManager->mail('zu_rest_api', 'subscriber_created', $email, $langcode, $params);
  }

  /**
   * Send subscribe confirmation email.
   */
  protected function sendSubscribeEmail($email, $name) {
    $mailManager = \Drupal::service('plugin.manager.mail');
    $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();

    $params = [
      'subject' => 'Thanks for subscribing to our newsletter!',
      'name' => $name,
    ];

    $mailManager->mail('zu_rest_api', 'newsletter_subscribe', $email, $langcode, $params);
  }

  /**
   * Send unsubscribe email.
   */
  protected function sendUnsubscribeEmail($email, $name) {
    $mailManager = \Drupal::service('plugin.manager.mail');
    $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();

    $params = [
      'subject' => 'You have unsubscribed from our newsletter',
      'name' => $name,
    ];

    $mailManager->mail('zu_rest_api', 'newsletter_unsubscribe', $email, $langcode, $params);
  }
}
