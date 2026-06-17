<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Service;

use Drupal\custom_elastic_search\Controller\ElasticAdvancedSearchController;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Menu\MenuLinkManagerInterface;
use Drupal\Core\Menu\MenuLinkTreeInterface;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\State\StateInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Drupal\user\Entity\Role;

/**
 * Builds the super-admin dashboard from live site data (no static content).
 */
final class SuperAdminDashboardBuilder {

  use StringTranslationTrait;

  private const ADMIN_MENU = 'admin';

  /**
   * @var array<string, mixed>|null
   */
  private ?array $erdCache = NULL;

  public function __construct(
    private readonly ConfigFactoryInterface $configFactory,
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly ModuleHandlerInterface $moduleHandler,
    private readonly MenuLinkTreeInterface $menuTree,
    private readonly MenuLinkManagerInterface $menuLinkManager,
    private readonly DateFormatterInterface $dateFormatter,
    private readonly AccountProxyInterface $currentUser,
    private readonly StateInterface $state,
    private readonly ErdDashboardDataService $erdData,
    private readonly DashboardAdminLinkResolver $adminLinks,
  ) {}

  /**
   * Builds the dashboard render array.
   */
  public function build(): array {
    $appearance = $this->loadAppearanceLabels();
    $alerts = $this->buildAlerts();
    $actions = $this->buildRecentlyVisitedPages();
    $dashboard_menu = $this->buildDashboardAdminMenu();
    $deploy_menu = $this->buildDeploySiteMenu();
    $platform_ops = $this->buildPlatformOps();
    $permission_matrix = $this->buildPermissionMatrixSection();
    $appearance_settings = $this->buildAppearanceSettingsSection();
    $public_users = $this->buildPublicUsersSection();
    $search = $this->buildSearchSection();
    $advanced_search = $this->buildAdvancedSearchEmbed();
    $erd = $this->getErdData();

    return [
      '#theme' => 'zu_super_admin_dashboard',
      '#welcome' => $this->buildWelcome($appearance),
      '#alerts' => $alerts,
      '#advanced_search' => $advanced_search,
      '#actions' => $actions,
      '#platform_ops' => $platform_ops,
      '#permission_matrix' => $permission_matrix,
      '#appearance_settings' => $appearance_settings,
      '#public_users' => $public_users,
      '#search' => $search,
      '#dashboard_menu' => $dashboard_menu,
      '#deploy_menu' => $deploy_menu,
      '#erd' => $erd,
      '#recent_content' => $this->buildRecentContent(),
      '#actions_more' => $this->adminLinks->fromRoute(
        'system.admin',
        'access administration pages',
        (string) $this->t('View full administration'),
      ),
      '#recent_more' => $this->adminLinks->fromRoute(
        'system.admin_content',
        'access administration pages',
        (string) $this->t('View all content'),
      ),
      '#erd_more' => $this->adminLinks->fromRoute(
        'system.status',
        'administer site configuration',
        (string) $this->t('Status report'),
      ),
      '#platform_more' => $this->adminLinks->fromRoute(
        'system.admin_config',
        'administer site configuration',
        (string) $this->t('All configuration'),
      ),
      '#permission_more' => $this->adminLinks->fromRoute(
        'zu_college_permissions.admin',
        'administer zu college permissions',
        (string) $this->t('Open permissions'),
      ) ?? ($permission_matrix !== [] ? [
        'url' => $permission_matrix[0]['url'],
        'label' => (string) $this->t('Open permissions'),
      ] : NULL),
      '#appearance_more' => $this->adminLinks->fromRoute(
        'system.theme_settings_theme',
        'administer themes',
        (string) $this->t('Open appearance settings'),
        ['theme' => 'claro_admin'],
      ) ?? ($appearance_settings !== [] ? [
        'url' => $appearance_settings[0]['url'],
        'label' => (string) $this->t('Open appearance settings'),
      ] : NULL),
      '#public_users_more' => $this->adminLinks->fromRoute(
        'entity.public_user.collection',
        'administer users',
        (string) $this->t('Open public users'),
      ) ?? ($public_users !== [] ? [
        'url' => $public_users[0]['url'],
        'label' => (string) $this->t('Open public users'),
      ] : NULL),
      '#search_more' => $this->adminLinks->fromRoute(
        'zu_search_core.settings',
        'administer site configuration',
        (string) $this->t('Open search hub'),
      ) ?? ($search !== [] ? [
        'url' => $search[0]['url'],
        'label' => (string) $this->t('Open search'),
      ] : NULL),
      '#dashboard_more' => $this->adminLinks->fromRoute(
        'system.admin_content',
        'access administration pages',
        (string) $this->t('Content administration'),
      ),
      '#section_nav' => $this->buildSectionNavOrdered(
        $alerts,
        $advanced_search,
        $actions,
        $platform_ops,
        $permission_matrix,
        $appearance_settings,
        $public_users,
        $search,
        $dashboard_menu,
        $deploy_menu,
        $erd,
      ),
      '#cache' => [
        'contexts' => ['user', 'user.permissions', 'languages:language_interface'],
        'tags' => array_values(array_filter([
          'config:core.extension',
          'config:system.theme',
          'config:system.menu.admin',
          'menu_link_content_list',
          'node_list',
          'user_list',
          'taxonomy_term_list',
          'media_list',
          'webform_list',
          'search_api_index_list',
          $this->moduleHandler->moduleExists('zu_public_user') ? 'public_user_list' : NULL,
        ])),
        'max-age' => 120,
      ],
    ];
  }

