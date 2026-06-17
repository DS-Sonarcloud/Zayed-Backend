<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\user\Entity\Role;

/**
 * Builds live dashboard metrics mapped to the ZU Drupal ERD model.
 */
final class ErdDashboardDataService {

  use StringTranslationTrait;

  /**
   * ERD category metadata (matches zayed_university_drupal_erd.html legend).
   *
   * @var array<string, array{label: string, color: string}>
   */
  /** Maximum sample rows per ERD card (scroll inside the card for more). */
  private const PREVIEW_MAX_ROWS = 50;

  /** Placeholder rows when a table has no records. */
  private const PREVIEW_MIN_EMPTY_ROWS = 3;

  /**
   * Default column headers for mini-table previews when no live rows exist.
   *
   * @var array<string, list<string>>
   */
  private const PREVIEW_COLUMNS = [
    'USER' => ['uid', 'name', 'mail'],
    'ROLE' => ['id', 'label', 'weight'],
    'USER_ROLE' => ['user_id', 'site_id', 'role'],
    'SSO_SESSION' => ['token', 'user_id', 'expires'],
    'CONTENT_NODE' => ['nid', 'title', 'type'],
    'TAXONOMY_TERM' => ['tid', 'name', 'vid'],
    'NODE_TAXONOMY' => ['nid', 'tid', 'weight'],
    'COURSE' => ['course_id', 'title', 'code'],
    'ENROLLMENT' => ['enrollment_id', 'user_id', 'course_id'],
    'SITE' => ['site_id', 'domain', 'label'],
    'FORM_DEFINITION' => ['survey_id', 'title', 'status'],
    'FORM_SUBMISSION' => ['response_id', 'survey_id', 'submitted'],
    'JOB_APPLICATION' => ['application_id', 'job_id', 'status'],
  ];

