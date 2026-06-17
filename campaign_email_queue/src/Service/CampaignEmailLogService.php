<?php

namespace Drupal\campaign_email_queue\Service;

use Drupal\Core\Database\Connection;
use Psr\Log\LoggerInterface;

/**
 * Service for managing campaign email logs and statistics.
 */
class CampaignEmailLogService
{

  protected Connection $database;
  protected LoggerInterface $logger;

  public function __construct(Connection $database, LoggerInterface $logger)
  {
    $this->database = $database;
    $this->logger = $logger;
    $this->ensureSchemaUpdated();
  }

  /**
   * Ensures the database schema is updated with run_id columns.
   */
  public function ensureSchemaUpdated(): void
  {
    $schema = $this->database->schema();

    if ($schema->tableExists('campaign_email_log') && !$schema->fieldExists('campaign_email_log', 'run_id')) {
      $schema->addField('campaign_email_log', 'run_id', [
        'type' => 'int',
        'not null' => TRUE,
        'default' => 1,
        'description' => 'The run sequence number.',
      ]);
      $schema->dropIndex('campaign_email_log', 'campaign_status');
      $schema->addIndex('campaign_email_log', 'run_id', ['run_id'], []);
      $schema->addIndex('campaign_email_log', 'campaign_run_status', ['campaign_id', 'run_id', 'status'], []);
    }

    if ($schema->tableExists('campaign_statistics') && !$schema->fieldExists('campaign_statistics', 'run_id')) {
      $schema->addField('campaign_statistics', 'run_id', [
        'type' => 'int',
        'not null' => TRUE,
        'default' => 1,
        'description' => 'The run sequence number.',
      ]);

      try {
        $this->database->query("ALTER TABLE {campaign_statistics} DROP PRIMARY KEY, ADD PRIMARY KEY (campaign_id, run_id)");
      } catch (\Exception $e) {
      }
    }

    if ($schema->tableExists('campaign_rerun_log') && !$schema->fieldExists('campaign_rerun_log', 'run_id')) {
      $schema->addField('campaign_rerun_log', 'run_id', [
        'type' => 'int',
        'not null' => TRUE,
        'default' => 1,
        'description' => 'The run sequence number.',
      ]);
    }
  }

  /**
   * Aggregate live log counts for dashboard summary cards.
   *
   * @param list<int|string> $campaign_ids
   *
   * @return array{sent: int, failed: int, pending: int}
   */
  public function getAccessibleCampaignSummary(array $campaign_ids): array {
    $sent = 0;
    $failed = 0;
    $pending = 0;

    foreach ($campaign_ids as $campaign_id) {
      $campaign_id = (int) $campaign_id;
      if ($campaign_id <= 0) {
        continue;
      }
      $counts = $this->getLogStatusCounts($campaign_id);
      $sent += $counts['sent'];
      $failed += $counts['failed'] + $counts['error'];
      $pending += $counts['pending'];
    }

    return [
      'sent' => $sent,
      'failed' => $failed,
      'pending' => $pending,
    ];
  }

  /**
   * Get the latest run ID for a campaign (prefer runs that have log rows).
   */
  public function getLatestRunId(int $campaign_id): int
  {
    $log_query = $this->database->select('campaign_email_log', 'cel');
    $log_query->addExpression('MAX(run_id)', 'max_run_id');
    $log_query->condition('campaign_id', $campaign_id);
    $from_logs = (int) $log_query->execute()->fetchField();
    if ($from_logs > 0) {
      return $from_logs;
    }

    $from_queue = $this->peekQueueRunId($campaign_id);
    if ($from_queue > 0) {
      return $from_queue;
    }

    $from_stats = (int) $this->database->select('campaign_statistics', 'cs')
      ->fields('cs', ['run_id'])
      ->condition('campaign_id', $campaign_id)
      ->condition('total_emails', 0, '>')
      ->orderBy('run_id', 'DESC')
      ->range(0, 1)
      ->execute()
      ->fetchField();

    return $from_stats > 0 ? $from_stats : 1;
  }

