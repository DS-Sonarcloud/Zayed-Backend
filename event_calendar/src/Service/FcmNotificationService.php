<?php

namespace Drupal\event_calendar\Service;

use Google\Auth\Credentials\ServiceAccountCredentials;
use GuzzleHttp\Client;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\file\Entity\File;

class FcmNotificationService
{

  protected $fileSystem;
  protected $logger;
  protected $config;

  public function __construct(
    FileSystemInterface $file_system,
    LoggerChannelFactoryInterface $logger_factory,
    ConfigFactoryInterface $config_factory
  ) {
    $this->fileSystem = $file_system;
    $this->logger = $logger_factory->get('event_calendar');
    $this->config = $config_factory->get('event_calendar.settings');
  }

  /**
   * Sends FCM push notifications to multiple tokens.
   */
  public function sendFcmNotifications(array $tokens, string $title, string $message): void
  {

    if (empty($tokens)) {
      $this->logger->warning('No FCM tokens provided.');
      return;
    }

    $firebaseConfig = $this->config->get('firebase_json_path');

    if (empty($firebaseConfig)) {
      throw new \Exception('Firebase JSON file path is not configured.');
    }

    $jsonData = NULL;

    if (is_numeric($firebaseConfig)) {
      $file = File::load($firebaseConfig);
      if (!$file) {
        throw new \Exception('Firebase JSON file entity not found for ID ' . $firebaseConfig);
      }
      $jsonPath = $file->getFileUri();
      $content = file_get_contents($jsonPath);
      if ($content === FALSE) {
        throw new \Exception('Could not read Firebase JSON file: ' . $jsonPath);
      }
      $jsonData = json_decode($content, TRUE);
    } else {
      $jsonPath = $firebaseConfig;
      $realPath = file_exists($jsonPath) ? $jsonPath : $this->fileSystem->realpath($jsonPath);

      if (!$realPath || !file_exists($realPath) || is_dir($realPath)) {
        throw new \Exception('Firebase JSON file missing or invalid at ' . ($jsonPath ?: 'NULL'));
      }

      $content = file_get_contents($realPath);
      if ($content === FALSE) {
        throw new \Exception('Could not read Firebase JSON file: ' . $realPath);
      }
      $jsonData = json_decode($content, TRUE);
    }

    if (empty($jsonData) || !is_array($jsonData)) {
      throw new \Exception('Failed to decode Firebase JSON file. Invalid JSON.');
    }

    if (empty($jsonData['project_id'])) {
      throw new \Exception('Firebase JSON missing "project_id".');
    }

    $url = "https://fcm.googleapis.com/v1/projects/" . $jsonData['project_id'] . "/messages:send";

    $scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
    $credentials = new ServiceAccountCredentials($scopes, $jsonData);

    try {
      $accessTokenData = $credentials->fetchAuthToken();
    } catch (\Exception $e) {
      $this->logger->error('Failed to fetch Firebase access token: @msg', ['@msg' => $e->getMessage()]);
      return;
    }

    $accessToken = $accessTokenData['access_token'] ?? NULL;
    if (!$accessToken) {
      $this->logger->error('Firebase access token missing.');
      return;
    }
    $client = new Client(['timeout' => 10, 'verify' => TRUE]);

    $results = ['sent' => 0, 'failed' => 0, 'errors' => []];

    foreach ($tokens as $token) {
      try {
        $client->post($url, [
          'headers' => [
            'Authorization' => "Bearer $accessToken",
            'Content-Type' => 'application/json',
          ],
          'json' => [
            'message' => [
              'token' => $token,
              'notification' => [
                'title' => $title,
                'body' => $message,
              ],
              'data' => [
                'event_title' => $title,
                'title' => $title,
                'body' => $message,
                'message' => $message,
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
              ],
            ],
          ],
        ]);
        $results['sent']++;
      } catch (\Exception $e) {
        $results['failed']++;
        $results['errors'][] = substr($token, 0, 10) . '...: ' . $e->getMessage();
      }
    }

    if ($results['sent'] > 0) {
      $this->logger->info('FCM Bulk Send: @count successfully sent.', ['@count' => $results['sent']]);
    }
    if ($results['failed'] > 0) {
      $this->logger->error('FCM Bulk Failure: @count failed. Details: @details', [
        '@count' => $results['failed'],
        '@details' => implode(', ', array_slice($results['errors'], 0, 10)) . (count($results['errors']) > 10 ? '...' : '')
      ]);
    }
  }
}

