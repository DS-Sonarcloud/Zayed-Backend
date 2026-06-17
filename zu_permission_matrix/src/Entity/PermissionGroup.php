<?php

namespace Drupal\zu_permission_matrix\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBase;

/**
 * Defines the Permission Group config entity.
 *
 * @ConfigEntityType(
 *   id = "permission_group",
 *   label = @Translation("Permission Group"),
 *   label_collection = @Translation("Permission Groups"),
 *   label_singular = @Translation("permission group"),
 *   label_plural = @Translation("permission groups"),
 *   handlers = {
 *     "list_builder" = "Drupal\zu_permission_matrix\PermissionGroupListBuilder",
 *     "form" = {
 *       "add" = "Drupal\zu_permission_matrix\Form\PermissionGroupForm",
 *       "edit" = "Drupal\zu_permission_matrix\Form\PermissionGroupForm",
 *       "delete" = "Drupal\zu_permission_matrix\Form\PermissionGroupDeleteForm"
 *     }
 *   },
 *   config_prefix = "permission_group",
 *   admin_permission = "administer permission groups",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label",
 *     "weight" = "weight"
 *   },
 *   config_export = {
 *     "id",
 *     "label",
 *     "description",
 *     "permissions",
 *     "weight"
 *   },
 *   links = {
 *     "collection" = "/admin/config/people/permission-groups",
 *     "add-form" = "/admin/config/people/permission-groups/add",
 *     "edit-form" = "/admin/config/people/permission-groups/{permission_group}/edit",
 *     "delete-form" = "/admin/config/people/permission-groups/{permission_group}/delete"
 *   }
 * )
 */
class PermissionGroup extends ConfigEntityBase {

  /**
   * The machine name.
   *
   * @var string
   */
  protected $id;

  /**
   * The human-readable name.
   *
   * @var string
   */
  protected $label;

  /**
   * Description of the group.
   *
   * @var string
   */
  protected $description = '';

  /**
   * List of permission machine names.
   *
   * @var array
   */
  protected $permissions = [];

  /**
   * Weight for ordering.
   *
   * @var int
   */
  protected $weight = 0;

  /**
   * Gets the description.
   */
  public function getDescription() {
    return $this->description;
  }

  /**
   * Gets the permissions.
   */
  public function getPermissions() {
    return $this->permissions ?: [];
  }

  /**
   * Sets the permissions.
   */
  public function setPermissions(array $permissions) {
    $this->permissions = $permissions;
    return $this;
  }

  /**
   * Gets the weight.
   */
  public function getWeight() {
    return $this->weight;
  }

}
