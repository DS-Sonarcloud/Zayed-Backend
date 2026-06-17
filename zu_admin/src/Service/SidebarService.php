<?php

namespace Drupal\zu_admin\Service;

use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Routing\RouteProviderInterface;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\Core\Url;

/**
 * Builds the sidebar navigation data array for ZU Admin pages.
 */
class SidebarService {

  protected AccountInterface $currentUser;
  protected RouteProviderInterface $routeProvider;
  protected CurrentRouteMatch $routeMatch;

  // Inline SVG icon map (avoids image-path issues in Drupal themes).
  protected array $icons = [
    'dashboard'  => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>',
    'mls'        => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h8v2H2z"/></svg>',
    'bulk'       => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1L1 5l7 4 7-4-7-4zM1 9l7 4 7-4M1 13l7 4 7-4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
    'schema'     => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V3zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V9z"/></svg>',
    'audit'      => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 1h12v14H2V1zm2 3h8v1H4V4zm0 3h8v1H4V7zm0 3h5v1H4v-1z"/></svg>',
    'monitoring' => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1 12L5 7l3 3 3-5 3 3" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="1" y="13" width="14" height="1"/></svg>',
    'notif'      => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1a5 5 0 015 5v3l1 2H2l1-2V6a5 5 0 015-5zm-1.5 11h3a1.5 1.5 0 01-3 0z"/></svg>',
    'logout'     => '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6 2H2v12h4M10 11l3-3-3-3M6 8h7" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
  ];

  public function __construct(
    AccountInterface $currentUser,
    RouteProviderInterface $routeProvider,
    CurrentRouteMatch $routeMatch
  ) {
    $this->currentUser   = $currentUser;
    $this->routeProvider = $routeProvider;
    $this->routeMatch    = $routeMatch;
  }

  /**
   * Build the sidebar item list.
   *
   * @param int $notificationCount
   *   Number of unread notifications to display as a badge.
   *
   * @return array
   *   Array of sidebar item arrays, each with keys:
   *   - label:    Display label.
   *   - icon_svg: Raw inline SVG string.
   *   - url:      Absolute URL string.
   *   - route:    Route name (used for active detection).
   *   - badge:    Integer badge count (0 = hidden).
   *   - active:   Boolean; TRUE when this item matches the current route.
   */
  public function buildSidebarItems(int $notificationCount = 0): array {
    $currentRoute = $this->routeMatch->getRouteName() ?? '';

    $items = [
      [
        'label'  => 'Dashboard',
        'icon'   => 'dashboard',
        'url'    => Url::fromRoute('zu_admin.dashboard')->toString(),
        'route'  => 'zu_admin.dashboard',
        'badge'  => 0,
      ],
      [
        'label'  => 'MLS Integration',
        'icon'   => 'mls',
        'url'    => Url::fromRoute('zu_admin.mls_integration')->toString(),
        'route'  => 'zu_admin.mls_integration',
        'badge'  => 0,
      ],
      [
        'label'  => 'Bulk Import data',
        'icon'   => 'bulk',
        'url'    => Url::fromRoute('zu_admin.bulk_import')->toString(),
        'route'  => 'zu_admin.bulk_import',
        'badge'  => 0,
      ],
      [
        'label'  => 'Schema Viewer',
        'icon'   => 'schema',
        'url'    => Url::fromRoute('zu_admin.schema_viewer')->toString(),
        'route'  => 'zu_admin.schema_viewer',
        'badge'  => 0,
      ],
      [
        'label'  => 'Audit Logs',
        'icon'   => 'audit',
        'url'    => Url::fromRoute('zu_admin.audit_logs')->toString(),
        'route'  => 'zu_admin.audit_logs',
        'badge'  => 0,
      ],
      [
        'label'  => 'System Monitoring',
        'icon'   => 'monitoring',
        'url'    => Url::fromRoute('zu_admin.system_monitoring')->toString(),
        'route'  => 'zu_admin.system_monitoring',
        'badge'  => 0,
      ],
      [
        'label'  => 'Notifications',
        'icon'   => 'notif',
        'url'    => Url::fromRoute('zu_admin.notifications')->toString(),
        'route'  => 'zu_admin.notifications',
        'badge'  => $notificationCount,
      ],
      [
        'label'  => 'Logout',
        'icon'   => 'logout',
        'url'    => Url::fromRoute('user.logout')->toString(),
        'route'  => 'user.logout',
        'badge'  => 0,
      ],
    ];

    // Inject inline SVGs and mark active item.
    foreach ($items as &$item) {
      $item['icon_svg'] = $this->icons[$item['icon']] ?? '';
      $item['active']   = $this->isRouteActive($currentRoute, $item['route']);
    }
    unset($item);

    return $items;
  }

  /**
   * Determine whether a nav item should be marked active.
   *
   * Treats any 'zu_admin.people.*' route as active for 'zu_admin.dashboard'
   * is intentionally NOT done — each section is independent.
   *
   * @param string $currentRoute  Active Drupal route name.
   * @param string $itemRoute     Nav item route name to test.
   */
  protected function isRouteActive(string $currentRoute, string $itemRoute): bool {
    if ($currentRoute === $itemRoute) {
      return TRUE;
    }
    // People sub-routes (view/edit/workflows) share no specific nav item,
    // so don't highlight any sidebar item for them — they live under People
    // which has no dedicated nav entry. Extend here if a People link is added.
    return FALSE;
  }

  /**
   * Return the current user's display name and role label for the sidebar footer.
   *
   * @return array  Keys: 'name', 'role', 'initials'.
   */
  public function getCurrentUserInfo(): array {
    $name     = $this->currentUser->getDisplayName();
    $roles    = $this->currentUser->getRoles(TRUE); // exclude 'authenticated'
    $topRole  = !empty($roles) ? ucfirst(reset($roles)) : 'User';
    $parts    = explode(' ', $name);
    $initials = strtoupper(substr($parts[0], 0, 1) . (isset($parts[1]) ? substr($parts[1], 0, 1) : ''));

    return [
      'name'     => $name,
      'role'     => $topRole,
      'initials' => $initials,
    ];
  }

}
