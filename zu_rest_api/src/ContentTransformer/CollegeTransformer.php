<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Drupal\zu_rest_api\Utility\UrlHelper;

/**
 * Transformer for college content type.
 */
class CollegeTransformer implements ContentTransformerInterface {

  protected EntityTypeManagerInterface $entityTypeManager;

  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(): string {
    return 'colleges';
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldAliasMap(): array {
    return [
      'body' => 'college_description',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExcludedFields(): array {
    return ['field_programs', 'field_college_location'];
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $item, NodeInterface $node): array {

    // College name is the title; remove title key.
    $item['college_name'] = $node->getTitle();
    unset($item['title']);

    // College description from body.
    $item['college_description'] = $node->hasField('body') && !$node->get('body')->isEmpty()
      ? (string) $node->get('body')->value
      : '';

    // Location.
    $item['field_college_location'] = $node->hasField('field_college_location') && !$node->get('field_college_location')->isEmpty()
      ? (string) $node->get('field_college_location')->value
      : '';

    // Programs: entity references to titles.
    $programs = [];
    if ($node->hasField('field_programs') && !$node->get('field_programs')->isEmpty()) {
      foreach ($node->get('field_programs') as $program_item) {
        $program_node = $program_item->entity;
        if ($program_node) {
          $programs[] = [
            'title' => $program_node->label(),
          ];
        }
      }
    }
    $item['field_programs'] = $programs;

    // Language detection and URL cleanup.
    $langcode = 'en';
    if (!empty($item['url'])) {
      $url = $node->toUrl()->toString();
      $langcode = UrlHelper::detectLangFromUrl($url);
      $item['url'] = UrlHelper::stripLangPrefix(UrlHelper::normalizeUrl($url));
    }

    $item['langcode'] = $langcode;
    return $item;
  }

  /**
   * {@inheritdoc}
   */
  public function getDeployConfig(): array {
    return [
      'fileName' => 'zu-colleges-list',
      'contentKey' => 'collegesData',
      'deployType' => 'colleges',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExtraPayloadData(string $langcode): array {
    return [];
  }

}