  /**
   * Page labels from theme settings (stored config, not hardcoded YAML).
   *
   * @return array{page_title: string, page_subtitle: string}
   */
  private function loadAppearanceLabels(): array {
    $theme = $this->configFactory->get('system.theme')->get('admin') ?: 'claro_admin';
    $settings = $this->configFactory->get($theme . '.settings');

    return [
      'page_title' => (string) ($settings->get('sad_page_title') ?: $this->t('Super Admin Dashboard')),
      'page_subtitle' => (string) ($settings->get('sad_page_subtitle') ?: ''),
    ];
  }

  /**
   * @param array{page_title: string, page_subtitle: string} $appearance
   */
  private function buildWelcome(array $appearance): array {
    $account = $this->currentUser;
    $roles = array_filter($account->getRoles(), static fn(string $role): bool => $role !== 'authenticated');
    $last = $account->getLastAccessedTime();
    $primary_role = $roles[0] ?? 'authenticated';
    $role_entity = Role::load($primary_role);
    $role_label = $role_entity ? $role_entity->label() : $primary_role;

    return [
      'display_name' => $account->getDisplayName(),
      'roles' => $roles,
      'role_labels' => array_map(static function (string $rid): string {
        $role = Role::load($rid);
        return $role ? (string) $role->label() : $rid;
      }, $roles),
      'primary_role' => $role_label,
      'last_access' => $last
        ? $this->dateFormatter->format($last, 'medium')
        : (string) $this->t('First session'),
      'site_name' => $this->configFactory->get('system.site')->get('name') ?: (string) $this->t('Site'),
      'page_title' => $appearance['page_title'],
      'page_subtitle' => $appearance['page_subtitle'],
      'mail' => $account->getEmail(),
    ];
  }

  /**
   * @return list<array{type: string, message: string}>
   */
  private function buildAlerts(): array {
    // Intentionally empty: global admin status messages are suppressed on this page.
    return [];
  }

  /**
   * Recently visited admin pages for the current user.
   *
   * @return list<array{title: string, url: string, description: string}>
   */
  private function buildRecentlyVisitedPages(): array {
    if (!\Drupal::hasService('zu_super_admin_dashboard.visit_history')) {
      return [];
    }
    /** @var \Drupal\zu_super_admin_dashboard\Service\AdminVisitHistoryService $visitHistory */
    $visitHistory = \Drupal::service('zu_super_admin_dashboard.visit_history');
    return $visitHistory->getRecentForDashboard(8);
  }