  /**
   * Read run_id from the next waiting queue row without claiming it.
   */
  public function peekQueueRunId(int $campaign_id): int
  {
    $name = 'campaign_email_queue_' . $campaign_id;
    $data = $this->database->select('queue', 'q')
      ->fields('q', ['data'])
      ->condition('name', $name)
      ->orderBy('item_id', 'ASC')
      ->range(0, 1)
      ->execute()
      ->fetchField();

    if ($data === FALSE) {
      return 0;
    }

    $item = @unserialize($data, ['allowed_classes' => FALSE]);
    if (!is_array($item) || empty($item['run_id'])) {
      return 0;
    }

    return (int) $item['run_id'];
  }

  /**
   * Initialize email log entries when queue is created.
   *
   * @param int $campaign_id
   *   The campaign ID.
   * @param array $emails
   *   Array of email addresses.
   */
  public function initializeEmailLogs(int $campaign_id, array $emails, ?int $run_id = NULL): void
  {
    $chunk_size = (int) (\Drupal::config('campaign_email_queue.settings')->get('log_insert_chunk_size') ?? 500);
    $this->initializeEmailLogsBulk($campaign_id, $emails, $run_id, max(100, $chunk_size), TRUE);
  }

  /**
   * Bulk-insert pending log rows (10k–50k+ campaigns).
   *
   * @param list<string> $emails
   * @param bool $update_statistics
   *   When FALSE, skip statistics writes (e.g. dashboard read-only backfill).
   */
  public function initializeEmailLogsBulk(int $campaign_id, array $emails, ?int $run_id = NULL, int $chunk_size = 500, bool $update_statistics = TRUE): void
  {
    if ($emails === []) {
      return;
    }

    $time = \Drupal::time()->getRequestTime();
    $run_id = $run_id ?? $this->getLatestRunId($campaign_id);
    $chunk_size = max(50, $chunk_size);

    foreach (array_chunk(array_values($emails), $chunk_size) as $chunk) {
      $existing = $this->database->select('campaign_email_log', 'cel')
        ->fields('cel', ['email'])
        ->condition('campaign_id', $campaign_id)
        ->condition('run_id', $run_id)
        ->condition('email', $chunk, 'IN')
        ->execute()
        ->fetchCol();
      $existing_map = array_flip($existing);

      $insert = $this->database->insert('campaign_email_log')
        ->fields(['campaign_id', 'run_id', 'email', 'status', 'attempts', 'queued_time']);

      $added = 0;
      foreach ($chunk as $email) {
        if (isset($existing_map[$email])) {
          continue;
        }
        $insert->values([
          'campaign_id' => $campaign_id,
          'run_id' => $run_id,
          'email' => $email,
          'status' => 'pending',
          'attempts' => 0,
          'queued_time' => $time,
        ]);
        $added++;
      }

      if ($added > 0) {
        $insert->execute();
      }
    }

    if ($update_statistics) {
      $this->updateCampaignStatistics($campaign_id, $run_id);
    }
  }

