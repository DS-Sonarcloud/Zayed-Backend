<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\zu_admin\Service\NotificationService;

class NotificationsController extends ControllerBase {

  protected NotificationService $notificationService;

  public function __construct(NotificationService $ns) {
    $this->notificationService = $ns;
  }

  public static function create(ContainerInterface $container) {
    return new static($container->get('zu_admin.notification_service'));
  }

  public function index(): array {
    $notifications = $this->notificationService->getNotifications(50);
    $this->notificationService->markAllRead();
    $rows = [];
    foreach ($notifications as $n) {
      $rows[] = [
        \Drupal::service('date.formatter')->format($n['created'], 'short'),
        $n['message'],
        $n['is_read'] ? $this->t('Read') : $this->t('Unread'),
      ];
    }
    return [
      '#type'   => 'table',
      '#header' => [$this->t('Date'), $this->t('Message'), $this->t('Status')],
      '#rows'   => $rows,
      '#empty'  => $this->t('No notifications.'),
      '#cache'  => ['max-age' => 0],
    ];
  }

}