  /**
   * High-value admin destinations for platform super administrators.
   *
   * @return list<array{title: string, url: string, description: string}>
   */
  private function buildPlatformOps(): array {
    $ops = [];
    $account = $this->currentUser;

    $candidates = [
      [
        'permission' => 'administer site configuration',
        'route' => 'system.status',
        'title' => (string) $this->t('Status report'),
        'description' => (string) $this->t('Cron, PHP, database, and security checks'),
      ],
      [
        'permission' => 'view update notifications',
        'route' => 'update.status',
        'title' => (string) $this->t('Available updates'),
        'description' => (string) $this->t('Core, contributed modules, and themes'),
      ],
      [
        'permission' => 'administer users',
        'route' => 'entity.user.collection',
        'title' => (string) $this->t('People'),
        'description' => (string) $this->t('Accounts, roles, and permissions'),
      ],
      [
        'permission' => 'administer site configuration',
        'route' => 'system.admin_config',
        'title' => (string) $this->t('Configuration'),
        'description' => (string) $this->t('System, content, and service settings'),
      ],
      [
        'permission' => 'access administration pages',
        'route' => 'system.admin_content',
        'title' => (string) $this->t('Content'),
        'description' => (string) $this->t('All nodes and editorial workflows'),
      ],
    ];

    if ($this->moduleHandler->moduleExists('zu_multidomain')) {
      $candidates[] = [
        'permission' => 'administer site configuration',
        'route' => 'zu_multidomain.list',
        'title' => (string) $this->t('ZU sites'),
        'description' => (string) $this->t('Multi-domain / college site registry'),
      ];
    }

    foreach ($candidates as $item) {
      if (!$account->hasPermission($item['permission'])) {
        continue;
      }
      try {
        $ops[] = [
          'title' => $item['title'],
          'url' => Url::fromRoute($item['route'])->toString(),
          'description' => $item['description'],
        ];
      }
      catch (\Exception) {
        continue;
      }
    }

    return $ops;
  }

  /**
   * Quick actions from ZU Permission Matrix page.
   *
   * @return list<array{title: string, url: string, description: string}>
   */
  private function buildPermissionMatrixSection(): array {
    if (!$this->moduleHandler->moduleExists('zu_college_permissions')) {
      return [];
    }

    $links = [];
    $definitions = [
      [
        'title' => (string) $this->t('Permission matrix dashboard'),
        'route' => 'zu_college_permissions.admin',
        'description' => (string) $this->t('Manage college/department permission mappings'),
      ],
      [
        'title' => (string) $this->t('Add college'),
        'route' => 'zu_college_permissions.college_add',
        'description' => (string) $this->t('Create a new college scope for assignments'),
      ],
      [
        'title' => (string) $this->t('Add department'),
        'route' => 'zu_college_permissions.department_add_pick',
        'description' => (string) $this->t('Create departments under a selected college'),
      ],
      [
        'title' => (string) $this->t('Assign user'),
        'route' => 'zu_college_permissions.user_assign_form',
        'description' => (string) $this->t('Assign users to scoped roles'),
      ],
      [
        'title' => (string) $this->t('Permission matrix view'),
        'route' => 'zu_college_permissions.matrix_view',
        'description' => (string) $this->t('Open the matrix grid with role assignments'),
      ],
    ];

    foreach ($definitions as $item) {
      try {
        $links[] = [
          'title' => $item['title'],
          'url' => Url::fromRoute($item['route'])->toString(),
          'description' => $item['description'],
        ];
      }
      catch (\Exception) {
        continue;
      }
    }

    return $links;
  }

  /**
   * Quick link to Claro Admin theme settings (USWDS + ZU App tokens).
   *
   * @return list<array{title: string, url: string, description: string}>
   */
  private function buildAppearanceSettingsSection(): array {
    if (!$this->currentUser->hasPermission('administer themes')) {
      return [];
    }

    try {
      return [[
        'title' => (string) $this->t('Claro Admin appearance'),
        'url' => Url::fromRoute('system.theme_settings_theme', ['theme' => 'claro_admin'])->toString(),
        'description' => (string) $this->t('USWDS design system, ZU App surfaces, and Drupal admin page styling.'),
      ]];
    }
    catch (\Exception) {
      return [];
    }
  }

