<?php

namespace Drupal\zu_rest_api;

/**
 * Class Constants.
 * Holds reusable constants for the module.
 */
class Constants
{

  // JWT token secret and algorithm.
  // Length for secure random tokens.
  public const JWT_TOKEN_LENGTH = 64;
  public const JWT_SECRET = 'bec08319b382d7f3e10c2b77b68c17cf69609a942bd602a4cf4549dc55b17523';
  public const JWT_ALGO = 'HS256';

  public const ERROR = 'error';
  public const SUCCESS = 'success';

  // Expiration durations.
  // 10 minutes.
  public const OTP_TOKEN_LIFETIME = 600;
  // 1 hour
  public const ACCESS_TOKEN_LIFETIME = 3600000000;
  // 7 days
  public const REFRESH_TOKEN_LIFETIME = 604800;
  // 1 image
  public const MOBILE_INTRO_IMAGE_COUNT = 16;

  // DB table.
  public const REFRESH_TOKEN_TABLE = 'zu_refresh_tokens';

  // Common messages.
  public const MSG_INVALID_CREDENTIALS = 'Invalid credentials';
  public const MSG_INVALID_TOKEN = 'Invalid token';
  public const MSG_MISSING_USERNAME = 'Username and password required';
  public const MSG_MISSING_PROVIDER = 'Please provide a valid social auth provider';
  public const MSG_LOGOUT_SUCCESS = 'Logout successful';
  public const MSG_LOGIN_SUCCESS = 'Login successful';
  public const MSG_REGISTER_SUCCESS = 'Registration successful';
  public const MSG_TOKEN_EXPIRED = 'Invalid or expired token';
  public const MSG_REFRESH_MISSING = 'Refresh token missing';
  public const MSG_AUTH_HEADER_MISSING = "Missing or invalid Authorization header";
  public const MSG_USER_EXISTS = "User already exists";
  public const MSG_EMAIL_ALREADY_EXISTS = "Email already exists";
  public const MSG_USERNAME_ALREADY_EXISTS = "Username already exists";
  public const MSG_OTP_SENT_SUCCESSFULLY = "OTP sent successfully";
  public const NO_ACTIVE_SUBSCRIPTION_DISCOUNT_SETTINGS = "You need to have an active subscription to access this feature.";
  public const MSG_MISSING_TOKEN = 'Authorization token is missing.';
  public const MSG_MISSING_PASSWORD = 'Password is required.';
}
