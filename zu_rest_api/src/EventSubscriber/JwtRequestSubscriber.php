<?php

namespace Drupal\zu_rest_api\EventSubscriber;

use Drupal\zu_rest_api\Constants;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 *
 */
class JwtRequestSubscriber implements EventSubscriberInterface
{

  private $secret = Constants::JWT_SECRET;
  private $algo = Constants::JWT_ALGO;

  /**
   *
   */
  public function onRequest(RequestEvent $event)
  {
    // return; // Temporarily disable JWT validation for testing.
    $request = $event->getRequest();
    $path = $request->getPathInfo();
    $lang_prefix = \Drupal::languageManager()->getCurrentLanguage()->getId();
    $path = preg_replace('#^/' . preg_quote($lang_prefix, '#') . '#', '', $path);

    if (strpos($path, '/api/secure/') === 0) {

      $authHeader = $request->headers->get('Authorization');
      if (!$authHeader || !preg_match('/Bearer\\s(\\S+)/', $authHeader, $matches)) {
        if (strpos($path, '/api/secure/service-list') === 0 || strpos($path, '/api/secure/service-detail') === 0 || strpos($path, '/api/secure/profile') === 0 || strpos($path, '/api/secure/quote_details') === 0 || strpos($path, '/api/secure/messages/send') === 0) {
          try {
            // $decoded = JWT::decode($jwt, new Key($this->secret, $this->algo));
            // Optional: make decoded user info available to controller.
            $request->attributes->set('jwt_user', NULL);
          } catch (\Exception $e) {
            $event->setResponse(new JsonResponse(['status' => Constants::ERROR, 'message' => Constants::MSG_TOKEN_EXPIRED], 401));
            return;
          }
          return;
        }
      }

      $jwt = $matches[1];

      // Validate JWT create query to check if the token exists in the database.
      if (empty($jwt)) {
        $event->setResponse(new JsonResponse(['status' => Constants::ERROR, 'message' => Constants::MSG_MISSING_TOKEN], 401));
        return;
      }

      $connection = \Drupal::database();
      $query = $connection->select(Constants::REFRESH_TOKEN_TABLE, 'j')
        ->fields('j', ['access_token'])
        ->condition('access_token', $jwt)
        ->execute();
      $token_exists = $query->fetchField();

      if (!$token_exists) {
        $event->setResponse(new JsonResponse(['status' => Constants::ERROR, 'message' => Constants::MSG_INVALID_TOKEN], 401));
        return;
      }

      try {
        $decoded = JWT::decode($jwt, new Key($this->secret, $this->algo));
        // Optional: make decoded user info available to controller.
        $request->attributes->set('jwt_user', $decoded);
      } catch (\Exception $e) {
        $event->setResponse(new JsonResponse(['status' => Constants::ERROR, 'message' => Constants::MSG_TOKEN_EXPIRED], 401));
        return;
      }
    }
  }

  /**
   *
   */
  public static function getSubscribedEvents()
  {
    return [
      // Before controller executes.
      KernelEvents::REQUEST => ['onRequest', 29],
    ];
  }
}
