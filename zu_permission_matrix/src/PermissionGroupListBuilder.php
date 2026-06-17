<?php

namespace Drupal\zu_permission_matrix;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Entity\EntityInterface;

/**
 * List builder for Permission Group entities.
 */
class PermissionGroupListBuilder extends ConfigEntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['label'] = $this->t('Group Name');
    $header['description'] = $this->t('Description');
    $header['permissions_count'] = $this->t('Permissions');
    $header['assigned_roles'] = $this->t('Assigned to Roles');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /** @var \Drupal\zu_permission_matrix\Entity\PermissionGroup $entity */
    $row['label'] = $entity->label();
    $row['description'] = $entity->getDescription();
    $row['permissions_count'] = count($entity->getPermissions()) . ' permissions';
    $row['assigned_roles'] = $this->getAssignedRoles($entity->id());
    return $row + parent::buildRow($entity);
  }

  /**
   * Gets the roles assigned to a group.
   */
  protected function getAssignedRoles($group_id) {
    $config = \Drupal::config('zu_permission_matrix.role_assignments');
    $assignments = $config->get('assignments') ?: [];
    $roles = [];

    foreach ($assignments as $role_id => $group_ids) {
      if (in_array($group_id, $group_ids)) {
        $role = \Drupal\user\Entity\Role::load($role_id);
        if ($role) {
          $roles[] = $role->label();
        }
      }
    }

    return $roles ? implode(', ', $roles) : $this->t('None');
  }

}
