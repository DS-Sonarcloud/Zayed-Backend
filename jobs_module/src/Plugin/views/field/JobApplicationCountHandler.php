<?php

namespace Drupal\jobs_module\Plugin\views\field;

use Drupal\views\ResultRow;
use Drupal\views\Plugin\views\field\FieldPluginBase;

/**
 * Count job applications for each job node.
 *
 * @ViewsField("job_application_count_handler")
 */
class JobApplicationCountHandler extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  public function render(ResultRow $values) {

    // Get node ID from row.
    $nid = $values->nid;

    // Count job applications.
    $count = \Drupal::database()
      ->select('job_application', 'ja')
      ->condition('job_id', $nid)
      ->countQuery()
      ->execute()
      ->fetchField();

    return [
      '#markup' => $count,
    ];
  }
}
