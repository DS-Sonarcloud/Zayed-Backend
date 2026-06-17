<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Theme;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Theme\ThemeNegotiatorInterface;
use Drupal\zu_super_admin_dashboard\AdminContentRoutes;

/**
 * Forces the admin theme on node and other content entity view pages.
 *
 * Canonical node paths (and aliases) are not _admin_route, so core leaves the
 * default front-end theme active and Drupal toolbars appear instead of the ZU
 * app shell.
 */
final class AdminContentThemeNegotiator implements ThemeNegotiatorInterface {

  public function __construct(
    private readonly AccountInterface $currentUser,
    private readonly ConfigFactoryInterface $configFactory,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function applies(RouteMatchInterface $route_match): bool {
    if (!$this->currentUser->hasPermission('view the administration theme')) {
      return FALSE;
    }
    return AdminContentRoutes::isAdminContentRoute($route_match->getRouteName());
  }

  /**
   * {@inheritdoc}
   */
  public function determineActiveTheme(RouteMatchInterface $route_match): ?string {
    return $this->configFactory->get('system.theme')->get('admin') ?: NULL;
  }

}
