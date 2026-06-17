<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\zu_admin\Service\GroupManagerService;

class AjaxController extends ControllerBase {

  protected GroupManagerService $groupManager;

  public function __construct(EntityTypeManagerInterface $etm, GroupManagerService $gm) {
    $this->entityTypeManager = $etm;
    $this->groupManager      = $gm;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('zu_admin.group_manager')
    );
  }

  public function getGroups(): JsonResponse {
    return new JsonResponse(['groups' => $this->groupManager->getAllGroupNames()]);
  }

  public function getRoles(): JsonResponse {
    $roles = $this->entityTypeManager->getStorage('user_role')->loadMultiple();
    $data  = [];
    foreach ($roles as $role) {
      if ($role->id() !== 'anonymous') {
        $data[] = ['id' => $role->id(), 'label' => $role->label()];
      }
    }
    return new JsonResponse(['roles' => $data]);
  }

}
