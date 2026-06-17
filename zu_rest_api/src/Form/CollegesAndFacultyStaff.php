<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for deploying colleges and faculty staff.
 */
class CollegesAndFacultyStaff extends FormBase
{

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string
  {
    return 'FacultyAndStaff_admin_deploy_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array
  {
    $form['description'] = [
      '#markup' => $this->t('<p>Click the button below to deploy Colleges and Faculty Staff.</p>'),
    ];

    $form['deploy'] = [
      '#type' => 'submit',
      '#value' => $this->t('Deploy Colleges & Faculty Staff'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void
  {
    /** @var \Drupal\zu_rest_api\Service\ContentDeployManager $manager */
    $manager = \Drupal::service('zu_rest_api.content_deploy_manager');
    $results = $manager->deployCollegesAndFaculty();

    $colleges_result = $results['colleges'];
    $faculty_result = $results['faculty'];

    if ($colleges_result->success) {
      \Drupal::messenger()->addStatus($this->t('Colleges deployed successfully.'));
    } else {
      \Drupal::messenger()->addError($this->t('Colleges deployment failed.'));
    }

    if ($faculty_result->success) {
      \Drupal::messenger()->addStatus($this->t('Faculty deployed successfully.'));
    } else {
      \Drupal::messenger()->addError($this->t('Faculty deployment failed.'));
    }
  }
}