  /**
   * Quick actions for frontend public user accounts (zu_public_user).
   *
   * @return list<array{title: string, url: string, description: string}>
   */
  private function buildPublicUsersSection(): array {
    if (!$this->moduleHandler->moduleExists('zu_public_user')) {
      return [];
    }
    if (!$this->currentUser->hasPermission('administer users')) {
      return [];
    }

    $definitions = [
      [
        'title' => (string) $this->t('Public users list'),
        'route' => 'entity.public_user.collection',
        'description' => (string) $this->t('Browse and filter API-registered public accounts'),
      ],
      [
        'title' => (string) $this->t('Add public user'),
        'route' => 'entity.public_user.add_form',
        'description' => (string) $this->t('Create a new public user record'),
      ],
      [
        'title' => (string) $this->t('Drupal people'),
        'route' => 'entity.user.collection',
        'description' => (string) $this->t('Manage staff and administrator Drupal accounts'),
      ],
    ];

    $links = [];
    foreach ($definitions as $item) {
      try {
        $links[] = [
          'title' => $item['title'],
          'url' => Url::fromRoute($item['route'])->toString(),
          'description' => $item['description'],
        ];
      }
      catch (\Exception) {
        continue;
      }
    }

    return $links;
  }

  /**
   * Embeds the Elastic advanced search form on the Super Admin dashboard.
   *
   * @return array<string, mixed>|null
   *   Render array, or NULL when search is unavailable.
   */
  private function buildAdvancedSearchEmbed(): ?array {
    if (!$this->moduleHandler->moduleExists('custom_elastic_search')) {
      return NULL;
    }
    if (!$this->currentUser->hasPermission('access content')) {
      return NULL;
    }

    return ElasticAdvancedSearchController::buildWidget(TRUE);
  }

  /**
   * Prominent search shortcuts for the dashboard gradient header.
   *
   * @return list<array{label: string, url: string, primary: bool}>
   */
  public function buildSearchHeaderActions(): array {
    $actions = [];

    if ($this->moduleHandler->moduleExists('custom_elastic_search')
      && $this->currentUser->hasPermission('access content')) {
      try {
        $actions[] = [
          'label' => (string) $this->t('Elastic advanced search'),
          'url' => Url::fromRoute('custom_elastic_search.advanced_search')->toString(),
          'primary' => TRUE,
        ];
      }
      catch (\Exception) {
        // Skip.
      }
    }

    if ($this->moduleHandler->moduleExists('zu_search_core')
      && $this->currentUser->hasPermission('administer site configuration')) {
      try {
        $actions[] = [
          'label' => (string) $this->t('Search hub'),
          'url' => Url::fromRoute('zu_search_core.settings')->toString(),
          'primary' => FALSE,
        ];
      }
      catch (\Exception) {
        // Skip.
      }
    }

    return $actions;
  }

