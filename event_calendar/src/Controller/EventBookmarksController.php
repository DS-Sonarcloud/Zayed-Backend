<?php

namespace Drupal\event_calendar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Handles CSV download for event bookmark users.
 */
class EventBookmarksController extends ControllerBase
{

  /**
   * Download bookmarked users as CSV.
   */
  public function downloadCsv($nid)
  {
    $current_user = \Drupal::currentUser();

    if (!$current_user->hasPermission('export event bookmarks csv')) {
      throw new AccessDeniedHttpException('Access denied.');
    }

    // Load node.
    if (empty($nid) || !$node = Node::load($nid)) {
      throw new NotFoundHttpException('Invalid node ID.');
    }

    // Load flaggings.
    $flaggings = \Drupal::entityTypeManager()
      ->getStorage('flagging')
      ->loadByProperties(['flag_id' => 'bookmark', 'entity_id' => $nid]);

    if (empty($flaggings)) {
      throw new NotFoundHttpException('No users have bookmarked this content yet.');
    }

    // Build CSV data.
    $rows = [];
    $counter = 1;
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');

    // Add header row.
    $rows[] = ['S.No.', 'User ID', 'Username', 'Email', 'Bookmarked On'];

    foreach ($flaggings as $flagging) {
      $uid = $flagging->getOwnerId();
      $user = $storage->load($uid);
      if (!$user) {
        continue;
      }

      $rows[] = [
        $counter,
        $uid,
        $user->getDisplayName(),
        $user->getEmail() ?: 'N/A',
        date('Y-m-d H:i:s', $flagging->getCreatedTime()),
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
    $response = new Response($csv_content);
    $response->headers->set('Content-Type', 'text/csv');
    $response->headers->set('Content-Disposition', 'attachment; filename="bookmarks-node-' . $nid . '-' . date('Y-m-d') . '.csv"');

    return $response;
  }
}
