<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Theme;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Theme\ThemeNegotiatorInterface;
use Drupal\zu_super_admin_dashboard\ContentDashboardRoutes;

/**
 * Forces the admin theme on content dashboard View pages.
 *
 * These routes are not _admin_route, so core leaves the default front-end theme
 * active and the ZU app shell is not applied.
 */
final class ContentDashboardAdminThemeNegotiator implements ThemeNegotiatorInterface {

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
    return ContentDashboardRoutes::isContentDashboardRoute($route_match->getRouteName());
  }

  /**
   * {@inheritdoc}
   */
  public function determineActiveTheme(RouteMatchInterface $route_match): ?string {
    return $this->configFactory->get('system.theme')->get('admin') ?: NULL;
  }

}
