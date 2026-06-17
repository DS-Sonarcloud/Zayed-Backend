<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Provides a REST API to get the logged-in user's bookmarks.
 *
 * @RestResource(
 *   id = "user_bookmarks_resource",
 *   label = @Translation("User Bookmarks"),
 *   uri_paths = {
 *     "canonical" = "/api/bookmarks/list/{uid}"
 *   }
 * )
 */
class UserBookmarksResource extends ResourceBase
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
     * @var \Symfony\Component\HttpFoundation\RequestStack
     */
    protected $requestStack;

    public function __construct(
        array $configuration,
        $plugin_id,
        $plugin_definition,
        array $serializer_formats,
        LoggerInterface $logger,
        AccountProxyInterface $current_user,
        EntityTypeManagerInterface $entity_type_manager,
        RequestStack $request_stack
    ) {
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
        $this->currentUser = $current_user;
        $this->entityTypeManager = $entity_type_manager;
        $this->requestStack = $request_stack;
    }

    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->getParameter('serializer.formats'),
            $container->get('logger.factory')->get('rest'),
            $container->get('current_user'),
            $container->get('entity_type.manager'),
            $container->get('request_stack')
        );
    }

    /**
     * GET handler. **No parameters** here.
     */
    public function get($uid)
    {
        // if ($this->currentUser->isAnonymous()) {
        //     return new ResourceResponse(['message' => 'Authentication required'], 401);
        // }

        // Optional: allow ?uid= to fetch another user's bookmarks (guard as needed).
        // $request = $this->requestStack->getCurrentRequest();
        // $data = json_decode($request->getContent(), true) ?? [];

        // if (!isset($data['uid'])) {
        //     return new ResourceResponse(['message' => 'uid is required'], 401);
        // }

        // $uid = $data['uid'];

        // TODO: add access checks if allowing uid override:
        // if ($uid != $this->currentUser->id() && !$this->currentUser->hasPermission('administer users')) { ... }

        $flaggings = $this->entityTypeManager
            ->getStorage('flagging')
            ->loadByProperties([
                'uid' => $uid,
                'flag_id' => 'bookmark',
            ]);

        $items = [];
        foreach ($flaggings as $flagging) {
            /** @var \Drupal\flag\FlaggingInterface $flagging */
            $entity = $flagging->getFlaggable();
            if ($entity) {
                $items[] = [
                    'id' => $entity->id(),
                    'type' => $entity->getEntityTypeId(),
                    'title' => $entity->label(),
                    'url' => $entity->toUrl('canonical', ['absolute' => TRUE])->toString(),
                ];
            }
        }

        return new ResourceResponse($items, 200);
    }

}
