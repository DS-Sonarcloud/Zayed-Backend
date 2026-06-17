<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\comment\Entity\Comment;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Datetime\DateFormatterInterface;
/**
 * Provides a REST resource for comments by node ID.
 *
 * @RestResource(
 *   id = "blog_comments_resource",
 *   label = @Translation("Blog comments resource"),
 *   uri_paths = {
 *     "canonical" = "/comment/node/{nid}"
 *   }
 * )
 */
class BlogCommentsResource extends ResourceBase {

  /**
   * Responds to GET requests.
   *
   * @param int $nid
   *   Node ID of the blog.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The response containing comments.
   */
  public function get($nid) {
    // Load all published comments for the given node.
    $comments = \Drupal::entityTypeManager()
      ->getStorage('comment')
      ->loadByProperties(['entity_id' => $nid, 'status' => 1]);

    $flat = [];
    $date_formatter = \Drupal::service('date.formatter');

    /** @var \Drupal\comment\Entity\Comment $comment */
    foreach ($comments as $comment) {
      $flat[$comment->id()] = [
        'cid' => $comment->id(),
        'nid' => $nid,
        'author' => $comment->getOwner() ? $comment->getOwner()->getDisplayName() : 'Anonymous',
        'uid' => $comment->getOwnerId(),
        'body' => $comment->get('comment_body')->value,
        'pid' => $comment->get('pid')->target_id ?? null,
        'created' => $date_formatter->formatTimeDiffSince($comment->getCreatedTime()),
        'replies' => [], // prepare empty array for replies
      ];
    }

    // Build threaded hierarchy.
    $tree = [];
    foreach ($flat as $cid => &$comment) {
      if (!empty($comment['pid']) && isset($flat[$comment['pid']])) {
        $flat[$comment['pid']]['replies'][] = &$comment;
      }
      else {
        $tree[] = &$comment;
      }
    }

    // Return only top-level comments (with replies nested inside).
    return new ResourceResponse(array_values($tree));
  }
}