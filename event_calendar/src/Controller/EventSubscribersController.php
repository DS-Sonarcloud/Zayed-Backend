<?php

namespace Drupal\event_calendar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\taxonomy\Entity\Term;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Handles CSV download for event type subscribers.
 */
class EventSubscribersController extends ControllerBase
{

  /**
   * Download subscribers for an event type as CSV.
   */
  public function downloadCsv($tid)
  {
    $current_user = \Drupal::currentUser();

    if (!$current_user->hasPermission('export event subscribers csv')) {
      throw new AccessDeniedHttpException('Access denied.');
    }

    // Load taxonomy term.
    if (empty($tid) || !$term = Term::load($tid)) {
      throw new NotFoundHttpException('Invalid event type ID.');
    }

    // Load flaggings for this event type.
    $connection = \Drupal::database();
    $flagging_results = $connection->select('flagging', 'f')
      ->fields('f', ['uid', 'created'])
      ->condition('f.flag_id', 'subscribe_event')
      ->condition('f.entity_type', 'taxonomy_term')
      ->condition('f.entity_id', $tid)
      ->execute()
      ->fetchAll();

    if (empty($flagging_results)) {
      throw new NotFoundHttpException('No users have subscribed to this event type yet.');
    }

    // Build CSV data.
    $rows = [];
    $counter = 1;
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');

    // Add header row.
    $rows[] = ['S.No.', 'User ID', 'Username', 'Email', 'Subscribed On', 'Status'];

    foreach ($flagging_results as $flagging) {
      $uid = $flagging->uid;
      $user = $storage->load($uid);
      if (!$user) {
        continue;
      }

      $status = $user->hasField('status') ? (int) $user->get('status')->value : 0;

      $rows[] = [
        $counter,
        $uid,
        $user->getDisplayName(),
        method_exists($user, 'getEmail') ? ($user->getEmail() ?: 'N/A') : 'N/A',
        date('Y-m-d H:i:s', $flagging->created),
        $status ? 'Active' : 'Inactive',
      ];

      $counter++;
    }

    // Generate CSV content.
    $csv_content = '';
    foreach ($rows as $row) {
      $csv_content .= implode(',', array_map(function ($field) {
        $field = (string) $field;
        if (strpos($field, ',') !== FALSE || strpos($field, '"') !== FALSE || strpos($field, "\n") !== FALSE) {
          return '"' . str_replace('"', '""', $field) . '"';
        }
        return $field;
      }, $row)) . "\n";
    }

    // Create response.
    $term_name = preg_replace('/[^a-zA-Z0-9_-]/', '-', strtolower($term->label()));
    $response = new Response($csv_content);
    $response->headers->set('Content-Type', 'text/csv');
    $response->headers->set('Content-Disposition', 'attachment; filename="subscribers-' . $term_name . '-' . date('Y-m-d') . '.csv"');

    return $response;
  }
}
