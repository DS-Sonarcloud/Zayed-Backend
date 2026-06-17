<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\zu_public_user\Entity\PublicUser;
use Drupal\Core\Url;

/**
 * Returns bookmarks for authenticated Public User (JWT protected).
 */
class UserBookmarksController extends ControllerBase
{

  /**
   * Returns bookmarks for the authenticated user (via JWT only).
   */
  public function getUserBookmarks(): JsonResponse
  {
    $request = \Drupal::request();
    $jwtUser = $request->attributes->get('jwt_user');

    // Validate JWT.
    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: missing or invalid token.',
      ], 401);
    }

    $uid = $jwtUser->user_id;

    // Load public user entity
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $user = $storage->load($uid);

    if (!$user || !$user->get('status')->value) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found or inactive.',
      ], 404);
    }

    // Load flaggings for this public user
    $flagging_storage = \Drupal::entityTypeManager()->getStorage('flagging');
    $flaggings = $flagging_storage->loadByProperties([
      'uid' => $uid,
      'flag_id' => 'bookmark',
    ]);

    // Separate arrays
    $blogs = [];
    $events = [];

    foreach ($flaggings as $flagging) {
      $entity = $flagging->getFlaggable();

      if ($entity instanceof \Drupal\node\Entity\Node) {
        $bundle = $entity->bundle();

        // Generate alias
        $alias = \Drupal::service('path_alias.manager')
          ->getAliasByPath('/node/' . $entity->id());

        // Remove language prefix (e.g. /en/, /ar/)
        $alias = preg_replace('#^/[a-zA-Z_]{2}(/|$)#', '/', $alias);

        // Keep only the last part of the path
        $parts = explode('/', trim($alias, '/'));
        $last_part = end($parts);

        // Final URL
        $clean_alias = '/' . $last_part;

        $item = [
          'id' => $entity->id(),
          'type' => $bundle,
          'title' => $entity->label(),
          'url' => $clean_alias,
        ];

        if ($bundle === 'blogs') {
          $blogs[] = $item;
        } elseif ($bundle === 'event') {
          $events[] = $item;
        }
      }
    }

    // Counts
    $blogs_count = count($blogs);
    $events_count = count($events);
    $total_bookmarks = $blogs_count + $events_count;

    return new JsonResponse([
      'status' => 'success',
      'user' => [
        'id' => $user->id(),
        'email' => $user->get('email')->value,
        'name' => $user->get('name')->value,
      ],
      'blogs_count' => $blogs_count,
      'events_count' => $events_count,
      'total_bookmarks' => $total_bookmarks,
      'bookmarks' => [
        'blogs' => $blogs,
        'events' => $events,
      ],
    ]);
  }

  /**
   * Download bookmarked users as CSV.
   */
  public function downloadCsv($nid)
  {
    // Permission check.
    $current_user = \Drupal::currentUser();
    $allowed_roles = ['administrator', 'reviewer', 'approver', 'content_editor'];

    if (!array_intersect($allowed_roles, $current_user->getRoles())) {
      throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException('Access denied.');
    }

    // Load node.
    if (empty($nid) || !$node = \Drupal\node\Entity\Node::load($nid)) {
      throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException('Invalid node ID.');
    }

    // Load flaggings.
    $flaggings = \Drupal::entityTypeManager()
      ->getStorage('flagging')
      ->loadByProperties(['flag_id' => 'bookmark', 'entity_id' => $nid]);

    if (empty($flaggings)) {
      throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException('No users have bookmarked this content yet.');
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
        // Escape fields containing commas, quotes, or newlines.
        if (strpos($field, ',') !== FALSE || strpos($field, '"') !== FALSE || strpos($field, "\n") !== FALSE) {
          return '"' . str_replace('"', '""', $field) . '"';
        }
        return $field;
      }, $row)) . "\n";
    }

    // Create response.
    $response = new \Symfony\Component\HttpFoundation\Response($csv_content);
    $response->headers->set('Content-Type', 'text/csv');
    $response->headers->set('Content-Disposition', 'attachment; filename="bookmarks-node-' . $nid . '-' . date('Y-m-d') . '.csv"');

    return $response;
  }
}
