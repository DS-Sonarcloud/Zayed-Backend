<?php

namespace Drupal\zu_rest_api\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Session\AccountProxyInterface;
use Psr\Log\LoggerInterface;

/**
 * Service for managing deployment logs.
 */
class DeploymentLogService
{

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected Connection $database;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected AccountProxyInterface $currentUser;

  /**
   * The logger service.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected LoggerInterface $logger;

  /**
   * Deployment status constants.
   */
  const STATUS_PENDING = 'pending';
  const STATUS_SUCCESS = 'success';
  const STATUS_FAILED = 'failed';

  /**
   * Constructs a DeploymentLogService object.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   The current user.
   * @param \Psr\Log\LoggerInterface $logger
   *   The logger service.
   */
  public function __construct(Connection $database, AccountProxyInterface $current_user, LoggerInterface $logger)
  {
    $this->database = $database;
    $this->currentUser = $current_user;
    $this->logger = $logger;
  }

  /**
   * Create a new deployment log entry.
   *
   * @param string $deploy_type
   *   Type of deployment (blog, news, events, etc.).
   * @param string $source
   *   Source form or controller.
   * @param string|null $langcode
   *   Language code.
   *
   * @return int
   *   The ID of the created log entry.
   */
  public function createLog(string $deploy_type, string $source, ?string $langcode = NULL): int
  {
    $id = $this->database->insert('zu_deployment_log')
      ->fields([
        'deploy_type' => $deploy_type,
        'source' => $source,
        'langcode' => $langcode,
        'status' => self::STATUS_PENDING,
        'uid' => $this->currentUser->id(),
        'created' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    return (int) $id;
  }

  /**
   * Update a deployment log entry.
   *
   * @param int $log_id
   *   The log entry ID.
   * @param string $status
   *   The status (success, failed).
   * @param string|null $message
   *   Optional status message.
   * @param int|null $items_count
   *   Optional number of items deployed.
   */
  public function updateLog(int $log_id, string $status, ?string $message = NULL, ?int $items_count = NULL): void
  {
    $fields = [
      'status' => $status,
      'completed' => \Drupal::time()->getRequestTime(),
    ];

    if ($message !== NULL) {
      $fields['message'] = $message;
    }

    if ($items_count !== NULL) {
      $fields['items_count'] = $items_count;
    }

    $this->database->update('zu_deployment_log')
      ->fields($fields)
      ->condition('id', $log_id)
      ->execute();
  }

  /**
   * Log a successful deployment.
   *
   * @param string $deploy_type
   *   Type of deployment.
   * @param string $source
   *   Source form or controller.
   * @param string|null $langcode
   *   Language code.
   * @param int $items_count
   *   Number of items deployed.
   * @param string|null $message
   *   Optional success message.
   *
   * @return int
   *   The log entry ID.
   */
  public function logSuccess(string $deploy_type, string $source, ?string $langcode = NULL, int $items_count = 0, ?string $message = NULL): int
  {
    $id = $this->database->insert('zu_deployment_log')
      ->fields([
        'deploy_type' => $deploy_type,
        'source' => $source,
        'langcode' => $langcode,
        'status' => self::STATUS_SUCCESS,
        'items_count' => $items_count,
        'message' => $message ?? 'Deployment completed successfully.',
        'uid' => $this->currentUser->id(),
        'created' => \Drupal::time()->getRequestTime(),
        'completed' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    $this->logger->info('Deployment successful: @type (@lang) - @count items', [
      '@type' => $deploy_type,
      '@lang' => $langcode ?? 'all',
      '@count' => $items_count,
    ]);

    return (int) $id;
  }

  /**
   * Log a failed deployment.
   *
   * @param string $deploy_type
   *   Type of deployment.
   * @param string $source
   *   Source form or controller.
   * @param string|null $langcode
   *   Language code.
   * @param string $error_message
   *   Error message.
   *
   * @return int
   *   The log entry ID.
   */
  public function logFailure(string $deploy_type, string $source, ?string $langcode = NULL, string $error_message = 'Deployment failed.'): int
  {
    $id = $this->database->insert('zu_deployment_log')
      ->fields([
        'deploy_type' => $deploy_type,
        'source' => $source,
        'langcode' => $langcode,
        'status' => self::STATUS_FAILED,
        'message' => $error_message,
        'uid' => $this->currentUser->id(),
        'created' => \Drupal::time()->getRequestTime(),
        'completed' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();

    $this->logger->error('Deployment failed: @type (@lang) - @message', [
      '@type' => $deploy_type,
      '@lang' => $langcode ?? 'all',
      '@message' => $error_message,
    ]);

    return (int) $id;
  }

  /**
   * Get all deployment logs with pagination.
   *
   * @param int $limit
   *   Number of records per page.
   * @param int $offset
   *   Offset for pagination.
   * @param array $filters
   *   Optional filters (deploy_type, status, date_from, date_to).
   *
   * @return array
   *   Array of log entries.
   */
  public function getLogs(int $limit = 50, int $offset = 0, array $filters = []): array
  {
    $query = $this->database->select('zu_deployment_log', 'dl')
      ->fields('dl')
      ->orderBy('created', 'DESC')
      ->range($offset, $limit);

    if (!empty($filters['deploy_type'])) {
      $query->condition('deploy_type', $filters['deploy_type']);
    }

    if (!empty($filters['status'])) {
      $query->condition('status', $filters['status']);
    }

    if (!empty($filters['date_from'])) {
      $query->condition('created', strtotime($filters['date_from']), '>=');
    }

    if (!empty($filters['date_to'])) {
      $query->condition('created', strtotime($filters['date_to'] . ' 23:59:59'), '<=');
    }

    return $query->execute()->fetchAll();
  }

  /**
   * Get total count of logs.
   *
   * @param array $filters
   *   Optional filters.
   *
   * @return int
   *   Total count.
   */
  public function getLogsCount(array $filters = []): int
  {
    $query = $this->database->select('zu_deployment_log', 'dl');
    $query->addExpression('COUNT(*)', 'count');

    if (!empty($filters['deploy_type'])) {
      $query->condition('deploy_type', $filters['deploy_type']);
    }

    if (!empty($filters['status'])) {
      $query->condition('status', $filters['status']);
    }

    if (!empty($filters['date_from'])) {
      $query->condition('created', strtotime($filters['date_from']), '>=');
    }

    if (!empty($filters['date_to'])) {
      $query->condition('created', strtotime($filters['date_to'] . ' 23:59:59'), '<=');
    }

    return (int) $query->execute()->fetchField();
  }

  /**
   * Get a single log entry by ID.
   *
   * @param int $id
   *   The log entry ID.
   *
   * @return object|null
   *   The log entry or null if not found.
   */
  public function getLog(int $id): ?object
  {
    return $this->database->select('zu_deployment_log', 'dl')
      ->fields('dl')
      ->condition('id', $id)
      ->execute()
      ->fetchObject() ?: NULL;
  }

  /**
   * Delete a log entry.
   *
   * @param int $id
   *   The log entry ID.
   *
   * @return bool
   *   TRUE if deleted, FALSE otherwise.
   */
  public function deleteLog(int $id): bool
  {
    $deleted = $this->database->delete('zu_deployment_log')
      ->condition('id', $id)
      ->execute();

    return $deleted > 0;
  }

  /**
   * Delete multiple log entries.
   *
   * @param array $ids
   *   Array of log entry IDs.
   *
   * @return int
   *   Number of deleted entries.
   */
  public function deleteLogs(array $ids): int
  {
    if (empty($ids)) {
      return 0;
    }

    return $this->database->delete('zu_deployment_log')
      ->condition('id', $ids, 'IN')
      ->execute();
  }

  /**
   * Delete logs older than specified days.
   *
   * @param int $days
   *   Number of days.
   *
   * @return int
   *   Number of deleted entries.
   */
  public function deleteOldLogs(int $days): int
  {
    $cutoff = \Drupal::time()->getRequestTime() - ($days * 86400);

    return $this->database->delete('zu_deployment_log')
      ->condition('created', $cutoff, '<')
      ->execute();
  }

  /**
   * Get deployment statistics.
   *
   * @return array
   *   Array with statistics.
   */
  public function getStatistics(): array
  {
    $stats = [
      'total' => 0,
      'success' => 0,
      'failed' => 0,
      'by_type' => [],
    ];

    // Total count
    $stats['total'] = $this->getLogsCount();

    // Success count
    $stats['success'] = $this->getLogsCount(['status' => self::STATUS_SUCCESS]);

    // Failed count
    $stats['failed'] = $this->getLogsCount(['status' => self::STATUS_FAILED]);

    // By type
    $query = $this->database->select('zu_deployment_log', 'dl');
    $query->addField('dl', 'deploy_type');
    $query->addExpression('COUNT(*)', 'count');
    $query->groupBy('deploy_type');

    $results = $query->execute()->fetchAll();
    foreach ($results as $row) {
      $stats['by_type'][$row->deploy_type] = (int) $row->count;
    }

    return $stats;
  }

  /**
   * Get available deploy types for filtering.
   *
   * @return array
   *   Array of deploy types.
   */
  public function getDeployTypes(): array
  {
    return $this->database->select('zu_deployment_log', 'dl')
      ->fields('dl', ['deploy_type'])
      ->distinct()
      ->orderBy('deploy_type')
      ->execute()
      ->fetchCol();
  }
}
