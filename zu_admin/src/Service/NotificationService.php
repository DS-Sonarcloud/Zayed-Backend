<?php

namespace Drupal\zu_admin\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Session\AccountInterface;

/**
 * Service to manage user notifications.
 */
class NotificationService {

  protected AccountInterface $currentUser;
  protected Connection $database;

  public function __construct(AccountInterface $currentUser, Connection $database) {
    $this->currentUser = $currentUser;
    $this->database    = $database;
  }

  /**
   * Count unread notifications for the current user.
   */
  public function getUnreadCount(): int {
    return (int) $this->database->select('zu_admin_notifications', 'n')
      ->condition('uid', $this->currentUser->id())
      ->condition('is_read', 0)
      ->countQuery()
      ->execute()
      ->fetchField();
  }

  /**
   * Get notifications for the current user.
   */
  public function getNotifications(int $limit = 20): array {
    return $this->database->select('zu_admin_notifications', 'n')
      ->fields('n')
      ->condition('uid', $this->currentUser->id())
      ->orderBy('created', 'DESC')
      ->range(0, $limit)
      ->execute()
      ->fetchAll(\PDO::FETCH_ASSOC);
  }

  /**
   * Mark all notifications as read for the current user.
   */
  public function markAllRead(): void {
    $this->database->update('zu_admin_notifications')
      ->fields(['is_read' => 1])
      ->condition('uid', $this->currentUser->id())
      ->execute();
  }

  /**
   * Add a notification for a specific user.
   */
  public function addNotification(int $uid, string $message): void {
    $this->database->insert('zu_admin_notifications')
      ->fields([
        'uid'     => $uid,
        'message' => $message,
        'is_read' => 0,
        'created' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();
  }

}
