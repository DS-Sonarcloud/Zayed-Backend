<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for deploying events.
 */
class EventsDeployForm extends FormBase
{

  /**
   * {@inheritdoc}
   */
  public function getFormId()
  {
    return 'events_admin_deploy_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $form['description'] = [
      '#markup' => $this->t('<p>Click the button below to deploy events.</p>'),
    ];

    $form['deploy'] = [
      '#type' => 'submit',
      '#value' => $this->t('Deploy Events'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    /** @var \Drupal\zu_rest_api\Service\ContentDeployManager $manager */
    $manager = \Drupal::service('zu_rest_api.content_deploy_manager');
    $result = $manager->deploy('event');

    if ($result->success) {
      \Drupal::messenger()->addStatus($this->t('Events deployed successfully.'));
    } else {
      \Drupal::messenger()->addError($this->t('Events deployment failed.'));
    }
  }
}
