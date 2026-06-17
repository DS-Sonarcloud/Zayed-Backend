<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\user\UserInterface;

/**
 * Controller for People and User management.
 */
class PeopleController extends ControllerBase {

  protected Connection $database;

  public function __construct(EntityTypeManagerInterface $etm, Connection $db) {
    $this->entityTypeManager = $etm;
    $this->database          = $db;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('database')
    );
  }

  /**
   * List all users.
   */
  public function list(): array {
    $users = $this->entityTypeManager->getStorage('user')->loadMultiple();
    $groups = $this->database->select('zu_admin_groups', 'g')->fields('g')->execute()->fetchAll();

    return [
      '#theme'  => 'zu_people_list',
      '#users'  => $users,
      '#groups' => $groups,
      '#tabs'   => _zu_admin_people_tabs(),
    ];
  }

  /**
   * View a specific user.
   */
  public function viewUser($uid): array {
    $user = $this->entityTypeManager->getStorage('user')->load($uid);
    if (!$user instanceof UserInterface) {
      throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException();
    }

    return [
      '#theme' => 'zu_people_list', // Using same template for now
      '#users' => [$user],
      '#tabs'  => _zu_admin_people_tabs($uid, 'view'),
    ];
  }

}
