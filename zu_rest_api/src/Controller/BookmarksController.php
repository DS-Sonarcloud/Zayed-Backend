<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\zu_rest_api\Constants;
use Drupal\node\Entity\Node;
use Drupal\zu_public_user\Entity\PublicUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Controller\ControllerBase;

/**
 * Handles bookmark operations for Public Users.
 */
class BookmarksController extends ControllerBase
{

  /**
   * Bookmark a node for a given public user (JWT or manual ID).
   */
  public function bookmarkByUserId(Request $request): JsonResponse
  {
    $data = json_decode($request->getContent(), TRUE);
    $user_id = $data['uid'] ?? NULL;
    $node_id = $data['node_id'] ?? NULL;

    if (!is_numeric($user_id) || !is_numeric($node_id)) {
      return new JsonResponse([
        'api_status_code' => Constants::ERROR,
        'message' => 'Invalid user or node ID.'
      ], 400);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = $storage->load($user_id);
    if (!$user) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'User not found.'], 404);
    }

    $node = Node::load($node_id);
    if (!$node) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Node not found.'], 404);
    }

    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('bookmark');
    if (!$flag) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Bookmark flag not found.'], 404);
    }

    $flagging = $flagService->getFlagging($flag, $node, $user);

    if (!$flagging) {
      $flagService->flag($flag, $node, $user);
      return new JsonResponse(['api_status_code' => Constants::SUCCESS, 'message' => 'Bookmark added successfully.'], 200);
    }
    return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Already bookmarked.'], 200);
  }

  /**
   * Bookmark node via JWT (authenticated public_user).
   */
  public function addOrUpdate(Request $request): JsonResponse
  {
    $jwtUser = $request->attributes->get('jwt_user');
    $uid = $jwtUser->user_id ?? NULL;
    if (empty($uid)) {
      return new JsonResponse(['error' => 'Unauthorized: Missing JWT user.'], 401);
    }

    $data = json_decode($request->getContent(), TRUE);
    $nid = (int) ($data['node_id'] ?? 0);

    if (empty($nid)) {
      return new JsonResponse(['error' => 'node_id is required.'], 400);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = $storage->load($uid);
    if (!$user) {
      return new JsonResponse(['error' => 'User not found.'], 404);
    }

    $node = Node::load($nid);
    if (!$node) {
      return new JsonResponse(['error' => 'Node not found.'], 404);
    }

    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('bookmark');
    if (!$flag) {
      return new JsonResponse(['error' => 'Bookmark flag not found.'], 404);
    }

    $flagging = $flagService->getFlagging($flag, $node, $user);

    if (!$flagging) {
      $flagService->flag($flag, $node, $user);
      return new JsonResponse(['message' => 'Bookmark added successfully.'], 200);
    }

    return new JsonResponse(['message' => 'Bookmark already exists.'], 200);
  }

  /**
   * Delete bookmark by public_user ID + node ID.
   */
  public function bookmarkDeleteByUserId(Request $request): JsonResponse
  {
    $data = json_decode($request->getContent(), TRUE);
    $user_id = $data['uid'] ?? NULL;
    $node_id = $data['node_id'] ?? NULL;

    if (!is_numeric($user_id) || !is_numeric($node_id)) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Invalid user or node ID.'], 400);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = $storage->load($user_id);
    if (!$user) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'User not found.'], 404);
    }

    $node = Node::load($node_id);
    if (!$node) {
      return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Node not found.'], 404);
    }

    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('bookmark');
    if (!$flag) {
      return new JsonResponse(['error' => 'Flag "bookmark" not found.'], 404);
    }

    $flagging = $flagService->getFlagging($flag, $node, $user);
    if ($flagging) {
      $flagService->unflag($flag, $node, $user);
      return new JsonResponse(['api_status_code' => Constants::SUCCESS, 'message' => 'Bookmark removed successfully.'], 200);
    }

    return new JsonResponse(['api_status_code' => Constants::ERROR, 'message' => 'Bookmark not found.'], 404);
  }

  /**
   * Delete bookmark using JWT-authenticated public_user.
   */
  public function delete(Request $request): JsonResponse
  {
    $jwtUser = $request->attributes->get('jwt_user');
    $uid = $jwtUser->user_id ?? NULL;

    if (empty($uid)) {
      return new JsonResponse(['error' => 'Unauthorized: Missing JWT user.'], 401);
    }

    $data = json_decode($request->getContent(), TRUE);
    $nid = (int) ($data['node_id'] ?? 0);

    if (empty($nid)) {
      return new JsonResponse(['error' => 'node_id is required.'], 400);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('public_user');
    /** @var \Drupal\zu_public_user\Entity\PublicUser|null $user */
    $user = $storage->load($uid);
    if (!$user) {
      return new JsonResponse(['error' => 'User not found.'], 404);
    }

    $node = Node::load($nid);
    if (!$node) {
      return new JsonResponse(['error' => 'Node not found.'], 404);
    }

    $flagService = \Drupal::service('flag');
    $flag = $flagService->getFlagById('bookmark');
    if (!$flag) {
      return new JsonResponse(['error' => 'Flag "bookmark" not found.'], 404);
    }

    $flagging = $flagService->getFlagging($flag, $node, $user);
    if ($flagging) {
      $flagService->unflag($flag, $node, $user);
      return new JsonResponse(['message' => 'Bookmark deleted successfully.'], 200);
    }

    return new JsonResponse(['message' => 'Bookmark does not exist.'], 200);
  }

}