  private const CATEGORIES = [
    'core' => [
      'label' => 'Core user & auth',
      'color' => '#185FA5',
    ],
    'content' => [
      'label' => 'Content',
      'color' => '#0F6E56',
    ],
    'community' => [
      'label' => 'Community & engagement',
      'color' => '#993556',
    ],
    'media_search' => [
      'label' => 'Media & search',
      'color' => '#533AB7',
    ],
    'jobs_forms' => [
      'label' => 'Jobs & forms',
      'color' => '#A32D2D',
    ],
  ];

  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly ModuleHandlerInterface $moduleHandler,
    private readonly Connection $database,
    private readonly ErdCategoryViewsBuilder $categoryViews,
    private readonly DashboardAdminLinkResolver $adminLinks,
  ) {}

  /**
   * @return array{
   *   categories: list<array<string, mixed>>,
   *   relationships: list<array<string, mixed>>,
   *   totals: array{entities: int, with_data: int, records: int}
   * }
   */
  public function build(): array {
    $visible_categories = array_keys(self::CATEGORIES);
    $entities = array_values(array_filter(
      $this->buildEntities(),
      static fn(array $entity): bool => in_array($entity['category'], $visible_categories, TRUE),
    ));
    $by_category = [];
    foreach (self::CATEGORIES as $category_id => $meta) {
      $category_entities = array_values(array_filter(
        $entities,
        static fn(array $entity): bool => $entity['category'] === $category_id,
      ));
      $by_category[] = [
        'id' => $category_id,
        'label' => (string) $this->t($meta['label']),
        'color' => $meta['color'],
        'views' => $this->categoryViews->buildForCategory($category_id),
        'more_links' => $this->adminLinks->categoryLinks($category_id),
        'entities' => $category_entities,
        'entity_count' => count($category_entities),
        'records' => array_sum(array_map(
          static fn(array $e): int => is_int($e['count']) ? $e['count'] : 0,
          $category_entities,
        )),
      ];
    }

    $with_data = count(array_filter(
      $entities,
      static fn(array $e): bool => is_int($e['count']) && $e['count'] > 0,
    ));
    $records = array_sum(array_map(
      static fn(array $e): int => is_int($e['count']) ? $e['count'] : 0,
      $entities,
    ));

    return [
      'categories' => $by_category,
      'schema' => $this->buildSchemaStatus(),
      'totals' => [
        'entities' => count($entities),
        'with_data' => $with_data,
        'records' => $records,
      ],
    ];
  }

  /**
   * @return array{
   *   branch: string,
   *   ready: bool,
   *   tables_expected: int,
   *   tables_installed: int,
   *   marker_tables: list<string>
   * }
   */
  private function buildSchemaStatus(): array {
    $expected = ErdSchemaRegistry::expectedSchemaTables();
    $installed = array_filter(
      $expected,
      fn(string $table): bool => $this->database->schema()->tableExists($table),
    );
    $markers_ready = array_filter(
      ErdSchemaRegistry::SCHEMA_MARKER_TABLES,
      fn(string $table): bool => $this->database->schema()->tableExists($table),
    );

    return [
      'branch' => ErdSchemaRegistry::SCHEMA_BRANCH,
      'ready' => count($markers_ready) >= 2,
      'tables_expected' => count($expected),
      'tables_installed' => count($installed),
      'marker_tables' => array_values($markers_ready),
    ];
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function buildEntities(): array {
    $out = [];
    foreach (ErdSchemaRegistry::entityDefinitions() as $definition) {
      $resolved = $this->resolveCountWithSource($definition);
      $count = $resolved['count'];
      $out[] = [
        'id' => $definition['id'],
        'category' => $definition['category'],
        'label' => (string) $this->t($definition['label']),
        'drupal_map' => $resolved['map_label'],
        'source' => $resolved['source'],
        'source_label' => $resolved['source_label'],
        'count' => $count,
        'count_label' => $this->formatCountLabel($count),
        'status' => $this->resolveStatus($count, $definition, $resolved['source']),
        'url' => $this->resolveUrl($definition),
        'preview' => $this->buildPreview($definition, $resolved),
      ];
    }
    return $out;
  }

  /**
   * @param array<string, mixed> $definition
   *
   * @return array{
   *   count: ?int,
   *   source: string,
   *   source_label: string,
   *   map_label: string,
   *   preview_mode: string,
   *   preview_table: ?string
   * }
   */
  private function resolveCountWithSource(array $definition): array {
    $default_map = (string) $definition['drupal_map'];
    $schema_table = $definition['table'] ?? NULL;

    if ($schema_table && $this->database->schema()->tableExists($schema_table)) {
      $schema_count = $this->countTable($schema_table);
      $fallback = $definition['fallback'] ?? NULL;

      if ($schema_count === 0 && $fallback && $fallback !== 'unavailable') {
        $fb_count = $this->resolveCountByResolver((string) $fallback, $definition);
        return [
          'count' => $fb_count ?? 0,
          'source' => 'drupal',
          'source_label' => (string) $this->t('Drupal fallback'),
          'map_label' => $default_map,
          'preview_mode' => 'fallback',
          'preview_table' => $schema_table,
        ];
      }

      return [
        'count' => $schema_count,
        'source' => 'schema',
        'source_label' => (string) $this->t('ERD table'),
        'map_label' => $schema_table,
        'preview_mode' => 'schema',
        'preview_table' => $schema_table,
      ];
    }

    $resolver = $definition['fallback'] ?? $definition['resolver'] ?? 'unavailable';
    $count = $this->resolveCountByResolver((string) $resolver, $definition);

    if ($resolver === 'unavailable') {
      return [
        'count' => NULL,
        'source' => 'concept',
        'source_label' => (string) $this->t('Conceptual'),
        'map_label' => $default_map,
        'preview_mode' => 'concept',
        'preview_table' => NULL,
      ];
    }

    return [
      'count' => $count,
      'source' => 'drupal',
      'source_label' => (string) $this->t('Drupal fallback'),
      'map_label' => $default_map,
      'preview_mode' => 'drupal',
      'preview_table' => NULL,
    ];
  }

  /**
   * @param array<string, mixed> $definition
   * @param array<string, mixed> $resolved
   *
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function buildPreview(array $definition, array $resolved): array {
    $preview_mode = (string) ($resolved['preview_mode'] ?? 'concept');
    $empty = (string) $this->t('—');

    if ($preview_mode === 'schema' && !empty($resolved['preview_table'])) {
      $schema_preview = $this->previewFromDatabaseTable((string) $resolved['preview_table']);
      if ($this->previewHasData($schema_preview)) {
        return $this->padPreview($schema_preview['columns'], $schema_preview['rows'], $empty);
      }
      return $this->padPreview(
        $schema_preview['columns'] ?: $this->defaultColumnsForEntity((string) $definition['id']),
        [],
        $empty,
      );
    }

    if (in_array($preview_mode, ['fallback', 'drupal'], TRUE)) {
      $resolver = $preview_mode === 'fallback'
        ? (string) ($definition['fallback'] ?? 'unavailable')
        : (string) ($definition['fallback'] ?? $definition['resolver'] ?? 'unavailable');
      $drupal_preview = $this->previewFromResolver($resolver, $definition);
      if ($this->previewHasData($drupal_preview)) {
        return $this->padPreview($drupal_preview['columns'], $drupal_preview['rows'], $empty);
      }
    }

    if (!empty($resolved['preview_table']) && $this->database->schema()->tableExists($resolved['preview_table'])) {
      $columns = $this->previewFromDatabaseTable((string) $resolved['preview_table'])['columns'];
      return $this->padPreview($columns ?: $this->defaultColumnsForEntity((string) $definition['id']), [], $empty);
    }

    return $this->padPreview($this->defaultColumnsForEntity((string) $definition['id']), [], $empty);
  }

  /**
   * @param list<string> $columns
   * @param list<list<string>> $rows
   *
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function padPreview(array $columns, array $rows, string $empty): array {
    if ($columns === []) {
      $columns = ['id', 'label', 'status'];
    }
    $columns = array_slice(array_values($columns), 0, 6);
    $data_rows = array_slice(array_values($rows), 0, self::PREVIEW_MAX_ROWS);
    $row_count = $data_rows === [] ? self::PREVIEW_MIN_EMPTY_ROWS : count($data_rows);
    $padded = [];
    for ($i = 0; $i < $row_count; $i++) {
      $row = $data_rows[$i] ?? [];
      $cells = [];
      foreach ($columns as $index => $column) {
        $cells[] = isset($row[$index]) && $row[$index] !== '' ? (string) $row[$index] : $empty;
      }
      $padded[] = $cells;
    }
    return [
      'columns' => $columns,
      'rows' => $padded,
    ];
  }

  /**
   * @param array{columns: list<string>, rows: list<list<string>>} $preview
   */
  private function previewHasData(array $preview): bool {
    $empty = (string) $this->t('—');
    foreach ($preview['rows'] as $row) {
      foreach ($row as $cell) {
        if ($cell !== '' && $cell !== $empty) {
          return TRUE;
        }
      }
    }
    return FALSE;
  }

  /**
   * @return list<string>
   */
  private function defaultColumnsForEntity(string $entity_id): array {
    return self::PREVIEW_COLUMNS[$entity_id] ?? ['id', 'label', 'status'];
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewFromDatabaseTable(string $table): array {
    $columns = array_slice($this->getTableColumnNames($table), 0, 6);
    if ($columns === []) {
      return ['columns' => ['id'], 'rows' => []];
    }

    try {
      $query = $this->database->select($table, 't')->fields('t', $columns)->range(0, self::PREVIEW_MAX_ROWS);
      $result = $query->execute();
      $rows = [];
      foreach ($result as $record) {
        $row = [];
        foreach ($columns as $column) {
          $value = $record->{$column} ?? '';
          $row[] = $this->formatPreviewCell($value);
        }
        $rows[] = $row;
      }
      return ['columns' => $columns, 'rows' => $rows];
    }
    catch (\Exception) {
      return ['columns' => $columns, 'rows' => []];
    }
  }

  /**
   * @param array<string, mixed> $definition
   *
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewFromResolver(string $resolver, array $definition): array {
    return match ($resolver) {
      'user_active' => $this->previewUsers(),
      'role_custom' => $this->previewRoles(),
      'user_custom_roles' => $this->previewUsers(TRUE),
      'node_all', 'node_published' => $this->previewNodes(),
      'node_bundle' => isset($definition['bundle'])
        ? $this->previewNodes($definition['bundle'])
        : ['columns' => ['nid', 'title', 'type'], 'rows' => []],
      'taxonomy_term' => $this->previewTaxonomyTerms(),
      'taxonomy_vocabulary' => isset($definition['vocabulary'])
        ? $this->previewTaxonomyTerms($definition['vocabulary'])
        : ['columns' => ['tid', 'name', 'vid'], 'rows' => []],
      'media' => $this->previewMedia(),
      'webform' => $this->previewWebforms(),
      'webform_submission' => $this->previewWebformSubmissions(),
      default => [
        'columns' => $this->defaultColumnsForEntity((string) ($definition['id'] ?? '')),
        'rows' => [],
      ],
    };
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewUsers(bool $custom_roles_only = FALSE): array {
    $columns = ['uid', 'name', 'mail'];
    if (!$this->entityTypeManager->hasDefinition('user')) {
      return ['columns' => $columns, 'rows' => []];
    }
    $query = $this->entityTypeManager->getStorage('user')->getQuery()
      ->accessCheck(FALSE)
      ->condition('uid', 0, '>')
      ->condition('status', 1)
      ->sort('uid', 'DESC')
      ->range(0, self::PREVIEW_MAX_ROWS);
    if ($custom_roles_only) {
      $uids = $this->getUsersWithCustomRoleUids(self::PREVIEW_MAX_ROWS);
      if ($uids === []) {
        return ['columns' => $columns, 'rows' => []];
      }
      $query->condition('uid', $uids, 'IN');
    }
    $uids = $query->execute();
    if ($uids === []) {
      return ['columns' => $columns, 'rows' => []];
    }
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('user')->loadMultiple($uids) as $user) {
      $rows[] = [
        (string) $user->id(),
        $user->getDisplayName(),
        $user->getEmail() ?: (string) $this->t('—'),
      ];
    }
    return ['columns' => $columns, 'rows' => $rows];
  }

  /**
   * @return list<int|string>
   */
  private function getUsersWithCustomRoleUids(int $limit): array {
    if (!$this->database->schema()->tableExists('user__roles')) {
      return [];
    }
    $query = $this->database->select('user__roles', 'ur');
    $query->join('users_field_data', 'u', 'u.uid = ur.entity_id');
    $query->fields('ur', ['entity_id']);
    $query->distinct();
    $query->condition('u.status', 1);
    $query->condition('u.uid', 0, '>');
    $query->condition('ur.roles_target_id', [Role::ANONYMOUS_ID, Role::AUTHENTICATED_ID], 'NOT IN');
    $query->range(0, $limit);
    return $query->execute()->fetchCol();
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewRoles(): array {
    $columns = ['id', 'label', 'weight'];
    $roles = Role::loadMultiple();
    $rows = [];
    foreach ($roles as $role) {
      if (in_array($role->id(), [Role::ANONYMOUS_ID, Role::AUTHENTICATED_ID], TRUE)) {
        continue;
      }
      $rows[] = [$role->id(), $role->label(), (string) $role->getWeight()];
      if (count($rows) >= self::PREVIEW_MAX_ROWS) {
        break;
      }
    }
    return ['columns' => $columns, 'rows' => $rows];
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewNodes(?string $bundle = NULL): array {
    $columns = ['nid', 'title', 'type'];
    if (!$this->entityTypeManager->hasDefinition('node')) {
      return ['columns' => $columns, 'rows' => []];
    }
    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->accessCheck(FALSE)
      ->sort('changed', 'DESC')
      ->range(0, self::PREVIEW_MAX_ROWS);
    if ($bundle !== NULL) {
      $query->condition('type', $bundle);
    }
    $nids = $query->execute();
    if ($nids === []) {
      return ['columns' => $columns, 'rows' => []];
    }
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('node')->loadMultiple($nids) as $node) {
      $rows[] = [
        (string) $node->id(),
        $node->label(),
        $node->bundle(),
      ];
    }
    return ['columns' => $columns, 'rows' => $rows];
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewTaxonomyTerms(?string $vid = NULL): array {
    $columns = ['tid', 'name', 'vid'];
    if (!$this->entityTypeManager->hasDefinition('taxonomy_term')) {
      return ['columns' => $columns, 'rows' => []];
    }
    $query = $this->entityTypeManager->getStorage('taxonomy_term')->getQuery()
      ->accessCheck(FALSE)
      ->sort('tid', 'DESC')
      ->range(0, self::PREVIEW_MAX_ROWS);
    if ($vid !== NULL) {
      $query->condition('vid', $vid);
    }
    $tids = $query->execute();
    if ($tids === []) {
      return ['columns' => $columns, 'rows' => []];
    }
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('taxonomy_term')->loadMultiple($tids) as $term) {
      $rows[] = [
        (string) $term->id(),
        $term->label(),
        $term->bundle(),
      ];
    }
    return ['columns' => $columns, 'rows' => $rows];
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewMedia(): array {
    $columns = ['mid', 'name', 'bundle'];
    if (!$this->entityTypeManager->hasDefinition('media')) {
      return ['columns' => $columns, 'rows' => []];
    }
    $ids = $this->entityTypeManager->getStorage('media')->getQuery()
      ->accessCheck(FALSE)
      ->sort('mid', 'DESC')
      ->range(0, self::PREVIEW_MAX_ROWS)
      ->execute();
    if ($ids === []) {
      return ['columns' => $columns, 'rows' => []];
    }
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('media')->loadMultiple($ids) as $media) {
      $rows[] = [
        (string) $media->id(),
        $media->label(),
        $media->bundle(),
      ];
    }
    return ['columns' => $columns, 'rows' => $rows];
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewWebforms(): array {
    $columns = ['id', 'title', 'status'];
    if (!$this->entityTypeManager->hasDefinition('webform')) {
      return ['columns' => $columns, 'rows' => []];
    }
    $ids = $this->entityTypeManager->getStorage('webform')->getQuery()
      ->accessCheck(FALSE)
      ->range(0, self::PREVIEW_MAX_ROWS)
      ->execute();
    if ($ids === []) {
      return ['columns' => $columns, 'rows' => []];
    }
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('webform')->loadMultiple($ids) as $webform) {
      $rows[] = [
        $webform->id(),
        $webform->label(),
        $webform->status() ? (string) $this->t('Open') : (string) $this->t('Closed'),
      ];
    }
    return ['columns' => $columns, 'rows' => $rows];
  }

  /**
   * @return array{columns: list<string>, rows: list<list<string>>}
   */
  private function previewWebformSubmissions(): array {
    $columns = ['sid', 'webform_id', 'created'];
    if (!$this->entityTypeManager->hasDefinition('webform_submission')) {
      return ['columns' => $columns, 'rows' => []];
    }
    $ids = $this->entityTypeManager->getStorage('webform_submission')->getQuery()
      ->accessCheck(FALSE)
      ->sort('sid', 'DESC')
      ->range(0, self::PREVIEW_MAX_ROWS)
      ->execute();
    if ($ids === []) {
      return ['columns' => $columns, 'rows' => []];
    }
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('webform_submission')->loadMultiple($ids) as $submission) {
      $webform = $submission->getWebform();
      $rows[] = [
        (string) $submission->id(),
        $webform ? $webform->id() : (string) $this->t('—'),
        date('Y-m-d', (int) $submission->getCreatedTime()),
      ];
    }
    return ['columns' => $columns, 'rows' => $rows];
  }

  /**
   * @return list<string>
   */
  private function getTableColumnNames(string $table): array {
    if (!$this->database->schema()->tableExists($table)) {
      return [];
    }

    $prefixed = $this->database->getPrefix() . $table;

    try {
      $columns = $this->database->query(
        'SELECT column_name FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = :table
         ORDER BY ordinal_position',
        [':table' => $prefixed],
      )->fetchCol();
      if (is_array($columns) && $columns !== []) {
        return array_values($columns);
      }
    }
    catch (\Exception) {
      // Fall through to DESCRIBE.
    }

    try {
      $columns = [];
      foreach ($this->database->query('DESCRIBE {' . $table . '}') as $row) {
        $name = is_object($row) ? ($row->Field ?? '') : ($row['Field'] ?? '');
        if ($name !== '') {
          $columns[] = (string) $name;
        }
      }
      return $columns;
    }
    catch (\Exception) {
      return [];
    }
  }

  private function formatPreviewCell(mixed $value): string {
    if ($value === NULL || $value === '') {
      return '';
    }
    if (is_scalar($value)) {
      $string = (string) $value;
      return strlen($string) > 48 ? substr($string, 0, 45) . '…' : $string;
    }
    return '';
  }

  /**
   * @param array<string, mixed> $definition
   */
  private function resolveCountByResolver(string $resolver, array $definition): ?int {
    return match ($resolver) {
      'user_active' => $this->countUsers(TRUE),
      'role_custom' => $this->countCustomRoles(),
      'user_custom_roles' => $this->countUsersWithCustomRoles(),
      'public_user_tokens' => $this->countTable('public_user_reset_tokens'),
      'zu_multidomain' => $this->countTable('zu_multidomain'),
      'node_all' => $this->countNodes(),
      'node_bundle' => isset($definition['bundle'])
        ? $this->countNodes($definition['bundle'])
        : NULL,
      'taxonomy_term' => $this->countEntity('taxonomy_term'),
      'taxonomy_vocabulary' => isset($definition['vocabulary'])
        ? $this->countTaxonomyVocabulary($definition['vocabulary'])
        : NULL,
      'taxonomy_index' => $this->countTaxonomyIndex(),
      'media' => $this->countEntity('media'),
      'comment_blogs' => $this->countComments('blogs'),
      'comment_forum' => $this->countComments('forum'),
      'webform' => $this->countEntity('webform'),
      'webform_submission' => $this->countEntity('webform_submission'),
      'search_api' => $this->countSearchIndexItems(),
      'dblog' => $this->countTable('watchdog'),
      'email_campaign' => $this->countEmailCampaignNodes(),
      'seo_notifications' => $this->countTable('seo_notifications'),
      'event_notifications' => $this->countTable('event_notification_queue'),
      'node_published' => $this->countNodes(NULL, TRUE),
      'unavailable' => NULL,
      default => NULL,
    };
  }

  private function countUsers(bool $active_only = FALSE): ?int {
    if (!$this->entityTypeManager->hasDefinition('user')) {
      return NULL;
    }
    $query = $this->entityTypeManager->getStorage('user')->getQuery()
      ->accessCheck(FALSE)
      ->condition('uid', 0, '>');
    if ($active_only) {
      $query->condition('status', 1);
    }
    return (int) $query->count()->execute();
  }

  private function countCustomRoles(): ?int {
    $roles = Role::loadMultiple();
    $count = 0;
    foreach ($roles as $role) {
      if (!in_array($role->id(), [Role::ANONYMOUS_ID, Role::AUTHENTICATED_ID], TRUE)) {
        $count++;
      }
    }
    return $count;
  }

  private function countUsersWithCustomRoles(): ?int {
    if (!$this->database->schema()->tableExists('user__roles')) {
      return NULL;
    }
    $query = $this->database->select('user__roles', 'ur');
    $query->join('users_field_data', 'u', 'u.uid = ur.entity_id');
    $query->addExpression('COUNT(DISTINCT ur.entity_id)', 'count');
    $query->condition('u.status', 1);
    $query->condition('u.uid', 0, '>');
    $query->condition('ur.roles_target_id', [Role::ANONYMOUS_ID, Role::AUTHENTICATED_ID], 'NOT IN');
    return (int) $query->execute()->fetchField();
  }

  private function countNodes(?string $bundle = NULL, ?bool $published_only = NULL): ?int {
    if (!$this->entityTypeManager->hasDefinition('node')) {
      return NULL;
    }
    $query = $this->entityTypeManager->getStorage('node')->getQuery()->accessCheck(FALSE);
    if ($bundle !== NULL) {
      $query->condition('type', $bundle);
    }
    if ($published_only === TRUE) {
      $query->condition('status', 1);
    }
    return (int) $query->count()->execute();
  }

  private function countEntity(string $entity_type): ?int {
    if (!$this->entityTypeManager->hasDefinition($entity_type)) {
      return NULL;
    }
    return (int) $this->entityTypeManager->getStorage($entity_type)->getQuery()
      ->accessCheck(FALSE)
      ->count()
      ->execute();
  }

  private function countTaxonomyVocabulary(string $vid): ?int {
    if (!$this->entityTypeManager->hasDefinition('taxonomy_term')) {
      return NULL;
    }
    return (int) $this->entityTypeManager->getStorage('taxonomy_term')->getQuery()
      ->accessCheck(FALSE)
      ->condition('vid', $vid)
      ->count()
      ->execute();
  }

  private function countTaxonomyIndex(): ?int {
    if (!$this->database->schema()->tableExists('taxonomy_index')) {
      return NULL;
    }
    return (int) $this->database->select('taxonomy_index', 'ti')
      ->countQuery()
      ->execute()
      ->fetchField();
  }

  private function countTable(string $table): ?int {
    if (!$this->database->schema()->tableExists($table)) {
      return NULL;
    }
    return (int) $this->database->select($table, 't')
      ->countQuery()
      ->execute()
      ->fetchField();
  }

  private function countComments(string $node_bundle): ?int {
    if (!$this->entityTypeManager->hasDefinition('comment')) {
      return NULL;
    }
    $nids = $this->entityTypeManager->getStorage('node')->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', $node_bundle)
      ->execute();
    if ($nids === []) {
      return 0;
    }
    return (int) $this->entityTypeManager->getStorage('comment')->getQuery()
      ->accessCheck(FALSE)
      ->condition('entity_type', 'node')
      ->condition('entity_id', $nids, 'IN')
      ->count()
      ->execute();
  }

  private function countSearchIndexItems(): ?int {
    if (!$this->moduleHandler->moduleExists('search_api')
      || !$this->entityTypeManager->hasDefinition('search_api_index')) {
      return NULL;
    }
    $total = 0;
    $indexes = $this->entityTypeManager->getStorage('search_api_index')->loadMultiple();
    foreach ($indexes as $index) {
      if (!$index->status()) {
        continue;
      }
      try {
        $total += (int) $index->getTrackerInstance()->getTotalItemsCount();
      }
      catch (\Exception) {
        // Skip indexes that cannot report counts.
      }
    }
    return $total;
  }

  private function countEmailCampaignNodes(): ?int {
    $campaign = $this->countNodes('campaign');
    $template = $this->countNodes('email_template');
    if ($campaign === NULL && $template === NULL) {
      return NULL;
    }
    return (int) ($campaign ?? 0) + (int) ($template ?? 0);
  }

  /**
   * @param array<string, mixed> $definition
   */
  private function resolveStatus(?int $count, array $definition, string $source): string {
    if ($source === 'concept' || ($definition['resolver'] ?? '') === 'unavailable') {
      return 'concept';
    }
    if ($count === NULL) {
      return 'unmapped';
    }
    if ($count === 0) {
      return 'empty';
    }
    return 'live';
  }

  private function formatCountLabel(?int $count): string {
    if ($count === NULL) {
      return (string) $this->t('—');
    }
    return (string) number_format($count);
  }

  /**
   * @param array<string, mixed> $definition
   */
  private function resolveUrl(array $definition): string {
    if (empty($definition['route'])) {
      return '';
    }
    try {
      $options = [];
      if (!empty($definition['bundle_filter'])) {
        $options['query'] = ['type' => $definition['bundle_filter']];
      }
      return Url::fromRoute($definition['route'], [], $options)->toString();
    }
    catch (\Exception) {
      return '';
    }
  }

  /**
   * Key ERD relationships with live counts where available.
   *
   * @return list<array<string, mixed>>
   */
  private function buildRelationships(): array {
    $rels = [
      ['from' => 'USER', 'to' => 'CONTENT_NODE', 'label' => 'authors', 'metric' => 'authored_nodes'],
      ['from' => 'SITE', 'to' => 'CONTENT_NODE', 'label' => 'hosts', 'metric' => 'zu_site'],
      ['from' => 'CONTENT_NODE', 'to' => 'TAXONOMY_TERM', 'label' => 'tagged with', 'metric' => 'taxonomy_index'],
      ['from' => 'CONTENT_NODE', 'to' => 'MEDIA_ASSET', 'label' => 'has media', 'metric' => 'media'],
      ['from' => 'CONTENT_NODE', 'to' => 'NEWS', 'label' => 'is news', 'metric' => 'node_news'],
      ['from' => 'CONTENT_NODE', 'to' => 'EVENT', 'label' => 'is event', 'metric' => 'node_event'],
      ['from' => 'CONTENT_NODE', 'to' => 'BLOG_POST', 'label' => 'is blog', 'metric' => 'node_blogs'],
      ['from' => 'BLOG_POST', 'to' => 'BLOG_COMMENT', 'label' => 'has comments', 'metric' => 'comment_blogs'],
      ['from' => 'EVENT', 'to' => 'EVENT_REGISTRATION', 'label' => 'registrations', 'metric' => 'event_notifications'],
      ['from' => 'COURSE', 'to' => 'ENROLLMENT', 'label' => 'enrolled in', 'metric' => 'zu_enrollment'],
      ['from' => 'USER', 'to' => 'ANALYTICS_EVENT', 'label' => 'triggers', 'metric' => 'zu_analytics_event'],
      ['from' => 'FORUM_THREAD', 'to' => 'FORUM_POST', 'label' => 'has posts', 'metric' => 'comment_forum'],
      ['from' => 'JOB_LISTING', 'to' => 'JOB_APPLICATION', 'label' => 'applications', 'metric' => 'webform_submission'],
      ['from' => 'FORM_DEFINITION', 'to' => 'FORM_SUBMISSION', 'label' => 'receives', 'metric' => 'webform_submission'],
      ['from' => 'CONTENT_NODE', 'to' => 'SEARCH_INDEX', 'label' => 'indexed as', 'metric' => 'search_api'],
      ['from' => 'USER', 'to' => 'ROLE', 'label' => 'has roles', 'metric' => 'user_custom_roles'],
    ];

    $out = [];
    foreach ($rels as $rel) {
      $count = $this->resolveRelationshipMetric($rel['metric']);
      $out[] = [
        'from' => $rel['from'],
        'to' => $rel['to'],
        'label' => (string) $this->t($rel['label']),
        'count' => $count,
        'count_label' => $this->formatCountLabel($count),
      ];
    }
    return $out;
  }

  private function resolveRelationshipMetric(string $metric): ?int {
    if ($this->database->schema()->tableExists($metric)) {
      return $this->countTable($metric);
    }

    return match ($metric) {
      'authored_nodes' => $this->countAuthoredNodes(),
      'nodes' => $this->countNodes(),
      'zu_site' => $this->countTable('zu_site') ?? $this->countTable('zu_multidomain'),
      'zu_enrollment' => $this->countTable('zu_enrollment'),
      'zu_analytics_event' => $this->countTable('zu_analytics_event'),
      'event_notifications' => $this->countTable('event_notification_queue'),
      'taxonomy_index' => $this->countTaxonomyIndex(),
      'media' => $this->countEntity('media'),
      'node_news' => $this->countNodes('news'),
      'node_event' => $this->countNodes('event'),
      'node_blogs' => $this->countNodes('blogs'),
      'comment_blogs' => $this->countComments('blogs'),
      'comment_forum' => $this->countComments('forum'),
      'webform_submission' => $this->countEntity('webform_submission'),
      'search_api' => $this->countSearchIndexItems(),
      'user_custom_roles' => $this->countUsersWithCustomRoles(),
      default => NULL,
    };
  }

  private function countAuthoredNodes(): ?int {
    if (!$this->entityTypeManager->hasDefinition('node')) {
      return NULL;
    }
    return (int) $this->entityTypeManager->getStorage('node')->getQuery()
      ->accessCheck(FALSE)
      ->condition('uid', 0, '>')
      ->count()
      ->execute();
  }

}
