<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\zu_admin\Service\AuditService;
use Drupal\zu_admin\Service\NotificationService;

/**
 * Dashboard overview controller.
 */
class DashboardController extends ControllerBase {

  protected Connection $database;
  protected AuditService $auditService;
  protected NotificationService $notificationService;

  public function __construct(Connection $db, AuditService $audit, NotificationService $notif) {
    $this->database            = $db;
    $this->auditService        = $audit;
    $this->notificationService = $notif;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('zu_admin.audit_service'),
      $container->get('zu_admin.notification_service')
    );
  }

  public function dashboard(): array {
    $total_users = $this->database->select('users_field_data', 'u')
      ->condition('uid', 0, '>')
      ->countQuery()->execute()->fetchField();

    $total_groups = $this->database->select('zu_admin_groups', 'g')
      ->countQuery()->execute()->fetchField();

    $total_notifications = $this->notificationService->getUnreadCount();
    $recent_logs         = $this->auditService->getEntries(10);

    return [
      '#theme' => 'zu_dashboard',
      '#stats' => [
        'total_users' => $total_users,
        'total_groups' => $total_groups,
        'notifications' => $total_notifications,
      ],
      '#recent_activity' => $recent_logs,
      '#attached' => [
        'library' => ['zu_admin/zu_admin_ui'],
      ],
    ];
  }

}
