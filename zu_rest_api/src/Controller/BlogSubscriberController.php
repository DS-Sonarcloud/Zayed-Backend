<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Password\PasswordInterface;
use Drupal\zu_public_user\Entity\PublicUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Component\Utility\Html;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Session\UserSession;

/**
 * Handles Blog Subscribers using public_user entity + Flag module.
 */
class BlogSubscriberController extends ControllerBase
{

  protected MailManagerInterface $mailManager;
  protected PasswordInterface $password;

  public function __construct(MailManagerInterface $mail_manager, PasswordInterface $password)
  {
    $this->mailManager = $mail_manager;
    $this->password = $password;
  }

  public static function create(ContainerInterface $container): static
  {
    return new static(
      $container->get('plugin.manager.mail'),
      $container->get('password')
    );
  }

  /**
   * Subscribe a public user to blog updates.
   */
  public function addSubscriber(Request $request): JsonResponse
  {

    // --- JWT VALIDATION ---
    $jwtUser = $request->attributes->get('jwt_user');
    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: Invalid or missing JWT token.',
      ], 401);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var PublicUser $current_user */
    $current_user = $storage->load($jwtUser->user_id);

    if (!$current_user || !$current_user->get('status')->value) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found or inactive.',
      ], 403);
    }

    // --- INPUT ---
    $data = json_decode($request->getContent(), TRUE);
    if (empty($data['email'])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Email is required.',
      ], 400);
    }

    $email = strtolower(trim($data['email']));
    $fcm_token = $data['fcm_token'] ?? '';

    if (!\Drupal::service('email.validator')->isValid($email)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid email format.',
      ], 400);
    }

    // --- FIND OR CREATE public user ---
    $uids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('email', $email)
      ->execute();

    /** @var PublicUser|null $subscriber */
    $subscriber = !empty($uids) ? $storage->load(reset($uids)) : NULL;

    $is_new_user = FALSE;

    if (!$subscriber) {
      // Create new subscriber
      $username = explode('@', $email)[0];
      $password = $this->generatePassword(10);

      $subscriber = PublicUser::create([
        'email' => $email,
        'name' => $username,
        'password' => $this->password->hash($password),
        'status' => 1,
        'fcm_token' => $fcm_token,
        'is_verified' => 0,
      ]);
      $subscriber->save();
      // Send welcome email
      $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();
      $params = [
        'subject' => 'Your subscriber account has been created',
        'name' => $username,
        'password' => $password,
      ];
      $this->mailManager->mail('zu_rest_api', 'subscriber_created', $email, $langcode, $params);
      $is_new_user = TRUE;

      //$this->sendSubscriptionEmail($subscriber, $password);
    } else {
      if ($fcm_token) {
        $subscriber->set('fcm_token', $fcm_token);
        $subscriber->save();
      }
    }

    // --- FLAG SUBSCRIBE ---
    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('blog_subscribe');

    if (!$flag) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Flag "blog_subscribe" not found.',
      ], 500);
    }

    $acting_user = new UserSession([
      'uid' => $subscriber->id(),
      'name' => $subscriber->get('name')->value,
    ]);

    // Check if already flagged
    $flagging = $flagService->getFlagging($flag, $subscriber, $acting_user);

    if (!$flagging) {
      $flagService->flag($flag, $subscriber, $acting_user);
      $message = "Blog subscription added successfully.";
    } else {
      $message = "Already subscribed.";
    }

    $temp_password = $is_new_user ? $password : NULL;
    $this->sendSubscriptionEmail($subscriber, $temp_password);

    // --- RESPONSE ---
    return new JsonResponse([
      'status' => 'success',
      'message' => $message,
      'subscriber' => [
        'id' => $subscriber->id(),
        'email' => $subscriber->get('email')->value,
        'fcm_token' => $subscriber->get('fcm_token')->value,
        'is_new_user' => $is_new_user,
      ],
    ], 200);
  }

  /**
   * Send blog subscription email.
   */
  protected function sendSubscriptionEmail(PublicUser $user, ?string $temp_pass = NULL)
  {

    $theme_path = \Drupal::service('extension.list.theme')->getPath('zu');
    $brand_logo = \Drupal::request()->getSchemeAndHttpHost() . '/' . $theme_path . '/images/logo.png';

    $params = [
      'subject' => 'Thank you for subscribing to our Blogs!',
      'user_name' => $user->get('name')->value,
      'brand_name' => 'Zayed University',
      'brand_logo' => $brand_logo,
      'manage_url' => \Drupal::request()->getSchemeAndHttpHost(),
      'support_email' => 'support@zu.ac.ae',
      'temp_password' => $temp_pass,
    ];

    $email = $user->get('email')->value;
    $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();

    \Drupal::service('plugin.manager.mail')
      ->mail('zu_rest_api', 'blog_subscribe_confirmation', $email, $langcode, $params);
  }

  /**
   * Generate password.
   */
  protected function generatePassword(int $length = 10): string
  {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    $pass = '';
    for ($i = 0; $i < $length; $i++) {
      $pass .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $pass;
  }

  public function unsubscribe(Request $request): JsonResponse
  {
    // --- JWT VALIDATION ---
    $jwtUser = $request->attributes->get('jwt_user');
    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: Invalid or missing JWT token.',
      ], 401);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var PublicUser $current_user */
    $current_user = $storage->load($jwtUser->user_id);

    if (!$current_user || !$current_user->get('status')->value) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found or inactive.',
      ], 403);
    }

    // --- INPUT ---
    $data = json_decode($request->getContent(), TRUE);

    if (empty($data['email'])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Email is required.',
      ], 400);
    }

    $email = strtolower(trim($data['email']));

    if (!\Drupal::service('email.validator')->isValid($email)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid email format.',
      ], 400);
    }

    // --- LOAD SUBSCRIBER ---
    $uids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('email', $email)
      ->execute();

    /** @var PublicUser|null $subscriber */
    $subscriber = !empty($uids) ? $storage->load(reset($uids)) : NULL;

    if (!$subscriber) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Subscriber not found.',
      ], 404);
    }

    // --- FLAG UNSUBSCRIBE ---
    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('blog_subscribe');

    if (!$flag) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Flag "blog_subscribe" not found.',
      ], 500);
    }

    $acting_user = new UserSession([
      'uid' => $subscriber->id(),
      'name' => $subscriber->get('name')->value,
    ]);

    // Check if flagged
    $flagging = $flagService->getFlagging($flag, $subscriber, $acting_user);

    if (!$flagging) {
      return new JsonResponse([
        'status' => 'warning',
        'message' => 'Already unsubscribed.',
        'subscriber' => [
          'id' => $subscriber->id(),
          'email' => $subscriber->get('email')->value,
          'fcm_token' => $subscriber->get('fcm_token')->value,
        ],
      ], 200);
    }

    // Perform unflag
    $flagService->unflag($flag, $subscriber, $acting_user);

    return new JsonResponse([
      'status' => 'success',
      'message' => 'Unsubscribed successfully.',
      'subscriber' => [
        'id' => $subscriber->id(),
        'email' => $subscriber->get('email')->value,
        'fcm_token' => $subscriber->get('fcm_token')->value,
      ],
    ], 200);
  }
}
