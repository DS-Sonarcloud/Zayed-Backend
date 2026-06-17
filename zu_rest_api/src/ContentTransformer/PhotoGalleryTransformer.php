<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Drupal\zu_rest_api\Service\ConstantService;

/**
 * Transformer for photo gallery content type.
 *
 */
class PhotoGalleryTransformer implements ContentTransformerInterface {

  protected ConstantService $constantService;
  protected EntityTypeManagerInterface $entityTypeManager;

  public function __construct(
    ConstantService $constant_service,
    EntityTypeManagerInterface $entity_type_manager
  ) {
    $this->constantService = $constant_service;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(): string {
    return 'photo_gallery';
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldAliasMap(): array {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getExcludedFields(): array {
    return [
      'field_gallery_images',
      'field_photo_gallery_event_date',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $item, NodeInterface $node): array {
    // Extract year and month from the event date field.
    $item['year'] = 0;
    $item['month'] = '';
    if ($node->hasField('field_photo_gallery_event_date') && !$node->get('field_photo_gallery_event_date')->isEmpty()) {
      $date_value = $node->get('field_photo_gallery_event_date')->value;
      if ($date_value) {
        try {
          $date = new \DateTime($date_value);
          $item['year'] = (int) $date->format('Y');
          $item['month'] = $date->format('F'); 
          }
        catch (\Exception $e) {
        }
      }
    }

    // Render gallery images as <img> HTML tags.
    $images = [];
    if ($node->hasField('field_gallery_images') && !$node->get('field_gallery_images')->isEmpty()) {
      foreach ($node->get('field_gallery_images')->referencedEntities() as $media) {
        $img_html = $this->renderMediaAsImgTag($media);
        if ($img_html) {
          $images[] = $img_html;
        }
      }
    }
    $item['images'] = $images;

    return $item;
  }

  /**
   * Render a media entity as an <img> HTML tag.
   */
  protected function renderMediaAsImgTag($media): string {
    if (!$media) {
      return '';
    }

    $source_field = $media->getSource()->getSourceFieldDefinition($media->bundle->entity);
    if (!$source_field) {
      return '';
    }

    $source_field_name = $source_field->getName();
    if (!$media->hasField($source_field_name) || $media->get($source_field_name)->isEmpty()) {
      return '';
    }

    $field_item = $media->get($source_field_name)->first();
    $file = $field_item->entity;
    if (!$file) {
      return '';
    }

    $absolute = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
    $src = preg_replace('#^https?://[^/]+#', '', $absolute);
    $width = $field_item->width ?? '';
    $height = $field_item->height ?? '';
    $alt = $field_item->alt ?? '';

    $tag = '<img loading="lazy" src="' . $src . '"';
    if ($width) {
      $tag .= ' width="' . $width . '"';
    }
    if ($height) {
      $tag .= ' height="' . $height . '"';
    }
    $tag .= ' alt="' . htmlspecialchars($alt, ENT_QUOTES) . '" />';

    return $tag;
  }

  /**
   * Group flat photo gallery items by year.
   *
   * @param array $items
   *   Flat array of transformed photo gallery items.
   *
   * @return array
   *   Grouped structure: [['year' => '2024', 'items' => [...]], ...]
   *   Sorted descending by year.
   */
  public function groupByYear(array $items): array {
    $grouped = [];

    foreach ($items as $row) {
      if (empty($row['year'])) {
        continue;
      }

      $year = (int) $row['year'];
      $grouped[$year][] = [
        'title' => $row['title'] ?? '',
        'month' => $row['month'] ?? '',
        'images' => $row['images'] ?? [],
      ];
    }

    krsort($grouped, SORT_NUMERIC);

    $ordered = [];
    foreach ($grouped as $year => $year_items) {
      $ordered[] = [
        'year' => (string) $year,
        'items' => $year_items,
      ];
    }

    return $ordered;
  }

  /**
   * {@inheritdoc}
   */
  public function getDeployConfig(): array {
    return [
      'fileName' => 'zu-image-gallery',
      'contentKey' => 'photoGallery',
      'deployType' => 'photo_gallery',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExtraPayloadData(string $langcode): array {
    return [];
  }

}
