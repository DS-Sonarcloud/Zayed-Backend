<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\node\NodeInterface;

/**
 * Interface for per-bundle content transformers.
 *
 */
interface ContentTransformerInterface {

  /**
   * The node bundle this transformer handles.
   */
  public function getBundle(): string;

  /**
   * Field alias map: Drupal field machine name => JSON output key.
   *
   * @return array<string, string>
   */
  public function getFieldAliasMap(): array;

  /**
   * Fields to exclude from auto detection output.
   *
   * @return string[]
   */
  public function getExcludedFields(): array;

  /**
   * Transform a single serialized item array after auto-serialization.
   *
   * This is where all custom post-processing goes:
   * URL cleanup, comment status, webform loading, media resolution, etc.
   *
   * @param array $item
   *   The auto-serialized node data.
   * @param \Drupal\node\NodeInterface $node
   *   The original node entity.
   *
   * @return array
   *   The transformed item ready for deployment.
   */
  public function transform(array $item, NodeInterface $node): array;

  /**
   * Deploy configuration for this content type.
   *
   * @return array
   *   Keys: 'fileName' (e.g. 'zu-blog-list'), 'contentKey' (e.g. 'blogsData'),
   *   'deployType' (e.g. 'blog') for logging.
   */
  public function getDeployConfig(): array;

  /**
   * Extra data to include in the payload alongside content items.
   *
   * For example, events include 'responsiveBreakpoints'.
   *
   * @param string $langcode
   *   The language code ('en' or 'ar').
   *
   * @return array
   */
  public function getExtraPayloadData(string $langcode): array;

}
