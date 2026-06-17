<?php

namespace Drupal\custom_elastic_search\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class ElasticSearchSettingsForm extends ConfigFormBase {

  const SETTINGS = 'custom_elastic_search.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'custom_elastic_search_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      static::SETTINGS,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(static::SETTINGS);

    $form['elasticsearch_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Elasticsearch URL'),
      '#description' => $this->t('Enter the full Elasticsearch search URL, e.g. site_url/elasticsearch_index/_search'),
      '#default_value' => $config->get('elasticsearch_url') ?: 'http://192.168.1.40:9208/elasticsearch_index/_search',
      '#required' => TRUE,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->configFactory->getEditable(static::SETTINGS)
      ->set('elasticsearch_url', $form_state->getValue('elasticsearch_url'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
