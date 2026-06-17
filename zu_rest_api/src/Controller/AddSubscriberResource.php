<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\taxonomy\Entity\Term;
use Drupal\zu_public_user\Entity\PublicUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Component\Utility\Html;
use Drupal\Core\Password\PasswordInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Session\AnonymousUserSession;
use Drupal\flag\Entity\Flag;
use Drupal\Core\Session\AccountInterface;

/**
 * Handles event subscription and automatic public_user creation.
 */
class AddSubscriberResource extends ControllerBase
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
   * Add or update subscriber based on email.
   */
  public function addSubscriberResource(Request $request): JsonResponse
  {

    $request = \Drupal::request();
    $jwtUser = $request->attributes->get('jwt_user');
    $uid = $jwtUser->user_id ?? NULL;

    $data = json_decode($request->getContent(), TRUE);
    if (empty($data['email']) || empty($data['terms'])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Email and terms are required.',
      ], 400);
    }

    $email = strtolower(trim($data['email']));
    $terms = $data['terms'];
    $fcm_token = $data['fcm_token'] ?? '';

    // Check for existing PublicUser
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $uids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('email', $email)
      ->execute();

    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = !empty($uids) ? $storage->load(reset($uids)) : NULL;

    // Load flag service
    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('subscribe_event');
    if (!$flag) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Flag "subscribe_event" not found.',
      ], 500);
    }
    $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();

    // Extract term names for email
    $term_names = [];
    foreach ($terms as $tid) {
      if ($t = Term::load($tid)) {
        $term_names[] = $t->label();
      }
    }

    // If existing user, update FCM and flag new terms
    if ($user) {
      if ($fcm_token) {
        $user->set('fcm_token', $fcm_token);
        $user->save();
      }

      $flagged_terms = $this->applyFlags($flagService, $flag, $terms, $user);
      $message = 'Account exists. Successfully subscribed to the new term.';
      if (empty($flagged_terms)) {
        $message = 'Account exists. You are already subscribed to these term(s).';
      }

      $this->mailManager->mail(
        'zu_rest_api',
        'event_subscribe',
        $email,
        $langcode,
        [
          'subject' => 'You have subscribed to event categories',
          'name' => $user->get('name')->value,
          'terms' => $term_names,
        ]
      );
      return new JsonResponse([
        'status' => 'updated',
        'message' => $message,
        'subscriber' => [
          'id' => $user->id(),
          'email' => $user->get('email')->value,
          'flagged_terms' => $flagged_terms,
          'fcm_token' => $user->get('fcm_token')->value,
        ],
      ], 200);
    }

    // Generate a unique username and password for new subscriber
    $username_base = explode('@', $email)[0];
    $username = $username_base;
    $counter = 1;
    while ($storage->getQuery()->accessCheck(FALSE)->condition('name', $username)->execute()) {
      $username = $username_base . '_' . $counter++;
    }

    $password = $this->generatePassword(10);

    try {
      // Create new PublicUser
      $user = PublicUser::create([
        'email' => $email,
        'name' => $username,
        'password' => $this->password->hash($password),
        'status' => 1,
        'fcm_token' => $fcm_token,
        'is_verified' => 0,
      ]);
      $user->save();

      // Send welcome email
      $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();
      $params = [
        'subject' => 'Your subscriber account has been created',
        'name' => $username,
        'password' => $password,
      ];
      $this->mailManager->mail('zu_rest_api', 'subscriber_created', $email, $langcode, $params);


      // Apply flags
      $flagged_terms = $this->applyFlags($flagService, $flag, $terms, $user);
      $this->mailManager->mail(
        'zu_rest_api',
        'event_subscribe',
        $email,
        $langcode,
        [
          'subject' => 'You have subscribed to event categories',
          'name' => $username,
          'terms' => $term_names,
        ]
      );

      return new JsonResponse([
        'status' => 'success',
        'message' => 'You have subscribed successfully and your account has been created.',
        'subscriber' => [
          'id' => $user->id(),
          'email' => $user->get('email')->value,
          'username' => $user->get('name')->value,
          'flagged_terms' => $flagged_terms,
          'fcm_token' => $user->get('fcm_token')->value,
        ],
      ], 201);
    } catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error('Error creating subscriber: @msg', ['@msg' => $e->getMessage()]);
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Could not create subscriber. Please try again later.',
      ], 500);
    }
  }

  /**
   * Helper to flag taxonomy terms for a user.
   */
  protected function applyFlags($flagService, $flag, array $terms, PublicUser $user): array
  {
    $flagged = [];

    foreach ($terms as $term_id) {
      $term = Term::load($term_id);
      if (!$term) {
        continue;
      }

      if (
        $flag->getFlaggableEntityTypeId() !== $term->getEntityTypeId() ||
        !in_array($term->bundle(), $flag->getApplicableBundles(), TRUE)
      ) {
        continue;
      }

      if (!$flagService->getFlagging($flag, $term, $user)) {
        $flagService->flag($flag, $term, $user);
        $flagged[] = $term_id;
      }
    }

    return $flagged;
  }


  /**
   * Generate a secure random alphanumeric password.
   */
  protected function generatePassword($length = 10): string
  {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    $max = strlen($chars) - 1;
    $pass = '';
    for ($i = 0; $i < $length; $i++) {
      $pass .= $chars[random_int(0, $max)];
    }
    return $pass;
  }

  public function unsubscribe(Request $request): JsonResponse
  {
    $request = \Drupal::request();
    $jwtUser = $request->attributes->get('jwt_user');
    $uid = $jwtUser->user_id ?? NULL;

    if (!$uid) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid user.',
      ], 400);
    }

    $data = json_decode($request->getContent(), TRUE);
    if (empty($data['terms'])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Terms are required to unsubscribe.',
      ], 400);
    }

    $terms = $data['terms'];

    // Load PublicUser.
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $user = $storage->load($uid);

    if (!$user) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found.',
      ], 404);
    }

    // Load flag service.
    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('subscribe_event');
    if (!$flag) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Flag not found.',
      ], 500);
    }

    $unsubscribed = [];
    $already_not_subscribed = [];

    foreach ($terms as $term_id) {
      $term = Term::load($term_id);
      if (!$term) {
        continue;
      }

      // Check if user is subscribed.
      $flagging = $flagService->getFlagging($flag, $term, $user);

      if ($flagging) {
        // User IS subscribed → unflag it.
        $flagService->unflag($flag, $term, $user);
        $unsubscribed[] = [
          'term_id' => $term_id,
          'term_name' => $term->label(),
        ];
      } else {
        // User is NOT subscribed → notify.
        $already_not_subscribed[] = [
          'term_id' => $term_id,
          'term_name' => $term->label(),
        ];
      }
    }

    // If nothing changed
    if (empty($unsubscribed) && !empty($already_not_subscribed)) {
      return new JsonResponse([
        'status' => 'no_change',
        'message' => 'No changes: user was not subscribed to these terms.',
        'already_not_subscribed' => $already_not_subscribed,
      ], 200);
    }

    return new JsonResponse([
      'status' => 'success',
      'message' => 'Unsubscription processed.',
      'unsubscribed_terms' => $unsubscribed,
      'already_not_subscribed' => $already_not_subscribed,
    ], 200);
  }

  public function getUserSubscribed(): JsonResponse
  {
    $request = \Drupal::request();
    $jwtUser = $request->attributes->get('jwt_user');

    // Validate JWT
    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: missing or invalid token.',
      ], 401);
    }

    $uid = $jwtUser->user_id;

    // Load user
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = $storage->load($uid);

    if (!$user) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found.',
      ], 404);
    }

    // Flag service
    $flagService = \Drupal::service('flag');

    $subscriptions = [
      'blog_subscribe' => false,
      'news_subscribe' => false,
      'newsletter_subscribe' => false,
    ];

    foreach ($subscriptions as $flag_id => $_) {
      $flag = $flagService->getFlagById($flag_id);
      if ($flag) {
        $flagging = $flagService->getFlagging($flag, $user, $user);
        $subscriptions[$flag_id] = $flagging ? true : false;
      }
    }

    $terms = \Drupal::entityTypeManager()
      ->getStorage('taxonomy_term')
      ->loadTree('event_type');

    $eventFlag = $flagService->getFlagById('subscribe_event');

    if (!$eventFlag) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Flag subscribe_event not found.',
      ], 500);
    }

    $subscribed_terms = [];

    foreach ($terms as $term) {
      $term_entity = Term::load($term->tid);

      $flagging = $flagService->getFlagging($eventFlag, $term_entity, $user);

      if ($flagging) {
        $subscribed_terms[] = [
          'tid' => $term->tid,
          'name' => $term->name,
        ];
      }
    }

    return new JsonResponse([
      'status' => 'success',
      'user' => [
        'id' => $user->id(),
        'email' => $user->get('email')->value,
        'name' => $user->get('name')->value,
      ],

      // Blog, News, Newsletter
      'subscriptions' => [
        'blog' => $subscriptions['blog_subscribe'],
        'news' => $subscriptions['news_subscribe'],
        'newsletter' => $subscriptions['newsletter_subscribe'],
      ],

      // Event term-level subscription
      'event_categories' => $subscribed_terms,

    ], 200);
  }
}
