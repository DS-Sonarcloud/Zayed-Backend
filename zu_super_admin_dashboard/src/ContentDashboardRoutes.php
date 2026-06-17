<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard;

/**
 * View page routes that render as ZU admin content dashboards.
 */
final class ContentDashboardRoutes {

  /**
   * Route names for dashboard Views (language-prefixed paths).
   */
  public const ROUTES = [
    'view.event_dashboard.event_dashboard_page',
    'view.blog_listing.blog_dashboard',
    'view.news_api.news_dashboard',
    'view.faculty.faculty_staff_dashboard',
    'view.jobs_listing.page_1',
  ];

  /**
   * Whether the given route is a content dashboard page.
   */
  public static function isContentDashboardRoute(?string $route_name = NULL): bool {
    $route_name ??= \Drupal::routeMatch()->getRouteName() ?? '';
    return $route_name !== '' && in_array($route_name, self::ROUTES, TRUE);
  }

}
