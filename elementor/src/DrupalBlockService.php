<?php

namespace Drupal\elementor;

use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\media\Entity\Media;
use Drupal\file\Entity\File;

class DrupalBlockService
{

  public function getNodeData($content_type, $field_title, $field_body, $field_image, $node_columns = 5, $node_offset = 0, $node_search = '')
  {
    if (!$content_type) {
      return [];
    }

    $query = \Drupal::entityQuery('node')
      ->condition('type', $content_type)
      ->condition('status', 1)
      ->range($node_offset, $node_columns)
      ->sort('created', 'DESC')
      ->accessCheck(FALSE);

    if (!empty($node_search)) {
      $query->condition('title', '%' . $node_search . '%', 'LIKE');
    }

    $nids = $query->execute();

    if (empty($nids)) {
      return [];
    }

    $nodes = Node::loadMultiple($nids);
    $items = [];

    foreach ($nodes as $node) {
      $item = [];

      // --- Title (plain or paragraph reference) ---
      if ($field_title && $node->hasField($field_title) && !$node->get($field_title)->isEmpty()) {
        $item['title'] = $this->extractFieldValue($node, $field_title);
      }

      // --- Body (plain or paragraph reference) ---
      if ($field_body && $node->hasField($field_body) && !$node->get($field_body)->isEmpty()) {
        $item['body'] = $this->extractFieldValue($node, $field_body);
      }

      // --- Image (plain or paragraph reference) ---
      if ($field_image && $node->hasField($field_image) && !$node->get($field_image)->isEmpty()) {
        $item['image'] = $this->extractImageValue($node, $field_image);
      }

      if (!empty($item)) {
        $items[] = $item;
      }
    }

    return $items;
  }

  /**
   * Extracts field value (handles both plain and paragraph reference).
   */
  /**
   * Extracts field value (handles both plain and paragraph reference).
   */
  private function extractFieldValue(Node $node, $field_name)
  {
    $field = $node->get($field_name);
    $fieldType = $field->getFieldDefinition()->getType();

    if (in_array($fieldType, ['image', 'file'])) {
      return "";
    }

    if ($fieldType === 'entity_reference_revisions') {
      $values = [];

      /** @var \Drupal\Core\Field\EntityReferenceRevisionsFieldItemList $field */
      foreach ($field->referencedEntities() as $paragraph) {
        if ($paragraph instanceof Paragraph) {
          $itemData = [];

          // Heading
          if ($paragraph->hasField('field_heading') && !$paragraph->get('field_heading')->isEmpty()) {
            $itemData['heading'] = $paragraph->get('field_heading')->value;
          }

          // Description
          if ($paragraph->hasField('field_description') && !$paragraph->get('field_description')->isEmpty()) {
            $item = $paragraph->get('field_description')->first();
            if ($item) {
              $build = [
                '#type' => 'processed_text',
                '#text' => $item->value,
                '#format' => $item->format,
              ];
              $itemData['description'] = \Drupal::service('renderer')->renderPlain($build);
            }
          }

          foreach ($paragraph->getFields() as $subFieldName => $subField) {
            $subType = $subField->getFieldDefinition()->getType();
            $targetType = $subField->getFieldDefinition()->getSetting('target_type');

            if ($subType === 'entity_reference' && $targetType === 'media') {
              continue;
            }
            
            if ($subType === 'entity_reference' && !$subField->isEmpty()) {
              $labels = [];
              foreach ($subField->referencedEntities() as $entity) {
                if ($entity) {
                  $labels[] = $entity->label();
                }
              }
              if (!empty($labels)) {
                $itemData[$subFieldName] = $labels;
              }
            }
          }

          if (!empty($itemData)) {
            $values[] = $itemData;
          }
        }
      }

      return $values ?: "";
    }

    if (in_array($fieldType, ['text_with_summary', 'text_long'])) {
      return $field->processed ?? "";
    }

    if ($fieldType === 'entity_reference' && !$field->isEmpty()) {
      $labels = [];
      $target = $field->getFieldDefinition()->getSetting('target_type');
      /** @var \Drupal\Core\Field\EntityReferenceFieldItemListInterface $field */
      foreach ($field->referencedEntities() as $entity) {
        if ($entity) {
          if (in_array($target, ['taxonomy_term', 'node'])) {
            $labels[] = $entity->label();
          } elseif ($target === 'user') {
            $labels[] = $entity->getDisplayName();
          } elseif (in_array($target, ['file', 'image', 'media'])) {
            continue;
          } else {
            $labels[] = $entity->label();
          }
        }
      }

      return $labels ?: "";
    }


    if (in_array($fieldType, ['text', 'string', 'string_long'])) {
      return $field->value ?? "";
    }

    if (in_array($fieldType, ['boolean', 'integer', 'decimal', 'float', 'email'])) {
      return $field->value ?? "";
    }

    return "";
  }


  /**
   * Extracts image URL (handles both direct image/media and paragraph references).
   */
  private function extractImageValue(Node $node, $field_name)
  {
    $field = $node->get($field_name);
    $fieldType = $field->getFieldDefinition()->getType();

    if ($fieldType === 'entity_reference_revisions') {
      $urls = [];

      /** @var \Drupal\Core\Field\EntityReferenceRevisionsFieldItemList $field */
      foreach ($field->referencedEntities() as $paragraph) {
        if ($paragraph instanceof \Drupal\paragraphs\Entity\Paragraph) {
          foreach ($paragraph->getFields() as $subField) {
            if (
              !$subField->isEmpty() &&
              $subField->getFieldDefinition()->getType() === 'entity_reference'
            ) {
              $entity = $subField->entity;
              $url = $this->getImageUrl($entity);
              if ($url) {
                $urls[] = $url;
              }
            }
          }
        }
      }

      return count($urls) === 1 ? $urls[0] : $urls;
    }


    // Normal image/media
    $entity = $field->entity;
    return $this->getImageUrl($entity);
  }

  private function getImageUrl($entity)
  {
    if ($entity instanceof Media) {
      if ($entity->hasField('field_media_image') && !$entity->get('field_media_image')->isEmpty()) {
        $file = $entity->get('field_media_image')->entity;
        if ($file instanceof File) {
          return \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
        }
      }
    } elseif ($entity instanceof File) {
      return \Drupal::service('file_url_generator')->generateAbsoluteString($entity->getFileUri());
    }
    return "";
  }
}
