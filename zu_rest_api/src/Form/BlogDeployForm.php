<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for deploying blogs.
 */
class BlogDeployForm extends FormBase
{

  /**
   * {@inheritdoc}
   */
  public function getFormId()
  {
    return 'blog_admin_deploy_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $form['description'] = [
      '#markup' => $this->t('<p>Click the button below to deploy Blog.</p>'),
    ];

    $form['deploy'] = [
      '#type' => 'submit',
      '#value' => $this->t('Deploy Blog'),
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
    $result = $manager->deploy('blogs');

    if ($result->success) {
      \Drupal::messenger()->addStatus($this->t('Blog deployed successfully.'));
    } else {
      \Drupal::messenger()->addError($this->t('Blog deployment failed.'));
    }
  }
}
