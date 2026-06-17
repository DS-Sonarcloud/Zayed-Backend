<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard;

/**
 * Front-end entity view routes that should use the admin theme when permitted.
 */
final class AdminContentRoutes {

  /**
   * Routes that render published content outside _admin_route.
   */
  public const ROUTES = [
    'entity.node.canonical',
    'entity.node.preview',
    'entity.node.revision',
    'entity.taxonomy_term.canonical',
    'entity.media.canonical',
  ];

  /**
   * Whether the given route should render inside the ZU admin shell.
   */
  public static function isAdminContentRoute(?string $route_name = NULL): bool {
    $route_name ??= \Drupal::routeMatch()->getRouteName() ?? '';
    return $route_name !== '' && in_array($route_name, self::ROUTES, TRUE);
  }

}
