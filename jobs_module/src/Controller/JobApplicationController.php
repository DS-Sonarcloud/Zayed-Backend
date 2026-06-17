<?php

namespace Drupal\jobs_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\Core\Link;
use Drupal\file\Entity\File;
use Drupal\node\Entity\Node;
use Drupal\zu_public_user\Entity\PublicUser;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Admin + Employer listing for job applications.
 */
class JobApplicationController extends ControllerBase
{

  /**
   * Listing of job applications.
   */
  public function listing()
  {

    return \Drupal::formBuilder()->getForm('Drupal\jobs_module\Form\JobApplicationFilterForm');
    // $current_user = \Drupal::currentUser();
    // $uid = $current_user->id();

    // $is_admin = $current_user->hasPermission('administer jobs module');
    // $can_manage_own = $current_user->hasPermission('manage applicants for own jobs');

    // $header = [
    //   'id'           => $this->t('ID'),
    //   'job'          => $this->t('Job'),
    //   'applicant'    => $this->t('Applicant'),
    //   'email'        => $this->t('Email'),
    //   'mobile'       => $this->t('Mobile'),
    //   'cover_letter' => $this->t('Cover Letter'),
    //   'resume'       => $this->t('Resume'),
    //   'status'       => $this->t('Status'),
    //   'created'      => $this->t('Created'),
    //   'public_user'  => $this->t('Public User'),
    //   'operations'   => $this->t('Operations'),
    // ];

    // $db = \Drupal::database();

    // // Base query
    // $query = $db->select('job_application', 'ja')
    //   ->fields('ja')
    //   ->orderBy('created', 'DESC');

    // // Restrict for non-admins
    // if (!$is_admin) {

    //   // Find job nodes created by the employer
    //   $my_job_ids = $db->select('node_field_data', 'n')
    //     ->fields('n', ['nid'])
    //     ->condition('n.type', 'jobs')
    //     ->condition('n.uid', $uid)
    //     ->execute()
    //     ->fetchCol();

    //   if (empty($my_job_ids)) {
    //     return [
    //       'table' => [
    //         '#type' => 'table',
    //         '#header' => $header,
    //         '#rows' => [],
    //         '#empty' => $this->t('No applications found for your job postings.'),
    //       ],
    //     ];
    //   }

    //   // Filter by employer-owned jobs
    //   $query->condition('job_id', $my_job_ids, 'IN');
    // }

    // $results = $query->execute()->fetchAll();

    // $rows = [];
    // $renderer = \Drupal::service('renderer');
    // $date_formatter = \Drupal::service('date.formatter');
    // $file_url_generator = \Drupal::service('file_url_generator');

    // foreach ($results as $r) {

    //   // Load job title
    //   $job_title = '-';
    //   $job = Node::load($r->job_id);
    //   if ($job) {
    //     $job_title = $job->getTitle();
    //   }

    //   // Public user details
    //   $public_user_output = '-';
    //   if (!empty($r->public_user_id)) {
    //     $pu = PublicUser::load($r->public_user_id);
    //     if ($pu) {
    //       $public_user_output =
    //         $pu->get('name')->value .
    //         '<br><small>' . $pu->get('email')->value . '</small>';
    //     }
    //   }

    //   // Resume
    //   $resume_link = '-';
    //   if (!empty($r->resume_fid) && ($file = File::load($r->resume_fid))) {
    //     $url = $file_url_generator->generateAbsoluteString($file->getFileUri());
    //     $ext = strtolower(pathinfo($file->getFilename(), PATHINFO_EXTENSION));

    //     $resume_link = ($ext === 'pdf')
    //       ? "<a href='$url' target='_blank'>" . $this->t('Preview Resume') . "</a>"
    //       : "<a href='$url' download>" . $this->t('Download Resume') . "</a>";
    //   }

    //   // -------------------------------
    //   // EDIT + DELETE PERMISSION LOGIC
    //   // -------------------------------
    //   $operations = '';
    //   $can_manage = FALSE;

    //   if ($is_admin) {
    //     $can_manage = TRUE; // Full access
    //   } else if ($can_manage_own && $job && $job->getOwnerId() == $uid) {
    //     $can_manage = TRUE; // Employer owns this job
    //   }

    //   if ($can_manage) {
    //     // EDIT
    //     $edit_url = Url::fromRoute('jobs_module.edit', ['id' => $r->id]);
    //     $operations .= Link::fromTextAndUrl($this->t('Edit'), $edit_url)->toString();

    //     // DELETE
    //     $delete_url = Url::fromRoute('jobs_module.delete', ['id' => $r->id]);
    //     $delete_url->setOption('attributes', [
    //       'onclick' => "return confirm('Delete application #{$r->id}?');",
    //     ]);
    //     $operations .= ' | ' . Link::fromTextAndUrl($this->t('Delete'), $delete_url)->toString();
    //   }

    //   $rows[] = [
    //     'id'           => $r->id,
    //     'job'          => $job_title,
    //     'applicant'    => $r->applicant_name,
    //     'email'        => $r->applicant_email,
    //     'mobile'       => $r->mobile_number ?? '-',
    //     'cover_letter' => nl2br($r->cover_letter ?? '-'),
    //     'resume'       => ['data' => ['#markup' => $resume_link]],
    //     'status'       => ucfirst($r->status),
    //     'created'      => $date_formatter->format($r->created, 'short'),
    //     'public_user'  => ['data' => ['#markup' => $public_user_output]],
    //     'operations'   => ['data' => ['#markup' => $operations]],
    //   ];
    // }

    // return [
    //   'table' => [
    //     '#type' => 'table',
    //     '#header' => $header,
    //     '#rows' => $rows,
    //     '#empty' => $this->t('No applications found.'),
    //   ],
    // ];
  }

  /**
   * Delete a job_application record.
   */
  public function delete($id)
  {

    $id = (int) $id;
    if ($id <= 0) {
      $this->messenger()->addError($this->t('Invalid application ID.'));
      return $this->redirectToList();
    }

    $conn = \Drupal::database();
    $record = $conn->select('job_application', 'ja')
      ->fields('ja')
      ->condition('id', $id)
      ->execute()
      ->fetchAssoc();

    if (!$record) {
      $this->messenger()->addError($this->t('Application not found.'));
      return $this->redirectToList();
    }

    // Delete resume file
    if (!empty($record['resume_fid']) && ($file = File::load($record['resume_fid']))) {
      try {
        $file->delete();
      } catch (\Exception $e) {
        \Drupal::logger('jobs_module')->warning('Unable to delete file @fid: @msg', [
          '@fid' => $record['resume_fid'],
          '@msg' => $e->getMessage(),
        ]);
      }
    }

    // Delete DB record
    try {
      $conn->delete('job_application')
        ->condition('id', $id)
        ->execute();

      $this->messenger()->addStatus($this->t('Application @id was deleted.', ['@id' => $id]));
    } catch (\Exception $e) {
      \Drupal::logger('jobs_module')->error('Delete failed @id: @msg', [
        '@id' => $id,
        '@msg' => $e->getMessage(),
      ]);
      $this->messenger()->addError($this->t('Failed to delete application.'));
    }

    return $this->redirectToList();
  }

  /**
   * Redirect helper.
   */
  protected function redirectToList()
  {
    return new RedirectResponse(Url::fromRoute('jobs_module.list')->toString());
  }
}