  /**
   * Log multiple email sending attempts in batch.
   *
   * @param int $campaign_id
   *   The campaign ID.
   * @param array $results
   *   Array of results: [['email' => '...', 'status' => 'sent', 'processing_time' => 123, 'error' => '...'], ...]
   * @param int|null $run_id
   *   The run ID.
   */
  public function logEmailAttemptsBatch(int $campaign_id, array $results, ?int $run_id = NULL): void
  {
    if ($results === []) {
      return;
    }

    $time = \Drupal::time()->getRequestTime();
    $run_id = (int) ($run_id ?? $this->resolveRunId($campaign_id));

    $transaction = $this->database->startTransaction();
    try {
      foreach ($results as $result) {
        $email = trim((string) ($result['email'] ?? ''));
        if ($email === '') {
          continue;
        }
        $status = (string) ($result['status'] ?? 'error');
        $error_message = $result['error'] ?? NULL;
        $processing_time = $result['processing_time'] ?? NULL;

        $log_data = $this->database->select('campaign_email_log', 'cel')
          ->fields('cel', ['id', 'attempts'])
          ->condition('campaign_id', $campaign_id)
          ->condition('run_id', $run_id)
          ->condition('email', $email)
          ->execute()
          ->fetch();

        if ($log_data) {
          $update_fields = [
            'status' => $status,
            'attempts' => $log_data->attempts + 1,
          ];

          if ($status === 'sent') {
            $update_fields['sent_time'] = $time;
          }

          if ($error_message) {
            $update_fields['error_message'] = $error_message;
          }

          if ($processing_time !== NULL) {
            $update_fields['processing_time'] = $processing_time;
          }

          $this->database->update('campaign_email_log')
            ->fields($update_fields)
            ->condition('id', $log_data->id)
            ->execute();
        }
        else {
          $insert = [
            'campaign_id' => $campaign_id,
            'run_id' => $run_id,
            'email' => $email,
            'status' => $status,
            'attempts' => 1,
            'queued_time' => $time,
          ];
          if ($status === 'sent') {
            $insert['sent_time'] = $time;
          }
          if ($error_message) {
            $insert['error_message'] = $error_message;
          }
          if ($processing_time !== NULL) {
            $insert['processing_time'] = $processing_time;
          }
          $this->database->insert('campaign_email_log')->fields($insert)->execute();
        }
      }
    }
    catch (\Exception $e) {
      $transaction->rollBack();
      $this->logger->error('Batch logging failed for campaign @id: @message', [
        '@id' => $campaign_id,
        '@message' => $e->getMessage(),
      ]);
      throw $e;
    }

    $this->updateCampaignStatistics($campaign_id, $run_id);
  }

  /**
   * Log email sending attempt.
   *
   * @param int $campaign_id
   *   The campaign ID.
   * @param string $email
   *   The email address.
   * @param string $status
   *   Status: 'sent', 'failed', 'error'.
   * @param string|null $error_message
   *   Error message if applicable.
   * @param int|null $processing_time
   *   Processing time in milliseconds.
   */
  public function logEmailAttempt(int $campaign_id, string $email, string $status, ?string $error_message = NULL, ?int $processing_time = NULL, ?int $run_id = NULL): void
  {
    $results = [
      [
        'email' => $email,
        'status' => $status,
        'error' => $error_message,
        'processing_time' => $processing_time,
      ],
    ];
    $this->logEmailAttemptsBatch($campaign_id, $results, $run_id);
  }

  /**
   * Update campaign statistics.
   *
   * @param int $campaign_id
   *   The campaign ID.
   */
  public function updateCampaignStatistics(int $campaign_id, ?int $run_id = NULL): void
  {
    $time = \Drupal::time()->getRequestTime();
    $run_id = $run_id ?? $this->getLatestRunId($campaign_id);

    // Optimize: Use aggregation instead of fetching all rows.
    $results = $this->aggregateLogCountsByStatus($campaign_id, $run_id);

    $sent = (int) ($results['sent'] ?? 0);
    $failed = (int) ($results['failed'] ?? 0);
    $pending = (int) ($results['pending'] ?? 0);
    $error = (int) ($results['error'] ?? 0);
    $total = $sent + $failed + $pending + $error;

    $avg_query = $this->database->select('campaign_email_log', 'cel');
    $avg_query->addExpression('AVG(processing_time)', 'avg_processing_time');
    $avg_query->condition('campaign_id', $campaign_id);
    $avg_query->condition('run_id', $run_id);
    $avg_query->condition('status', 'sent');
    $avg_query->isNotNull('processing_time');
    $avg_time = (int) $avg_query->execute()->fetchField();

    $start_query = $this->database->select('campaign_email_log', 'cel');
    $start_query->addExpression('MIN(sent_time)', 'started_time');
    $start_query->condition('campaign_id', $campaign_id);
    $start_query->condition('run_id', $run_id);
    $start_query->condition('status', 'sent');
    $started_time = $start_query->execute()->fetchField();

    $completed_time = NULL;
    if ($pending === 0 && $total > 0) {
      $completed_time = $time;
    }

    $exists = $this->database->select('campaign_statistics', 'cs')
      ->fields('cs', ['campaign_id'])
      ->condition('campaign_id', $campaign_id)
      ->condition('run_id', $run_id)
      ->execute()
      ->fetchField();

    $fields = [
      'total_emails' => $total,
      'sent_count' => $sent,
      'failed_count' => $failed,
      'pending_count' => $pending,
      'error_count' => $error,
      'last_updated' => $time,
      'avg_processing_time' => $avg_time,
    ];

    if ($started_time) {
      $fields['started_time'] = $started_time;
    }

    if ($completed_time) {
      $fields['completed_time'] = $completed_time;
    }

    if ($exists) {
      $this->database->update('campaign_statistics')
        ->fields($fields)
        ->condition('campaign_id', $campaign_id)
        ->condition('run_id', $run_id)
        ->execute();
    }
    elseif ($total > 0) {
      $fields['campaign_id'] = $campaign_id;
      $fields['run_id'] = $run_id;
      $this->database->insert('campaign_statistics')
        ->fields($fields)
        ->execute();
    }
  }

