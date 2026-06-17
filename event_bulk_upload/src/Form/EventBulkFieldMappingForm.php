<?php

namespace Drupal\event_bulk_upload\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\file\Entity\File;

class EventBulkFieldMappingForm extends FormBase
{

  protected $tempStore;
  protected $entityFieldManager;

  public function __construct(PrivateTempStoreFactory $tempStoreFactory, EntityFieldManagerInterface $entityFieldManager)
  {
    $this->tempStore = $tempStoreFactory->get('event_bulk_upload');
    $this->entityFieldManager = $entityFieldManager;
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('tempstore.private'),
      $container->get('entity_field.manager')
    );
  }

  public function getFormId()
  {
    return 'event_bulk_field_mapping_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $fid = $this->tempStore->get('csv_fid');

    if (!$fid) {
      $this->messenger()->addError($this->t('No CSV file found. Please upload a file first.'));
      return $this->redirect('event_bulk_upload.form');
    }

    $file = File::load($fid);
    if (!$file) {
      $this->messenger()->addError($this->t('File not found.'));
      return $this->redirect('event_bulk_upload.form');
    }

    $uri = $file->getFileUri();
    $handle = fopen($uri, 'r');
    $header = fgetcsv($handle);
    fclose($handle);

    if (!$header) {
      $this->messenger()->addError($this->t('Invalid CSV file.'));
      return $this->redirect('event_bulk_upload.form');
    }

    $header_options = array_combine($header, $header);

    $field_definitions = $this->entityFieldManager->getFieldDefinitions('node', 'event');
    $event_fields = [];
    foreach ($field_definitions as $field_name => $definition) {
      if (strpos($field_name, 'field_') === 0 || $field_name == 'title' || $field_name == 'body' || $field_name == 'feeds_item') {
        $event_fields[$field_name] = $definition->getLabel() . ' (' . $field_name . ')';
      }
    }

    $form['mapping_table'] = [
      '#type' => 'table',
      '#header' => [
        $this->t('Target Event Field'),
        $this->t('Source CSV Column'),
      ],
      '#empty' => $this->t('No fields found'),
    ];

    foreach ($event_fields as $field_name => $label) {
      $form['mapping_table'][$field_name]['target'] = [
        '#plain_text' => $label,
      ];

      $form['mapping_table'][$field_name]['source'] = [
        '#type' => 'select',
        '#options' => $header_options,
        '#empty_option' => $this->t('- Select -'),
        '#default_value' => $this->guessMapping($field_name, $header_options),
      ];
    }

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Confirm Mapping'),
      '#button_type' => 'primary',
    ];

    $form['actions']['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Cancel'),
      '#url' => \Drupal\Core\Url::fromRoute('event_bulk_upload.form'),
      '#attributes' => ['class' => ['button']],
    ];

    return $form;
  }

  private function guessMapping($field_name, $header_options)
  {
    foreach ($header_options as $header) {
      $clean_header = strtolower(trim($header));
      $clean_field = strtolower(str_replace('field_', '', $field_name));

      if ($clean_header == $clean_field)
        return $header;

      if ($field_name == 'title' && (stripos($header, 'name') !== false || stripos($header, 'title') !== false))
        return $header;
      if ($field_name == 'field_external_id' && (stripos($header, 'id') !== false || stripos($header, 'guid') !== false))
        return $header;

      if ($field_name == 'field_description' && stripos($header, 'desc') !== false)
        return $header;
      if ($field_name == 'field_start_date' && stripos($header, 'start') !== false)
        return $header;
      if ($field_name == 'field_end_date' && stripos($header, 'end') !== false)
        return $header;
    }
    return NULL;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $values = $form_state->getValue('mapping_table');
    $mapping = [];

    foreach ($values as $field_name => $data) {
      if (!empty($data['source'])) {
        $mapping[$field_name] = $data['source'];
      }
    }

    $this->tempStore->set('csv_mapping', $mapping);
    $this->messenger()->addStatus($this->t('Mapping saved. Ready to process.'));
    $form_state->setRedirect('event_bulk_upload.form');
  }
}
