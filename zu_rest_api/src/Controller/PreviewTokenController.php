<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\zu_rest_api\Constants;
use Firebase\JWT\JWT;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Generates signed preview tokens so editors can preview draft content in React.
 *
 * Flow:
 *   1. Editor clicks "Preview" in Drupal (links to /api/preview/token/{nid}).
 *   2. This endpoint returns a short-lived JWT token + the React preview URL.
 *   3. Editor opens React URL: https://www.zu.ac.ae/preview?token=XXX&nid=NID
 *   4. React calls /api/preview/validate?token=XXX&nid=NID to get draft content.
 *
 * POST /api/preview/token/{nid}     — generate token (requires Drupal session)
 * GET  /api/preview/validate        — validate token, return node data
 */
class PreviewTokenController extends ControllerBase {

  /** Preview tokens expire after 30 minutes. */
  private const PREVIEW_TTL = 1800;

  public function generateToken(int $nid, Request $request): JsonResponse {
    $node = Node::load($nid);

    if (!$node) {
      return new JsonResponse(['status' => Constants::ERROR, 'message' => 'Node not found.'], 404);
    }

    $current_user = \Drupal::currentUser();
    if (!$current_user->hasPermission('access content')) {
      return new JsonResponse(['status' => Constants::ERROR, 'message' => 'Access denied.'], 403);
    }

    $payload = [
      'iss'  => \Drupal::request()->getSchemeAndHttpHost(),
      'iat'  => time(),
      'exp'  => time() + self::PREVIEW_TTL,
      'nid'  => $nid,
      'uid'  => $current_user->id(),
      'type' => 'preview',
    ];

    $token = JWT::encode($payload, Constants::jwtSecret(), Constants::JWT_ALGO);

    $react_base = \Drupal::config('zu_rest_api.settings')->get('react_base_url') ?? '';
    $preview_url = rtrim($react_base, '/') . "/preview?token={$token}&nid={$nid}";

    return new JsonResponse([
      'status'      => Constants::SUCCESS,
      'token'       => $token,
      'nid'         => $nid,
      'preview_url' => $preview_url,
      'expires_in'  => self::PREVIEW_TTL,
    ]);
  }

  public function validateToken(Request $request): JsonResponse {
    $token = $request->query->get('token');
    $nid   = (int) $request->query->get('nid');

    if (empty($token) || empty($nid)) {
      return new JsonResponse(['status' => Constants::ERROR, 'message' => 'token and nid are required.'], 400);
    }

    try {
      $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key(Constants::jwtSecret(), Constants::JWT_ALGO));
    }
    catch (\Exception $e) {
      return new JsonResponse(['status' => Constants::ERROR, 'message' => 'Invalid or expired preview token.'], 401);
    }

    if (($decoded->type ?? '') !== 'preview' || (int) ($decoded->nid ?? 0) !== $nid) {
      return new JsonResponse(['status' => Constants::ERROR, 'message' => 'Token mismatch.'], 401);
    }

    $node = Node::load($nid);
    if (!$node) {
      return new JsonResponse(['status' => Constants::ERROR, 'message' => 'Node not found.'], 404);
    }

    // Load node in all available translations for preview.
    $langcode = $request->query->get('langcode', 'en');
    if ($node->hasTranslation($langcode)) {
      $node = $node->getTranslation($langcode);
    }

    $preview_data = [
      'nid'      => $node->id(),
      'title'    => $node->getTitle(),
      'bundle'   => $node->bundle(),
      'status'   => $node->isPublished() ? 'published' : 'draft',
      'langcode' => $node->language()->getId(),
      'changed'  => $node->getChangedTime(),
      'url'      => $node->toUrl()->toString(),
    ];

    // Include body if present.
    if ($node->hasField('body') && !$node->get('body')->isEmpty()) {
      $preview_data['body'] = $node->get('body')->value;
    }

    return new JsonResponse([
      'status'  => Constants::SUCCESS,
      'preview' => TRUE,
      'node'    => $preview_data,
    ]);
  }

}
