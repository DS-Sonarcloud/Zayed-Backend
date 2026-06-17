<?php

namespace Drupal\jobs_module\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;
use Drupal\node\Entity\Node;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Drupal\zu_rest_api\Constants;
use Drupal\zu_public_user\Entity\PublicUser;
use Drupal\Core\Access\AccessResult;

/**
 * Job application form that mirrors API behavior (JWT protected).
 */
class JobApplicationForm extends FormBase
{

  /**
   * {@inheritdoc}
   */
  public function getFormId()
  {
    return 'job_application_custom_form';
  }

  /**
   * Extract JWT from Authorization header or ?token= query.
   */
  protected function extractToken()
  {
    $request = \Drupal::request();
    $auth = $request->headers->get('Authorization');
    if ($auth && preg_match('/Bearer\s+(\S+)/', $auth, $m)) {
      return $m[1];
    }
    return $request->query->get('token');
  }
 
  public function buildForm(array $form, FormStateInterface $form_state, $job_id = NULL)
  {
    // Validate token & load public user
    $token = $this->extractToken();
    if (!$token) {
      // Redirect to public user login if no token
      return ['#type' => 'markup', '#markup' => '<script>window.location="/public-user/login";</script>'];
    }

    try {
      $decoded = JWT::decode($token, new Key(Constants::JWT_SECRET, Constants::JWT_ALGO));
    } catch (\Exception $e) {
      return ['#type' => 'markup', '#markup' => '<script>window.location="/public-user/login";</script>'];
    }

    $uid = $decoded->user_id ?? NULL;
    if (!$uid) {
      return ['#type' => 'markup', '#markup' => '<script>window.location="/public-user/login";</script>'];
    }

    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $public_user */
    $public_user = PublicUser::load($uid);
    if (!$public_user) {
      return ['#type' => 'markup', '#markup' => '<script>window.location="/public-user/login";</script>'];
    }

    // Ensure upload directory exists.
    $directory = 'public://job-resumes';
    \Drupal::service('file_system')->prepareDirectory(
      $directory,
      FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS
    );

    // Validate job node
    $job = Node::load($job_id);
    if (!$job) {
      $form['#markup'] = $this->t('Invalid job.');
      return $form;
    }

    // Try to load existing application for this user + job (by public_user_id or email)
    $connection = \Drupal::database();
    $existing = $connection->select('job_application', 'ja')
      ->fields('ja')
      ->condition('job_id', $job_id)
      ->condition('public_user_id', $uid)
      ->execute()
      ->fetchAssoc();

    if (!$existing) {
      // fallback by email (older records)
      $existing = $connection->select('job_application', 'ja')
        ->fields('ja')
        ->condition('job_id', $job_id)
        ->condition('applicant_email', $public_user->get('email')->value)
        ->execute()
        ->fetchAssoc();
    }

    // Build form
    $form['#attributes']['enctype'] = 'multipart/form-data';
    $form['#tree'] = TRUE;

    $form['job_id'] = [
      '#type' => 'hidden',
      '#value' => $job_id,
    ];

    $form['name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Full Name'),
      '#required' => TRUE,
      '#default_value' => $public_user->get('name')->value,
      '#attributes' => ['readonly' => 'readonly'],
    ];

    $form['email'] = [
      '#type' => 'email',
      '#title' => $this->t('Email'),
      '#required' => TRUE,
      '#default_value' => $public_user->get('email')->value,
      '#attributes' => ['readonly' => 'readonly'],
    ];

    $form['mobile_number'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Mobile Number'),
      '#default_value' => $existing['mobile_number'] ?? '',
    ];

    // If a resume exists, show a note with preview link
    if (!empty($existing['resume_fid']) && ($file = File::load($existing['resume_fid']))) {
      $uri = $file->getFileUri();
      $url = \Drupal::service('file_url_generator')->generateAbsoluteString($uri);
      $form['existing_resume'] = [
        '#type' => 'item',
        '#title' => $this->t('Existing resume'),
        '#markup' => '<a href="' . $url . '" target="_blank">' . $this->t('Preview Resume') . '</a>',
      ];
    }

    $form['resume'] = [
      '#type' => 'managed_file',
      '#title' => $this->t('Upload Resume'),
      '#upload_location' => $directory,
      '#required' => empty($existing['resume_fid']),
      '#description' => $this->t('Allowed: pdf, doc, docx. Uploading a new resume will replace the previous file.'),
    ];

    $form['cover_letter'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Cover Letter'),
      '#required' => FALSE,
      '#default_value' => $existing['cover_letter'] ?? '',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t($existing ? 'Update Application' : 'Submit Application'),
    ];

