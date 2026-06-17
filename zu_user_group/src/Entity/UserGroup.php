<?php

namespace Drupal\zu_user_group\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\user\EntityOwnerInterface;
use Drupal\user\EntityOwnerTrait;

/**
 * Defines the User Group entity.
 *
 * @ContentEntityType(
 *   id = "user_group",
 *   label = @Translation("User Group"),
 *   base_table = "user_group",
 *   admin_permission = "administer user groups",
 *   handlers = {
 *     "view_builder" = "Drupal\Core\Entity\EntityViewBuilder",
 *     "list_builder" = "Drupal\zu_user_group\UserGroupListBuilder",
 *     "form" = {
 *       "default" = "Drupal\zu_user_group\Form\UserGroupForm",
 *       "add" = "Drupal\zu_user_group\Form\UserGroupForm",
 *       "edit" = "Drupal\zu_user_group\Form\UserGroupForm",
 *       "delete" = "Drupal\Core\Entity\ContentEntityDeleteForm",
 *     },
 *     "route_provider" = {
 *       "html" = "Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *     },
 *   },
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "name",
 *     "uuid" = "uuid",
 *     "owner" = "uid",
 *   },
 *   links = {
 *     "canonical" = "/admin/people/user-group/{user_group}",
 *     "add-form" = "/admin/people/user-group/add",
 *     "edit-form" = "/admin/people/user-group/{user_group}/edit",
 *     "delete-form" = "/admin/people/user-group/{user_group}/delete",
 *     "collection" = "/admin/people/user-groups",
 *   },
 *   field_ui_base_route = "entity.user_group.collection"
 * )
 */
class UserGroup extends ContentEntityBase implements ContentEntityInterface, EntityOwnerInterface
{
  use StringTranslationTrait;
  use EntityOwnerTrait;

