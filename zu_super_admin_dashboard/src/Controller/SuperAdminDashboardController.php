<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\zu_super_admin_dashboard\Service\SuperAdminDashboardBuilder;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Renders the ZU Super Admin Dashboard.
 */
final class SuperAdminDashboardController extends ControllerBase {

  public function __construct(
    private readonly SuperAdminDashboardBuilder $dashboardBuilder,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('zu_super_admin_dashboard.builder'),
    );
  }

  /**
   * Dashboard page callback.
   */
  public function dashboard(): array {
    return $this->dashboardBuilder->build();
  }

}
