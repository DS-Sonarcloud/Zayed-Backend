<?php

namespace Drupal\zu_permission_matrix;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;

/**
 * Service to sync permission groups to Drupal roles.
 */
class PermissionSyncService {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Constructs the sync service.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    EntityTypeManagerInterface $entity_type_manager,
    LoggerChannelFactoryInterface $logger_factory
  ) {
    $this->configFactory = $config_factory;
    $this->entityTypeManager = $entity_type_manager;
    $this->logger = $logger_factory->get('zu_permission_matrix');
  }

  /**
   * Syncs all permission group assignments to roles.
   *
   * For each role that has group assignments, this merges all permissions
   * from assigned groups and updates the role. Permissions NOT managed by
   * any group are left untouched.
   */
  public function syncAll() {
    $config = $this->configFactory->get('zu_permission_matrix.role_assignments');
    $assignments = $config->get('assignments') ?: [];

    // Load all permission groups.
    $groups = $this->entityTypeManager->getStorage('permission_group')->loadMultiple();

    // Collect all permissions managed by any group.
    $all_managed_permissions = [];
    foreach ($groups as $group) {
      foreach ($group->getPermissions() as $perm) {
        $all_managed_permissions[$perm] = TRUE;
      }
    }

    // Get all non-admin, non-anonymous roles.
    $role_storage = $this->entityTypeManager->getStorage('user_role');
    $roles = $role_storage->loadMultiple();

    foreach ($roles as $role_id => $role) {
      // Skip admin and anonymous roles.
      if ($role->isAdmin() || $role_id === 'anonymous') {
        continue;
      }

      $current_permissions = $role->getPermissions();
      $role_group_ids = $assignments[$role_id] ?? [];

      // Calculate permissions that should come from groups.
      $group_permissions = [];
      foreach ($role_group_ids as $group_id) {
        if (isset($groups[$group_id])) {
          foreach ($groups[$group_id]->getPermissions() as $perm) {
            $group_permissions[$perm] = TRUE;
          }
        }
      }

      // Separate current permissions into managed and unmanaged.
      $unmanaged_permissions = [];
      foreach ($current_permissions as $perm) {
        if (!isset($all_managed_permissions[$perm])) {
          $unmanaged_permissions[] = $perm;
        }
      }

      // Final permission set = unmanaged (untouched) + group permissions.
      $new_permissions = array_unique(array_merge(
        $unmanaged_permissions,
        array_keys($group_permissions)
      ));
      sort($new_permissions);

      // Compare and update only if changed.
      $current_sorted = $current_permissions;
      sort($current_sorted);

      if ($current_sorted !== $new_permissions) {
        // Revoke all current permissions and grant new set.
        foreach ($current_permissions as $perm) {
          $role->revokePermission($perm);
        }
        foreach ($new_permissions as $perm) {
          $role->grantPermission($perm);
        }
        $role->save();

        $this->logger->info('Synced permissions for role @role: @count permissions from groups, @unmanaged unmanaged permissions preserved.', [
          '@role' => $role->label(),
          '@count' => count($group_permissions),
          '@unmanaged' => count($unmanaged_permissions),
        ]);
      }
    }
  }

}
