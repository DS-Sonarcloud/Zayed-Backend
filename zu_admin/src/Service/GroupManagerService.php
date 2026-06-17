<?php

namespace Drupal\zu_admin\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Service for managing ZU Admin groups.
 */
class GroupManagerService {

  protected Connection $database;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected AccountInterface $currentUser;

  public function __construct(
    Connection $database,
    EntityTypeManagerInterface $entityTypeManager,
    AccountInterface $currentUser
  ) {
    $this->database          = $database;
    $this->entityTypeManager = $entityTypeManager;
    $this->currentUser       = $currentUser;
  }

  /**
   * Return all group names.
   */
  public function getAllGroupNames(): array {
    return $this->database->select('zu_admin_groups', 'g')
      ->fields('g', ['group_name'])
      ->orderBy('group_name')
      ->execute()
      ->fetchCol();
  }

  /**
   * Load a group record by name.
   */
  public function loadGroupByName(string $name): ?array {
    $result = $this->database->select('zu_admin_groups', 'g')
      ->fields('g')
      ->condition('group_name', $name)
      ->execute()
      ->fetchAssoc();
    return $result ?: NULL;
  }

  /**
   * Load a group by ID.
   */
  public function loadGroupById(int $gid): ?array {
    $result = $this->database->select('zu_admin_groups', 'g')
      ->fields('g')
      ->condition('gid', $gid)
      ->execute()
      ->fetchAssoc();
    return $result ?: NULL;
  }

  /**
   * Get the GID for a group name.
   */
  public function getGroupIdByName(string $name): ?int {
    $gid = $this->database->select('zu_admin_groups', 'g')
      ->fields('g', ['gid'])
      ->condition('group_name', $name)
      ->execute()
      ->fetchField();
    return $gid ? (int) $gid : NULL;
  }

  /**
   * Add a user to a group.
   */
  public function addUserToGroup(int $uid, int $gid): void {
    $this->database->merge('zu_admin_group_users')
      ->keys(['uid' => $uid, 'gid' => $gid])
      ->execute();
  }

  /**
   * Remove a user from a group.
   */
  public function removeUserFromGroup(int $uid, int $gid): void {
    $this->database->delete('zu_admin_group_users')
      ->condition('uid', $uid)
      ->condition('gid', $gid)
      ->execute();
  }

  /**
   * Get users in a group.
   */
  public function getGroupUsers(int $gid): array {
    $query = $this->database->select('zu_admin_group_users', 'gu');
    $query->join('users_field_data', 'u', 'u.uid = gu.uid');
    return $query
      ->fields('u', ['uid', 'name'])
      ->condition('gu.gid', $gid)
      ->execute()
      ->fetchAll(\PDO::FETCH_ASSOC);
  }

  /**
   * Get roles assigned to a group.
   */
  public function getGroupRoles(int $gid): array {
    return $this->database->select('zu_admin_group_roles', 'gr')
      ->fields('gr', ['role'])
      ->condition('gid', $gid)
      ->execute()
      ->fetchCol();
  }

  /**
   * Load all groups with user/role counts.
   */
  public function loadAllGroupsWithCounts(): array {
    $groups = $this->database->select('zu_admin_groups', 'g')
      ->fields('g')
      ->orderBy('group_name')
      ->execute()
      ->fetchAllAssoc('gid', \PDO::FETCH_ASSOC);

    foreach ($groups as &$group) {
      $group['user_count'] = (int) $this->database->select('zu_admin_group_users', 'gu')
        ->condition('gid', $group['gid'])
        ->countQuery()
        ->execute()
        ->fetchField();
      $group['roles'] = $this->getGroupRoles((int) $group['gid']);
    }
    unset($group);

    return $groups;
  }

  /**
   * Delete a group and its memberships/roles.
   */
  public function deleteGroup(int $gid): void {
    $this->database->delete('zu_admin_group_users')->condition('gid', $gid)->execute();
    $this->database->delete('zu_admin_group_roles')->condition('gid', $gid)->execute();
    $this->database->delete('zu_admin_groups')->condition('gid', $gid)->execute();
  }

}
