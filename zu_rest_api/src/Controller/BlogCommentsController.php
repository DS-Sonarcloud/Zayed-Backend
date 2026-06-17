<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\comment\Entity\Comment;
use Drupal\zu_public_user\Entity\PublicUser;

/**
 * Provides API endpoint to fetch comments by node ID for Public User.
 */
class BlogCommentsController extends ControllerBase
{
  /**
   * Returns threaded comments for a given node.
   *
   * @param int $nid
   *   Node ID of the blog.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response containing threaded comments.
   */
  public function getComments($nid, Request $request)
  {
    /*
    $jwtUser = $request->attributes->get('jwt_user');
    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized: missing or invalid token.',
      ], 401);
    }
    

    $uid = $jwtUser->user_id;
    
    // Load PublicUser
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $auth_user = $storage->load($uid);
    if (!$auth_user || !$auth_user->get('status')->value) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'User not found or inactive.',
      ], 404);
    }
    */
    $comment_ids = \Drupal::entityQuery('comment')
      ->condition('entity_id', $nid)
      ->condition('entity_type', 'node')
      ->condition('status', 1)
      ->sort('created', 'ASC')
      ->accessCheck(FALSE)
      ->execute();

    $comments = \Drupal::entityTypeManager()
      ->getStorage('comment')
      ->loadMultiple($comment_ids);


    if (empty($comments)) {
      return new JsonResponse([
        'status' => 'success',
        'comments' => [],
        'message' => 'No comments found for this node.',
      ]);
    }

    $flat = [];
    $dateFormatter = \Drupal::service('date.formatter');
    $entityTypeManager = \Drupal::entityTypeManager();

    foreach ($comments as $comment) {
      /** @var \Drupal\comment\Entity\Comment $comment */

      $uid = $comment->getOwnerId();
      $owner = $comment->getOwner();

      if ($owner && $owner->id() && $owner->isAuthenticated()) {
        $authorName = $owner->getAccountName();
      } else {
        /** @var \Drupal\user\Entity\public_user $publicUser */
        $publicUser = $entityTypeManager->getStorage('public_user')->load($uid);

        if ($publicUser) {
          $authorName = $publicUser->get('name')->value;
        } else {
          $authorName = 'Anonymous';
        }
      }

      $flat[$comment->id()] = [
        'cid' => $comment->id(),
        'nid' => $nid,
        'author' => $authorName,
        'uid' => $uid,
        'body' => $comment->get('comment_body')->value,
        'pid' => $comment->get('pid')->target_id ?? null,
        'created' => $dateFormatter->formatTimeDiffSince($comment->getCreatedTime()),
        'replies' => [],
      ];
    }

    // Build threaded comment structure
    $tree = [];
    foreach ($flat as $cid => &$commentData) {
      if (!empty($commentData['pid']) && isset($flat[$commentData['pid']])) {
        $flat[$commentData['pid']]['replies'][] = &$commentData;
      } else {
        $tree[] = &$commentData;
      }
    }

    return new JsonResponse([
      'status' => 'success',
      'comments' => array_values($tree),
    ]);
  }

  /**
   * POST: Add a new comment.
   */
  public function postComment(Request $request)
  {
    $jwtUser = $request->attributes->get('jwt_user');

    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
    }

    $uid = $jwtUser->user_id;

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $user = $storage->load($uid);

    if (!$user) {
      return new JsonResponse(['status' => 'error', 'message' => 'User not found'], 404);
    }

    $data = json_decode($request->getContent(), TRUE);
    $nid  = $data['nid']  ?? NULL;
    $body = trim($data['body'] ?? '');
    $pid  = $data['pid']  ?? NULL;

    if (!$nid || !$body) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Node ID and comment body are required.',
      ], 400);
    }

    // Load the node being commented on.
    $node = \Drupal::entityTypeManager()->getStorage('node')->load($nid);
    if (!$node) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid node ID.',
      ], 404);
    }

    // Validate parent comment
    if ($pid) {
      $parent = Comment::load($pid);
      if (!$parent || $parent->get('entity_id')->target_id != $nid) {
        return new JsonResponse(['status' => 'error', 'message' => 'Invalid parent comment.'], 400);
      }
    }

    // Create comment
    $comment = Comment::create([
      'entity_type' => 'node',
      'entity_id'   => $nid,
      'field_name'  => 'comment',
      'pid'         => $pid,
      'uid'         => $uid,
      'comment_type' => 'comment',
      'status'      => 1,
      'comment_body' => [
        'value' => $body,
        'format' => 'basic_html',
      ],
    ]);

    $comment->save();
    /** @var \Drupal\zu_public_user\Entity\PublicUser $user */
    return new JsonResponse([
      'status' => 'success',
      'message' => 'Comment posted successfully.',
      'comment' => [
        'cid' => $comment->id(),
        'nid' => $nid,
        'pid' => $pid,
        'body' => $body,
        'uid' => $uid,
        'author' => $user->get('name')->value,
      ],
    ], 201);
  }

  /**
   * POST: Update a comment.
   */
  public function updateComment(Request $request)
  {
    $jwtUser = $request->attributes->get('jwt_user');

    if (empty($jwtUser) || empty($jwtUser->user_id)) {
      return new JsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
    }

    $uid = $jwtUser->user_id;

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    $user = $storage->load($uid);

    if (!$user) {
      return new JsonResponse(['status' => 'error', 'message' => 'User not found'], 404);
    }

    $data = json_decode($request->getContent(), TRUE);
    $cid = $data['cid'] ?? NULL;
    $body = trim($data['body'] ?? '');

    if (!$cid || !$body) {
      return new JsonResponse(['status' => 'error', 'message' => 'CID and body required'], 400);
    }

    $comment = Comment::load($cid);

    if (!$comment) {
      return new JsonResponse(['status' => 'error', 'message' => 'Comment not found'], 404);
    }

    // Ensure this public user owns the comment
    if ($comment->getOwnerId() != $uid) {
      return new JsonResponse(['status' => 'error', 'message' => 'Permission denied'], 403);
    }

    // Update
    $comment->set('comment_body', [
      'value' => $body,
      'format' => 'basic_html',
    ]);
    $comment->save();

    return new JsonResponse([
      'status' => 'success',
      'message' => 'Comment updated successfully.',
      'cid' => $cid,
      'body' => $body,
    ]);
  }
}
