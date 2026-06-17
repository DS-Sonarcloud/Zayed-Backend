<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\NodeInterface;
use Drupal\user\Entity\Role;
use Drupal\user\UserInterface;

/**
 * Builds joined, category-level sample tables for the super-admin ERD dashboard.
 *
 * Unlike per-entity schema previews, these views show how data works together.
 */
final class ErdCategoryViewsBuilder {

  use StringTranslationTrait;

  private const MAX_ROWS = 12;

  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly Connection $database,
    private readonly DateFormatterInterface $dateFormatter,
    private readonly DashboardAdminLinkResolver $adminLinks,
  ) {}

  /**
   * @return list<array{
   *   id: string,
   *   title: string,
   *   description: string,
   *   columns: list<string>,
   *   rows: list<list<string>>
   * }>
   */
  public function buildForCategory(string $category_id): array {
    $views = match ($category_id) {
      'core' => $this->buildCoreViews(),
      'content' => $this->buildContentViews(),
      'community' => $this->buildCommunityViews(),
      'media_search' => $this->buildMediaSearchViews(),
      'jobs_forms' => $this->buildJobsFormsViews(),
      default => [],
    };

    return array_map(fn(array $view): array => $this->attachViewMore($view), $views);
  }

  /**
   * @param array<string, mixed> $view
   *
   * @return array<string, mixed>
   */
  private function attachViewMore(array $view): array {
    $view_id = (string) ($view['id'] ?? '');
    $more = $this->adminLinks->viewMore($view_id);
    if ($more !== NULL) {
      $view['more_url'] = $more['url'];
      $view['more_label'] = $more['label'];
    }
    return $view;
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function buildCoreViews(): array {
    $views = [];
    $users_view = $this->viewActiveUsersWithRoles();
    if ($users_view !== NULL) {
      $views[] = $users_view;
    }
    $roles_view = $this->viewRoleMembershipSummary();
    if ($roles_view !== NULL) {
      $views[] = $roles_view;
    }
    $site_access = $this->viewSiteUserAccess();
    if ($site_access !== NULL) {
      $views[] = $site_access;
    }
    return $views;
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function buildContentViews(): array {
    $views = [];
    $recent = $this->viewRecentContentWithAuthors();
    if ($recent !== NULL) {
      $views[] = $recent;
    }
    $bundles = $this->viewContentByBundle();
    if ($bundles !== NULL) {
      $views[] = $bundles;
    }
    $tagged = $this->viewContentWithTaxonomy();
    if ($tagged !== NULL) {
      $views[] = $tagged;
    }
    return $views;
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function buildCommunityViews(): array {
    $views = [];
    $blogs = $this->viewNodesByBundleSample('blogs', (string) $this->t('Recent blog posts'), (string) $this->t('Blog content with author — comments link via BLOG_COMMENT entity.'));
    if ($blogs !== NULL) {
      $views[] = $blogs;
    }
    $forum = $this->viewNodesByBundleSample('forum', (string) $this->t('Forum threads'), (string) $this->t('Discussion threads; replies are stored as forum comments.'));
    if ($forum !== NULL) {
      $views[] = $forum;
    }
    $email_templates = $this->viewNodesByBundleSample(
      'email_template',
      (string) $this->t('Email templates'),
      (string) $this->t('Reusable email template content managed from the Email Templates dashboard.'),
    );
    if ($email_templates !== NULL) {
      $email_templates['id'] = 'community_email_templates';
      $views[] = $email_templates;
    }
    $campaigns = $this->viewNodesByBundleSample(
      'campaign',
      (string) $this->t('Email campaigns'),
      (string) $this->t('Campaign content entities that feed the campaign queue dashboard.'),
    );
    if ($campaigns !== NULL) {
      $campaigns['id'] = 'community_campaigns';
      $views[] = $campaigns;
    }
    $queue = $this->viewCampaignQueueStats();
    if ($queue !== NULL) {
      $views[] = $queue;
    }
    return $views;
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function buildMediaSearchViews(): array {
    $views = [];
    $media = $this->viewRecentMedia();
    if ($media !== NULL) {
      $views[] = $media;
    }
    $search = $this->viewSearchIndexSummary();
    if ($search !== NULL) {
      $views[] = $search;
    }
    return $views;
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function buildJobsFormsViews(): array {
    $views = [];
    $jobs = $this->viewNodesByBundleSample('jobs', (string) $this->t('Job listings'), (string) $this->t('Open roles published on the site.'));
    if ($jobs !== NULL) {
      $views[] = $jobs;
    }
    $forms = $this->viewWebformsWithSubmissions();
    if ($forms !== NULL) {
      $views[] = $forms;
    }
    return $views;
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewActiveUsersWithRoles(): ?array {
    if (!$this->entityTypeManager->hasDefinition('user')) {
      return NULL;
    }
    $uids = $this->entityTypeManager->getStorage('user')->getQuery()
      ->accessCheck(FALSE)
      ->condition('uid', 0, '>')
      ->condition('status', 1)
      ->sort('access', 'DESC')
      ->range(0, self::MAX_ROWS)
      ->execute();
    if ($uids === []) {
      return $this->emptyView(
        'core_users_roles',
        (string) $this->t('Active users with roles'),
        (string) $this->t('Accounts and the roles assigned on this site (Drupal user + role entities).'),
        ['uid', 'name', 'mail', 'roles', 'last access'],
      );
    }

    $rows = [];
    foreach ($this->entityTypeManager->getStorage('user')->loadMultiple($uids) as $user) {
      if (!$user instanceof UserInterface) {
        continue;
      }
      $roles = array_filter($user->getRoles(), static fn(string $rid): bool => !in_array($rid, [Role::ANONYMOUS_ID, Role::AUTHENTICATED_ID], TRUE));
      $role_labels = array_map(static function (string $rid): string {
        $role = Role::load($rid);
        return $role ? (string) $role->label() : $rid;
      }, $roles);
      $last = $user->getLastAccessedTime();
      $rows[] = [
        (string) $user->id(),
        $user->getDisplayName(),
        $user->getEmail() ?: $this->dash(),
        $role_labels !== [] ? implode(', ', $role_labels) : $this->dash(),
        $last ? $this->dateFormatter->format($last, 'short') : $this->dash(),
      ];
    }

    return [
      'id' => 'core_users_roles',
      'title' => (string) $this->t('Active users with roles'),
      'description' => (string) $this->t('Accounts and the roles assigned on this site (Drupal user + role entities).'),
      'columns' => ['uid', 'name', 'mail', 'roles', 'last access'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewRoleMembershipSummary(): ?array {
    if (!$this->database->schema()->tableExists('user__roles')) {
      return NULL;
    }
    $query = $this->database->select('user__roles', 'ur');
    $query->join('users_field_data', 'u', 'u.uid = ur.entity_id');
    $query->addField('ur', 'roles_target_id', 'role_id');
    $query->addExpression('COUNT(DISTINCT ur.entity_id)', 'members');
    $query->condition('u.status', 1);
    $query->condition('u.uid', 0, '>');
    $query->condition('ur.roles_target_id', [Role::ANONYMOUS_ID, Role::AUTHENTICATED_ID], 'NOT IN');
    $query->groupBy('ur.roles_target_id');
    $query->orderBy('members', 'DESC');
    $query->range(0, self::MAX_ROWS);
    $result = $query->execute();

    $rows = [];
    foreach ($result as $record) {
      $rid = (string) $record->role_id;
      $role = Role::load($rid);
      $rows[] = [
        $rid,
        $role ? (string) $role->label() : $rid,
        (string) number_format((int) $record->members),
      ];
    }

    return [
      'id' => 'core_role_summary',
      'title' => (string) $this->t('Role membership'),
      'description' => (string) $this->t('How many active users hold each custom role.'),
      'columns' => ['role id', 'role', 'active users'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewSiteUserAccess(): ?array {
    if (!$this->database->schema()->tableExists('zu_site_user_access')) {
      return NULL;
    }
    $columns = array_slice($this->getTableColumns('zu_site_user_access'), 0, 5);
    if ($columns === []) {
      $columns = ['user_id', 'site_id', 'role'];
    }
    return $this->viewFromTable(
      'core_site_access',
      (string) $this->t('Multi-site user access'),
      (string) $this->t('Which users can access which ZU site and with which role (zu_site_user_access).'),
      'zu_site_user_access',
      $columns,
    );
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewRecentContentWithAuthors(): ?array {
    if (!$this->entityTypeManager->hasDefinition('node')) {
      return NULL;
    }
    $nids = $this->entityTypeManager->getStorage('node')->getQuery()
      ->accessCheck(FALSE)
      ->sort('changed', 'DESC')
      ->range(0, self::MAX_ROWS)
      ->execute();
    if ($nids === []) {
      return $this->emptyView(
        'content_recent',
        (string) $this->t('Recent content (with author)'),
        (string) $this->t('Nodes as editors see them: title, bundle, author, publish state, last changed.'),
        ['nid', 'title', 'type', 'author', 'status', 'changed'],
      );
    }

    $rows = [];
    foreach ($this->entityTypeManager->getStorage('node')->loadMultiple($nids) as $node) {
      if (!$node instanceof NodeInterface) {
        continue;
      }
      $author = $node->getOwner();
      $rows[] = [
        (string) $node->id(),
        $node->label(),
        $node->bundle(),
        $author ? $author->getDisplayName() : $this->dash(),
        $node->isPublished() ? (string) $this->t('Published') : (string) $this->t('Unpublished'),
        $this->dateFormatter->format($node->getChangedTime(), 'short'),
      ];
    }

    return [
      'id' => 'content_recent',
      'title' => (string) $this->t('Recent content (with author)'),
      'description' => (string) $this->t('Nodes as editors see them: title, bundle, author, publish state, last changed.'),
      'columns' => ['nid', 'title', 'type', 'author', 'status', 'changed'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewContentByBundle(): ?array {
    if (!$this->entityTypeManager->hasDefinition('node_type')) {
      return NULL;
    }
    $storage = $this->entityTypeManager->getStorage('node');
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('node_type')->loadMultiple() as $type) {
      $bundle = $type->id();
      $total = (int) $storage->getQuery()
        ->accessCheck(FALSE)
        ->condition('type', $bundle)
        ->count()
        ->execute();
      if ($total === 0) {
        continue;
      }
      $published = (int) $storage->getQuery()
        ->accessCheck(FALSE)
        ->condition('type', $bundle)
        ->condition('status', 1)
        ->count()
        ->execute();
      $rows[] = [
        $bundle,
        (string) $type->label(),
        (string) number_format($published),
        (string) number_format($total - $published),
        (string) number_format($total),
      ];
      if (count($rows) >= self::MAX_ROWS) {
        break;
      }
    }

    usort($rows, static fn(array $a, array $b): int => (int) str_replace(',', '', $b[4]) <=> (int) str_replace(',', '', $a[4]));

    return [
      'id' => 'content_by_bundle',
      'title' => (string) $this->t('Content by type'),
      'description' => (string) $this->t('Published vs draft counts per node bundle — the realistic split super admins care about.'),
      'columns' => ['machine name', 'label', 'published', 'unpublished', 'total'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewContentWithTaxonomy(): ?array {
    if (!$this->database->schema()->tableExists('taxonomy_index')
      || !$this->entityTypeManager->hasDefinition('node')
      || !$this->entityTypeManager->hasDefinition('taxonomy_term')) {
      return NULL;
    }

    $query = $this->database->select('taxonomy_index', 'ti');
    $query->join('node_field_data', 'n', 'n.nid = ti.nid');
    $query->fields('n', ['nid', 'title', 'type']);
    $query->addField('ti', 'tid');
    $query->condition('n.status', 1);
    $query->orderBy('n.changed', 'DESC');
    $query->range(0, self::MAX_ROWS * 3);
    $records = $query->execute()->fetchAll();

    $grouped = [];
    foreach ($records as $record) {
      $nid = (int) $record->nid;
      if (!isset($grouped[$nid])) {
        $grouped[$nid] = [
          'nid' => (string) $nid,
          'title' => (string) $record->title,
          'type' => (string) $record->type,
          'tids' => [],
        ];
      }
      $grouped[$nid]['tids'][(int) $record->tid] = (int) $record->tid;
    }

    $rows = [];
    foreach (array_slice($grouped, 0, self::MAX_ROWS, TRUE) as $item) {
      $labels = [];
      foreach ($this->entityTypeManager->getStorage('taxonomy_term')->loadMultiple(array_keys($item['tids'])) as $term) {
        $labels[] = $term->label();
      }
      $rows[] = [
        $item['nid'],
        $item['title'],
        $item['type'],
        $labels !== [] ? implode(', ', $labels) : $this->dash(),
      ];
    }

    return [
      'id' => 'content_taxonomy',
      'title' => (string) $this->t('Published content with tags'),
      'description' => (string) $this->t('NODE ↔ TAXONOMY_TERM via taxonomy_index — how content is categorized.'),
      'columns' => ['nid', 'title', 'type', 'terms'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewNodesByBundleSample(string $bundle, string $title, string $description): ?array {
    if (!$this->entityTypeManager->hasDefinition('node')) {
      return NULL;
    }
    $count = (int) $this->entityTypeManager->getStorage('node')->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', $bundle)
      ->count()
      ->execute();
    if ($count === 0) {
      return NULL;
    }

    $nids = $this->entityTypeManager->getStorage('node')->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', $bundle)
      ->sort('changed', 'DESC')
      ->range(0, self::MAX_ROWS)
      ->execute();

    $rows = [];
    foreach ($this->entityTypeManager->getStorage('node')->loadMultiple($nids) as $node) {
      if (!$node instanceof NodeInterface) {
        continue;
      }
      $author = $node->getOwner();
      $rows[] = [
        (string) $node->id(),
        $node->label(),
        $author ? $author->getDisplayName() : $this->dash(),
        $node->isPublished() ? (string) $this->t('Published') : (string) $this->t('Unpublished'),
        $this->dateFormatter->format($node->getChangedTime(), 'short'),
      ];
    }

    return [
      'id' => 'nodes_' . $bundle,
      'title' => $title,
      'description' => $description,
      'columns' => ['nid', 'title', 'author', 'status', 'changed'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewRecentMedia(): ?array {
    if (!$this->entityTypeManager->hasDefinition('media')) {
      return NULL;
    }
    $ids = $this->entityTypeManager->getStorage('media')->getQuery()
      ->accessCheck(FALSE)
      ->sort('changed', 'DESC')
      ->range(0, self::MAX_ROWS)
      ->execute();
    if ($ids === []) {
      return NULL;
    }

    $rows = [];
    foreach ($this->entityTypeManager->getStorage('media')->loadMultiple($ids) as $media) {
      $owner = $media->getOwner();
      $rows[] = [
        (string) $media->id(),
        $media->label(),
        $media->bundle(),
        $owner ? $owner->getDisplayName() : $this->dash(),
        $this->dateFormatter->format($media->getChangedTime(), 'short'),
      ];
    }

    return [
      'id' => 'media_recent',
      'title' => (string) $this->t('Recent media assets'),
      'description' => (string) $this->t('Media library items linked to content via entity references.'),
      'columns' => ['mid', 'name', 'bundle', 'owner', 'changed'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewSearchIndexSummary(): ?array {
    if (!$this->entityTypeManager->hasDefinition('search_api_index')) {
      return NULL;
    }
    $rows = [];
    foreach ($this->entityTypeManager->getStorage('search_api_index')->loadMultiple() as $index) {
      try {
        $count = $index->getTrackerInstance()->getTotalItemsCount();
      }
      catch (\Exception) {
        $count = NULL;
      }
      $rows[] = [
        $index->id(),
        $index->label(),
        $count !== NULL ? (string) number_format((int) $count) : $this->dash(),
        $index->status() ? (string) $this->t('Enabled') : (string) $this->t('Disabled'),
      ];
    }
    if ($rows === []) {
      return NULL;
    }

    return [
      'id' => 'search_indexes',
      'title' => (string) $this->t('Search API indexes'),
      'description' => (string) $this->t('How content is exposed to search — index name and tracked item counts.'),
      'columns' => ['index id', 'label', 'items', 'status'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewWebformsWithSubmissions(): ?array {
    if (!$this->entityTypeManager->hasDefinition('webform')) {
      return NULL;
    }
    $webforms = $this->entityTypeManager->getStorage('webform')->loadMultiple();
    if ($webforms === []) {
      return NULL;
    }

    $submission_storage = $this->entityTypeManager->hasDefinition('webform_submission')
      ? $this->entityTypeManager->getStorage('webform_submission')
      : NULL;

    $rows = [];
    foreach ($webforms as $webform) {
      $count = 0;
      if ($submission_storage !== NULL) {
        $count = (int) $submission_storage->getQuery()
          ->accessCheck(FALSE)
          ->condition('webform_id', $webform->id())
          ->count()
          ->execute();
      }
      $rows[] = [
        $webform->id(),
        $webform->label(),
        (string) number_format($count),
        $webform->isOpen() ? (string) $this->t('Open') : (string) $this->t('Closed'),
      ];
      if (count($rows) >= self::MAX_ROWS) {
        break;
      }
    }

    usort($rows, static fn(array $a, array $b): int => (int) str_replace(',', '', $b[2]) <=> (int) str_replace(',', '', $a[2]));

    return [
      'id' => 'forms_submissions',
      'title' => (string) $this->t('Forms and submission volume'),
      'description' => (string) $this->t('FORM_DEFINITION ↔ FORM_SUBMISSION — which forms are collecting data.'),
      'columns' => ['webform id', 'title', 'submissions', 'status'],
      'rows' => $rows,
    ];
  }

  /**
   * @return array<string, mixed>
   */
  private function viewZuSites(): array {
    $columns = array_slice($this->getTableColumns('zu_site'), 0, 5);
    if ($columns === []) {
      $columns = ['site_id', 'domain', 'label'];
    }
    return $this->viewFromTable(
      'config_sites',
      (string) $this->t('ZU sites (multi-domain)'),
      (string) $this->t('SITE entity — domains and labels for each college / property.'),
      'zu_site',
      $columns,
    ) ?? $this->emptyView(
      'config_sites',
      (string) $this->t('ZU sites (multi-domain)'),
      (string) $this->t('SITE entity — domains and labels for each college / property.'),
      $columns,
    );
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewRecentAuditLog(): ?array {
    $columns = array_slice($this->getTableColumns('zu_admin_audit_log'), 0, 5);
    if ($columns === []) {
      $columns = ['id', 'user_id', 'action', 'created'];
    }
    return $this->viewFromTable(
      'config_audit',
      (string) $this->t('Recent admin audit events'),
      (string) $this->t('USER_ACTIVITY_LOG — latest platform actions recorded in zu_admin_audit_log.'),
      'zu_admin_audit_log',
      $columns,
      'created',
      'DESC',
    );
  }

  /**
   * @return array<string, mixed>|null
   */
  private function viewCampaignQueueStats(): ?array {
    if (!$this->database->schema()->tableExists('campaign_statistics')) {
      return NULL;
    }
    $available = $this->getTableColumns('campaign_statistics');
    if ($available === []) {
      return NULL;
    }
    $preferred = [
      'campaign_id',
      'run_id',
      'total_emails',
      'sent_count',
      'failed_count',
      'pending_count',
      'last_updated',
    ];
    $columns = array_values(array_intersect($preferred, $available));
    if ($columns === []) {
      $columns = array_slice($available, 0, 6);
    }
    return $this->viewFromTable(
      'community_campaign_queues',
      (string) $this->t('Campaign queue statistics'),
      (string) $this->t('Live run status from campaign queue processing (campaign_statistics table).'),
      'campaign_statistics',
      $columns,
      in_array('last_updated', $columns, TRUE) ? 'last_updated' : NULL,
      'DESC',
    );
  }

  /**
   * @param list<string> $columns
   *
   * @return array<string, mixed>|null
   */
  private function viewFromTable(
    string $id,
    string $title,
    string $description,
    string $table,
    array $columns,
    ?string $order_by = NULL,
    string $order_dir = 'ASC',
  ): ?array {
    if (!$this->database->schema()->tableExists($table)) {
      return NULL;
    }
    try {
      $query = $this->database->select($table, 't')->fields('t', $columns)->range(0, self::MAX_ROWS);
      if ($order_by !== NULL && $this->database->schema()->fieldExists($table, $order_by)) {
        $query->orderBy($order_by, $order_dir);
      }
      $rows = [];
      foreach ($query->execute() as $record) {
        $row = [];
        foreach ($columns as $column) {
          $row[] = $this->formatCell($record->{$column} ?? NULL);
        }
        $rows[] = $row;
      }
      return [
        'id' => $id,
        'title' => $title,
        'description' => $description,
        'columns' => $columns,
        'rows' => $rows,
      ];
    }
    catch (\Exception) {
      return NULL;
    }
  }

  /**
   * @param list<string> $columns
   *
   * @return array<string, mixed>
   */
  private function emptyView(string $id, string $title, string $description, array $columns): array {
    $dash = $this->dash();
    $rows = [];
    for ($i = 0; $i < 3; $i++) {
      $rows[] = array_fill(0, count($columns), $dash);
    }
    return [
      'id' => $id,
      'title' => $title,
      'description' => $description,
      'columns' => $columns,
      'rows' => $rows,
    ];
  }

  /**
   * @return list<string>
   */
  private function getTableColumns(string $table): array {
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
      // Fall through.
    }
    return [];
  }

  private function formatCell(mixed $value): string {
    if ($value === NULL || $value === '') {
      return $this->dash();
    }
    if (is_numeric($value) && strlen((string) $value) === 10 && (int) $value > 1_000_000_000) {
      return $this->dateFormatter->format((int) $value, 'short');
    }
    return (string) $value;
  }

  private function dash(): string {
    return (string) $this->t('—');
  }

}
