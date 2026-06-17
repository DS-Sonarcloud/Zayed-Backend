<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles blog rating operations.
 */
class BlogRatingController extends ControllerBase
{

  /**
   * Add or update rating for blog using Flag.
   */
  public function rateBlog(Request $request): JsonResponse
  {
    $request = \Drupal::request();
    $jwtUser = $request->attributes->get('jwt_user');
    $uid = $jwtUser->user_id ?? NULL;

    if (!$uid) {
      return new JsonResponse(['error' => 'Unauthorized'], 401);
    }

    $data = json_decode($request->getContent(), TRUE);
    $nid = (int)($data['node_id'] ?? 0);
    $rating = (int)($data['rating'] ?? 0);

    if (!$nid || $rating < 1 || $rating > 5) {
      return new JsonResponse(['error' => 'Rating must be 1–5'], 400);
    }

    $node = Node::load($nid);
    if (!$node || $node->bundle() !== 'blogs') {
      return new JsonResponse(['error' => 'Blog not found'], 404);
    }

    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('rating_blog');

    if (!$flag) {
      return new JsonResponse(['error' => 'rating_blog flag missing'], 500);
    }

    $user = \Drupal::entityTypeManager()->getStorage('public_user')->load($uid);
    $storage = \Drupal::entityTypeManager()->getStorage('flagging');

    // Check existing rating.
    $flagging = $flagService->getFlagging($flag, $node, $user);

    if ($flagging) {
      // Update existing rating.
      $flagging->set('field_rating', $rating);
      $flagging->save();

      return new JsonResponse([
        'message' => 'Rating updated',
        'rating' => $rating,
      ]);
    }

    // Create new rating.
    $flagging = $flagService->flag($flag, $node, $user);
    $flagging->set('field_rating', $rating);
    $flagging->save();

    return new JsonResponse([
      'message' => 'Rating added',
      'rating' => $rating,
    ]);
  }

  /**
   * Get rating information for blog.
   */
  public function getAllBlogRatings(Request $request): JsonResponse
  {
    $jwtUser = $request->attributes->get('jwt_user');
    $uid = $jwtUser->user_id ?? NULL;

    if (empty($uid)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized',
      ], 401);
    }

    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('rating_blog');
    $storage = \Drupal::entityTypeManager()->getStorage('flagging');

    // Fetch ALL flaggings for rating_blog
    $query = $storage->getQuery()
      ->condition('flag_id', 'rating_blog')
      ->accessCheck(FALSE);

    $ids = $query->execute();

    if (empty($ids)) {
      return new JsonResponse([
        'blogs' => [],
        'totals' => [
          'overall_total_ratings' => 0,
          'overall_average_rating' => 0
        ]
      ]);
    }

    $flaggings = $storage->loadMultiple($ids);

    $ratings = [];
    $global_total_sum = 0;
    $global_total_count = 0;

    foreach ($flaggings as $f) {

      // SAFE & CORRECT WAY TO EXTRACT NODE ID
      $node = $f->getFlaggable();
      if (!$node) {
        continue;
      }
      $nid = $node->id();   // ALWAYS CORRECT

      // Get rating
      $rating = (int) $f->get('field_rating')->value;

      // Get user id of this rating
      $flagUid = (int) $f->get('uid')->target_id;

      // Init block for this node
      if (!isset($ratings[$nid])) {
        $ratings[$nid] = [
          'nid' => $nid,
          'total_ratings' => 0,
          'rating_sum' => 0,
          'user_rating' => 0,
        ];
      }

      // Increase per-node totals
      $ratings[$nid]['total_ratings']++;
      $ratings[$nid]['rating_sum'] += $rating;

      // Increase overall totals
      $global_total_count++;
      $global_total_sum += $rating;

      // If THIS user rated THIS blog → store user rating
      if ($flagUid === (int) $uid) {
        $ratings[$nid]['user_rating'] = $rating;
      }
    }

    // Build output
    $blogs = [];

    foreach ($ratings as $nid => $data) {
      $blogs[] = [
        'nid' => $nid,
        'user_rating' => $data['user_rating'],
        'average_rating' => $data['total_ratings'] > 0
          ? round($data['rating_sum'] / $data['total_ratings'], 2)
          : 0,
        'total_ratings' => $data['total_ratings'],
      ];
    }

    return new JsonResponse([
      'blogs' => $blogs,
      'totals' => [
        'overall_total_ratings' => $global_total_count,
        'overall_average_rating' => $global_total_count > 0
          ? round($global_total_sum / $global_total_count, 2)
          : 0,
      ]
    ]);
  }
}
