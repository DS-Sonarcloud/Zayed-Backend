<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Theme;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Theme\ThemeNegotiatorInterface;

/**
 * Uses the admin theme on user profile pages opened from People admin.
 *
 * User canonical (/user/{user}) is not an _admin_route, so core's negotiator
 * leaves the front-end theme active and the ZU app shell is not applied.
 */
final class UserProfileAdminThemeNegotiator implements ThemeNegotiatorInterface {

  /**
   * Routes that should render inside the admin theme when permitted.
   */
  private const ADMIN_USER_ROUTES = [
    'entity.user.canonical',
  ];

  public function __construct(
    private readonly AccountInterface $currentUser,
    private readonly ConfigFactoryInterface $configFactory,
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function applies(RouteMatchInterface $route_match): bool {
    if (!$this->entityTypeManager->hasHandler('user_role', 'storage')) {
      return FALSE;
    }
    if (!$this->currentUser->hasPermission('view the administration theme')) {
      return FALSE;
    }
    return in_array($route_match->getRouteName(), self::ADMIN_USER_ROUTES, TRUE);
  }

  /**
   * {@inheritdoc}
   */
  public function determineActiveTheme(RouteMatchInterface $route_match): ?string {
    return $this->configFactory->get('system.theme')->get('admin') ?: NULL;
  }

}