  /**
   * Latest activity timestamp for a run from email logs.
   */
  public function getLastLogActivityTime(int $campaign_id, int $run_id): ?int {
    $activity_query = $this->database->select('campaign_email_log', 'cel');
    $activity_query->condition('campaign_id', $campaign_id);
    $activity_query->condition('run_id', $run_id);
    $activity_query->addExpression('GREATEST(COALESCE(MAX(queued_time), 0), COALESCE(MAX(sent_time), 0))', 'last_activity');
    $value = (int) $activity_query->execute()->fetchField();
    return $value > 0 ? $value : NULL;
  }

  /**
   * Get campaign statistics.
   *
   * @param int $campaign_id
   *   The campaign ID.
   *
   * @return object|null
   *   Statistics object or NULL.
   */
  public function getCampaignStatistics(int $campaign_id, ?int $run_id = NULL): ?object
  {
    $run_id = $run_id ?? $this->getLatestRunId($campaign_id);
    $result = $this->database->select('campaign_statistics', 'cs')
      ->fields('cs')
      ->condition('campaign_id', $campaign_id)
      ->condition('run_id', $run_id)
      ->execute()
      ->fetch();

    return $result ?: null;
  }

  /**
   * Get detailed email logs for a campaign.
   *
   * @param int $campaign_id
   *   The campaign ID.
   * @param int $limit
   *   Number of records to return.
   * @param int $offset
   *   Offset for pagination.
   *
   * @return array
   *   Array of email log records.
   */
  public function getCampaignEmailLogs(int $campaign_id, int $limit = 100, int $offset = 0, ?int $run_id = NULL): array
  {
    $run_id = $run_id ?? $this->getLatestRunId($campaign_id);
    $query = $this->database->select('campaign_email_log', 'cel')
      ->extend('Drupal\Core\Database\Query\PagerSelectExtender')
      ->fields('cel')
      ->condition('campaign_id', $campaign_id)
      ->condition('run_id', $run_id)
      ->orderBy('id', 'DESC')
      ->limit($limit);

    return $query->execute()->fetchAll();
  }

  /**
   * Get all campaign statistics.
   *
   * @return array
   *   Array of all campaign statistics.
   */
  public function getAllCampaignStatistics(): array
  {
    return $this->database->select('campaign_statistics', 'cs')
      ->fields('cs')
      ->execute()
      ->fetchAll();
  }

  /**
   * Clear logs for a campaign.
   *
   * @param int $campaign_id
   *   The campaign ID.
   */
  public function clearCampaignLogs(int $campaign_id): void
  {
    $this->database->delete('campaign_email_log')
      ->condition('campaign_id', $campaign_id)
      ->execute();

    $this->database->delete('campaign_statistics')
      ->condition('campaign_id', $campaign_id)
      ->execute();
  }

  /**
   * Get progress percentage for a campaign.
   *
   * @param int $campaign_id
   *   The campaign ID.
   *
   * @return float
   *   Progress percentage (0-100).
   */
  public function getCampaignProgress(int $campaign_id, ?int $run_id = NULL): float
  {
    $stats = $this->getCampaignStatistics($campaign_id, $run_id);

    if (!$stats || $stats->total_emails == 0) {
      return 0;
    }

    $processed = $stats->sent_count + $stats->failed_count + $stats->error_count;
    return ($processed / $stats->total_emails) * 100;
  }

