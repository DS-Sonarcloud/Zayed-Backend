<?php

namespace Drupal\jobs_module\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Database;
use Drupal\Core\Url;
use Drupal\Core\Link;
use Drupal\node\Entity\Node;
use Drupal\file\Entity\File;
use Drupal\zu_public_user\Entity\PublicUser;

class JobApplicationFilterForm extends FormBase
{

  public function getFormId()
  {
    return 'job_application_filter_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {

    $user = \Drupal::currentUser();
    $uid = $user->id();
    $is_admin = $user->hasPermission('administer jobs module');
    $can_manage_own = $user->hasPermission('manage applicants for own jobs');

    // Load stored AJAX filter values
    $filters = $form_state->get('filters') ?: [
      'job_title' => '',
      'public_user' => '',
      'status' => '',
    ];

    // AJAX wrapper
    $form['#prefix'] = '<div id="job-app-wrapper">';
    $form['#suffix'] = '</div>';

    // -------------------------------------
    // FILTERS
    // -------------------------------------
    $form['filters'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['filters-flex']],
    ];

    $form['filters']['job_title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Job Title'),
      '#default_value' => $filters['job_title'],
      '#ajax' => [
        'callback' => '::ajaxRefresh',
        'wrapper' => 'job-app-wrapper',
      ],
    ];

    $form['filters']['public_user'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Public User'),
      '#default_value' => $filters['public_user'],
      '#autocomplete_route_name' => 'jobs_module.public_user_autocomplete',
      '#ajax' => [
        'callback' => '::ajaxRefresh',
        'wrapper' => 'job-app-wrapper',
      ],
    ];


    $form['filters']['status'] = [
      '#type' => 'select',
      '#title' => $this->t('Status'),
      '#empty_option' => $this->t('- Any -'),
      '#options' => [
        'submitted' => 'Submitted',
        'round1' => 'Round 1',
        'round2' => 'Round 2',
        'hr' => 'HR Round',
        'rejected' => 'Rejected',
      ],
      '#default_value' => $filters['status'],
      '#ajax' => [
        'callback' => '::ajaxRefresh',
        'wrapper' => 'job-app-wrapper',
      ],
    ];

    // Submit button (AJAX)
    $form['filters']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Apply Filters'),
      '#submit' => ['::filtersSubmit'],
      '#ajax' => [
        'callback' => '::ajaxRefresh',
        'wrapper' => 'job-app-wrapper',
      ],
    ];

    // -------------------------------------
    // TABLE OUTPUT
    // -------------------------------------
    $rows = $this->loadRows($filters, $is_admin, $can_manage_own, $uid);

    $form['table'] = [
      '#type' => 'table',
      '#header' => [
        'id' => $this->t('ID'),
        'job' => $this->t('Job'),
        'applicant' => $this->t('Applicant'),
        'email' => $this->t('Email'),
        'mobile' => $this->t('Mobile'),
        'cover_letter' => $this->t('Cover Letter'),
        'resume' => $this->t('Resume'),
        'status' => $this->t('Status'),
        'created' => $this->t('Created'),
        'public_user' => $this->t('Public User'),
        'operations' => $this->t('Operations'),
      ],
      '#rows' => $rows,
      '#empty' => $this->t('No applications found.'),
    ];

    return $form;
  }

  /**
   * AJAX callback - refreshes entire wrapper.
   */
  public function ajaxRefresh(array &$form, FormStateInterface $form_state)
  {
    return $form;
  }

  /**
   * Custom submit handler for filters.
   */
  public function filtersSubmit(array &$form, FormStateInterface $form_state)
  {
    $form_state->set('filters', [
      'job_title' => $form_state->getValue('job_title'),
      'public_user' => $form_state->getValue('public_user'),
      'status' => $form_state->getValue('status'),
    ]);
    $form_state->setRebuild(TRUE);
  }

  /**
   * Required by FormBase – unused.
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // Do nothing.
  }

  /**
   * Load applications with filters.
   */
  private function loadRows(array $filters, $is_admin, $can_manage_own, $uid)
  {

    $db = Database::getConnection();

    $query = $db->select('job_application', 'ja')
      ->fields('ja')
      ->orderBy('created', 'DESC');

    // Restrict for employer
    if (!$is_admin) {
      $my_job_ids = $db->select('node_field_data', 'n')
        ->fields('n', ['nid'])
        ->condition('type', 'jobs')
        ->condition('uid', $uid)
        ->execute()
        ->fetchCol();

      if (empty($my_job_ids)) {
        return [];
      }

      $query->condition('job_id', $my_job_ids, 'IN');
    }

    // -----------------------------
    // APPLY FILTERS
    // -----------------------------
    if (!empty($filters['job_title'])) {
      $job_ids = $db->select('node_field_data', 'n')
        ->fields('n', ['nid'])
        ->condition('type', 'jobs')
        ->condition('title', '%' . $filters['job_title'] . '%', 'LIKE')
        ->execute()
        ->fetchCol();

      $query->condition('job_id', $job_ids ?: [0], 'IN');
    }

    if (!empty($filters['public_user'])) {

      // Extract ID from the autocomplete text
      if (preg_match('/ID:\s*(\d+)/', $filters['public_user'], $m)) {
        $id = (int) $m[1];
        $query->condition('public_user_id', $id);
      } else {
        // Fallback: search name/email directly
        $ids = Database::getConnection()
          ->select('public_user', 'pu')
          ->fields('pu', ['id'])
          ->condition(
            db_or()
              ->condition('pu.name', '%' . $filters['public_user'] . '%', 'LIKE')
              ->condition('pu.email', '%' . $filters['public_user'] . '%', 'LIKE')
          )
          ->execute()
          ->fetchCol();

        $query->condition('public_user_id', $ids ?: [0], 'IN');
      }
    }

    if (!empty($filters['status'])) {
      $query->condition('status', $filters['status']);
    }

    $results = $query->execute()->fetchAll();

    $rows = [];
    $date_formatter = \Drupal::service('date.formatter');
    $file_url_gen = \Drupal::service('file_url_generator');

    foreach ($results as $r) {

      // Job node
      $job = Node::load($r->job_id);
      $job_title = $job ? $job->getTitle() : '-';

      // Public user
      $pu_html = '-';
      if ($r->public_user_id && ($pu = PublicUser::load($r->public_user_id))) {
        $pu_html =
          $pu->get('name')->value .
          '<br><small>' . $pu->get('email')->value . '</small>';
      }

      // Resume link
      $resume = '-';
      if ($r->resume_fid && ($file = File::load($r->resume_fid))) {
        $url = $file_url_gen->generateAbsoluteString($file->getFileUri());
        $ext = strtolower(pathinfo($file->getFilename(), PATHINFO_EXTENSION));
        $resume = ($ext === 'pdf')
          ? "<a href='$url' target='_blank'>Preview</a>"
          : "<a href='$url' download>Download</a>";
      }

      // Permission logic for Edit/Delete
      $ops = '';
      $can_manage = $is_admin || ($can_manage_own && $job && $job->getOwnerId() == $uid);

      if ($can_manage) {
        $edit_url = Url::fromRoute('jobs_module.edit', ['id' => $r->id]);
        $ops .= Link::fromTextAndUrl('Edit', $edit_url)->toString();

        $delete_url = Url::fromRoute('jobs_module.delete', ['id' => $r->id]);
        $delete_url->setOption('attributes', [
          'onclick' => "return confirm('Delete application #{$r->id}?');",
        ]);
        $ops .= ' | ' . Link::fromTextAndUrl('Delete', $delete_url)->toString();
      }

      // Add table row
      $rows[] = [
        'id' => $r->id,
        'job' => $job_title,
        'applicant' => $r->applicant_name,
        'email' => $r->applicant_email,
        'mobile' => $r->mobile_number ?? '-',
        'cover_letter' => nl2br($r->cover_letter ?? '-'),
        'resume' => ['data' => ['#markup' => $resume]],
        'status' => ucfirst($r->status),
        'created' => $date_formatter->format($r->created, 'short'),
        'public_user' => ['data' => ['#markup' => $pu_html]],
        'operations' => ['data' => ['#markup' => $ops]],
      ];
    }

    return $rows;
  }
}
