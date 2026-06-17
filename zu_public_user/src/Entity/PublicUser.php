<?php

namespace Drupal\zu_public_user\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Session\AccountInterface;

/**
 * @method mixed get(string $field_name)
 * @method mixed set(string $field_name, $value)
 * @method mixed label()
 * @method mixed id()
 */
/**
 * Defines the Public User entity.
 *
 * @ContentEntityType(
 *   id = "public_user",
 *   label = @Translation("Public User"),
 *   base_table = "public_user",
 *   handlers = {
 *     "storage" = "Drupal\Core\Entity\Sql\SqlContentEntityStorage",
 *     "access" = "Drupal\Core\Entity\EntityAccessControlHandler",
 *     "list_builder" = "Drupal\Core\Entity\EntityListBuilder",
 *     "form" = {
 *       "default" = "Drupal\zu_public_user\Form\PublicUserEditForm",
 *       "add" = "Drupal\zu_public_user\Form\PublicUserEditForm",
 *       "edit" = "Drupal\zu_public_user\Form\PublicUserEditForm",
 *       "delete" = "Drupal\Core\Entity\ContentEntityDeleteForm"
 *     },
 *     "route_provider" = {
 *       "default" = "Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *     }
 *   },
 *   admin_permission = "administer users",
 *   entity_keys = {
 *     "id" = "id",
 *     "uuid" = "uuid",
 *     "label" = "name"
 *   },
 *   links = {
 *     "canonical" = "/admin/people/public-user/{public_user}",
 *     "add-form" = "/admin/people/public-user/add",
 *     "edit-form" = "/admin/people/public-user/{public_user}/edit",
 *     "delete-form" = "/admin/people/public-user/{public_user}/delete",
 *     "collection" = "/admin/people/public-users"
 *   },
 *   field_ui_base_route = "entity.public_user.collection"
 * )
 */
class PublicUser extends ContentEntityBase implements AccountInterface {

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type) {
    $fields = parent::baseFieldDefinitions($entity_type);

    // Email field.
    $fields['email'] = BaseFieldDefinition::create('email')
      ->setLabel(t('Email'))
      ->setRequired(TRUE)
      ->addConstraint('UniqueField')
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
      ])
      ->setDisplayConfigurable('view', TRUE)
      ->setDisplayConfigurable('form', FALSE);

    // Username field.
    $fields['name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Username'))
      ->setRequired(TRUE)
      ->addConstraint('UniqueField')
      ->setSettings(['max_length' => 255])
      ->setDisplayOptions('view', [
        'label' => 'inline',
        'type' => 'string',
      ])
      ->setDisplayConfigurable('view', TRUE)
      ->setDisplayConfigurable('form', FALSE);

    // Password hash.
    $fields['password'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Password hash'))
      ->setRequired(TRUE)
      ->setSettings(['max_length' => 255])
      ->setDisplayConfigurable('form', FALSE);

    // Status field.
    $fields['status'] = BaseFieldDefinition::create('list_integer')
      ->setLabel(t('Status'))
      ->setDescription(t('Whether the account is active or blocked.'))
      ->setSettings([
        'allowed_values' => [
          1 => 'Active',
          0 => 'Blocked',
        ],
      ])
      ->setDefaultValue(1)
      ->setRequired(TRUE)
      ->setDisplayOptions('form', [
        'type' => 'options_buttons',
        'weight' => 5,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    // FCM token.
    $fields['fcm_token'] = BaseFieldDefinition::create('string')
      ->setLabel(t('FCM Token'))
      ->setSettings(['max_length' => 255])
      ->setDisplayConfigurable('form', TRUE);

    // Email verified flag.
    $fields['is_verified'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Email Verified'))
      ->setDefaultValue(FALSE)
      ->setDisplayConfigurable('form', FALSE);

    // Created timestamp.
    $fields['created'] = BaseFieldDefinition::create('created')
      ->setLabel(t('Created'));

    // Changed timestamp.
    $fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'));

    // FRD extended profile fields.
    $fields['student_id'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Student ID'))
      ->setSettings(['max_length' => 64])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['employee_id'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Employee ID'))
      ->setSettings(['max_length' => 64])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['zu_id'] = BaseFieldDefinition::create('string')
      ->setLabel(t('ZU ID'))
      ->setSettings(['max_length' => 64])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['device_type'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Device Type'))
      ->setDefaultValue('')
      ->setSettings(['max_length' => 32])
      ->setDisplayConfigurable('form', FALSE);

    $fields['geo_location'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Geo Location'))
      ->setDefaultValue('')
      ->setSettings(['max_length' => 255])
      ->setDisplayConfigurable('form', FALSE);

    $fields['language_preference'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Language Preference'))
      ->setDefaultValue('en')
      ->setSettings(['max_length' => 16])
      ->setDisplayConfigurable('form', TRUE);

    $fields['phone'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Phone'))
      ->setSettings(['max_length' => 32])
      ->setDisplayConfigurable('form', TRUE);

    $fields['avatar_url'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Avatar URL'))
      ->setSettings(['max_length' => 512])
      ->setDisplayConfigurable('form', TRUE);

    return $fields;
  }

  /* =======================================================
   *  AccountInterface implementations
   * ======================================================= */

  public function id() {
    return $this->get('id')->value;
  }

  public function getAccountName() {
    return $this->get('name')->value;
  }

  public function getDisplayName() {
    return $this->getAccountName();
  }

  public function getEmail() {
    return $this->get('email')->value;
  }

  public function isAuthenticated() {
    return TRUE;
  }

  public function isAnonymous() {
    return FALSE;
  }

  public function getRoles($exclude_locked_roles = FALSE) {
    return ['public_user'];
  }

  public function hasPermission($permission) {
    return TRUE;
  }

  public function getPreferredLangcode($fallback_to_default = TRUE) {
    return 'en';
  }

  public function getPreferredAdminLangcode($fallback_to_default = TRUE) {
    return $this->getPreferredLangcode($fallback_to_default);
  }

  public function getPreferredLangcodes($fallback_to_default = TRUE) {
    return [$this->getPreferredLangcode($fallback_to_default)];
  }

  public function getTimeZone() {
    return date_default_timezone_get();
  }

  public function getLastAccessedTime() {
    return (int) $this->get('changed')->value ?? time();
  }
}
