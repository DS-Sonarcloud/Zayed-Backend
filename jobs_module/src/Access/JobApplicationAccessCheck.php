<?php

namespace Drupal\jobs_module\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\Entity\Node;

/**
 * Custom access checker for job application editing.
 */
class JobApplicationAccessCheck
{

  /**
   * Custom access callback.
   */
  public function access($id, AccountInterface $account)
  {
    $id = (int) $id;
    if (!$id) {
      return AccessResult::forbidden();
    }

    $record = \Drupal::database()->select('job_application', 'ja')
      ->fields('ja')
      ->condition('id', $id)
      ->execute()
      ->fetchAssoc();

    if (!$record) {
      return AccessResult::forbidden();
    }

    $job = Node::load($record['job_id']);
    if (!$job) {
      return AccessResult::forbidden();
    }

    if ($account->hasPermission('administer jobs module')) {
      return AccessResult::allowed();
    }

    if (
      $job->getOwnerId() == $account->id() &&
      $account->hasPermission('manage applicants for own jobs')
    ) {
      return AccessResult::allowed();
    }

    return AccessResult::forbidden();
  }
}
