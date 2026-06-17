<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Password\PasswordInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\zu_public_user\Entity\PublicUser;
use Drupal\zu_rest_api\Constants;
use Firebase\JWT\JWT;
use Drupal\Component\Utility\Random;

/**
 * Controller for Public User JWT API (register, login, reset, logout).
 */
class UserController extends ControllerBase
{

  private const MSG_USER_NOT_FOUND = 'User not found.';
  private const MSG_UNAUTHORIZED   = 'Unauthorized.';

  protected PasswordInterface $password;
  protected MailManagerInterface $mailManager;
  protected string $secret;
  protected string $algo;

  public function __construct(PasswordInterface $password, MailManagerInterface $mail_manager)
  {
    $this->password = $password;
    $this->mailManager = $mail_manager;
    $this->secret = Constants::JWT_SECRET;
    $this->algo = Constants::JWT_ALGO;
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('password'),
      $container->get('plugin.manager.mail')
    );
  }

  /**
   * Register new Public User.
   */
  public function register(Request $request)
  {
    $data = json_decode($request->getContent(), TRUE);
    $email = strtolower(trim($data['mail'] ?? ''));
    $password = $data['pass'] ?? '';
    $name = trim($data['name'] ?? '');
    $fcm_token = $data['fcm_token'] ?? '';

    if (!$email || !$password) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Email and password required.'], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Invalid email format.'], 400);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');

    // Check if email already exists
    $email_exists = $storage->getQuery()->accessCheck(FALSE)->condition('email', $email)->execute();
    if (!empty($email_exists)) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Email already registered.'], 409);
    }

    // Check if username exists
    if (!empty($name)) {
      $name_exists = $storage->getQuery()->accessCheck(FALSE)->condition('name', $name)->execute();
      if (!empty($name_exists)) {
        return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Username already taken.'], 409);
      }
    }

    if (empty($name)) {
      $name = explode('@', $email)[0];
    }

    // Create the user
    $user = PublicUser::create([
      'email' => $email,
      'name' => $name,
      'password' => $this->password->hash($password),
      'status' => 1,
      'fcm_token' => $fcm_token,
      'is_verified' => 0,
    ]);

    try {
      $user->save();
    } catch (\Exception $e) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Failed to create user.'], 500);
    }

    // Generate JWT tokens
    $access_payload = [
      'user_id' => $user->id(),
      'email' => $email,
      'exp' => time() + Constants::ACCESS_TOKEN_LIFETIME,
    ];
    $access_token = JWT::encode($access_payload, $this->secret, $this->algo);
    $refresh_token = bin2hex(random_bytes(32));

    // Save refresh token
    \Drupal::database()->insert('zu_refresh_tokens')->fields([
      'uid' => $user->id(),
      'access_token' => $access_token,
      'refresh_token' => $refresh_token,
      'expires' => time() + Constants::REFRESH_TOKEN_LIFETIME,
    ])->execute();

    return new JsonResponse([
      'api_status_code' => Constants::SUCCESS,
      'message' => 'Registration successful.',
      'user' => [
        'id' => $user->id(),
        'name' => $user->get('name')->value,
        'email' => $user->get('email')->value,
      ],
      'access_token' => $access_token,
      'refresh_token' => $refresh_token,
    ], 201);
  }

  /**
   * Login user with username or email.
   */
  public function login(Request $request)
  {
    $data = json_decode($request->getContent(), TRUE);
    $identifier = strtolower(trim($data['name'] ?? '')); // Name and email both accepted
    $password = $data['pass'] ?? '';
    $fcm_token = $data['fcm_token'] ?? '';

    if (!$identifier || !$password) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Username/Email and password required.'], 400);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $query = $storage->getQuery()->accessCheck(FALSE)
      ->condition('email', $identifier);
    $uids = $query->execute();

    if (empty($uids)) {
      $uids = $storage->getQuery()->accessCheck(FALSE)
        ->condition('name', $identifier)
        ->execute();
    }

    if (empty($uids)) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Invalid credentials.'], 401);
    }

    $uid = reset($uids);
    /** @var \Drupal\zu_public_user\Entity\PublicUser $user */
    $user = $storage->load($uid);

    if (!$user->get('status')->value) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Account blocked.'], 403);
    }

    if (!$this->password->check($password, $user->get('password')->value)) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Invalid credentials.'], 401);
    }

    // Update FCM token
    if ($fcm_token) {
      $user->set('fcm_token', $fcm_token);
      $user->save();
    }

    // Generate JWT tokens
    $access_payload = [
      'user_id' => $user->id(),
      'exp' => time() + Constants::ACCESS_TOKEN_LIFETIME,
    ];
    $access_token = JWT::encode($access_payload, $this->secret, $this->algo);
    $refresh_token = bin2hex(random_bytes(32));

    \Drupal::database()->insert('zu_refresh_tokens')->fields([
      'uid' => $user->id(),
      'access_token' => $access_token,
      'refresh_token' => $refresh_token,
      'expires' => time() + Constants::REFRESH_TOKEN_LIFETIME,
    ])->execute();

    return new JsonResponse([
      'api_status_code' => Constants::SUCCESS,
      'message' => 'Login successful.',
      'current_user' => [
        'uid' => $user->id(),
        'name' => $user->get('name')->value,
        'email' => $user->get('email')->value,
      ],
      'access_token' => $access_token,
      'refresh_token' => $refresh_token,
    ], 200);
  }

  /**
   * Forgot Password — email reset token.
   */
  public function forgotPassword(Request $request)
  {
    $request = \Drupal::request();
    $data = json_decode($request->getContent(), TRUE);
    $email = strtolower(trim($data['email'] ?? ''));

    if (empty($email)) {
      return new JsonResponse([
        'api_status_code' => Constants::ERROR,
        'message' => 'Email is required.',
      ], 400);
    }

    // Load user by email
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $uids = $storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('email', $email)
      ->execute();

    if (empty($uids)) {
      return new JsonResponse([
        'api_status_code' => Constants::ERROR,
        'message' => 'No account found with this email address.',
      ], 404);
    }

    $uid = reset($uids);
    /** @var \Drupal\zu_public_user\Entity\PublicUser $user */
    $user = $storage->load($uid);

    // Check if account is active
    if (!$user->get('status')->value) {
      return new JsonResponse([
        'api_status_code' => Constants::ERROR,
        'message' => 'Account is blocked. Please contact support.',
      ], 403);
    }

    $access_payload = [
      'user_id' => $user->id(),
      'exp' => time() + Constants::ACCESS_TOKEN_LIFETIME,
    ];
    $access_token = \Firebase\JWT\JWT::encode($access_payload, Constants::JWT_SECRET, Constants::JWT_ALGO);
    $refresh_token = bin2hex(random_bytes(32));

    \Drupal::database()->insert('zu_refresh_tokens')->fields([
      'uid' => $user->id(),
      'access_token' => $access_token,
      'refresh_token' => $refresh_token,
      'expires' => time() + Constants::REFRESH_TOKEN_LIFETIME,
    ])->execute();
    $reset_token = (string) random_int(100000, 999999);
    $expires = \Drupal::time()->getRequestTime() + 600;

    \Drupal::database()->upsert('public_user_reset_tokens')
      ->key('uid')
      ->fields([
        'uid' => $user->id(),
        'token' => $reset_token,
        'expires' => $expires,
        'created' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    $mailParams = [
      'subject' => 'Password Reset Request',
      'name' => $user->get('name')->value,
      'token' => $reset_token,
    ];
    $this->mailManager->mail('zu_public_user', 'reset_password_otp', $email, 'en', $mailParams);

    return new JsonResponse([
      'api_status_code' => Constants::SUCCESS,
      'message' => 'Password reset OTP sent successfully.',
      'user' => [
        'id' => $user->id(),
        'email' => $user->get('email')->value,
        'name' => $user->get('name')->value,
      ],
      'tokens' => [
        'access_token' => $access_token,
        'refresh_token' => $refresh_token,
      ],
    ], 200);
  }

  /**
   * Reset password with valid token.
   */
  public function resetPassword(Request $request)
  {
    $request = \Drupal::request();
    $jwtUser = $request->attributes->get('jwt_user');

    // 1. JWT validation
    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: missing or invalid token.',
      ], 401);
    }

    $uid = (int) $jwtUser->user_id;

    // Load user from JWT
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $auth_user */
    $auth_user = $storage->load($uid);

    if (!$auth_user) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found for provided token.',
      ], 404);
    }

    // Get input values
    $data = json_decode($request->getContent(), TRUE);
    $otp = trim($data['otp'] ?? '');
    $new_pass = trim($data['new_password'] ?? '');

    if (!$otp || !$new_pass) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'OTP and new password are required.',
      ], 400);
    }

    // Validate OTP in DB
    $record = \Drupal::database()->select('public_user_reset_tokens', 't')
      ->fields('t')
      ->condition('token', $otp)
      ->execute()
      ->fetchAssoc();

    if (!$record) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid OTP.',
      ], 400);
    }

    // OTP expired
    if ($record['expires'] < \Drupal::time()->getRequestTime()) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'OTP expired.',
      ], 400);
    }

    // Make sure OTP belongs to the same JWT user
    if ((int) $record['uid'] !== (int) $auth_user->id()) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'OTP does not belong to the authenticated user.',
      ], 403);
    }

    // New password cannot be same as old one
    $old_hashed = $auth_user->get('password')->value;
    if ($this->password->check($new_pass, $old_hashed)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'New password cannot be same as old password.',
      ], 400);
    }

    // Update password
    $auth_user->set('password', $this->password->hash($new_pass));
    $auth_user->save();

    // Delete OTP
    \Drupal::database()->delete('public_user_reset_tokens')
      ->condition('uid', $auth_user->id())
      ->execute();

    return new JsonResponse([
      'status' => 'success',
      'message' => 'Password reset successful.',
      'user' => [
        'id' => $auth_user->id(),
        'email' => $auth_user->get('email')->value,
      ]
    ], 200);
  }

  /**
   * Resend email verification link.
   *
   * POST /api/public-user/resend-verification  {email}
   */
  public function sendVerificationEmail(Request $request): JsonResponse {
    $data  = json_decode($request->getContent(), TRUE);
    $email = strtolower(trim($data['email'] ?? ''));
    $err   = NULL;
    $user  = $this->resolve_public_user_by_email($email, $err);
    if ($user === NULL) {
      return $err; // 1
    }
    if ($user->get('is_verified')->value) {
      return new JsonResponse(['api_status_code' => Constants::SUCCESS, 'message' => 'Already verified.'], 200); // 2
    }
    $this->issue_verification_token((int) $user->id(), $email, $user->get('name')->value);
    return new JsonResponse(['api_status_code' => Constants::SUCCESS, 'message' => 'Verification email sent.'], 200); // 3
  }

  /**
   * Verify email via token link.
   *
   * GET /api/public-user/verify-email?token=<hex>
   */
  public function verifyEmail(Request $request): JsonResponse {
    $token  = trim((string) $request->query->get('token', ''));
    $record = $this->load_token_record($token);
    if ($record === NULL) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Invalid or expired token.'], 400); // 1
    }
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = \Drupal::entityTypeManager()->getStorage('public_user')->load((int) $record['uid']);
    if (!$user) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => self::MSG_USER_NOT_FOUND], 404); // 2
    }
    $user->set('is_verified', 1)->save();
    \Drupal::database()->delete('public_user_email_verification')->condition('uid', $user->id())->execute();
    return new JsonResponse([
      'api_status_code' => Constants::SUCCESS,
      'message'         => 'Email verified successfully.',
      'user'            => ['id' => $user->id(), 'email' => $user->get('email')->value],
    ], 200); // 3
  }

  /**
   * Update authenticated public user profile.
   *
   * PUT /api/secure/public-user/profile
   * Accepted fields: name, phone, avatar_url, language_preference, fcm_token,
   *                  student_id, employee_id, zu_id, current_password + new_password.
   */
  public function updateProfile(Request $request): JsonResponse {
    $err  = NULL;
    $user = $this->load_jwt_public_user($request, $err);
    if ($user === NULL) {
      return $err; // 1
    }
    $data = json_decode($request->getContent(), TRUE) ?: [];
    foreach (['name', 'phone', 'avatar_url', 'language_preference', 'fcm_token', 'student_id', 'employee_id', 'zu_id'] as $field) {
      if (isset($data[$field])) {
        $user->set($field, (string) $data[$field]);
      }
    }
    $pw_error = $this->apply_password_change($user, $data);
    if ($pw_error !== NULL) {
      return $pw_error; // 2
    }
    $user->save();
    return new JsonResponse(['api_status_code' => Constants::SUCCESS, 'message' => 'Profile updated.',
      'user' => $this->build_user_payload($user)], 200); // 3
  }

  /**
   * Get authenticated public user profile.
   *
   * GET /api/secure/public-user/profile
   */
  public function getProfile(Request $request): JsonResponse {
    $err  = NULL;
    $user = $this->load_jwt_public_user($request, $err);
    if ($user === NULL) {
      return $err; // 1
    }
    return new JsonResponse(['api_status_code' => Constants::SUCCESS,
      'user' => $this->build_user_payload($user, TRUE)], 200); // 2
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Load a PublicUser by email; populates $error on failure.
   *
   * @param \Symfony\Component\HttpFoundation\JsonResponse|null $error
   * @return \Drupal\zu_public_user\Entity\PublicUser|null
   */
  private function resolve_public_user_by_email(string $email, ?JsonResponse &$error): ?\Drupal\zu_public_user\Entity\PublicUser {
    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
      $error = new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Valid email is required.'], 400);
      return NULL;
    }
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $uids    = $storage->getQuery()->accessCheck(FALSE)->condition('email', $email)->execute();
    if (empty($uids)) {
      $error = new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => self::MSG_USER_NOT_FOUND], 404);
      return NULL;
    }
    return $storage->load(reset($uids));
  }

  /**
   * Load a PublicUser from the JWT in the request; populates $error on failure.
   *
   * @param \Symfony\Component\HttpFoundation\JsonResponse|null $error
   * @return \Drupal\zu_public_user\Entity\PublicUser|null
   */
  private function load_jwt_public_user(Request $request, ?JsonResponse &$error): ?\Drupal\zu_public_user\Entity\PublicUser {
    $jwtUser = $request->attributes->get('jwt_user');
    if (empty($jwtUser->user_id)) {
      $error = new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => self::MSG_UNAUTHORIZED], 401);
      return NULL;
    }
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = \Drupal::entityTypeManager()->getStorage('public_user')->load((int) $jwtUser->user_id);
    if (!$user) {
      $error = new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => self::MSG_USER_NOT_FOUND], 404);
      return NULL;
    }
    return $user;
  }

  /**
   * Validates and applies a password change; returns a JsonResponse on error or NULL on success/skip.
   */
  private function apply_password_change(\Drupal\zu_public_user\Entity\PublicUser $user, array $data): ?JsonResponse {
    if (empty($data['new_password'])) {
      return NULL; // 1 — no password change requested
    }
    $missing = empty($data['current_password']);
    $wrong   = !$missing && !$this->password->check($data['current_password'], $user->get('password')->value);
    if ($missing || $wrong) {
      $msg  = $missing ? 'current_password is required to change password.' : 'Current password is incorrect.';
      $code = $missing ? 400 : 403;
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => $msg], $code); // 2
    }
    $user->set('password', $this->password->hash($data['new_password']));
    return NULL; // 3 — changed successfully
  }

  /**
   * Validates a verification token; returns the DB record array or NULL if missing/expired.
   *
   * @return array<string, mixed>|null
   */
  private function load_token_record(string $token): ?array {
    if (!$token) {
      return NULL;
    }
    $record = \Drupal::database()->select('public_user_email_verification', 'v')
      ->fields('v')->condition('token', $token)->execute()->fetchAssoc();
    return ($record && (int) $record['expires'] >= \Drupal::time()->getRequestTime())
      ? (array) $record : NULL;
  }

  /**
   * Builds the standard public user response payload.
   *
   * @return array<string, mixed>
   */
  private function build_user_payload(\Drupal\zu_public_user\Entity\PublicUser $user, bool $include_geo = FALSE): array {
    $payload = [
      'id'                  => $user->id(),
      'email'               => $user->get('email')->value,
      'name'                => $user->get('name')->value,
      'phone'               => $user->get('phone')->value ?? '',
      'avatar_url'          => $user->get('avatar_url')->value ?? '',
      'language_preference' => $user->get('language_preference')->value ?? 'en',
      'student_id'          => $user->get('student_id')->value ?? '',
      'employee_id'         => $user->get('employee_id')->value ?? '',
      'zu_id'               => $user->get('zu_id')->value ?? '',
      'is_verified'         => (bool) $user->get('is_verified')->value,
      'created'             => (int) $user->get('created')->value,
    ];
    if ($include_geo) {
      $payload['device_type']  = $user->get('device_type')->value ?? '';
      $payload['geo_location'] = $user->get('geo_location')->value ?? '';
    }
    return $payload;
  }

  private function issue_verification_token(int $uid, string $email, string $name): void {
    $token   = bin2hex(random_bytes(32));
    $expires = \Drupal::time()->getRequestTime() + 86400; // 24 h

    \Drupal::database()->upsert('public_user_email_verification')
      ->key('uid')
      ->fields(['uid' => $uid, 'token' => $token, 'expires' => $expires,
                'created' => \Drupal::time()->getRequestTime()])
      ->execute();

    $verify_url = \Drupal::request()->getSchemeAndHttpHost()
      . '/api/public-user/verify-email?token=' . $token;

    $this->mailManager->mail('zu_public_user', 'email_verification', $email, 'en', [
      'subject'    => 'Verify your Zayed University account',
      'name'       => $name,
      'verify_url' => $verify_url,
    ]);
  }

  /**
   * Logout — invalidate tokens and clear FCM token.
   */
  public function logout(Request $request)
  {
    $request = \Drupal::request();
    $jwtUser = $request->attributes->get('jwt_user');
    // Validate JWT presence
    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'api_status_code' => Constants::ERROR,
        'message' => 'Unauthorized: missing or invalid token.',
      ], 401);
    }

    $uid = (int) $jwtUser->user_id;

    // Load public user entity
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = $storage->load($uid);

    if (!$user) {
      return new JsonResponse([
        'api_status_code' => Constants::ERROR,
        'message' => 'User not found.',
      ], 404);
    }

    try {
      $user->set('fcm_token', '');
      $user->save();

      \Drupal::database()->delete('zu_refresh_tokens')
        ->condition('uid', $uid)
        ->execute();

      return new JsonResponse([
        'api_status_code' => Constants::SUCCESS,
        'message' => 'Logout successful.',
      ], 200);
    } catch (\Exception $e) {

      \Drupal::logger('zu_public_user')->error('Logout error: @msg', ['@msg' => $e->getMessage()]);

      return new JsonResponse([
        'api_status_code' => Constants::ERROR,
        'message' => 'Failed to logout. Try again.',
      ], 500);
    }
  }
}
