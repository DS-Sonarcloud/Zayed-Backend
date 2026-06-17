<?php

namespace Drupal\email_marketing\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\Entity\User;
use Drupal\file\Entity\File;

class UserGroupsForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'email_marketing_user_groups_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state) {

    // --- Drupal Users ---
    $users = \Drupal::entityTypeManager()
      ->getStorage('user')
      ->loadByProperties(['status' => 1]);

    $options = [];
    foreach ($users as $user) {
      if ($user->id() == 0) {
        continue; // Skip anonymous.
      }
      $options['drupal_' . $user->id()] = $user->getEmail();
    }

    $form['users'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Drupal Users'),
      '#options' => $options,
      '#default_value' => $form_state->getValue('users') ?? [],
    ];  

  $form['csv_file'] = [
      '#type' => 'file',
      '#title' => $this->t('Upload CSV File'),
      '#description' => $this->t('Only CSV files are allowed.'),
    ];

    $form['preview'] = [
      '#type' => 'submit',
      '#value' => $this->t('Preview'),
      '#submit' => ['::previewCsv'], // Custom submit handler
      '#limit_validation_errors' => [], // Skip other validations
    ];

    $form['send_email'] = [
      '#type' => 'submit',
      '#value' => $this->t('Send Email'),
      '#submit' => ['::sendEmails'],
    ];

    // Step 2: If emails are stored in form_state, show checkboxes
    $emails = $form_state->get('csv_emails');
    if (!empty($emails)) {
      $options = array_combine($emails, $emails); // key = value
      $form['emails'] = [
        '#type' => 'checkboxes',
        '#title' => $this->t('Select Emails to Send from CSV'),
        '#options' => $options,
      ];

      
    }

    return $form;
  }

  /**
   * Custom submit handler for preview button.
   */
  public function previewCsv(array &$form, FormStateInterface $form_state) {

    // Get uploaded file from $_FILES
    if (!empty($_FILES['files']['tmp_name']['csv_file'])) {
      $tmp_file = $_FILES['files']['tmp_name']['csv_file'];
      $file_name = $_FILES['files']['name']['csv_file'];

      // Only allow CSV files
      if (strtolower(pathinfo($file_name, PATHINFO_EXTENSION)) !== 'csv') {
        // $this->messenger()->addError('Only CSV files are allowed.');
        return;
      }

      // Read CSV
      if (($handle = fopen($tmp_file, 'r')) !== FALSE) {
        $emails = [];
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
          // Assuming emails are in first column
          $emails[] = $data[0];
        }
        fclose($handle);

        if (!empty($emails)) {
          // $this->messenger()->addMessage('<strong>CSV Preview:</strong>', ['html' => TRUE]);
          foreach ($emails as $email) {
           
            // $this->messenger()->addMessage($email);
          }
          $form_state->set('csv_emails', $emails);
          $form_state->setRebuild(TRUE); // Rebuild form to show checkboxes
        } else {
          // $this->messenger()->addMessage('No data found in CSV.');
        }

      } else {
        // $this->messenger()->addError('Could not open CSV file.');
      }

    } else {
      // $this->messenger()->addError('No file uploaded.');
    }
  }

  /**
   * Send emails to selected addresses.
   */
  public function sendEmails(array &$form, FormStateInterface $form_state) {
    $selected = [];
    if (is_array($form_state->getValue('emails'))) {
      $selected = array_filter($form_state->getValue('emails'));
    }

    $mailManager = \Drupal::service('plugin.manager.mail');
    $module = 'email_marketing';
    $key = 'user_group_email';
    $langcode = $this->currentUser()->getPreferredLangcode();

    $selected_emails = [];

    // Selected Drupal users.
    $drupal_uids = array_filter($form_state->getValue('users') ?? []);
    foreach ($drupal_uids as $uid_key) {
      if (strpos($uid_key, 'drupal_') === 0) {
        $uid = str_replace('drupal_', '', $uid_key);
        $user = User::load($uid);
        if ($user && $user->getEmail()) {
          $selected_emails[] = $user->getEmail();
        }
      }
    }
    $selected_emails = array_merge($selected_emails, $selected);
    $selected_emails = array_unique($selected_emails);

    foreach ($selected_emails as $email) {
      $params['subject'] = 'Test Email';
      $params['message'] = 'Hello, this is a test email.';

      $result = $mailManager->mail($module, $key, $email, $langcode, $params);
      if ($result['result'] !== TRUE) {
        $this->messenger()->addError("Failed to send email to $email");
      } else {
        $this->messenger()->addMessage("Email sent to $email");
      }
    }
  }


  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Nothing here; preview uses custom submit
  }
}