  /**
   * Search hub, Elasticsearch admin, and the public advanced search UI.
   *
   * @return list<array{title: string, url: string, description: string}>
   */
  private function buildSearchSection(): array {
    if (!$this->moduleHandler->moduleExists('custom_elastic_search')
      && !$this->moduleHandler->moduleExists('zu_search_core')) {
      return [];
    }

    $definitions = [];

    if ($this->moduleHandler->moduleExists('custom_elastic_search')
      && $this->currentUser->hasPermission('access content')) {
      $definitions[] = [
        'title' => (string) $this->t('Elastic advanced search'),
        'route' => 'custom_elastic_search.advanced_search',
        'description' => (string) $this->t('Public keyword search with filters (General, Documents, News/Events, Articles).'),
        'permission' => 'access content',
      ];
    }

    if ($this->moduleHandler->moduleExists('zu_search_core')
      && $this->currentUser->hasPermission('administer site configuration')) {
      $definitions = array_merge($definitions, [
        [
          'title' => (string) $this->t('Search hub'),
          'route' => 'zu_search_core.settings',
          'description' => (string) $this->t('Central page for Elasticsearch, Search API, and logs.'),
          'permission' => 'administer site configuration',
        ],
        [
          'title' => (string) $this->t('Core search settings'),
          'route' => 'zu_search_core.settings_form',
          'description' => (string) $this->t('Unified API toggles and search core configuration.'),
          'permission' => 'administer site configuration',
        ],
        [
          'title' => (string) $this->t('Search access rules'),
          'route' => 'zu_search_core.rules',
          'description' => (string) $this->t('Role and scope rules for search visibility.'),
          'permission' => 'administer site configuration',
        ],
        [
          'title' => (string) $this->t('Search query logs'),
          'route' => 'zu_search_core.logs',
          'description' => (string) $this->t('Query, click, and result-count telemetry.'),
          'permission' => 'administer site configuration',
        ],
        [
          'title' => (string) $this->t('Search API overview'),
          'route' => 'search_api.overview',
          'description' => (string) $this->t('Servers, indexes, and maintenance tasks.'),
          'permission' => 'administer site configuration',
        ],
        [
          'title' => (string) $this->t('Elasticsearch server'),
          'route' => 'entity.search_api_server.canonical',
          'route_parameters' => ['search_api_server' => 'elasticsearch_server'],
          'description' => (string) $this->t('Connector URL, cluster status, and debugging.'),
          'permission' => 'administer site configuration',
        ],
        [
          'title' => (string) $this->t('Elasticsearch index'),
          'route' => 'entity.search_api_index.canonical',
          'route_parameters' => ['search_api_index' => 'elasticsearch_index'],
          'description' => (string) $this->t('Fields, processors, and index maintenance.'),
          'permission' => 'administer site configuration',
        ],
        [
          'title' => (string) $this->t('Legacy search settings'),
          'route' => 'custom_elastic_search.settings_form',
          'description' => (string) $this->t('Legacy Elasticsearch URL and compatibility options.'),
          'permission' => 'administer site configuration',
        ],
      ]);
    }

    if ($this->moduleHandler->moduleExists('zu_personalization')
      && $this->currentUser->hasPermission('administer site configuration')) {
      $definitions[] = [
        'title' => (string) $this->t('Personalization dashboard'),
        'route' => 'zu_personalization.admin_dashboard',
        'description' => (string) $this->t('Rules, personas, and content variants.'),
        'permission' => 'administer site configuration',
      ];
    }

    $links = [];
    foreach ($definitions as $item) {
      if (!$this->currentUser->hasPermission($item['permission'])) {
        continue;
      }
      try {
        $links[] = [
          'title' => $item['title'],
          'url' => Url::fromRoute($item['route'], $item['route_parameters'] ?? [])->toString(),
          'description' => $item['description'],
        ];
      }
      catch (\Exception) {
        continue;
      }
    }

    return $links;
  }

  /**
   * @return list<array{title: string, url: string, type: string, changed: string, author: string}>
   */
  private function buildRecentContent(): array {
    $node_storage = $this->entityTypeManager->getStorage('node');
    $nids = $node_storage->getQuery()
      ->accessCheck(TRUE)
      ->sort('changed', 'DESC')
      ->range(0, 10)
      ->execute();

    if ($nids === []) {
      return [];
    }

    $type_labels = [];
    if ($this->entityTypeManager->hasDefinition('node_type')) {
      foreach ($this->entityTypeManager->getStorage('node_type')->loadMultiple() as $type) {
        $type_labels[$type->id()] = $type->label();
      }
    }

    $out = [];
    foreach ($node_storage->loadMultiple($nids) as $node) {
      if (!$node instanceof NodeInterface) {
        continue;
      }
      $bundle = $node->bundle();
      $out[] = [
        'title' => $node->label(),
        'url' => $node->toUrl()->toString(),
        'type' => (string) ($type_labels[$bundle] ?? $bundle),
        'changed' => $this->dateFormatter->format($node->getChangedTime(), 'short'),
        'author' => $node->getOwner()?->getDisplayName() ?? (string) $this->t('Unknown'),
      ];
    }

    return $out;
  }

