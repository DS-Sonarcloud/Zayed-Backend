<?php

namespace Drupal\zu_rest_api\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\node\NodeInterface;
use Drupal\path_alias\AliasManagerInterface;

/**
 * Type-aware field serializer that converts entity fields to JSON-ready arrays.
 */
class FieldSerializerService
{

  protected EntityTypeManagerInterface $entityTypeManager;
  protected FileUrlGeneratorInterface $fileUrlGenerator;
  protected AliasManagerInterface $aliasManager;
  protected ConstantService $constantService;

  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    FileUrlGeneratorInterface $file_url_generator,
    AliasManagerInterface $alias_manager,
    ConstantService $constant_service
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->fileUrlGenerator = $file_url_generator;
    $this->aliasManager = $alias_manager;
    $this->constantService = $constant_service;
  }

  /**
   * Serialize a node into a JSON-ready associative array.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node entity.
   * @param \Drupal\Core\Field\FieldDefinitionInterface[] $fieldDefinitions
   *   Content field definitions to serialize.
   * @param array $fieldAliasMap
   *   Map of Drupal field name => JSON output key.
   * @param array $excludeFields
   *   Field names to skip.
   *
   * @return array
   *   Serialized data with base fields + content fields.
   */
  public function serializeNode(
    NodeInterface $node,
    array $fieldDefinitions,
    array $fieldAliasMap = [],
    array $excludeFields = []
  ): array {
    $data = [];

    $data['nid'] = (int) $node->id();
    $data['title'] = $node->getTitle();

    // URL from path alias.
    $data['url'] = $this->getNodeUrl($node);

    // Serialize each content field.
    foreach ($fieldDefinitions as $field_name => $definition) {
      if (in_array($field_name, $excludeFields, TRUE)) {
        continue;
      }

      if (!$node->hasField($field_name) || $node->get($field_name)->isEmpty()) {
        $json_key = $fieldAliasMap[$field_name] ?? $field_name;
        $data[$json_key] = $this->getEmptyDefault($definition);
        continue;
      }

      $field = $node->get($field_name);
      $value = $this->serializeField($field, $definition);

      // Apply alias.
      $json_key = $fieldAliasMap[$field_name] ?? $field_name;
      $data[$json_key] = $value;
    }

    return $data;
  }

  /**
   * Serialize a single field value based on its type.
   */
  protected function serializeField(FieldItemListInterface $field, FieldDefinitionInterface $definition): mixed
  {
    $type = $definition->getType();

    switch ($type) {
      case 'string':
      case 'string_long':
        return (string) $field->value;

      case 'text_long':
      case 'text_with_summary':
        return (string) ($field->value ?? '');

      case 'boolean':
        return (bool) $field->value;

      case 'integer':
        return (int) $field->value;

      case 'float':
      case 'decimal':
        return (float) $field->value;

      case 'datetime':
      case 'daterange':
      case 'timestamp':
        return $this->serializeDateField($field, $type);

      case 'time':
        return $this->serializeTimeField($field);

      case 'link':
        return $this->serializeLinkField($field);

      case 'image':
        return $this->serializeImageField($field);

      case 'file':
        return $this->serializeFileField($field);

      case 'entity_reference':
        return $this->serializeEntityReference($field, $definition);

      case 'entity_reference_revisions':
        return $this->serializeParagraph($field);

      case 'list_string':
      case 'list_integer':
      case 'list_float':
        // Handle social media icon fields.
        $social_fields = ['field_show_social_media_icon'];
        if (in_array($field->getName(), $social_fields, TRUE)) {
          return $this->serializeSocialField($field);
        }

        $allowed_values = $definition->getSetting('allowed_values');
        $values = [];
        foreach ($field as $item) {
          $key = $item->value;
          $values[] = isset($allowed_values[$key]) ? (string) $allowed_values[$key] : (string) $key;
        }
        return count($values) === 1 ? $values[0] : $values;

      case 'address_country':
        $country_repository = \Drupal::service('address.country_repository');
        $countries = $country_repository->getList();
        $values = [];
        foreach ($field as $item) {
          $cc = strtoupper($item->value);
          $values[] = $countries[$cc] ?? $item->value;
        }
        return count($values) === 1 ? $values[0] : $values;

      case 'address_zone':
        return $this->serializeAddressZone($field);

      case 'address':
        return $this->serializeAddressField($field);

      case 'email':
        return (string) $field->value;

      case 'telephone':
        return (string) $field->value;

      case 'comment':
        return $this->serializeCommentField($field);

      case 'webform':
        return $field->target_id ?? '';

      default:
        $value = $field->value;
        if ($value !== NULL) {
          return $value;
        }
        return $field->getValue();
    }
  }

  /**
   * Serialize date fields.
   */
  protected function serializeDateField(FieldItemListInterface $field, string $type): mixed
  {
    if ($type === 'daterange') {
      $items = [];
      foreach ($field as $item) {
        $items[] = [
          'value' => $item->value ?? '',
          'end_value' => $item->end_value ?? '',
        ];
      }
      return count($items) === 1 ? $items[0] : $items;
    }
    if ($type === 'timestamp') {
      return (int) $field->value;
    }
    return (string) ($field->value ?? '');
  }

  /**
   * Serialize time fields (seconds since midnight → "hh:mm AM/PM").
   */
  protected function serializeTimeField(FieldItemListInterface $field): string
  {
    $value = $field->value;
    if ($value === NULL || $value === '') {
      return '';
    }
    $seconds = (int) $value;
    $hours = intdiv($seconds, 3600);
    $minutes = intdiv($seconds % 3600, 60);
    $period = $hours >= 12 ? 'PM' : 'AM';
    $display_hour = $hours % 12;
    if ($display_hour === 0) {
      $display_hour = 12;
    }
    return sprintf('%02d:%02d %s', $display_hour, $minutes, $period);
  }

  /**
   * Serialize link fields.
   */
  protected function serializeLinkField(FieldItemListInterface $field): mixed
  {
    $items = [];
    foreach ($field as $item) {
      $items[] = [
        'uri' => $item->uri ?? '',
        'title' => $item->title ?? '',
      ];
    }
    return count($items) === 1 ? $items[0] : $items;
  }

  /**
   * Serialize image fields to file URLs (relative, no base domain).
   */
  protected function serializeImageField(FieldItemListInterface $field): mixed
  {
    $urls = [];
    foreach ($field as $item) {
      if ($item->entity) {
        $uri = $item->entity->getFileUri();
        $urls[] = $this->toRelativeFileUrl($uri);
      }
    }
    return count($urls) === 1 ? $urls[0] : $urls;
  }

  /**
   * Serialize file fields to file URLs (relative, no base domain).
   */
  protected function serializeFileField(FieldItemListInterface $field): mixed
  {
    $urls = [];
    foreach ($field as $item) {
      if ($item->entity) {
        $uri = $item->entity->getFileUri();
        $urls[] = $this->toRelativeFileUrl($uri);
      }
    }
    return count($urls) === 1 ? $urls[0] : $urls;
  }

  /**
   * Serialize entity reference fields.
   */
  protected function serializeEntityReference(FieldItemListInterface $field, FieldDefinitionInterface $definition): mixed
  {
    $target_type = $definition->getSetting('target_type');

    // Media references -> resolve to file URLs.
    if ($target_type === 'media') {
      return $this->serializeMediaReference($field);
    }

    // Taxonomy term references -> return term names.
    if ($target_type === 'taxonomy_term') {
      $names = [];
      foreach ($this->getReferencedEntities($field, 'taxonomy_term') as $term) {
        $names[] = $term->label();
      }
      return count($names) === 1 ? $names[0] : $names;
    }

    // Node references -> return nids/labels.
    if ($target_type === 'node') {
      $refs = [];
      foreach ($this->getReferencedEntities($field, 'node') as $ref_node) {
        $refs[] = [
          'nid' => (int) $ref_node->id(),
          'title' => $ref_node->label(),
        ];
      }
      return count($refs) === 1 ? $refs[0] : $refs;
    }

    // User references -> return uid.
    if ($target_type === 'user') {
      $users = [];
      foreach ($this->getReferencedEntities($field, 'user') as $user) {
        $users[] = $user->getDisplayName();
      }
      return count($users) === 1 ? $users[0] : $users;
    }

    // Webform references.
    if ($target_type === 'webform') {
      return $field->target_id ?? '';
    }

    // Generic fallback: return target IDs.
    $ids = [];
    foreach ($field as $item) {
      $ids[] = $item->target_id;
    }
    return count($ids) === 1 ? $ids[0] : $ids;
  }

  /**
   * Serialize media entity references to objects with link and type.
   */
  protected function serializeMediaReference(FieldItemListInterface $field): mixed
  {
    $items = [];
    foreach ($this->getReferencedEntities($field, 'media') as $media) {
      $serialized = $this->serializeSingleMedia($media);
      if ($serialized !== NULL) {
        $items[] = $serialized;
      }
    }
    return count($items) === 1 ? $items[0] : $items;
  }

  /**
   * Serialize one media entity to a JSON-friendly multimedia object.
   */
  protected function serializeSingleMedia($media): ?array
  {
    if (!$media) {
      return NULL;
    }

    $link = $this->getMediaFileUrl($media);
    if (!$link) {
      return NULL;
    }

    $file_info = $this->getMediaFileInfo($media);
    return [
      // Keep existing keys for backward compatibility.
      'link' => $link,
      'type' => $media->bundle(),
      // Additional details useful for frontend handling by file type.
      'mime' => $file_info['mime'] ?? '',
      'filename' => $file_info['filename'] ?? '',
    ];
  }

  /**
   * Get file URL from a media entity.
   */
  public function getMediaFileUrl($media): ?string
  {
    if (!$media) {
      return NULL;
    }

    $source_field = NULL;
    $media_type = NULL;
    if (method_exists($media, 'bundle')) {
      $media_type = $this->entityTypeManager
        ->getStorage('media_type')
        ->load($media->bundle());
    }
    if ($media_type) {
      $source_field = $media->getSource()->getSourceFieldDefinition($media_type);
    }

    if ($source_field) {
      $source_field_name = $source_field->getName();
      if ($media->hasField($source_field_name) && !$media->get($source_field_name)->isEmpty()) {
        $source_item = $media->get($source_field_name)->first();
        if ($source_item && isset($source_item->entity) && $source_item->entity) {
          return $this->toRelativeFileUrl($source_item->entity->getFileUri());
        }
        // Handles source fields like remote video URL strings.
        if (!empty($source_item->value)) {
          return (string) $source_item->value;
        }
      }
    }

    // Fallbacks for known media source fields.
    $candidate_fields = [
      'field_media_video_file',
      'field_media_document',
      'field_media_image',
      'field_media_audio_file',
      'field_media_file',
      'field_media_oembed_video',
    ];

    foreach ($candidate_fields as $field_name) {
      if (!$media->hasField($field_name) || $media->get($field_name)->isEmpty()) {
        continue;
      }

      $item = $media->get($field_name)->first();
      if (!$item) {
        continue;
      }

      if (isset($item->entity) && $item->entity) {
        return $this->toRelativeFileUrl($item->entity->getFileUri());
      }

      if (!empty($item->value)) {
        return (string) $item->value;
      }
    }

    return NULL;
  }

  /**
   * Get file metadata (mime/filename) from media if available.
   */
  protected function getMediaFileInfo($media): array
  {
    if (!$media) {
      return [];
    }

    $candidate_fields = [
      'field_media_video_file',
      'field_media_document',
      'field_media_image',
      'field_media_audio_file',
      'field_media_file',
    ];

    foreach ($candidate_fields as $field_name) {
      if (!$media->hasField($field_name) || $media->get($field_name)->isEmpty()) {
        continue;
      }
      $item = $media->get($field_name)->first();
      if ($item && isset($item->entity) && $item->entity) {
        return [
          'mime' => (string) ($item->entity->getMimeType() ?? ''),
          'filename' => (string) ($item->entity->getFilename() ?? ''),
        ];
      }
    }

    return [];
  }

  /**
   * Convert a file URI to a relative URL
   */
  protected function toRelativeFileUrl(string $uri): string
  {
    $absolute = $this->fileUrlGenerator->generateAbsoluteString($uri);
    return preg_replace('#^https?://[^/]+#', '', $absolute);
  }

  /**
   * Serialize paragraph (entity_reference_revisions) fields.
   */
  protected function serializeParagraph(FieldItemListInterface $field): array
  {
    $result = [];

    foreach ($this->getReferencedEntities($field, 'paragraph') as $paragraph) {
      if (!method_exists($paragraph, 'getFieldDefinitions')) {
        continue;
      }

      $item = [];
      $field_definitions = $paragraph->getFieldDefinitions();

      foreach ($field_definitions as $field_def) {
        $fname = $field_def->getName();

        // Skip internal metadata fields.
        if (
          in_array($fname, [
            'id',
            'uuid',
            'revision_id',
            'langcode',
            'type',
            'status',
            'parent_id',
            'parent_type',
            'parent_field_name',
            'behavior_settings',
            'default_langcode',
            'revision_default',
            'revision_translation_affected',
            'content_translation_source',
            'content_translation_outdated',
            'content_translation_changed',
          ], TRUE)
        ) {
          continue;
        }

        if (!$paragraph->hasField($fname) || $paragraph->get($fname)->isEmpty()) {
          continue;
        }

        $p_field = $paragraph->get($fname);
        $p_type = $field_def->getType();

        if ($p_type === 'string' || $p_type === 'string_long') {
          $item[$fname] = (string) $p_field->value;
        } elseif ($p_type === 'text_long' || $p_type === 'text_with_summary') {
          $item[$fname] = (string) ($p_field->value ?? '');
        } elseif ($p_type === 'entity_reference' || $p_type === 'entity_reference_revisions') {
          $refs = [];
          $p_target_type = $field_def->getSetting('target_type') ?: NULL;
          foreach ($this->getReferencedEntities($p_field, $p_target_type) as $ref_entity) {
            $refs[] = $ref_entity->label();
          }
          $item[$fname] = $refs;
        } elseif ($p_type === 'image' || $p_type === 'file') {
          $files = [];
          foreach ($this->getReferencedEntities($p_field, 'file') as $file_entity) {
            if ($file_entity) {
              $uri = $file_entity->getFileUri();
              $files[] = $this->toRelativeFileUrl($uri);
            }
          }
          $item[$fname] = $files;
        } elseif ($p_type === 'link') {
          $links = [];
          foreach ($p_field as $link_item) {
            $links[] = [
              'uri' => $link_item->uri ?? '',
              'title' => $link_item->title ?? '',
            ];
          }
          $item[$fname] = count($links) === 1 ? $links[0] : $links;
        } else {
          $val = $p_field->value;
          $item[$fname] = $val !== NULL ? $val : $p_field->getValue();
        }
      }

      if (!empty($item)) {
        $result[] = $item;
      }
    }

    return $result;
  }

  /**
   * Serialize address fields to structured objects.
   */
  protected function serializeAddressField(FieldItemListInterface $field): mixed
  {
    $items = [];
    $country_repository = \Drupal::service('address.country_repository');
    $subdivision_repository = \Drupal::service('address.subdivision_repository');

    foreach ($field as $item) {
      $address = [];
      $country_code = $item->country_code;

      $address['given_name'] = $item->given_name ?? '';
      $address['family_name'] = $item->family_name ?? '';
      $address['additional_name'] = $item->additional_name ?? '';
      $address['organization'] = $item->organization ?? '';
      $address['address_line1'] = $item->address_line1 ?? '';
      $address['address_line2'] = $item->address_line2 ?? '';
      $address['address_line3'] = $item->address_line3 ?? '';
      $address['locality'] = $item->locality ?? '';
      $address['dependent_locality'] = $item->dependent_locality ?? '';
      $address['postal_code'] = $item->postal_code ?? '';
      $address['sorting_code'] = $item->sorting_code ?? '';

      // Get Administrative Area (Zone) label.
      $admin_area = $item->administrative_area;
      if ($admin_area && $country_code) {
        $subdivisions = $subdivision_repository->getList([$country_code]);
        $address['zone'] = $subdivisions[$admin_area] ?? $admin_area;
      } else {
        $address['zone'] = $admin_area ?? '';
      }

      // Get country label.
      if ($country_code) {
        $countries = $country_repository->getList();
        $address['country'] = $countries[$country_code] ?? $country_code;
      } else {
        $address['country'] = '';
      }

      // Filter out empty values except country/zone
      $items[] = array_filter($address, function ($val) {
        return $val !== NULL && $val !== '';
      });
    }
    return count($items) === 1 ? $items[0] : $items;
  }

  /**
   * Serialize address_zone fields to structured territory data.
   */
  protected function serializeAddressZone(FieldItemListInterface $field): mixed
  {
    $items = [];
    $country_repository = \Drupal::service('address.country_repository');
    $subdivision_repository = \Drupal::service('address.subdivision_repository');
    $format_repository = \Drupal::service('address.address_format_repository');
    $countries = $country_repository->getList();

    foreach ($field as $item) {
      $zone = $item->value;
      if (!$zone instanceof \CommerceGuys\Addressing\Zone\Zone) {
        continue;
      }

      $territories = [];
      foreach ($zone->getTerritories() as $territory) {
        $cc = strtoupper($territory->getCountryCode());
        $admin_area_code = $territory->getAdministrativeArea();
        $format = $format_repository->get($cc);
        $labels = \Drupal\address\LabelHelper::getFieldLabels($format);

        $territory_data = [];
        // Use localized labels as keys (must be cast to string).
        $country_key = (string) t('Country', [], ['context' => 'Address label']);
        $territory_data[$country_key] = $countries[$cc] ?? $cc;

        if ($admin_area_code && $cc) {
          $subdivisions = $subdivision_repository->getList([$cc]);
          $state_label = $subdivisions[$admin_area_code] ?? $admin_area_code;
          $zone_key = (string) ($labels[\CommerceGuys\Addressing\AddressFormat\AddressField::ADMINISTRATIVE_AREA] ?? t('Administrative area', [], ['context' => 'Address label']));
          $territory_data[$zone_key] = $state_label;
        }

        $included = $territory->getIncludedPostalCodes();
        if ($included) {
          $postal_key = (string) ($labels[\CommerceGuys\Addressing\AddressFormat\AddressField::POSTAL_CODE] ?? t('Postal code', [], ['context' => 'Address label']));
          $territory_data[$postal_key] = $included;
        }

        $excluded = $territory->getExcludedPostalCodes();
        if ($excluded) {
          $excluded_key = (string) t('Excluded postal codes', [], ['context' => 'Address label']);
          $territory_data[$excluded_key] = $excluded;
        }

        $territories[] = $territory_data;
      }

      $items[] = [
        'id' => $zone->getId(),
        'label' => $zone->getLabel(),
        'territories' => $territories,
      ];
    }
    return count($items) === 1 ? $items[0] : $items;
  }

  /**
   * Serialize comment field to status label.
   */
  protected function serializeCommentField(FieldItemListInterface $field): string
  {
    $value = $field->getValue();
    $status = isset($value[0]['status']) ? (int) $value[0]['status'] : -1;
    return match ($status) {
      2 => 'open',
      1 => 'closed',
      0 => 'hidden',
      default => 'unknown',
    };
  }

  /**
   * Serialize social media icon fields to structured objects.
   */
  protected function serializeSocialField(FieldItemListInterface $field): array
  {
    $config = \Drupal::config('zu_rest_api.social_media');
    $platforms = $config->get('platforms') ?: [];
    $values = [];

    foreach ($field as $item) {
      $key = $item->value;
      if (isset($platforms[$key])) {
        $values[] = [
          'name' => (string) $platforms[$key]['label'],
          'url' => (string) $platforms[$key]['url'],
          'icon' => (string) $platforms[$key]['icon'],
        ];
      } else {
        $values[] = [
          'name' => (string) $key,
          'url' => '#',
          'icon' => '',
        ];
      }
    }
    return $values;
  }

  /**
   * Get the URL/path alias for a node.
   */
  public function getNodeUrl(NodeInterface $node): string
  {
    return $node->toUrl()->toString();
  }

  /**
   * Get an appropriate empty default for a field type.
   */
  protected function getEmptyDefault(FieldDefinitionInterface $definition): mixed
  {
    $type = $definition->getType();
    return match ($type) {
      'boolean' => FALSE,
      'integer', 'float', 'decimal', 'timestamp' => 0,
      'entity_reference_revisions' => [],
      'image', 'file' => '',
      default => '',
    };
  }

  /**
   * Safely load referenced entities from an entity reference field list.
   */
  protected function getReferencedEntities(FieldItemListInterface $field, ?string $target_type = NULL): array
  {
    if (method_exists($field, 'referencedEntities')) {
      return call_user_func([$field, 'referencedEntities']);
    }

    $target_type = $target_type ?: ($field->getFieldDefinition()->getSetting('target_type') ?: NULL);
    if (!$target_type) {
      return [];
    }

    $ids = [];
    foreach ($field as $item) {
      if (isset($item->target_id) && $item->target_id !== NULL && $item->target_id !== '') {
        $ids[] = (int) $item->target_id;
      }
    }
    if (empty($ids)) {
      return [];
    }

    return array_values($this->entityTypeManager->getStorage($target_type)->loadMultiple(array_unique($ids)));
  }

}
