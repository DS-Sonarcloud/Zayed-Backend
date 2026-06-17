<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\Core\Datetime\DateFormatterInterface;


/**
 * Transformer for forum topics.
 *
 */
class ForumTransformer implements ContentTransformerInterface {

  protected AliasManagerInterface $aliasManager;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected DateFormatterInterface $dateFormatter;
  protected array $preloadedCommentCounts = [];

  public function __construct(
    AliasManagerInterface $alias_manager,
    EntityTypeManagerInterface $entity_type_manager,
      DateFormatterInterface $date_formatter
  ) {
    $this->aliasManager = $alias_manager;
    $this->entityTypeManager = $entity_type_manager;
    $this->dateFormatter = $date_formatter;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(): string {
    return 'forum';
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldAliasMap(): array {
    return [
      'body' => 'body',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExcludedFields(): array {
    return [];
  }

  /**
   * Pre-load comment counts for multiple node IDs in a single query.
   *
   * @param int[] $nids
   *   Array of node IDs.
   */
  public function preloadCommentCounts(array $nids): void {
    if (empty($nids)) {
      return;
    }

    $database = \Drupal::database();
    $query = $database->select('comment_field_data', 'c');
    $query->fields('c', ['entity_id']);
    $query->condition('c.entity_id', $nids, 'IN');
    $query->condition('c.field_name', 'comment_forum');
    $query->condition('c.status', 1);
    $query->groupBy('c.entity_id');
    $query->addExpression('COUNT(c.cid)', 'comment_count');
    $result = $query->execute();

    $this->preloadedCommentCounts = [];
    foreach ($result as $row) {
      $this->preloadedCommentCounts[(int) $row->entity_id] = (int) $row->comment_count;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $item, NodeInterface $node): array {

    $nid = (int) $node->id();
    $internal_path = "/node/$nid";
    $alias = $this->aliasManager->getAliasByPath($internal_path);
    

    $langcode = 'en';
    if (strpos($alias, '/ar/') === 0) {
      $langcode = 'ar';
    }

    // Get forum taxonomy term.
    $tid = NULL;
    $forum_name = '';
    if ($node->hasField('taxonomy_forums') && !$node->get('taxonomy_forums')->isEmpty()) {
      $term = $node->get('taxonomy_forums')->entity;
      if ($term) {
        $tid = (int) $term->id();
        $forum_name = $term->label();
      }
    }
    $author = $node->getOwner();
    $author_name = $author ? $author->getDisplayName() : '';

    $created_timestamp = $node->getCreatedTime();
    $created_rendered = '<time datetime="' . date('c', $created_timestamp) . '">' .
      $this->dateFormatter->format($created_timestamp, 'custom', 'd M Y') .
    '</time>';

    // Comment count.
    if (isset($this->preloadedCommentCounts[$nid])) {
      $comments_count = $this->preloadedCommentCounts[$nid];
    }
    else {
      $comments_count = $this->entityTypeManager
        ->getStorage('comment')
        ->getQuery()
        ->condition('entity_id', $nid)
        ->condition('field_name', 'comment_forum')
        ->condition('status', 1)
        ->accessCheck(FALSE)
        ->count()
        ->execute();
    }

    return [
      'nid' => $nid,
      'title' => $node->getTitle(),
      'author' => $author_name,
      'created' => $created_rendered,
      'replies' => (int) $comments_count,
      'url' => "/forum/$tid/$nid",
      'excerpt' => $node->hasField('body') && !$node->get('body')->isEmpty()
        ? (string) $node->get('body')->value
        : '',
      'tid' => $tid,
      'forum_name' => $forum_name,
      'langcode' => $langcode,
    ];
  }

  /**
   * Group flat forum topic items into container structure.
   *
   * @param array $items
   *   Flat array of transformed forum topic items.
   *
   * @return array
   *   Keyed by langcode, each containing array of container structures.
   */
  public function groupIntoContainers(array $items): array {
    $containers = [];
    $by_lang = ['en' => [], 'ar' => []];

    foreach ($items as $topic) {
      $langcode = $topic['langcode'] ?? 'en';
      $tid = $topic['tid'] ?? NULL;

      if (!$tid) {
        continue;
      }

      $forum_name = $topic['forum_name'] ?? '';
      unset($topic['tid'], $topic['forum_name'], $topic['langcode']);

      if (!isset($containers[$langcode][$tid])) {
        $containers[$langcode][$tid] = [
          'tid' => $tid,
          'name' => $forum_name,
          'topics_count' => 0,
          'posts_count' => 0,
          'url' => "/forum/$tid",
          'topics' => [],
        ];
      }

      $containers[$langcode][$tid]['topics'][] = $topic;
      $containers[$langcode][$tid]['topics_count']++;
      $containers[$langcode][$tid]['posts_count'] += $topic['replies'] ?? 0;
    }

    foreach (['en', 'ar'] as $lang) {
      if (!empty($containers[$lang])) {
        $by_lang[$lang] = array_values($containers[$lang]);
      }
    }

    return $by_lang;
  }

  /**
   * {@inheritdoc}
   */
  public function getDeployConfig(): array {
    return [
      'fileName' => 'zu-forum-list',
      'contentKey' => 'forumData',
      'deployType' => 'forum',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExtraPayloadData(string $langcode): array {
    return [];
  }

}