  /**
   * Children of the admin "Dashboard" menu (Blog, Event, News, etc.).
   *
   * @return array{title: string, links: list<array{title: string, url: string, route: string, has_children: bool, children: list}>}
   */
  private function buildDashboardAdminMenu(): array {
    $root = $this->findDashboardMenuRootPluginId();
    if ($root === NULL) {
      return [
        'title' => (string) $this->t('Dashboard'),
        'links' => [],
      ];
    }

    $parent_title = (string) $this->t('Dashboard');
    if ($this->entityTypeManager->hasDefinition('menu_link_content')) {
      $entities = $this->entityTypeManager->getStorage('menu_link_content')->loadByProperties([
        'menu_name' => self::ADMIN_MENU,
      ]);
      foreach ($entities as $entity) {
        if ($entity->getPluginId() === $root) {
          $parent_title = (string) $entity->getTitle();
          break;
        }
      }
    }

    $links = $this->buildDashboardLinksFromMenuEntities($root);

    return [
      'title' => $parent_title,
      'links' => $links,
    ];
  }

  /**
   * Children of the static admin "Deploy Site" menu (zu_rest_api).
   *
   * @return array{title: string, links: list<array{title: string, url: string, route: string, has_children: bool, children: list}>}
   */
  private function buildDeploySiteMenu(): array {
    $root_id = 'build_site';
    $default_title = (string) $this->t('Deploy Site');

    if (!$this->menuLinkManager->hasDefinition($root_id)) {
      return [
        'title' => $default_title,
        'links' => [],
      ];
    }

    $root_link = $this->menuLinkManager->createInstance($root_id);
    $title = (string) $root_link->getTitle();

    $parameters = new MenuTreeParameters();
    $parameters->setRoot($root_id);
    $parameters->setMinDepth(1);
    $parameters->setMaxDepth(1);
    $parameters->onlyEnabledLinks();

    $tree = $this->menuTree->load(self::ADMIN_MENU, $parameters);
    $manipulators = [
      ['callable' => 'menu.default_tree_manipulators:checkAccess'],
      ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
    ];
    $elements = $this->menuTree->transform($tree, $manipulators);

    $links = [];
    foreach ($elements as $element) {
      if (!$element->access->isAllowed()) {
        continue;
      }
      $url = $element->link->getUrlObject();
      if ($url->isRouted()) {
        $route = (string) $url->getRouteName();
        if ($route === '<nolink>') {
          continue;
        }
      }
      else {
        $route = '';
      }

      $links[] = [
        'title' => (string) $element->link->getTitle(),
        'url' => $url->toString(),
        'route' => $route,
        'has_children' => FALSE,
        'children' => [],
      ];
    }

    return [
      'title' => $title !== '' ? $title : $default_title,
      'links' => $links,
    ];
  }

