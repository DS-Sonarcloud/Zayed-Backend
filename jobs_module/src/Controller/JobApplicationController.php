<?php

namespace Drupal\jobs_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\file\Entity\File;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Admin + Employer listing for job applications.
 */
class JobApplicationController extends ControllerBase {

  public function listing() {
    return \Drupal::formBuilder()->getForm('Drupal\jobs_module\Form\JobApplicationFilterForm');
  }

  public function delete($id) {
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

    if (!empty($record['resume_fid']) && ($file = File::load($record['resume_fid']))) {
      try {
        $file->delete();
      }
      catch (\Exception $e) {
        \Drupal::logger('jobs_module')->warning('Unable to delete file @fid: @msg', [
          '@fid' => $record['resume_fid'],
          '@msg' => $e->getMessage(),
        ]);
      }
    }

    try {
      $conn->delete('job_application')
        ->condition('id', $id)
        ->execute();
      $this->messenger()->addStatus($this->t('Application @id was deleted.', ['@id' => $id]));
    }
    catch (\Exception $e) {
      \Drupal::logger('jobs_module')->error('Delete failed @id: @msg', [
        '@id' => $id,
        '@msg' => $e->getMessage(),
      ]);
      $this->messenger()->addError($this->t('Failed to delete application.'));
    }

    return $this->redirectToList();
  }

  protected function redirectToList() {
    return new RedirectResponse(Url::fromRoute('jobs_module.list')->toString());
  }

}
