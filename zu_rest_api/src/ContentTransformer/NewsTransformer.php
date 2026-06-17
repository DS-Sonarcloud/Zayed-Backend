<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Drupal\zu_rest_api\Service\ConstantService;
use Drupal\zu_rest_api\Utility\UrlHelper;

/**
 * Transformer for news content type.
 */
class NewsTransformer implements ContentTransformerInterface {

  protected $shortAliasRepository;
  protected ConstantService $constantService;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected $aliasManager;

  public function __construct(
    $short_alias_repository,
    ConstantService $constant_service,
    EntityTypeManagerInterface $entity_type_manager,
    $alias_manager = NULL
  ) {
    $this->shortAliasRepository = $short_alias_repository;
    $this->constantService = $constant_service;
    $this->entityTypeManager = $entity_type_manager;
    $this->aliasManager = $alias_manager ?: \Drupal::service('path_alias.manager');
  }

  public function getBundle(): string {
    return 'news';
  }

  public function getFieldAliasMap(): array {
    return [
      'body' => 'content',
      'field_summary' => 'summary',
      'field_thumbnail' => 'thumbnail',
      'field_featured_image' => 'featuredImage',
      'field_news_categories' => 'categories',
      'field_tags' => 'tags',
      'field_image_gallery' => 'imageGallery',
    ];
  }

  public function getExcludedFields(): array {
    return [];
  }

  public function transform(array $item, NodeInterface $node): array {
    $baseDomain = $this->constantService->getConstant('BACKEND_API_BASE_URL');

    /* -------------------------
      * Slug & URL
      * ------------------------- */
      $node_langcode = $node->language()->getId();

      $alias = $this->aliasManager
        ->getAliasByPath('/node/' . $node->id(), $node_langcode);

      if ($alias === '/node/' . $node->id()) {
        $alias = '/' . $node_langcode . '/node/' . $node->id();
      }

      if (!str_starts_with($alias, '/' . $node_langcode . '/')) {
        $alias = '/' . $node_langcode . $alias;
      }

      $item['slug'] = $alias;
      $item['url'] = UrlHelper::stripLangPrefix($alias);
      $item['langcode'] = $node_langcode;


    /* -------------------------
     * Type
     * ------------------------- */
    $item['type'] = 'news';

    /* -------------------------
     * Dates & status
     * ------------------------- */
    $item['publishDate'] = (string) $node->getCreatedTime();

    if ($node->hasField('field_expiry_date') && !$node->get('field_expiry_date')->isEmpty()) {
      $item['expiryDate'] = $node->get('field_expiry_date')->value;
    }

    $item['status'] = $node->isPublished() ? 'Published' : 'Unpublished';

    /* -------------------------
     * Author details
     * ------------------------- */
    $author = $node->getOwner();

    $item['name'] = $author ? $author->getDisplayName() : '';
    $item['user_picture'] = '';

    if ($author && $author->hasField('user_picture') && !$author->get('user_picture')->isEmpty()) {
      $file = $author->get('user_picture')->entity;
      if ($file) {
        $item['user_picture'] = \Drupal::service('file_url_generator')
          ->generateAbsoluteString($file->getFileUri());
      }
    }

    $roles = $author ? $author->getRoles() : [];
    $item['role'] = !empty($roles)
      ? ucfirst(str_replace('_', ' ', $roles[0]))
      : '';

    /* -------------------------
     * Video
     * ------------------------- */
    if ($node->hasField('field_embedded_video') && !$node->get('field_embedded_video')->isEmpty()) {
      $item['videoEmbed'] = $node->get('field_embedded_video')->value;
    }

    /* -------------------------
     * Categories & tags
     * ------------------------- */
    foreach (['categories', 'tags'] as $field) {
      if (!empty($item[$field]) && !is_array($item[$field])) {
        $item[$field] = array_map('trim', explode(',', $item[$field]));
      }
    }

    /* -------------------------
     * Campus
     * ------------------------- */
    if ($node->hasField('field_campus') && !$node->get('field_campus')->isEmpty()) {
      $item['campus'] = $node->get('field_campus')->value;
    }

    /* -------------------------
     * Language label
     * ------------------------- */
    $item['language'] = match ($node->language()->getId()) {
      'en' => 'English',
      'ar' => 'Arabic',
      default => $node->language()->getId(),
    };

    /* -------------------------
     * Featured
     * ------------------------- */
    $item['isFeatured'] = (
      $node->hasField('field_featured') &&
      $node->get('field_featured')->value
    ) ? 'True' : 'False';

    /* -------------------------
     * Images
     * ------------------------- */
    foreach (['thumbnail', 'featuredImage'] as $image_field) {
      if (!empty($item[$image_field]) && is_string($item[$image_field])) {
        $item[$image_field] = UrlHelper::absolutizeUrl($item[$image_field], $baseDomain);
      }
    }

    foreach (['summary', 'content'] as $html_field) {
      if (!empty($item[$html_field]) && is_string($item[$html_field])) {
        $item[$html_field] = UrlHelper::fixInlineImageUrls($item[$html_field], $baseDomain);
      }
    }

    /* -------------------------
     * Image gallery
     * ------------------------- */
    if (!empty($item['imageGallery'])) {
      $gallery_items = is_array($item['imageGallery'])
        ? $item['imageGallery']
        : explode(',', $item['imageGallery']);

      $images = [];
      $numeric_ids = [];
      $string_paths = [];

      // Separate numeric IDs from string paths.
      foreach ($gallery_items as $id) {
        if (!\is_string($id) && !\is_numeric($id)) {
          continue;
        }
        $id = trim((string) $id);
        if (!$id) {
          continue;
        }
        if (is_numeric($id)) {
          $numeric_ids[] = $id;
        }
        elseif (str_starts_with($id, '/sites/default/files')) {
          $string_paths[] = $baseDomain . $id;
        }
      }

      // Batch load all media entities at once.
      if (!empty($numeric_ids)) {
        $media_entities = $this->entityTypeManager->getStorage('media')->loadMultiple($numeric_ids);
        foreach ($media_entities as $media) {
          if ($media->bundle() === 'image') {
            $file = $media->get('field_media_image')->entity;
            if ($file) {
              $images[] = \Drupal::service('file_url_generator')
                ->generateAbsoluteString($file->getFileUri());
            }
          }
        }
      }

      $images = array_merge($images, $string_paths);
      $item['imageGallery'] = $images;
    }

    /* -------------------------
     * Social icons (frontend contract)
     * ------------------------- */
    $item['social_media_icon_list'] = [
      'facebook',
      'linkedin',
      'x',
      'email',
    ];

    /* -------------------------
     * Comments
     * ------------------------- */
    $item['Comments'] = '';

    return $item;
  }

  public function getDeployConfig(): array {
    return [
      'fileName' => 'zu-news-list',
      'contentKey' => 'newsData',
      'deployType' => 'news',
    ];
  }

  public function getExtraPayloadData(string $langcode): array {
    return [];
  }

}
