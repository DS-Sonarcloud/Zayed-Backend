<?php

namespace Drupal\event_calendar\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class FirebaseSettingsForm extends ConfigFormBase
{

  public function getFormId()
  {
    return 'event_calendar_firebase_settings_form';
  }

  protected function getEditableConfigNames()
  {
    return ['event_calendar.settings'];
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $config = $this->config('event_calendar.settings');

    $firebase_json_path = $config->get('firebase_json_path');
    $form['firebase_json_path'] = [
      '#type' => 'managed_file',
      '#title' => $this->t('Firebase JSON File'),
      '#description' => $this->t('Upload your Firebase service account JSON file.'),
      '#upload_location' => 'public://firebase/',
      '#default_value' => $firebase_json_path ? [$firebase_json_path] : [],
      '#upload_validators' => [
        'FileExtension' => ['extensions' => 'json'],
      ],
      '#required' => TRUE,
    ];

    $form['firebase_config'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Firebase Web Config'),
      '#description' => $this->t('Paste your Firebase web configuration as JSON.'),
      '#default_value' => $config->get('firebase_config'),
      '#required' => TRUE,
    ];


    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $firebase_json_path = $form_state->getValue('firebase_json_path');
    $file_id = is_array($firebase_json_path) && !empty($firebase_json_path) ? reset($firebase_json_path) : NULL;

    $this->config('event_calendar.settings')
      ->set('firebase_json_path', $file_id)
      ->set('firebase_config', $form_state->getValue('firebase_config'))
      ->save();

    parent::submitForm($form, $form_state);
  }
}