  /**
   * {@inheritdoc}
   */
  public function label()
  {
    $name = $this->get('name')->value;
    return !empty($name) ? $name : $this->t('User Group #@id', ['@id' => $this->id()]);
  }

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface $entity_type)
  {
    $fields = parent::baseFieldDefinitions($entity_type);
    $fields['name'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Name'))
      ->setRequired(TRUE)
      ->setDescription(t('The name of the User Group entity.'))
      ->setSettings([
        'max_length' => 255,
        'text_processing' => 0,
      ])
      ->setDefaultValue('')
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'string',
        'weight' => -4,
      ])
      ->setDisplayOptions('form', [
        'type' => 'string_textfield',
        'weight' => -4,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    // 1. Internal Roles
    // $fields['target_roles'] = BaseFieldDefinition::create('entity_reference')
    //     ->setLabel(t('Target Roles'))
    //     ->setDescription(t('Send to all users with these roles.'))
    //     ->setSetting('target_type', 'user_role')
    //     ->setSetting('handler', 'default')
    //     ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
    //     ->setDisplayOptions('view', [
    //         'label' => 'above',
    //         'type' => 'entity_reference_label',
    //         'weight' => 0,
    //     ])
    //     ->setDisplayOptions('form', [
    //         'type' => 'options_buttons',
    //         'weight' => 0,
    //     ])
    //     ->setDisplayConfigurable('form', TRUE)
    //     ->setDisplayConfigurable('view', TRUE);

    $fields['target_public_segments'] = BaseFieldDefinition::create('list_string')
      ->setLabel(t('Target Public Subscribers'))
      ->setDescription(t('Send to public users subscribed to these updates.'))
      ->setSettings([
        'allowed_values' => [
          'blog_subscribe' => 'Blog Subscribers',
          'news_subscribe' => 'News Subscribers',
          'newsletter_subscribe' => 'Newsletter Subscribers',
        ],
      ])
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'list_default',
        'weight' => 1,
      ])
      ->setDisplayOptions('form', [
        'type' => 'options_buttons',
        'weight' => 1,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    // 3. Event Categories
    $fields['target_event_types'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Target Event Categories'))
      ->setDescription(t('Send to public users subscribed to these event types.'))
      ->setSetting('target_type', 'taxonomy_term')
      ->setSetting('handler', 'default')
      //->setSetting('handler_settings', ['target_bundles' => ['event_type', 'area_of_expertise', 'blog_tags', 'news_tags']]) // Broadened to include other relevant tax
      ->setSetting('handler_settings', ['target_bundles' => ['event_type']])
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'entity_reference_label',
        'weight' => 2,
      ])
      ->setDisplayOptions('form', [
        'type' => 'options_select',
        'weight' => 2,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['target_all_public_users'] = BaseFieldDefinition::create('boolean')
      ->setLabel(t('Target All Public Users'))
      ->setDescription(t('If checked, this group will include ALL active public users.'))
      ->setDefaultValue(FALSE)
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'weight' => 6,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['target_webforms'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Target Webforms'))
      ->setDescription(t('Target users who have submitted specific webforms.'))
      ->setSetting('target_type', 'webform')
      ->setSetting('handler', 'default')
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setDisplayOptions('view', [
        'label' => 'above',
        'type' => 'entity_reference_label',
        'weight' => 3,
      ])
      ->setDisplayOptions('form', [
        'type' => 'options_select',
        'weight' => 3,
      ])
      ->setDisplayConfigurable('form', TRUE)
      ->setDisplayConfigurable('view', TRUE);

    $fields['target_webform_submissions'] = BaseFieldDefinition::create('string')
      ->setLabel(t('Selected Webform Submissions'))
      ->setDescription(t('Internal field used to store specific submission IDs selected from the Target Webforms table. This allows fine-grained targeting of individual users.'))
      ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
      ->setDisplayConfigurable('form', FALSE)
      ->setDisplayConfigurable('view', FALSE);

    // $fields['users'] = BaseFieldDefinition::create('entity_reference')
    //     ->setLabel(t('Manual Internal Users (Overrides)'))
    //     ->setDescription(t('Manually add specific internal users.'))
    //     ->setSetting('target_type', 'user')
    //     ->setSetting('handler', 'default')
    //     ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
    //     ->setDisplayOptions('view', [
    //         'label' => 'above',
    //         'type' => 'entity_reference_label',
    //         'weight' => 10,
    //     ])
    //     ->setDisplayOptions('form', [
    //         'type' => 'entity_autocomplete',
    //         'weight' => 10,
    //     ])
    //     ->setDisplayConfigurable('form', TRUE)
    //     ->setDisplayConfigurable('view', TRUE);

    // $fields['public_users'] = BaseFieldDefinition::create('entity_reference')
    //     ->setLabel(t('Manual Public Users (Overrides)'))
    //     ->setDescription(t('Manually add specific public users.'))
    //     ->setSetting('target_type', 'public_user')
    //     ->setSetting('handler', 'default')
    //     ->setCardinality(BaseFieldDefinition::CARDINALITY_UNLIMITED)
    //     ->setDisplayOptions('view', [
    //         'label' => 'above',
    //         'type' => 'entity_reference_label',
    //         'weight' => 11,
    //     ])
    //     ->setDisplayOptions('form', [
    //         'type' => 'entity_autocomplete',
    //         'weight' => 11,
    //     ])
    //     ->setDisplayConfigurable('form', TRUE)
    //     ->setDisplayConfigurable('view', TRUE);

    $fields['uid'] = BaseFieldDefinition::create('entity_reference')
      ->setLabel(t('Authored by'))
      ->setDescription(t('The user ID of author of the User Group entity.'))
      ->setSetting('target_type', 'user')
      ->setSetting('handler', 'default')
      ->setDefaultValueCallback(static::class . '::getDefaultEntityOwner')
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'author',
        'weight' => 0,
      ])
      ->setDisplayConfigurable('form', FALSE)
      ->setDisplayConfigurable('view', TRUE);

    return $fields;
  }
}
