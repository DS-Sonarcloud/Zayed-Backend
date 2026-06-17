<?php

namespace Drupal\event_bulk_upload\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Drupal\Core\Entity\EntityFieldManagerInterface;

/**
 * Form for mapping API JSON fields to Event node fields.
 */
class EventBulkAPIFieldMappingForm extends FormBase
{

  protected $tempStore;
  protected $entityFieldManager;

  /**
   * {@inheritdoc}
   */
  public function __construct(PrivateTempStoreFactory $tempStoreFactory, EntityFieldManagerInterface $entityFieldManager)
  {
    $this->tempStore = $tempStoreFactory->get('event_bulk_upload');
    $this->entityFieldManager = $entityFieldManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('tempstore.private'),
      $container->get('entity_field.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId()
  {
    return 'event_bulk_api_field_mapping_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $state = \Drupal::state();
    $filename = $state->get('event_bulk_upload.json_filename');
    $sync_dir = DRUPAL_ROOT . '/event_sync_data';

    $file_path = '';
    if ($filename) {
      $file_path = $sync_dir . '/' . ltrim($filename, '/');
      if (!str_ends_with(strtolower($file_path), '.json')) {
        $file_path .= '.json';
      }
    }

    // Fallback if configured file doesn't exist: find the last updated JSON in the folder
    if (!$file_path || !file_exists($file_path)) {
      $files = glob($sync_dir . '/*.json');
      if (!empty($files)) {
        usort($files, function ($a, $b) {
          return filemtime($b) - filemtime($a);
        });
        $file_path = $files[0];
      }
    }

    if (!$file_path || !file_exists($file_path)) {
      $this->messenger()->addError($this->t('No JSON sync file found in @dir. Please perform an API sync from the Settings page first.', ['@dir' => $sync_dir]));
      return $this->redirect('event_bulk_upload.settings');
    }

    $json_content = file_get_contents($file_path);
    $data = json_decode($json_content, TRUE);

    if (empty($data)) {
      $this->messenger()->addError($this->t('The JSON file "@file" is empty or invalid.', ['@file' => basename($file_path)]));
      return $this->redirect('event_bulk_upload.settings');
    }

    // Identify a sample object to extract keys from
    // Matches logic in bulkCreateEvents: checks array root or 'eventsData' key
    $sample_item = (isset($data[0]) && is_array($data[0])) ? $data[0] : (isset($data['eventsData'][0]) ? $data['eventsData'][0] : $data);

    if (!is_array($sample_item)) {
      $this->messenger()->addError($this->t('Could not find data items in the JSON file structure.'));
      return $this->redirect('event_bulk_upload.settings');
    }

    $api_keys = $this->extractKeys($sample_item);
    $key_options = array_combine($api_keys, $api_keys);

    $field_definitions = $this->entityFieldManager->getFieldDefinitions('node', 'event');
    $event_fields = [];
    foreach ($field_definitions as $field_name => $definition) {
      // Focus on content fields
      if (strpos($field_name, 'field_') === 0 || $field_name == 'title' || $field_name == 'body' || $field_name == 'feeds_item') {
        $event_fields[$field_name] = $definition->getLabel() . ' (' . $field_name . ')';
      }
    }

    $form['info'] = [
      '#markup' => '<div class="messages messages--status">' . $this->t('Mapping fields from latest data file: <strong>@file</strong>', ['@file' => basename($file_path)]) . '</div>',
    ];

    $form['mapping_table'] = [
      '#type' => 'table',
      '#header' => [
        $this->t('Target Event Field (Drupal)'),
        $this->t('Source API Field (JSON/WP)'),
      ],
      '#empty' => $this->t('No fields found'),
    ];

    $saved_mapping = $state->get('event_bulk_upload.api_mapping') ?: [];

    foreach ($event_fields as $field_name => $label) {
      $form['mapping_table'][$field_name]['target'] = [
        '#plain_text' => $label,
      ];

      $form['mapping_table'][$field_name]['source'] = [
        '#type' => 'select',
        '#options' => $key_options,
        '#empty_option' => $this->t('- Select Field -'),
        '#default_value' => $saved_mapping[$field_name] ?? $this->guessMapping($field_name, $api_keys),
      ];
    }

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save API Mapping'),
      '#button_type' => 'primary',
    ];

    $form['actions']['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Back to Upload'),
      '#url' => \Drupal\Core\Url::fromRoute('event_bulk_upload.form'),
      '#attributes' => ['class' => ['button']],
    ];

    return $form;
  }

  /**
   * Flattens associative arrays into dot-notated keys (e.g. title.rendered).
   */
  private function extractKeys($data, $prefix = '')
  {
    $keys = [];
    if (!is_array($data))
      return $keys;

    foreach ($data as $key => $value) {
      $full_key = $prefix ? $prefix . '.' . $key : $key;
      // If it's an associative array (object), go deeper. 
      // We avoid deeper levels if it's a numeric array (list of tags, etc) or flat value.
      if (is_array($value) && !isset($value[0]) && !empty($value)) {
        $keys = array_merge($keys, $this->extractKeys($value, $full_key));
      } else {
        $keys[] = $full_key;
      }
    }
    return $keys;
  }

  /**
   * intelligently guesses the mapping based on field names and WP patterns.
   */
  private function guessMapping($field_name, $api_keys)
  {
    $clean = str_replace('field_', '', $field_name);
    foreach ($api_keys as $key) {
      if (strtolower($key) == strtolower($clean))
        return $key;
    }

    // Fallback guesses
    if ($field_name == 'title' && in_array('title.rendered', $api_keys))
      return 'title.rendered';
    if ($field_name == 'body' && in_array('content.rendered', $api_keys))
      return 'content.rendered';
    if ($field_name == 'field_description' && in_array('content.rendered', $api_keys))
      return 'content.rendered';
    if ($field_name == 'field_external_id' && in_array('id', $api_keys))
      return 'id';

    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $table_values = $form_state->getValue('mapping_table');
    $mapping = [];
    foreach ($table_values as $field_name => $data) {
      if (!empty($data['source'])) {
        $mapping[$field_name] = $data['source'];
      }
    }

    \Drupal::state()->set('event_bulk_upload.api_mapping', $mapping);
    $this->messenger()->addStatus($this->t('API field mapping saved. The "Bulk API Upload" will now use this configuration.'));
    $form_state->setRedirect('event_bulk_upload.form');
  }
}
