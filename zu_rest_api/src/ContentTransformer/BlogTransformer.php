<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\node\NodeInterface;
use Drupal\zu_rest_api\Service\ConstantService;
use Drupal\zu_rest_api\Utility\UrlHelper;

/**
 * Transformer for blog content type.
 */
class BlogTransformer implements ContentTransformerInterface {

  protected $shortAliasRepository;
  protected ConstantService $constantService;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected RendererInterface $renderer;
  protected array $preloadedAliases = [];

  public function __construct(
    $short_alias_repository,
    ConstantService $constant_service,
    EntityTypeManagerInterface $entity_type_manager,
    RendererInterface $renderer
  ) {
    $this->shortAliasRepository = $short_alias_repository;
    $this->constantService = $constant_service;
    $this->entityTypeManager = $entity_type_manager;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(): string {
    return 'blogs';
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldAliasMap(): array {
    return [
      'body' => 'content',
      'field_categories' => 'categories',
      'field_image' => 'featuredImage',
      'field_show_social_media_icon' => 'social_media_icon_list',
      'field_read_time' => 'read_time',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExcludedFields(): array {
    return [];
  }

  /**
   * Set pre-loaded short aliases.
   *
   * @param array $aliases
   *   Keyed by nid, value is source path.
   */
  public function setPreloadedAliases(array $aliases): void {
    $this->preloadedAliases = $aliases;
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $item, NodeInterface $node): array {
    $baseDomain = $this->constantService->getConstant('BACKEND_API_BASE_URL');

    $item['nid'] = (string) $item['nid'];

    // Add type identifier.
    $item['type'] = 'blog';

    // body.
    if ($node->hasField('body') && !$node->get('body')->isEmpty()) {
      $item['body'] = (string) ($node->get('body')->summary ?? '');
    }
    else {
      $item['body'] = '';
    }

    // publishDate from node created timestamp.
    $item['publishDate'] = (string) $node->getCreatedTime();

    // status.
    $item['status'] = 'Published';

    // uid.
    $item['uid'] = '';

    // Short alias.
    $nid_int = (int) $item['nid'];
    if (!empty($this->preloadedAliases) && isset($this->preloadedAliases[$nid_int])) {
      $item['short_alias'] = $this->preloadedAliases[$nid_int];
    }
    else {
      $short_alias = $this->shortAliasRepository
        ->findByDestinationUri(["internal:/node/" . $item['nid']]);
      $item['short_alias'] = $short_alias ? $short_alias->getSourcePathWithQuery() : '';
    }

    // Normalize URL and detect language.
    $langcode = 'en';
    if (!empty($item['url'])) {
      $url = UrlHelper::normalizeUrl($item['url']);
      $langcode = UrlHelper::detectLangFromUrl($url);
      $clean_url = UrlHelper::stripLangPrefix($url);
      $clean_url = UrlHelper::stripPathPrefix($clean_url, 'blog');
      $item['url'] = $clean_url;
    }

    // Convert categories to array if multi-value, empty string if empty.
    if (isset($item['categories'])) {
      if (empty($item['categories'])) {
        $item['categories'] = '';
      }
      elseif (is_string($item['categories'])) {
        $item['categories'] = array_map('trim', explode(',', $item['categories']));
      }
    }
    else {
      $item['categories'] = '';
    }

    $social_key = 'social_media_icon_list';
    if (!isset($item[$social_key]) || $item[$social_key] === '') {
      $item[$social_key] = [];
    }
    elseif (is_string($item[$social_key])) {
      $item[$social_key] = array_map('trim', explode(',', $item[$social_key]));
    }
    elseif (!is_array($item[$social_key])) {
      $item[$social_key] = [];
    }

    // Render comment field as HTML.
    $item['comment'] = $this->renderComments($node);

    // Comment status label.
    $comment_status = 'unknown';
    if ($node->hasField('comment')) {
      $value = $node->get('comment')->getValue();
      if (isset($value[0]['status'])) {
        $comment_status = (int) $value[0]['status'];
      }
    }
    $item['commentStatusLabel'] = match ($comment_status) {
      2 => 'open',
      1 => 'closed',
      0 => 'hidden',
      default => 'unknown',
    };

    // Fix featured image URL to absolute.
    if (!empty($item['featuredImage']) && is_string($item['featuredImage'])) {
      $item['featuredImage'] = UrlHelper::absolutizeUrl($item['featuredImage'], $baseDomain);
    }

    // Fix inline images in HTML fields.
    foreach (['body', 'content'] as $html_field) {
      if (!empty($item[$html_field]) && is_string($item[$html_field])) {
        $item[$html_field] = UrlHelper::fixInlineImageUrls($item[$html_field], $baseDomain);
      }
    }

    $item['langcode'] = $langcode;
    return $item;
  }

  /**
   * Render all published comments for a node as HTML.
   */
  private function renderComments(NodeInterface $node): string {
    if (!$node->hasField('comment') || $node->get('comment')->isEmpty()) {
      return '';
    }

    $cids = $this->entityTypeManager->getStorage('comment')
      ->getQuery()
      ->condition('entity_id', $node->id())
      ->condition('entity_type', 'node')
      ->condition('field_name', 'comment')
      ->condition('status', 1)
      ->accessCheck(FALSE)
      ->sort('created', 'DESC')
      ->range(0, 50)
      ->execute();

    if (empty($cids)) {
      return '';
    }

    $comments = $this->entityTypeManager->getStorage('comment')
      ->loadMultiple($cids);

    $view_builder = $this->entityTypeManager->getViewBuilder('comment');
    $output = '';
    foreach ($comments as $comment) {
      $build = $view_builder->view($comment);
      $rendered = (string) $this->renderer->renderPlain($build);
      $rendered = preg_replace('/<!--.*?-->/s', '', $rendered);
      $output .= "\n" . $rendered . "\n";
    }

    return $output;
  }

  /**
   * {@inheritdoc}
   */
  public function getDeployConfig(): array {
    return [
      'fileName' => 'zu-blog-list',
      'contentKey' => 'blogsData',
      'deployType' => 'blog',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExtraPayloadData(string $langcode): array {
    return [];
  }

}
