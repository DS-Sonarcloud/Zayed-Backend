<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\flag\Entity\Flagging;
use Drupal\rest\Plugin\ResourceBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Provides a REST Resource to add a bookmark for a user and node.
 *
 * @RestResource(
 *   id = "bookmark_add_rest_resource",
 *   label = @Translation("Add Bookmark"),
 *   uri_paths = {
 *     "create" = "/api/bookmark/add"
 *   }
 * )
 */
class BookmarkAddResource extends ResourceBase
{

    /**
     * @var \Drupal\Core\Session\AccountProxyInterface
     */
    protected $currentUser;

    /**
     * @var \Drupal\Core\Entity\EntityTypeManagerInterface
     */
    protected $entityTypeManager;

    /**
     * @var \Psr\Log\LoggerInterface
     */
    protected $logger;

    public function __construct(
        array $configuration,
        $plugin_id,
        $plugin_definition,
        array $serializer_formats,
        LoggerInterface $logger,
        AccountProxyInterface $current_user,
        EntityTypeManagerInterface $entity_type_manager
    ) {
        // IMPORTANT: pass 5th arg ($logger) to parent.
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

        $this->logger = $logger;
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
            // Get a channel-specific logger (name it after your module).
            $container->get('logger.factory')->get('zu_rest_api'),
            $container->get('current_user'),
            $container->get('entity_type.manager')
        );
    }

    /**
     * Responds to POST requests to add bookmark.
     */
    public function post(Request $request)
    {
        $data = json_decode($request->getContent(), TRUE) ?? [];

        $uid = $data['uid'] ?? NULL;
        $nid = $data['node_id'] ?? NULL;

        if (empty($uid) || empty($nid)) {
            return new JsonResponse(['error' => 'uid and node_id are required'], 400);
        }

        // Get the flag service.
        $flagService = \Drupal::service('flag');
        // dd($flagService );

        // Load a flag by machine name (e.g., created in UI as “bookmark”).
        $flag = $flagService->getFlagById('bookmark');

        // Load entities.
        $node = \Drupal::entityTypeManager()->getStorage('node')->load($nid);
        $user = \Drupal::entityTypeManager()->getStorage('user')->load($uid);

        // Check if already flagged.
        $flagging = $flagService->getFlagging($flag, $node, $user);

        if (!$flagging) {
            // Flag it.
            $flagService->flag($flag, $node, $user);
            return new JsonResponse(['message' => 'Bookmark added successfully'], 200);
        } else {
            // Already flagged, return a message.
            return new JsonResponse(['message' => 'Bookmark already exists'], 200);
        }
    }
}
