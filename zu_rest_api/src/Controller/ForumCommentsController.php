<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\comment\Entity\Comment;

/**
 * API for Forum Comments.
 */
class ForumCommentsController extends ControllerBase
{

  /**
   * GET comments for a Forum Topic (Threaded JSON)
   */
  public function getComments($nid, Request $request)
  {

    //$publicUserStorage = \Drupal::entityTypeManager()->getStorage('public_user');
    $commentStorage = \Drupal::entityTypeManager()->getStorage('comment');
    $formatter = \Drupal::service('date.formatter');

    $comment_ids = \Drupal::entityQuery('comment')
      ->condition('entity_id', $nid)
      ->condition('entity_type', 'node')
      ->condition('status', 1)
      ->condition('field_name', 'comment_forum')
      ->sort('created', 'ASC')
      ->accessCheck(FALSE)
      ->execute();

    $comments = $commentStorage->loadMultiple($comment_ids);


    if (empty($comments)) {
      return new JsonResponse([
        'status' => 'success',
        'comments' => [],
      ]);
    }

    $flat = [];

    /** @var \Drupal\comment\Entity\Comment $comment */
    foreach ($comments as $comment) {

      $uid = $comment->getOwnerId();
      $owner = $comment->getOwner();
      $entityTypeManager = \Drupal::entityTypeManager();

      if ($owner && $owner->id() && $owner->isAuthenticated()) {
        $authorName = $owner->getAccountName();
      } else {
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
        'uid' => $uid,
        'author' => $authorName,
        'body' => $comment->get('comment_body')->value,
        'pid' => $comment->get('pid')->target_id ?? null,
        'created' => $formatter->formatTimeDiffSince($comment->getCreatedTime()),
        'replies' => [],
      ];
    }

    $tree = [];
    foreach ($flat as $cid => &$item) {
      if ($item['pid'] && isset($flat[$item['pid']])) {
        $flat[$item['pid']]['replies'][] = &$item;
      } else {
        $tree[] = &$item;
      }
    }

    return new JsonResponse([
      'status' => 'success',
      'comments' => $tree,
    ]);
  }

  /**
   * POST: Add a comment.
   */
  public function postComment(Request $request)
  {
    $jwt = $request->attributes->get('jwt_user');
    if (!$jwt || empty($jwt->user_id)) {
      return new JsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
    }

    $uid = $jwt->user_id;
    $publicUser = \Drupal::entityTypeManager()->getStorage('public_user')->load($uid);

    if (!$publicUser) {
      return new JsonResponse(['status' => 'error', 'message' => 'User not found'], 404);
    }

    $data = json_decode($request->getContent(), TRUE);
    $nid = $data['nid'] ?? null;
    $body = trim($data['body'] ?? '');
    $pid  = $data['pid'] ?? null;

    if (!$nid || !$body) {
      return new JsonResponse(['status' => 'error', 'message' => 'nid and body required'], 400);
    }

    if ($pid) {
      $parent = Comment::load($pid);
      if (!$parent || $parent->get('entity_id')->target_id != $nid) {
        return new JsonResponse(['status' => 'error', 'message' => 'Invalid parent comment'], 400);
      }
    }

    // Create comment
    $comment = Comment::create([
      'entity_type' => 'node',
      'entity_id'   => $nid,
      'field_name'  => 'comment_forum',
      'pid'         => $pid,
      'uid'         => $uid,
      'comment_type' => 'comment',
      'status'      => 1,
      'comment_body' => [
        'value' => $body,
        'format' => 'full_html',
      ],
    ]);

    $comment->save();
    /** @var \Drupal\zu_public_user\Entity\PublicUser $publicUser */
    return new JsonResponse([
      'status' => 'success',
      'message' => 'Comment updated successfully',
      'comment' => [
        'cid' => $comment->id(),
        'nid' => $nid,
        'pid' => $pid,
        'uid' => $uid,
        'author' => $publicUser->get('name')->value,
        'body' => $body,
      ],
    ], 201);
  }
}