  /**
   * Resolve run ID from queue payload or latest run with activity.
   */
  public function resolveRunId(int $campaign_id): int {
    if (\Drupal::hasService('campaign_email_queue.processing_state')) {
      $active_run = \Drupal::service('campaign_email_queue.processing_state')->getRunId($campaign_id);
      if ($active_run !== NULL) {
        return $active_run;
      }
    }

    $from_queue = $this->peekQueueRunId($campaign_id);
    if ($from_queue > 0) {
      return $from_queue;
    }
    return $this->getLatestRunId($campaign_id);
  }

  /**
   * Live counts from campaign_email_log.
   *
   * @return array{sent: int, failed: int, pending: int, error: int, total: int, run_id: int}
   */
  public function getLogStatusCounts(int $campaign_id, ?int $run_id = NULL): array {
    $run_id = $run_id ?? $this->resolveRunId($campaign_id);
    $counts = $this->fetchLogStatusCountsForRun($campaign_id, $run_id);

    if ($counts['total'] === 0) {
      $fallback = $this->getLatestRunId($campaign_id);
      if ($fallback !== $run_id) {
        $fallback_counts = $this->fetchLogStatusCountsForRun($campaign_id, $fallback);
        if ($fallback_counts['total'] > 0) {
          return $fallback_counts;
        }
      }
    }

    return $counts;
  }

  /**
   * @return array<string, int>
   */
  protected function aggregateLogCountsByStatus(int $campaign_id, int $run_id): array {
    $query = $this->database->select('campaign_email_log', 'cel');
    $query->addField('cel', 'status', 'log_status');
    $query->addExpression('COUNT([cel].[id])', 'item_count');
    $query->condition('campaign_id', $campaign_id);
    $query->condition('run_id', $run_id);
    $query->groupBy('log_status');

    $counts = [];
    foreach ($query->execute() as $row) {
      $status = (string) ($row->log_status ?? '');
      if ($status === '') {
        continue;
      }
      $counts[$status] = (int) ($row->item_count ?? 0);
    }
    return $counts;
  }

  /**
   * @return array{sent: int, failed: int, pending: int, error: int, total: int, run_id: int}
   */
  protected function fetchLogStatusCountsForRun(int $campaign_id, int $run_id): array {
    $results = $this->aggregateLogCountsByStatus($campaign_id, $run_id);

    $sent = (int) ($results['sent'] ?? 0);
    $failed = (int) ($results['failed'] ?? 0);
    $pending = (int) ($results['pending'] ?? 0);
    $error = (int) ($results['error'] ?? 0);

    return [
      'sent' => $sent,
      'failed' => $failed,
      'pending' => $pending,
      'error' => $error,
      'total' => $sent + $failed + $pending + $error,
      'run_id' => $run_id,
    ];
  }

  /**
   * Dashboard status from live logs (not stale statistics cache).
   */
  public function getRealTimeStatus(int $campaign_id, ?int $run_id = NULL): array {
    $counts = $this->getLogStatusCounts($campaign_id, $run_id);
    $run_id = $counts['run_id'];
    unset($counts['run_id']);

    $total = $counts['total'];
    $processed = $counts['sent'] + $counts['failed'] + $counts['error'];
    $progress = $total > 0 ? ($processed / $total) * 100 : 0;

    $background_active = \Drupal::hasService('campaign_email_queue.processing_state')
      && \Drupal::service('campaign_email_queue.processing_state')->isActive($campaign_id);

    if ($total === 0) {
      $status = 'not_started';
    }
    elseif ($counts['pending'] === 0) {
      $status = 'completed';
    }
    elseif ($background_active || $processed > 0) {
      $status = 'in_progress';
    }
    else {
      $status = 'pending';
    }

    $stats = $this->getCampaignStatistics($campaign_id, $run_id);
    $last_updated = $stats?->last_updated ?? $this->getLastLogActivityTime($campaign_id, $run_id);

    $queue_count = 0;
    if (\Drupal::hasService('campaign_email_queue.queue')) {
      $queue_count = \Drupal::service('campaign_email_queue.queue')->getQueueCount($campaign_id);
    }
    if ($total === 0 && $queue_count > 0) {
      $status = 'pending';
    }

    return [
      'campaign_id' => $campaign_id,
      'status' => $status,
      'progress' => round($progress, 2),
      'total' => $total,
      'sent' => $counts['sent'],
      'failed' => $counts['failed'],
      'pending' => $counts['pending'],
      'error' => $counts['error'],
      'started_time' => $stats?->started_time,
      'completed_time' => $stats?->completed_time,
      'avg_processing_time' => $stats?->avg_processing_time,
      'last_updated' => $last_updated,
      'run_id' => $run_id,
      'background_active' => $background_active,
    ];
  }