    // Store loaded context for submit handler
    $form_state->set('jobs_module_public_user', $public_user);
    $form_state->set('jobs_module_existing_application', $existing);

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state)
  {
    // You can add extra validation for resume extension/size here if needed.
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $values = $form_state->getValues();
    $job_id = $values['job_id'];

    /** @var \Drupal\zu_public_user\Entity\PublicUser $public_user */
    $public_user = $form_state->get('jobs_module_public_user');
    $existing = $form_state->get('jobs_module_existing_application');

    $applicant_name = $public_user->get('name')->value;
    $applicant_email = $public_user->get('email')->value;
    $mobile = $values['mobile_number'] ?? '';
    $cover_letter = $values['cover_letter'] ?? '';

    // Handle managed_file resume upload from the form.
    $fid = $existing['resume_fid'] ?? NULL;
    if (!empty($values['resume'][0])) {
      $uploaded_fid = (int) $values['resume'][0];
      $file = File::load($uploaded_fid);
      if ($file) {
        $file->setPermanent();
        $file->save();
        $fid = $file->id();
      }
    }

    $time = time();
    $connection = \Drupal::database();

    // Existing application -> update if allowed
    if ($existing) {
      // If status is not 'submitted' we block changes
      if (($existing['status'] ?? '') !== 'submitted') {
        $this->messenger()->addError($this->t('You cannot edit this application at the current status.'));
        // Redirect back to job page
        $form_state->setRedirect('entity.node.canonical', ['node' => $job_id]);
        return;
      }

      // Sync public_user_id if missing
      if (empty($existing['public_user_id'])) {
        $connection->update('job_application')
          ->fields(['public_user_id' => $public_user->id()])
          ->condition('id', $existing['id'])
          ->execute();
      }

      // Update record
      $connection->update('job_application')
        ->fields([
          'applicant_name' => $applicant_name,
          'applicant_email' => $applicant_email,
          'mobile_number' => $mobile,
          'cover_letter' => $cover_letter,
          'resume_fid' => $fid,
          'changed' => $time,
        ])
        ->condition('id', $existing['id'])
        ->execute();

      // Send email to applicant & admin — render twig template if available
      $job = Node::load($job_id);
      $job_title = $job ? $job->getTitle() : $this->t('Job');

      // Try to render Twig template (if you have templates in your module)
      try {
        $body = \Drupal::service('twig')->render('modules/custom/jobs_module/templates/application_updated.html.twig', [
          'name' => $applicant_name,
          'job_title' => $job_title,
        ]);
      } catch (\Exception $e) {
        // Fallback plain text body.
        $body = $this->t("Dear @name,\n\nYour application for \"@job\" has been updated.", [
          '@name' => $applicant_name,
          '@job' => $job_title,
        ]);
      }

      jobs_module_send_mail('application_updated_user', $applicant_email, [
        'subject' => $this->t('Application updated for @job', ['@job' => $job_title]),
        'body' => $body,
      ]);

      $admin_email = \Drupal::config('system.site')->get('mail');
      if ($admin_email) {
        jobs_module_send_mail('application_updated_admin', $admin_email, [
          'subject' => $this->t('Application updated: @job', ['@job' => $job_title]),
          'body' => $this->t('@name (@mail) updated their application for @job (Job ID: @jid).', [
            '@name' => $applicant_name,
            '@mail' => $applicant_email,
            '@job' => $job_title,
            '@jid' => $job_id,
          ]),
        ]);
      }

      $this->messenger()->addMessage($this->t('Application updated successfully.'));
      $form_state->setRedirect('entity.node.canonical', ['node' => $job_id]);
      return;
    }

    // No existing -> insert new record
    $connection->insert('job_application')
      ->fields([
        'job_id' => $job_id,
        'public_user_id' => $public_user->id(),
        'applicant_name' => $applicant_name,
        'applicant_email' => $applicant_email,
        'mobile_number' => $mobile,
        'cover_letter' => $cover_letter,
        'resume_fid' => $fid,
        'status' => 'submitted',
        'created' => $time,
        'changed' => $time,
      ])
      ->execute();

    // Email notifications for new submission
    $job = Node::load($job_id);
    $job_title = $job ? $job->getTitle() : $this->t('Job');

    try {
      $body = \Drupal::service('twig')->render('modules/custom/jobs_module/templates/application_submitted.html.twig', [
        'name' => $applicant_name,
        'job_title' => $job_title,
      ]);
    } catch (\Exception $e) {
      $body = $this->t("Dear @name,\n\nYour application for \"@job\" has been received. Thank you!", [
        '@name' => $applicant_name,
        '@job' => $job_title,
      ]);
    }

    jobs_module_send_mail('application_received_applicant', $applicant_email, [
      'subject' => $this->t('Application received for @job', ['@job' => $job_title]),
      'body' => $body,
    ]);

    $admin_email = \Drupal::config('system.site')->get('mail');
    if ($admin_email) {
      jobs_module_send_mail('application_received_admin', $admin_email, [
        'subject' => $this->t('New job application: @job', ['@job' => $job_title]),
        'body' => $this->t('Applicant: @name <@mail> for job @job (ID: @jid)', [
          '@name' => $applicant_name,
          '@mail' => $applicant_email,
          '@job' => $job_title,
          '@jid' => $job_id,
        ]),
      ]);
    }

    $this->messenger()->addMessage($this->t('Your application has been submitted successfully.'));
    $form_state->setRedirect('entity.node.canonical', ['node' => $job_id]);
  }
}