  /**
   * Builds dashboard submenu links from menu_link_content entities.
   *
   * @return list<array{title: string, url: string, route: string, has_children: bool, children: list}>
   */
  private function buildDashboardLinksFromMenuEntities(string $root_plugin_id): array {
    if (!$this->entityTypeManager->hasDefinition('menu_link_content')) {
      return [];
    }

    $storage = $this->entityTypeManager->getStorage('menu_link_content');
    $children = $storage->loadByProperties([
      'menu_name' => self::ADMIN_MENU,
      'parent' => $root_plugin_id,
    ]);

    usort($children, static fn($a, $b): int => ($a->getWeight() ?? 0) <=> ($b->getWeight() ?? 0));

    $links = [];
    foreach ($children as $entity) {
      if (!$entity->isEnabled()) {
        continue;
      }

      $url = $entity->getUrlObject();
      if (!$url->access($this->currentUser)) {
        continue;
      }

      $route = $url->isRouted() ? (string) $url->getRouteName() : '';
      if ($route === '<nolink>' || $route === 'zu_super_admin_dashboard.dashboard') {
        continue;
      }

      $plugin_id = $entity->getPluginId();
      $sub_entities = $storage->loadByProperties([
        'menu_name' => self::ADMIN_MENU,
        'parent' => $plugin_id,
      ]);
      usort($sub_entities, static fn($a, $b): int => ($a->getWeight() ?? 0) <=> ($b->getWeight() ?? 0));

      $sub_links = [];
      foreach ($sub_entities as $sub) {
        if (!$sub->isEnabled()) {
          continue;
        }
        $sub_url = $sub->getUrlObject();
        if (!$sub_url->access($this->currentUser)) {
          continue;
        }
        $sub_route = $sub_url->isRouted() ? (string) $sub_url->getRouteName() : '';
        if ($sub_route === '<nolink>') {
          continue;
        }
        $sub_links[] = [
          'title' => (string) $sub->getTitle(),
          'url' => $sub_url->toString(),
          'route' => $sub_route,
        ];
      }

      $links[] = [
        'title' => (string) $entity->getTitle(),
        'url' => $url->toString(),
        'route' => $route,
        'has_children' => $sub_links !== [],
        'children' => $sub_links,
      ];
    }

    return $links;
  }

  /**
   * Finds the admin menu link titled "Dashboard" with the most child items.
   */
  private function findDashboardMenuRootPluginId(): ?string {
    if (!$this->entityTypeManager->hasDefinition('menu_link_content')) {
      return NULL;
    }

    $storage = $this->entityTypeManager->getStorage('menu_link_content');
    $best_id = NULL;
    $best_count = 0;

    foreach ($storage->loadByProperties(['menu_name' => self::ADMIN_MENU]) as $entity) {
      if (!$entity->isEnabled()) {
        continue;
      }
      if (strcasecmp(trim((string) $entity->getTitle()), 'Dashboard') !== 0) {
        continue;
      }
      $plugin_id = $entity->getPluginId();
      $children = $storage->loadByProperties([
        'menu_name' => self::ADMIN_MENU,
        'parent' => $plugin_id,
      ]);
      $enabled_children = array_filter($children, static fn($child): bool => $child->isEnabled());
      $count = count($enabled_children);
      if ($count > $best_count) {
        $best_count = $count;
        $best_id = $plugin_id;
      }
    }

    return $best_id;
  }

  /**
   * @return list<\Drupal\Core\Menu\MenuLinkTreeElement>
   */
  private function loadAdminMenuTree(int $maxDepth): array {
    $parameters = new MenuTreeParameters();
    $parameters->setMaxDepth($maxDepth);
    $parameters->onlyEnabledLinks();

    $tree = $this->menuTree->load(self::ADMIN_MENU, $parameters);
    $manipulators = [
      ['callable' => 'menu.default_tree_manipulators:checkAccess'],
      ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
    ];

    return $this->menuTree->transform($tree, $manipulators);
  }

  /**
   * @return array{title: string, url: string, description?: string}|null
   */
  private function menuElementToLink(object $element, ?string $group): ?array {
    $url = $element->link->getUrlObject();
    if (!$url->isRouted() && !$url->isExternal()) {
      return NULL;
    }
    if ($url->isRouted()) {
      $route_name = $url->getRouteName();
      if ($route_name === '<nolink>' || $route_name === 'zu_super_admin_dashboard.dashboard') {
        return NULL;
      }
    }

    return [
      'title' => (string) $element->link->getTitle(),
      'url' => $url->toString(),
      'description' => $group
        ? (string) $this->t('Menu: @group', ['@group' => $group])
        : (string) $this->t('Administrative menu'),
    ];
  }

