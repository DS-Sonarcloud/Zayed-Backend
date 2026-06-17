<?php

namespace Drupal\zu_admin\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Session\AccountInterface;

/**
 * Central audit logging service for all user and system actions.
 *
 * Every action taken in the site — content create/update/delete, user
 * login/logout/block, taxonomy changes, media uploads, config edits — is
 * recorded here via Drupal hooks in zu_admin.module. Callers in custom modules
 * can also call AuditService::log() directly for application-level events.
 *
 * Event type taxonomy (use these strings for $event_type):
 *   node.create, node.update, node.delete, node.publish, node.unpublish
 *   user.login, user.logout, user.create, user.update, user.delete,
 *   user.block, user.unblock, user.password_reset
 *   taxonomy.create, taxonomy.update, taxonomy.delete
 *   media.create, media.update, media.delete
 *   config.save, config.delete
 *   file.upload, file.delete
 *   comment.create, comment.delete
 *   webform.submit
 *   system.*   (cron, flush, module enable/disable)
 */
class AuditService {

  protected Connection $database;
  protected AccountInterface $currentUser;

  public function __construct(Connection $database, AccountInterface $currentUser) {
    $this->database    = $database;
    $this->currentUser = $currentUser;
  }

  /**
   * Record an audit log entry.
   *
   * @param string $event_type  Dot-namespaced event type, e.g. 'node.create'.
   * @param string $message     Human-readable description (may include HTML).
   * @param array  $args        strtr() replacements applied to $message.
   * @param int    $uid         Actor UID; 0 = use current user.
   */
  public function log(string $event_type, string $message, array $args = [], int $uid = 0): void {
    try {
      $this->database->insert('zu_admin_audit_log')
        ->fields([
          'event_type' => $event_type,
          'message'    => $args ? strtr($message, $args) : $message,
          'uid'        => $uid ?: (int) $this->currentUser->id(),
          'timestamp'  => \Drupal::time()->getRequestTime(),
          'ip_address' => \Drupal::request()->getClientIp() ?? '',
        ])
        ->execute();
    }
    catch (\Exception $e) {
      \Drupal::logger('zu_admin')->error('Audit log write failed: @msg', ['@msg' => $e->getMessage()]);
    }
  }

  /**
   * Fetch log entries with optional filtering and pagination.
   *
   * Returns rows with an extra 'username' column joined from {users_field_data}.
   *
   * @param int    $limit       Max rows (default 50, use 0 for unlimited).
   * @param int    $offset      Row offset for pagination.
   * @param string $event_type  Exact event_type filter (empty = all).
   * @param int    $uid         Filter by user ID (0 = all).
   * @param int    $date_from   Unix timestamp lower bound (0 = none).
   * @param int    $date_to     Unix timestamp upper bound (0 = none).
   * @param string $search      Free-text substring search in message.
   * @return array<int, array<string, mixed>>
   */
  public function getEntries(
    int $limit = 50,
    int $offset = 0,
    string $event_type = '',
    int $uid = 0,
    int $date_from = 0,
    int $date_to = 0,
    string $search = '',
  ): array {
    $query = $this->database->select('zu_admin_audit_log', 'a')
      ->fields('a')
      ->orderBy('a.timestamp', 'DESC');

    $query->leftJoin('users_field_data', 'u', 'u.uid = a.uid');
    $query->addField('u', 'name', 'username');

    $this->applyFilters($query, $event_type, $uid, $date_from, $date_to, $search);

    if ($limit > 0) {
      $query->range($offset, $limit);
    }

    return $query->execute()->fetchAll(\PDO::FETCH_ASSOC);
  }

  /**
   * Total count of matching entries (for pagination).
   */
  public function countEntries(
    string $event_type = '',
    int $uid = 0,
    int $date_from = 0,
    int $date_to = 0,
    string $search = '',
  ): int {
    $query = $this->database->select('zu_admin_audit_log', 'a');
    $this->applyFilters($query, $event_type, $uid, $date_from, $date_to, $search);
    return (int) $query->countQuery()->execute()->fetchField();
  }

  /**
   * Return the list of distinct event_type values present in the log.
   *
   * @return string[]
   */
  public function getEventTypes(): array {
    $result = $this->database->select('zu_admin_audit_log', 'a')
      ->fields('a', ['event_type'])
      ->distinct()
      ->orderBy('event_type')
      ->execute()
      ->fetchCol();
    return $result ?: [];
  }

  /**
   * Delete log entries older than $days days.
   */
  public function purgeOldEntries(int $days = 90): int {
    $cutoff = \Drupal::time()->getRequestTime() - ($days * 86400);
    return (int) $this->database->delete('zu_admin_audit_log')
      ->condition('timestamp', $cutoff, '<')
      ->execute();
  }

  /**
   * Apply shared WHERE conditions to a SelectQuery.
   */
  private function applyFilters(
    $query,
    string $event_type,
    int $uid,
    int $date_from,
    int $date_to,
    string $search,
  ): void {
    if ($event_type) {
      // Support prefix matching: "node" matches "node.create", "node.update" …
      if (!str_contains($event_type, '.')) {
        $query->condition('a.event_type', $event_type . '.%', 'LIKE');
      }
      else {
        $query->condition('a.event_type', $event_type);
      }
    }
    if ($uid) {
      $query->condition('a.uid', $uid);
    }
    if ($date_from) {
      $query->condition('a.timestamp', $date_from, '>=');
    }
    if ($date_to) {
      $query->condition('a.timestamp', $date_to, '<=');
    }
    if ($search !== '') {
      $query->condition('a.message', '%' . $this->database->escapeLike($search) . '%', 'LIKE');
    }
  }

}
