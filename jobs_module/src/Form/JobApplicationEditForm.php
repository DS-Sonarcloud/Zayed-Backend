<?php

namespace Drupal\jobs_module\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Admin form to edit job application status.
 */
class JobApplicationEditForm extends FormBase
{

  public function getFormId()
  {
    return 'jobs_module_application_edit_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, $id = NULL)
  {
    $id = (int) $this->getRouteMatch()->getParameter('id') ?: $id;
    if (empty($id)) {
      $form['#markup'] = $this->t('Invalid application.');
      return $form;
    }

    $conn = \Drupal::database();
    $record = $conn->select('job_application', 'ja')
      ->fields('ja')
      ->condition('id', $id)
      ->execute()
      ->fetchAssoc();

    if (!$record) {
      $form['#markup'] = $this->t('Application not found.');
      return $form;
    }

    $form['id'] = ['#type' => 'value', '#value' => $id];
    $form['job_info'] = ['#markup' => $this->t('<strong>Job:</strong> @title', ['@title' => \Drupal::entityTypeManager()->getStorage('node')->load($record['job_id'])->getTitle()])];
    $form['applicant'] = ['#markup' => $this->t('<strong>Applicant:</strong> @name &lt;@email&gt;', ['@name' => $record['applicant_name'] ?: '-', '@email' => $record['applicant_email']])];

    $options = [
      'submitted' => $this->t('Submitted'),
      'round1' => $this->t('Shortlisted — Technical Round 1'),
      'round2' => $this->t('Shortlisted — Technical Round 2'),
      'hr' => $this->t('Shortlisted — HR Round'),
      'rejected' => $this->t('Not moving forward (Rejected)'),
    ];

    $form['status'] = [
      '#type' => 'select',
      '#title' => $this->t('Application Status'),
      '#options' => $options,
      '#default_value' => $record['status'],
    ];

    $form['admin_comment'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Message to applicant (optional)'),
      '#description' => $this->t('Optional message that will be emailed to the applicant when you update the status.'),
    ];

    $form['actions']['#type'] = 'actions';
    $form['actions']['save'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
      '#button_type' => 'primary',
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state) {}

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $id = $form_state->getValue('id');
    $new_status = $form_state->getValue('status');
    $comment = $form_state->getValue('admin_comment');

    $conn = \Drupal::database();
    $record = $conn->select('job_application', 'ja')
      ->fields('ja')
      ->condition('id', $id)
      ->execute()
      ->fetchAssoc();
    if (!$record) {
      $this->messenger()->addError($this->t('Application not found.'));
      return;
    }

    // If changed, update and send email.
    if ($record['status'] !== $new_status) {
      $time = \Drupal::time()->getRequestTime();
      $conn->update('job_application')
        ->fields(['status' => $new_status, 'changed' => $time])
        ->condition('id', $id)
        ->execute();

      // Prepare status message text.
      $map = [
        'submitted' => $this->t('Submitted'),
        'round1' => $this->t('Your resume is shortlisted for Technical Round 1.'),
        'round2' => $this->t('Your resume is shortlisted for Technical Round 2.'),
        'hr' => $this->t('Your resume is shortlisted for HR Round.'),
        'rejected' => $this->t('We are not moving forward with your application.'),
      ];
      $body = $map[$new_status] ?? $this->t('Application status updated.');
      if (!empty($comment)) {
        $body .= "\n\n" . $comment;
      }

      // Send email to applicant.
      $params = [
        'subject' => $this->t('Application update'),
        'body' => $body,
      ];
      jobs_module_send_mail('application_status_update', $record['applicant_email'], $params);

      $this->messenger()->addStatus($this->t('Status updated and applicant notified.'));
    } else {
      $this->messenger()->addStatus($this->t('No status change.'));
    }

    // Redirect back to list.
    $form_state->setRedirect('jobs_module.list');
  }
}
