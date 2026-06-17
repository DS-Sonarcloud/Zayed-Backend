<?php

namespace Drupal\event_bulk_upload\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\File\FileSystemInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class EventBulkUploadSettingsForm extends ConfigFormBase
{
  protected $fileSystem;
  public function __construct(FileSystemInterface $file_system)
  {
    $this->fileSystem = $file_system;
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('file_system')
    );
  }

  protected function getEditableConfigNames()
  {
    return ['event_bulk_upload.settings'];
  }
  // Removed getEditableConfigNames() as settings are now stored in State API.

  public function getFormId()
  {
    return 'event_bulk_upload_settings_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {
    // $config = $this->config('event_bulk_upload.settings'); // Removed config usage for State API
    // Use a dedicated directory for sync files
    $sync_dir = DRUPAL_ROOT . '/event_sync_data';

    // Ensure directory exists for scanning ease, though scanning might just fail gracefully if empty
    if (!is_dir($sync_dir)) {
      // mkdir($sync_dir, 0775, true); // Don't create on build, simply won't have files
    }

    $files = glob($sync_dir . '/*.json');
    $options = [];
    if ($files) {
      foreach ($files as $file) {
        $options[basename($file)] = basename($file);
      }
    }

    $form['base_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Base URL'),
      '#default_value' => \Drupal::state()->get('event_bulk_upload.base_url'),
      '#required' => TRUE,
    ];

    $form['token_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Token URL'),
      '#default_value' => \Drupal::state()->get('event_bulk_upload.token_url'),
      '#required' => TRUE,
    ];

    // $form['event_endpoint'] = [
    //   '#type' => 'textfield',
    //   '#title' => $this->t('Event Endpoint'),
    //   '#default_value' => \Drupal::state()->get('event_bulk_upload.event_endpoint'),
    //   '#required' => TRUE,
    // ];

    $form['username'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API Username'),
      '#default_value' => \Drupal::state()->get('event_bulk_upload.username'),
    ];

    $form['password'] = [
      '#type' => 'password',
      '#title' => $this->t('API Password'),
      '#default_value' => \Drupal::state()->get('event_bulk_upload.password'),
    ];

    $form['json_file_select'] = [
      '#type' => 'select',
      '#title' => $this->t('Select existing JSON file'),
      '#options' => $options,
      '#empty_option' => $this->t('- Create New File -'),
      '#default_value' => \Drupal::state()->get('event_bulk_upload.json_filename'),
    ];

    $form['json_file_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Or enter new JSON file name'),
      '#description' => $this->t('Example: newevents.json'),
    ];

    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // $config = $this->config('event_bulk_upload.settings'); // Removed

    $storage_dir = DRUPAL_ROOT . '/event_sync_data';
    if (!is_dir($storage_dir)) {
      mkdir($storage_dir, 0775, true);
    }

    $selected = $form_state->getValue('json_file_select');
    $custom = trim($form_state->getValue('json_file_name'));

    $filename = $custom ?: $selected;

    if (!$filename) {
      $filename = 'events.json';
    }

    if (!str_ends_with($filename, '.json')) {
      $filename .= '.json';
    }

    $file_path = $storage_dir . '/' . $filename;

    // Create or update JSON file
    if (!file_exists($file_path)) {
      file_put_contents($file_path, json_encode([
        'created' => date('c'),
        'data' => [],
      ], JSON_PRETTY_PRINT));
    }

    // Save settings to State API
    \Drupal::state()->set('event_bulk_upload.base_url', $form_state->getValue('base_url'));
    \Drupal::state()->set('event_bulk_upload.token_url', $form_state->getValue('token_url'));
    // event_endpoint removed from form but logic might need it. Assuming standard WP endpoint for now as per sync logic.
    \Drupal::state()->set('event_bulk_upload.username', $form_state->getValue('username'));
    \Drupal::state()->set('event_bulk_upload.password', $form_state->getValue('password'));
    \Drupal::state()->set('event_bulk_upload.json_filename', $filename);

    // --- TRIGGER IMMEDIATE SYNC ---
    try {
      $client = \Drupal::httpClient();
      $base_url = rtrim($form_state->getValue('base_url'), '/');
      $token_url_val = $form_state->getValue('token_url');
      if (str_contains($token_url_val, 'posts')) {
        $token_url_val = '/wp-json/jwt-auth/v1/token';
      }
      $token_url = $base_url . '/' . ltrim($token_url_val, '/');

      // 1. Get Token
      $response = $client->post($token_url, [
        'json' => [
          'username' => $form_state->getValue('username'),
          'password' => $form_state->getValue('password'),
        ],
        'http_errors' => false,
        'timeout' => 90,
      ]);

      $data = json_decode((string) $response->getBody(), true);
      $token = $data['token'] ?? null;

      if ($token) {
        $posts_url = $base_url . $form_state->getValue('token_url');
        $response = $client->get($posts_url, [
          'headers' => [
            'Authorization' => 'Bearer ' . $token,
          ],
          'http_errors' => false,
          'timeout' => 90,
        ]);

        $status_code = $response->getStatusCode();
        $posts_data = json_decode((string) $response->getBody(), true);

        // Check if response is a WordPress API error
        if (is_array($posts_data) && isset($posts_data['code']) && isset($posts_data['message'])) {
          // WordPress returned an error response
          $error_code = $posts_data['code'];
          $error_message = $posts_data['message'];

          // Build helpful error message based on error type
          if (str_contains($error_code, 'rest_invalid_param') || str_contains($error_message, 'page')) {
            // Parameter validation error
            $param_details = '';
            if (isset($posts_data['data']['params'])) {
              $params = $posts_data['data']['params'];
              $param_details = ' (' . implode(', ', array_keys($params)) . ')';
            }
            $this->messenger()->addError($this->t(
              // '@details: @message Check your Token URL and ensure parameters like "page" have valid values (not empty).',
              '@message Check your Token URL and ensure parameters like "page" have valid values (not empty).',
              // ['@details' => $param_details, '@message' => $error_message]
              ['@message' => $error_message]
            ));
          } else {
            // Other API errors
            $this->messenger()->addError($this->t(
              'API Error (@code): @message',
              ['@code' => $error_code, '@message' => $error_message]
            ));
          }
        } elseif ($status_code >= 200 && $status_code < 300 && is_array($posts_data)) {
          // Success - valid posts data
          file_put_contents(
            $file_path,
            json_encode($posts_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
          );
          $this->messenger()->addStatus($this->t('Synced @count posts from API to @file', ['@count' => count($posts_data), '@file' => $filename]));
        } else {
          // HTTP error without WordPress error structure
          $this->messenger()->addError($this->t(
            'API request failed with HTTP status @status. Please verify your Token URL is correct.',
            ['@status' => $status_code]
          ));
        }
      } else {
        // Token authentication failed
        $error_msg = $data['message'] ?? 'Unknown authentication error';
        $this->messenger()->addWarning($this->t(
          'Could not obtain token: @message Settings saved but sync failed.',
          ['@message' => $error_msg]
        ));
      }
    } catch (\Exception $e) {
      $this->messenger()->addError($this->t('Sync Error: @message', ['@message' => $e->getMessage()]));
    }

    parent::submitForm($form, $form_state);
  }
}
