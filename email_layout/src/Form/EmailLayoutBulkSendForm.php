<?php

namespace Drupal\email_layout\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\Entity\User;
use Drupal\node\Entity\Node;
use Drupal\email_layout\Batch\EmailLayoutBatch;

class EmailLayoutBulkSendForm extends FormBase {

  public function getFormId() {
    return 'email_layout_bulk_send_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    // Load email template nodes
    $templates = \Drupal::entityTypeManager()->getStorage('node')->loadByProperties(['type' => 'email_template']);
    $template_options = [];
    foreach ($templates as $template) {
      $template_options[$template->id()] = $template->label();
    }

    $form['template'] = [
      '#type' => 'select',
      '#title' => $this->t('Email Template'),
      '#options' => $template_options,
      '#required' => TRUE,
    ];

    // Load active users with email
    $users = \Drupal::entityTypeManager()->getStorage('user')->loadMultiple();
    $user_options = [];
    foreach ($users as $user) {
      if ($user->isActive() && $user->getEmail()) {
        $user_options[$user->id()] = $user->getDisplayName() . ' (' . $user->getEmail() . ')';
      }
    }

    $form['users'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Select Users'),
      '#options' => $user_options,
      '#required' => TRUE,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Send Emails'),
    ];

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $template_nid = $form_state->getValue('template');
    $user_ids = array_filter($form_state->getValue('users'));

    $operations = [];
    foreach ($user_ids as $uid) {
      $operations[] = [
        [EmailLayoutBatch::class, 'sendEmailOperation'],
        [$uid, $template_nid],
      ];
    }

    $batch = [
      'title' => $this->t('Sending Emails...'),
      'operations' => $operations,
      'finished' => [EmailLayoutBatch::class, 'batchFinished'],
    ];

    batch_set($batch);
  }
}
