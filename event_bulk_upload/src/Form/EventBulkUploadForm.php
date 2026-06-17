<?php

namespace Drupal\event_bulk_upload\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\file\Entity\File;

class EventBulkUploadForm extends FormBase
{
  protected $service;
  protected $tempStore;

  public function __construct($service, \Drupal\Core\TempStore\PrivateTempStoreFactory $tempStoreFactory)
  {
    $this->service = $service;
    $this->tempStore = $tempStoreFactory->get('event_bulk_upload');
  }
  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('event_bulk_upload.service'),
      $container->get('tempstore.private')
    );
  }
  public function getFormId()
  {
    return 'event_bulk_upload_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {

    $mapping = $this->tempStore->get('csv_mapping');
    $fid = $this->tempStore->get('csv_fid');

    if ($mapping && $fid) {
      $file = File::load($fid);
      if ($file) {
        $form['info'] = [
          '#markup' => $this->t('Ready to import file: %filename with %count mapped fields.', [
            '%filename' => $file->getFilename(),
            '%count' => count($mapping),
          ]),
        ];

        $form['actions']['finish'] = [
          '#type' => 'submit',
          '#value' => $this->t('Finish Import'),
          '#button_type' => 'primary',
          '#submit' => ['::finishImport'],
        ];

        $form['actions']['cancel'] = [
          '#type' => 'submit',
          '#value' => $this->t('Start Over'),
          '#submit' => ['::cancelImport'],
          '#limit_validation_errors' => [],
        ];
        return $form;
      }
    }

    $form['csv_file'] = [
      '#type' => 'managed_file',
      '#title' => $this->t('Upload CSV'),
      '#upload_location' => 'public://event_uploads/',
      '#upload_validators' => [
        'FileExtension' => ['extensions' => 'csv'],
      ],
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Upload CSV'),
      '#button_type' => 'primary',
    ];

    $form['actions']['bulk_api_submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Bulk API Upload'),
      '#button_type' => 'secondary',
      '#submit' => ['::bulkApiSubmit'],
    ];

    $form['actions']['api_mapping'] = [
      '#type' => 'link',
      '#title' => $this->t('API Mapping'),
      '#url' => \Drupal\Core\Url::fromRoute('event_bulk_upload.api_mapping'),
      '#attributes' => [
        'class' => ['button', 'button--api-mapping'],
        'style' => 'margin-left:10px;',
      ],
    ];


    $form['actions']['settings'] = [
      '#type' => 'link',
      '#title' => $this->t('Settings'),
      '#url' => \Drupal\Core\Url::fromRoute('event_bulk_upload.settings'),
      '#attributes' => [
        'class' => ['button', 'button--settings'],
        'style' => 'margin-left:10px;',
      ],
    ];

    $form['actions']['back'] = [
      '#type' => 'link',
      '#title' => $this->t('Back'),
      '#url' => \Drupal\Core\Url::fromRoute('<none>'),
      '#attributes' => [
        'class' => ['button', 'button--back'],
        'onclick' => 'history.back(); return false;',
        'style' => 'margin-left:10px;',
      ],
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state)
  {

    $trigger = $form_state->getTriggeringElement()['#value'];

    if ($trigger == 'Upload CSV') {
      $fids = $form_state->getValue('csv_file');

      if (empty($fids)) {
        $form_state->setErrorByName('csv_file', $this->t('Please upload a CSV file.'));
      }
    }
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {

    $fids = $form_state->getValue('csv_file');

    if (!empty($fids)) {

      $file = File::load($fids[0]);

      if ($file) {
        $file->setPermanent();
        $file->save();

        $this->tempStore->set('csv_fid', $file->id());

        $form_state->setRedirect('event_bulk_upload.mapping');
      }
    } else {
      $this->messenger()->addError('File upload failed. Please try again.');
    }
  }

  public function finishImport(array &$form, FormStateInterface $form_state)
  {
    $fid = $this->tempStore->get('csv_fid');
    $mapping = $this->tempStore->get('csv_mapping');

    if ($fid && $mapping) {
      $file = File::load($fid);
      $uri = $file->getFileUri();
      $messages = $this->service->processCsv($uri, $mapping);

      if (empty($messages)) {
        $this->messenger()->addStatus('CSV uploaded and processed successfully.');
      } else {
        $this->messenger()->addStatus('CSV processed with some skipped fields:');
        foreach ($messages as $msg) {
          $this->messenger()->addWarning($msg);
        }
      }

      $this->tempStore->delete('csv_fid');
      $this->tempStore->delete('csv_mapping');

      $form_state->setRedirect('event_bulk_upload.result');
    } else {
      $this->messenger()->addError('Import failed. Missing file or mapping.');
    }
  }

  public function cancelImport(array &$form, FormStateInterface $form_state)
  {
    $this->tempStore->delete('csv_fid');
    $this->tempStore->delete('csv_mapping');
    $this->messenger()->addStatus('Import cancelled.');
    $form_state->setRebuild();
  }
  public function bulkApiSubmit(array &$form, FormStateInterface $form_state)
  {
    try {
      $token = $this->getJwtToken();

      if (!$token) {
        $this->messenger()->addError('Failed to get JWT token.');
        return;
      }

      $result = $this->bulkCreateEvents($token);

      if (is_array($result)) {
        $this->messenger()->addStatus('Bulk API processing completed.');
        if (!empty($result)) {
          foreach ($result as $msg) {
            $this->messenger()->addWarning($msg);
          }
        }
      } else {
        $this->messenger()->addError('Bulk API call failed or returned unexpected format.');
      }
    } catch (\Exception $e) {
      $this->messenger()->addError('Error: ' . $e->getMessage());
    }
  }

  public function getJwtToken()
  {
    $client = \Drupal::httpClient();
    $state = \Drupal::state();

    $token_url = $state->get('event_bulk_upload.token_url');
    // Sanity check: if the user has the wrong URL config (e.g. pointing to posts endpoint), fix it dynamically
    if (str_contains($token_url, 'posts')) {
      $token_url = '/wp-json/jwt-auth/v1/token';
    }

    $url = rtrim($state->get('event_bulk_upload.base_url'), '/') . '/' . ltrim($token_url, '/');

    try {
      $response = $client->request('POST', $url, [
        'headers' => [
          'Content-Type' => 'application/json',
          'Accept' => 'application/json',
        ],
        'body' => json_encode([
          'username' => $state->get('event_bulk_upload.username'),
          'password' => $state->get('event_bulk_upload.password'),
        ]),
        'timeout' => 90,
        'cookies' => false,   // IMPORTANT
        'http_errors' => false,
      ]);

      if ($response->getStatusCode() !== 200) {
        \Drupal::logger('event_bulk_upload')->error(
          'JWT failed. Status: @status Response: @body',
          [
            '@status' => $response->getStatusCode(),
            '@body' => (string) $response->getBody(),
          ]
        );
        return NULL;
      }

      $data = json_decode((string) $response->getBody(), TRUE);

      return $data['token'] ?? NULL;
    } catch (\Exception $e) {
      \Drupal::logger('event_bulk_upload')->error(
        'JWT exception: @message',
        ['@message' => $e->getMessage()]
      );
      return NULL;
    }
  }

  public function bulkCreateEvents($token)
  {
    $client = \Drupal::httpClient();
    $state = \Drupal::state();

    $request = \Drupal::request();
    $base_url = $request->getSchemeAndHttpHost();
    $endpoint = $state->get('event_bulk_upload.json_filename');

    if (filter_var($endpoint, FILTER_VALIDATE_URL)) {
      $url = $endpoint;
    } else {
      $url = $base_url . '/event_sync_data/' . ltrim($endpoint, '/');
    }

    try {
      $response = $client->get($url, [
        'headers' => [
          'Authorization' => 'Bearer ' . $token,
          'Content-Type' => 'application/json',
        ],
        'timeout' => 90,
      ]);

      $body = (string) $response->getBody();
      $data = json_decode($body, TRUE);


      $filename = \Drupal::state()->get('event_bulk_upload.json_filename') ?: 'event.json';
      if ($filename && is_array($data)) {

        $dir = DRUPAL_ROOT . '/event_sync_data';
        // Ensure dir exists
        if (!is_dir($dir)) {
          mkdir($dir, 0775, true);
        }

        if (!str_ends_with($filename, '.json')) {
          $filename .= '.json';
        }

        $file_path = $dir . '/' . $filename;

        // DIRECTLY SAVE THE API DATA, OVERWRITING THE FILE
        // This ensures the file structure matches the API exactly for future processing
        file_put_contents(
          $file_path,
          json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );
        \Drupal::logger('event_bulk_upload')->info('Updated JSON file: @file', ['@file' => $file_path]);
        \Drupal::messenger()->addStatus($this->t('Local JSON file updated: %file', ['%file' => $filename]));
      }

      /* ================= EXISTING LOGIC (UNCHANGED) ================= */

      if (isset($data['eventsData']) && is_array($data['eventsData'])) {
        return $this->service->processJson($data['eventsData']);
      }

      if (is_array($data) && isset($data[0])) {
        return $this->service->processJson($data);
      }

      if (!empty($data['success'])) {
        return TRUE;
      }

      \Drupal::logger('event_bulk_upload')->error(
        'Unexpected WP API response: <pre>@data</pre>',
        ['@data' => print_r($data, TRUE)]
      );

      return FALSE;
    } catch (\Throwable $e) {
      \Drupal::logger('event_bulk_upload')->error(
        'Bulk API request failed: @message',
        ['@message' => $e->getMessage()]
      );
      return FALSE;
    }
  }
}
