<?php

namespace Drupal\zu_rest_api\Service;

use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;

/**
 * Generic entity query service with field auto-detection.
 */
class EntityQueryService {

  protected EntityTypeManagerInterface $entityTypeManager;
  protected EntityFieldManagerInterface $entityFieldManager;

  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    EntityFieldManagerInterface $entity_field_manager
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->entityFieldManager = $entity_field_manager;
  }

  /**
   * Load all published nodes of a given bundle.
   *
   * @param string $bundle
   *   The node bundle machine name (e.g. 'blog', 'event').
   * @param string|null $langcode
   *   Optional language code to load translations.
   *
   * @return \Drupal\node\NodeInterface[]
   */
  public function loadPublishedNodes(string $bundle, ?string $langcode = NULL, int $batch_size = 50): array {
    $nids = $this->entityTypeManager
      ->getStorage('node')
      ->getQuery()
      ->condition('type', $bundle)
      ->condition('status', NodeInterface::PUBLISHED)
      ->sort('created', 'DESC')
      ->accessCheck(FALSE)
      ->execute();

    if (empty($nids)) {
      return [];
    }

    // Load in batches to avoid memory exhaustion.
    $result = [];
    foreach (array_chunk($nids, $batch_size, TRUE) as $batch) {
      $nodes = $this->entityTypeManager
        ->getStorage('node')
        ->loadMultiple($batch);

      if ($langcode) {
        foreach ($nodes as $nid => $node) {
          if ($node->hasTranslation($langcode)) {
            $result[$nid] = $node->getTranslation($langcode);
          }
        }
      }
      else {
        $result += $nodes;
      }

      // Clear static entity cache to free memory between batches.
      $this->entityTypeManager->getStorage('node')->resetCache($batch);
    }

    return $result;
  }

  /**
   * Load all nodes of a given bundle including translations as separate items.
   *
   *
   * @param string $bundle
   *   The node bundle machine name.
   *
   * @return \Drupal\node\NodeInterface[]
   *   Array of node entities (including translations as separate items).
   */
  public function loadPublishedNodesAllTranslations(string $bundle, int $batch_size = 50): array {
    $nids = $this->entityTypeManager
      ->getStorage('node')
      ->getQuery()
      ->condition('type', $bundle)
      ->condition('status', NodeInterface::PUBLISHED)
      ->sort('created', 'DESC')
      ->accessCheck(FALSE)
      ->execute();

    if (empty($nids)) {
      return [];
    }

    // Load in batches to avoid memory exhaustion.
    $result = [];
    foreach (array_chunk($nids, $batch_size, TRUE) as $batch) {
      $nodes = $this->entityTypeManager
        ->getStorage('node')
        ->loadMultiple($batch);

      foreach ($nodes as $node) {
        foreach ($node->getTranslationLanguages() as $language) {
          $translation = $node->getTranslation($language->getId());
          if ($translation->isPublished()) {
            $result[] = $translation;
          }
        }
      }

      // Clear static entity cache to free memory between batches.
      $this->entityTypeManager->getStorage('node')->resetCache($batch);
    }

    return $result;
  }

  /**
   * Get all content field definitions for a bundle .
   *
   * @param string $bundle
   *   The node bundle.
   *
   * @return \Drupal\Core\Field\FieldDefinitionInterface[]
   *   Field definitions keyed by field name.
   */
  public function getContentFieldDefinitions(string $bundle): array {
    $all_fields = $this->entityFieldManager->getFieldDefinitions('node', $bundle);
    $content_fields = [];

    // Base fields to always exclude from auto-detection.
    $exclude_base = [
      'nid', 'uuid', 'vid', 'type', 'langcode', 'status',
      'uid', 'title', 'created', 'changed', 'promote', 'sticky',
      'default_langcode', 'revision_default', 'revision_uid',
      'revision_timestamp', 'revision_log', 'revision_translation_affected',
      'content_translation_source', 'content_translation_outdated',
      'content_translation_uid', 'content_translation_created',
      'content_translation_changed', 'content_translation_status',
      'menu_link', 'path', 'publish_on', 'unpublish_on',
      'ds_switch',
    ];

    foreach ($all_fields as $field_name => $definition) {
      if (in_array($field_name, $exclude_base, TRUE)) {
        continue;
      }
      // Include configurable (content) fields: field_*, body, comment, etc.
      if (!$definition->getFieldStorageDefinition()->isBaseField() || $field_name === 'body') {
        $content_fields[$field_name] = $definition;
      }
    }

    return $content_fields;
  }

}