  /**
   * Log a campaign re-run event.
   *
   * @param int $campaign_id
   *   The campaign ID.
   * @param int $user_id
   *   The user ID who triggered the re-run.
   */
  public function logRerun(int $campaign_id, int $user_id): int
  {
    $time = \Drupal::time()->getRequestTime();
    $last_run_id = $this->getLatestRunId($campaign_id);
    $next_run_id = $last_run_id + 1;

    $this->database->insert('campaign_rerun_log')
      ->fields([
        'campaign_id' => $campaign_id,
        'user_id' => $user_id,
        'rerun_time' => $time,
        'run_id' => $next_run_id,
      ])
      ->execute();

    return $next_run_id;
  }

  /**
   * Get total re-run count for a campaign.
   *
   * @param int $campaign_id
   *   The campaign ID.
   *
   * @return int
   *   Total number of re-runs.
   */
  public function getRerunCount(int $campaign_id): int
  {
    return (int) $this->database->select('campaign_rerun_log', 'crl')
      ->condition('campaign_id', $campaign_id)
      ->countQuery()
      ->execute()
      ->fetchField();
  }

  /**
   * Get re-run breakdown by user for a campaign.
   *
   * @param int $campaign_id
   *   The campaign ID.
   *
   * @return array
   *   Array of objects with user_id, count, and last_rerun_time.
   */
  public function getRerunsByUser(int $campaign_id): array
  {
    $query = $this->database->select('campaign_rerun_log', 'crl');
    $query->fields('crl', ['user_id']);
    $query->addExpression('COUNT(*)', 'rerun_count');
    $query->addExpression('MAX(rerun_time)', 'last_rerun_time');
    $query->condition('campaign_id', $campaign_id);
    $query->groupBy('user_id');
    $query->orderBy('rerun_count', 'DESC');

    return $query->execute()->fetchAll();
  }

  /**
   * Get all runs for a campaign with their statistics.
   */
  public function getRerunsWithStats(int $campaign_id): array
  {
    $query = $this->database->select('campaign_statistics', 'cs')
      ->extend('Drupal\Core\Database\Query\PagerSelectExtender');
    $query->leftJoin('campaign_rerun_log', 'crl', 'cs.campaign_id = crl.campaign_id AND cs.run_id = crl.run_id');
    $query->fields('cs');
    $query->fields('crl', ['user_id', 'rerun_time']);
    $query->condition('cs.campaign_id', $campaign_id);
    $query->limit(100);
    $query->orderBy('cs.run_id', 'DESC');

    return $query->execute()->fetchAll();
  }
  /**
   * Mark all pending logs for a campaign as failed.
   *
   * @param int $campaign_id
   *   The campaign ID.
   * @param string $error_message
   *   The error message to log.
   * @param int|null $run_id
   *   The run ID (optional).
   */
  public function markPendingAsFailed(int $campaign_id, string $error_message, ?int $run_id = NULL): int
  {
    $run_id = $run_id ?? $this->getLatestRunId($campaign_id);

    $count = $this->database->update('campaign_email_log')
      ->fields([
        'status' => 'failed',
        'error_message' => $error_message,
        'processing_time' => 0,
      ])
      ->condition('campaign_id', $campaign_id)
      ->condition('run_id', $run_id)
      ->condition('status', 'pending')
      ->execute();

    if ($count > 0) {
      $this->updateCampaignStatistics($campaign_id, $run_id);
    }
    return $count;
  }
}