  /**
   * Section jump links for the page header (same order as zu-super-admin-dashboard.html.twig).
   *
   * @return list<array{id: string, label: string}>
   */
  public function buildSectionNavigation(): array {
    return $this->buildSectionNavOrdered(
      $this->buildAlerts(),
      $this->buildAdvancedSearchEmbed(),
      $this->buildRecentlyVisitedPages(),
      $this->buildPlatformOps(),
      $this->buildPermissionMatrixSection(),
      $this->buildAppearanceSettingsSection(),
      $this->buildPublicUsersSection(),
      $this->buildSearchSection(),
      $this->buildDashboardAdminMenu(),
      $this->buildDeploySiteMenu(),
      $this->getErdData(),
    );
  }

  /**
   * Welcome block for the merged page header (page template).
   *
   * @return array<string, mixed>
   */
  public function buildWelcomeForHeader(): array {
    return $this->buildWelcome($this->loadAppearanceLabels());
  }

  /**
   * @return array<string, mixed>
   */
  private function getErdData(): array {
    if ($this->erdCache === NULL) {
      $this->erdCache = $this->erdData->build();
    }
    return $this->erdCache;
  }

  /**
   * Builds nav items in top-to-bottom page order.
   *
   * @param list<array{type: string, message: string}> $alerts
   * @param array<string, mixed>|null $advanced_search
   * @param list<array{title: string, url: string, description: string}> $actions
   * @param list<array{title: string, url: string, description: string}> $search
   * @param list<array{title: string, url: string, description: string}> $platform_ops
   * @param list<array{title: string, url: string, description: string}> $permission_matrix
   * @param array{title: string, links: list<mixed>} $dashboard_menu
   * @param array{title: string, links: list<mixed>} $deploy_menu
   * @param array<string, mixed> $erd
   *
   * @return list<array{id: string, label: string}>
   */
  private function buildSectionNavOrdered(
    array $alerts,
    ?array $advanced_search,
    array $actions,
    array $platform_ops,
    array $permission_matrix,
    array $appearance_settings,
    array $public_users,
    array $search,
    array $dashboard_menu,
    array $deploy_menu,
    array $erd,
  ): array {
    $nav = [];

    if ($alerts !== []) {
      $nav[] = [
        'id' => 'zu-sad-alerts',
        'label' => (string) $this->t('Notices'),
      ];
    }

    $nav[] = [
      'id' => 'zu-sad-welcome',
      'label' => (string) $this->t('Overview'),
    ];

    if ($advanced_search !== NULL) {
      $nav[] = [
        'id' => 'zu-sad-advanced-search',
        'label' => (string) $this->t('Advance Search'),
      ];
    }

    if ($this->currentUser->hasPermission('access administration pages')) {
      $nav[] = [
        'id' => 'zu-sad-actions',
        'label' => (string) $this->t('Recently visited'),
      ];
    }

    if ($platform_ops !== []) {
      $nav[] = [
        'id' => 'zu-sad-platform',
        'label' => (string) $this->t('Platform'),
      ];
    }

    if ($permission_matrix !== []) {
      $nav[] = [
        'id' => 'zu-sad-permissions',
        'label' => (string) $this->t('Permissions'),
      ];
    }

    if ($appearance_settings !== []) {
      $nav[] = [
        'id' => 'zu-sad-appearance',
        'label' => (string) $this->t('Appearance'),
      ];
    }

    if ($public_users !== []) {
      $nav[] = [
        'id' => 'zu-sad-public-users',
        'label' => (string) $this->t('Public users'),
      ];
    }

    if ($search !== []) {
      $nav[] = [
        'id' => 'zu-sad-search',
        'label' => (string) $this->t('Search'),
      ];
    }

    if ($dashboard_menu['links'] !== []) {
      $nav[] = [
        'id' => 'zu-sad-dashboard',
        'label' => (string) $dashboard_menu['title'],
      ];
    }

    if ($deploy_menu['links'] !== []) {
      $nav[] = [
        'id' => 'zu-sad-deploy',
        'label' => (string) $deploy_menu['title'],
      ];
    }

    $nav[] = [
      'id' => 'zu-sad-erd',
      'label' => (string) $this->t('Live data'),
    ];

    $nav[] = [
      'id' => 'zu-sad-recent',
      'label' => (string) $this->t('Recently updated'),
    ];

    return $nav;
  }

}
