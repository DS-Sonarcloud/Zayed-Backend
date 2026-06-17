<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Provides a REST API to delete a flag (bookmark).
 *
 * @RestResource(
 *   id = "bookmark_delete_resource",
 *   label = @Translation("Bookmark Delete Resource"),
 *   uri_paths = {
 *     "canonical" = "/api/bookmark/delete",
 *   }
 * )
 */
class BookmarkDeleteResource extends ResourceBase
{

    protected AccountProxyInterface $currentUser;
    protected EntityTypeManagerInterface $entityTypeManager;

    public function __construct(
        array $configuration,
        $plugin_id,
        $plugin_definition,
        array $serializer_formats,
        LoggerInterface $logger,
        AccountProxyInterface $current_user,
        EntityTypeManagerInterface $entity_type_manager
    ) {
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
        $this->currentUser = $current_user;
        $this->entityTypeManager = $entity_type_manager;
    }

    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->getParameter('serializer.formats'),
            $container->get('logger.factory')->get('zu_rest_api'),
            $container->get('current_user'),
            $container->get('entity_type.manager')
        );
    }

    /**
     * Handles DELETE /api/bookmark
     * Body JSON: {"uid": 1, "node_id": 123}
     */
    public function delete(Request $request)
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $uid = (int) ($data['uid'] ?? 0);
        $nid = (int) ($data['node_id'] ?? 0);

        if (!$uid || !$nid) {
            return new JsonResponse(['error' => 'uid and node_id are required'], 400);
        }

        $flagService = \Drupal::service('flag');
        $flag = $flagService->getFlagById('bookmark');
        if (!$flag) {
            return new JsonResponse(['error' => 'Flag "bookmark" not found'], 404);
        }

        $node = $this->entityTypeManager->getStorage('node')->load($nid);
        $user = $this->entityTypeManager->getStorage('user')->load($uid);
        if (!$node || !$user) {
            return new JsonResponse(['error' => 'Invalid node or user'], 404);
        }

        $flagging = $flagService->getFlagging($flag, $node, $user);
        if ($flagging) {
            $flagService->unflag($flag, $node, $user);
            return new ResourceResponse(['message' => 'Bookmark deleted successfully'], 200);
        }

        return new ResourceResponse(['message' => 'Bookmark does not exist'], 200);
    }
}
