<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Service;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;

/**
 * Resolves permission-checked admin URLs for dashboard "View more" actions.
 */
final class DashboardAdminLinkResolver {

  use StringTranslationTrait;

  public function __construct(
    private readonly AccountProxyInterface $currentUser,
    private readonly ModuleHandlerInterface $moduleHandler,
  ) {}

  /**
   * @param array<string, mixed> $route_parameters
   * @param array<string, mixed> $options
   *
   * @return array{url: string, label: string}|null
   */
  public function fromRoute(
    string $route,
    string $permission,
    string $label,
    array $route_parameters = [],
    array $options = [],
  ): ?array {
    if (!$this->currentUser->hasPermission($permission)) {
      return NULL;
    }
    try {
      return [
        'url' => Url::fromRoute($route, $route_parameters, $options)->toString(),
        'label' => $label,
      ];
    }
    catch (\Exception) {
      return NULL;
    }
  }

  /**
   * @return list<array{url: string, label: string}>
   */
  public function categoryLinks(string $category_id): array {
    $links = [];
    foreach ($this->categoryLinkDefinitions($category_id) as $definition) {
      $link = $this->resolveLinkDefinition($definition);
      if ($link !== NULL) {
        $links[] = $link;
      }
    }
    return $links;
  }

  /**
   * @return array{url: string, label: string}|null
   */
  public function viewMore(string $view_id): ?array {
    $definition = $this->viewLinkDefinitions()[$view_id] ?? NULL;
    if ($definition === NULL) {
      return NULL;
    }
    return $this->resolveLinkDefinition($definition, (string) $this->t('View more'));
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function categoryLinkDefinitions(string $category_id): array {
    $definitions = match ($category_id) {
      'core' => [
        [
          'route' => 'entity.user.collection',
          'permission' => 'administer users',
          'label' => (string) $this->t('All people'),
        ],
        [
          'route' => 'user.admin_permissions',
          'permission' => 'administer permissions',
          'label' => (string) $this->t('Roles & permissions'),
        ],
      ],
      'content' => [
        [
          'route' => 'system.admin_content',
          'permission' => 'access administration pages',
          'label' => (string) $this->t('Content overview'),
        ],
        [
          'route' => 'entity.node.collection',
          'permission' => 'access content overview',
          'label' => (string) $this->t('All content'),
        ],
        [
          'route' => 'entity.taxonomy_vocabulary.collection',
          'permission' => 'administer taxonomy',
          'label' => (string) $this->t('Taxonomy'),
        ],
      ],
      'community' => [
        [
          'path' => '/admin/email-templates',
          'permission' => 'access email templates',
          'label' => (string) $this->t('Email templates'),
        ],
        [
          'path' => '/admin/content/campaign-email-queues',
          'permission' => 'access campaign email queue dashboard',
          'label' => (string) $this->t('Campaign queues'),
        ],
        [
          'route' => 'comment.admin',
          'permission' => 'administer comments',
          'label' => (string) $this->t('Comments'),
        ],
      ],
      'media_search' => [
        [
          'route' => 'entity.media.collection',
          'permission' => 'access media overview',
          'label' => (string) $this->t('Media library'),
        ],
        [
          'route' => 'entity.search_api_index.collection',
          'permission' => 'administer search_api',
          'label' => (string) $this->t('Search indexes'),
        ],
      ],
      'jobs_forms' => [
        [
          'route' => 'entity.node.collection',
          'permission' => 'access content overview',
          'label' => (string) $this->t('Job listings'),
          'options' => ['query' => ['type' => 'jobs']],
        ],
        [
          'route' => 'entity.webform.collection',
          'permission' => 'administer webform',
          'label' => (string) $this->t('Webforms'),
        ],
        [
          'route' => 'entity.webform_submission.collection',
          'permission' => 'administer webform submission',
          'label' => (string) $this->t('Submissions'),
        ],
      ],
      default => [],
    };

    if ($category_id === 'core' && $this->moduleHandler->moduleExists('zu_multidomain')) {
      $definitions[] = [
        'route' => 'zu_multidomain.list',
        'permission' => 'administer site configuration',
        'label' => (string) $this->t('ZU sites'),
      ];
    }

    return $definitions;
  }

  /**
   * @return array<string, array<string, mixed>>
   */
  private function viewLinkDefinitions(): array {
    return [
      'core_users_roles' => [
        'route' => 'entity.user.collection',
        'permission' => 'administer users',
      ],
      'core_role_summary' => [
        'route' => 'user.admin_permissions',
        'permission' => 'administer permissions',
      ],
      'core_site_access' => [
        'route' => 'zu_multidomain.list',
        'permission' => 'administer site configuration',
      ],
      'content_recent' => [
        'route' => 'system.admin_content',
        'permission' => 'access administration pages',
      ],
      'content_by_bundle' => [
        'route' => 'entity.node.collection',
        'permission' => 'access content overview',
      ],
      'content_taxonomy' => [
        'route' => 'entity.taxonomy_vocabulary.collection',
        'permission' => 'administer taxonomy',
      ],
      'nodes_blogs' => [
        'route' => 'entity.node.collection',
        'permission' => 'access content overview',
        'options' => ['query' => ['type' => 'blogs']],
      ],
      'nodes_forum' => [
        'route' => 'entity.node.collection',
        'permission' => 'access content overview',
        'options' => ['query' => ['type' => 'forum']],
      ],
      'community_email_templates' => [
        'path' => '/admin/email-templates',
        'permission' => 'access email templates',
      ],
      'community_campaigns' => [
        'route' => 'entity.node.collection',
        'permission' => 'access content overview',
        'options' => ['query' => ['type' => 'campaign']],
      ],
      'community_campaign_queues' => [
        'path' => '/admin/content/campaign-email-queues',
        'permission' => 'access campaign email queue dashboard',
      ],
      'media_recent' => [
        'route' => 'entity.media.collection',
        'permission' => 'access media overview',
      ],
      'search_indexes' => [
        'route' => 'entity.search_api_index.collection',
        'permission' => 'administer search_api',
      ],
      'nodes_jobs' => [
        'route' => 'entity.node.collection',
        'permission' => 'access content overview',
        'options' => ['query' => ['type' => 'jobs']],
      ],
      'forms_submissions' => [
        'route' => 'entity.webform.collection',
        'permission' => 'administer webform',
      ],
    ];
  }

  /**
   * @param array<string, mixed> $definition
   */
  private function resolveLinkDefinition(array $definition, string $default_label = ''): ?array {
    $permission = (string) ($definition['permission'] ?? '');
    $label = (string) ($definition['label'] ?? $default_label);
    if ($permission === '' || $label === '') {
      return NULL;
    }
    if (!empty($definition['route'])) {
      return $this->fromRoute(
        (string) $definition['route'],
        $permission,
        $label,
        $definition['parameters'] ?? [],
        $definition['options'] ?? [],
      );
    }
    if (!empty($definition['path'])) {
      return $this->fromPath(
        (string) $definition['path'],
        $permission,
        $label,
        $definition['options'] ?? [],
      );
    }
    return NULL;
  }

  /**
   * @param array<string, mixed> $options
   *
   * @return array{url: string, label: string}|null
   */
  private function fromPath(
    string $path,
    string $permission,
    string $label,
    array $options = [],
  ): ?array {
    if (!$this->currentUser->hasPermission($permission)) {
      return NULL;
    }
    if ($path === '' || $path[0] !== '/') {
      return NULL;
    }
    try {
      return [
        'url' => Url::fromUserInput($path, $options)->toString(),
        'label' => $label,
      ];
    }
    catch (\Exception) {
      return NULL;
    }
  }

}
