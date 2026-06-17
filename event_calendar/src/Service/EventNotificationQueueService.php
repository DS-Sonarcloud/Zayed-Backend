<?php

namespace Drupal\event_calendar\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\event_calendar\Service\FcmNotificationService;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;

/**
 * Service for managing event notification queue.
 */
class EventNotificationQueueService
{

    protected $database;
    protected $logger;
    protected $currentUser;
    protected $fcmService;
    protected $mailManager;
    protected $languageManager;

    public function __construct(
        Connection $database,
        LoggerChannelFactoryInterface $logger_factory,
        AccountProxyInterface $current_user,
        FcmNotificationService $fcm_service,
        MailManagerInterface $mail_manager,
        LanguageManagerInterface $language_manager
    ) {
        $this->database = $database;
        $this->logger = $logger_factory->get('event_calendar');
        $this->currentUser = $current_user;
        $this->fcmService = $fcm_service;
        $this->mailManager = $mail_manager;
        $this->languageManager = $language_manager;
    }

    /**
     * Create a new notification batch.
     */
    public function createBatch($event_id, $message, array $emails, array $fcm_tokens)
    {
        $time = time();
        $uid = $this->currentUser->id();

        // Create batch record
        $batch_id = $this->database->insert('event_notification_batch')
            ->fields([
                'event_id' => $event_id,
                'message' => $message,
                'total_count' => count($emails) + count($fcm_tokens),
                'sent_count' => 0,
                'failed_count' => 0,
                'status' => 'queued',
                'created_by' => $uid,
                'created_time' => $time,
            ])
            ->execute();

        // Queue email notifications
        foreach ($emails as $email) {
            $this->database->insert('event_notification_queue')
                ->fields([
                    'batch_id' => $batch_id,
                    'recipient_type' => 'email',
                    'recipient_value' => $email,
                    'event_id' => $event_id,
                    'message' => $message,
                    'status' => 'pending',
                    'attempts' => 0,
                    'queued_time' => $time,
                ])
                ->execute();
        }

        // Queue FCM notifications
        foreach ($fcm_tokens as $token) {
            $this->database->insert('event_notification_queue')
                ->fields([
                    'batch_id' => $batch_id,
                    'recipient_type' => 'fcm',
                    'recipient_value' => $token,
                    'event_id' => $event_id,
                    'message' => $message,
                    'status' => 'pending',
                    'attempts' => 0,
                    'queued_time' => $time,
                ])
                ->execute();
        }

        // Log batch creation
        $this->logAction($batch_id, NULL, 'queued', "Batch created with " . (count($emails) + count($fcm_tokens)) . " notifications");

        return $batch_id;
    }

    /**
     * Process pending queue items for a batch.
     */
    public function processBatch($batch_id, $limit = 100)
    {
        // Check if batch is already completed to avoid unnecessary locking
        $batch = $this->database->select('event_notification_batch', 'b')
            ->fields('b', ['status'])
            ->condition('batch_id', $batch_id)
            ->execute()
            ->fetchObject();

        if (!$batch || $batch->status === 'completed') {
            return 0;
        }

        // Try to acquire lock
        if (!$this->acquireLock($batch_id)) {
            //$this->logger->warning('Batch @batch_id is locked, skipping', ['@batch_id' => $batch_id]);
            return 0;
        }

        try {
            // Update batch status to processing
            $this->database->update('event_notification_batch')
                ->fields([
                    'status' => 'processing',
                    'started_time' => time(),
                ])
                ->condition('batch_id', $batch_id)
                ->execute();

            // Get pending items
            $items = $this->database->select('event_notification_queue', 'q')
                ->fields('q')
                ->condition('batch_id', $batch_id)
                ->condition('status', 'pending')
                ->condition('attempts', 3, '<')
                ->range(0, $limit)
                ->execute()
                ->fetchAll();

            $processed = 0;
            $fcm_items = [];

            foreach ($items as $item) {
                if ($item->recipient_type === 'fcm') {
                    $fcm_items[] = $item;
                } else {
                    $this->processQueueItem($item);
                }
                $processed++;
            }

            if (!empty($fcm_items)) {
                $this->processFcmBulk($fcm_items);
            }

            // Check if batch is complete
            $this->checkBatchCompletion($batch_id);
        } finally {
            $this->releaseLock($batch_id);
        }

        return $processed;
    }

    /**
     * Process a single queue item.
     */
    protected function processQueueItem($item)
    {
        $success = FALSE;
        $error_message = NULL;

        try {
            if ($item->recipient_type === 'email') {
                $success = $this->sendEmail($item);
            } elseif ($item->recipient_type === 'fcm') {
                $success = $this->sendFcm($item);
            }
        } catch (\Exception $e) {
            $error_message = $e->getMessage();
            $this->logger->error('Queue item @id failed: @msg', [
                '@id' => $item->id,
                '@msg' => $error_message,
            ]);
        }

        // Update queue item
        $update = [
            'attempts' => $item->attempts + 1,
        ];

        if ($success) {
            $update['status'] = 'sent';
            $update['sent_time'] = time();

            // Update batch sent count
            $this->database->update('event_notification_batch')
                ->expression('sent_count', 'sent_count + 1')
                ->condition('batch_id', $item->batch_id)
                ->execute();

            $this->logAction($item->batch_id, $item->id, 'sent', 'Notification sent successfully');
        } else {
            if ($item->attempts + 1 >= 3) {
                $update['status'] = 'failed';
                $update['error_message'] = $error_message ?: 'Unknown error';

                // Update batch failed count
                $this->database->update('event_notification_batch')
                    ->expression('failed_count', 'failed_count + 1')
                    ->condition('batch_id', $item->batch_id)
                    ->execute();

                $this->logAction($item->batch_id, $item->id, 'failed', $error_message ?: 'Max attempts reached');
            } else {
                $this->logAction($item->batch_id, $item->id, 'retry', "Attempt " . ($item->attempts + 1) . " failed: " . ($error_message ?: 'Unknown error'));
            }
        }

        $this->database->update('event_notification_queue')
            ->fields($update)
            ->condition('id', $item->id)
            ->execute();
    }

    /**
     * Send email notification.
     */
    protected function sendEmail($item)
    {
        $langcode = $this->languageManager->getDefaultLanguage()->getId();
        $event = \Drupal\node\Entity\Node::load($item->event_id);

        $params = [
            'subject' => 'Event Notification: ' . ($event ? $event->getTitle() : 'Event'),
            'message' => $item->message,
        ];

        $result = $this->mailManager->mail(
            'event_calendar',
            'manual_event_notification',
            $item->recipient_value,
            $langcode,
            $params
        );

        return !empty($result['result']);
    }

    /**
     * Send FCM notification.
     */
    protected function sendFcm($item)
    {
        $event = \Drupal\node\Entity\Node::load($item->event_id);
        $title = $event ? $event->getTitle() : 'Event Notification';

        try {
            $this->fcmService->sendFcmNotifications([$item->recipient_value], $title, $item->message);
            return TRUE;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Acquire lock for batch processing.
     */
    protected function acquireLock($batch_id)
    {
        $lock_timeout = 300;
        $current_time = time();

        // Try to acquire lock
        $affected = $this->database->update('event_notification_batch')
            ->fields(['lock_time' => $current_time])
            ->condition('batch_id', $batch_id)
            ->condition(
                $this->database->condition('OR')
                    ->isNull('lock_time')
                    ->condition('lock_time', $current_time - $lock_timeout, '<')
            )
            ->execute();

        return $affected > 0;
    }

    /**
     * Release lock for batch.
     */
    protected function releaseLock($batch_id)
    {
        $this->database->update('event_notification_batch')
            ->fields(['lock_time' => NULL])
            ->condition('batch_id', $batch_id)
            ->execute();
    }

    /**
     * Check if batch is complete and update status.
     */
    protected function checkBatchCompletion($batch_id)
    {
        $pending_count = $this->database->select('event_notification_queue', 'q')
            ->condition('batch_id', $batch_id)
            ->condition('status', 'pending')
            ->condition('attempts', 3, '<')
            ->countQuery()
            ->execute()
            ->fetchField();

        if ($pending_count == 0) {
            $this->database->update('event_notification_batch')
                ->fields([
                    'status' => 'completed',
                    'completed_time' => time(),
                ])
                ->condition('batch_id', $batch_id)
                ->execute();

            $this->logAction($batch_id, NULL, 'completed', 'Batch processing completed');
        }
    }

    /**
     * Get batch status for AJAX polling.
     */
    public function getBatchStatus($batch_id)
    {
        $batch = $this->database->select('event_notification_batch', 'b')
            ->fields('b')
            ->condition('batch_id', $batch_id)
            ->execute()
            ->fetchObject();

        if (!$batch) {
            return NULL;
        }

        $progress_percent = $batch->total_count > 0
            ? round((($batch->sent_count + $batch->failed_count) / $batch->total_count) * 100, 2)
            : 0;

        return [
            'batch_id' => $batch->batch_id,
            'total' => $batch->total_count,
            'sent' => $batch->sent_count,
            'failed' => $batch->failed_count,
            'pending' => $batch->total_count - $batch->sent_count - $batch->failed_count,
            'status' => $batch->status,
            'progress_percent' => $progress_percent,
        ];
    }

    /**
     * Log an action.
     */
    protected function logAction($batch_id, $queue_id, $action, $details)
    {
        $this->database->insert('event_notification_log')
            ->fields([
                'batch_id' => $batch_id,
                'queue_id' => $queue_id,
                'action' => $action,
                'details' => $details,
                'timestamp' => time(),
            ])
            ->execute();
    }

    /**
     * Process all pending batches (called by cron).
     */
    public function processAllPendingBatches($items_per_batch = 100)
    {
        $batches = $this->database->select('event_notification_batch', 'b')
            ->fields('b', ['batch_id'])
            ->condition('status', ['queued', 'processing'], 'IN')
            ->execute()
            ->fetchCol();

        $total_processed = 0;
        foreach ($batches as $batch_id) {
            $processed = $this->processBatch($batch_id, $items_per_batch);
            $total_processed += $processed;
        }

        return $total_processed;
    }

    /**
     * Process FCM items in bulk.
     */
    protected function processFcmBulk(array $items)
    {
        if (empty($items))
            return;

        $tokens = [];
        $item_ids = [];
        $first_item = reset($items);

        foreach ($items as $item) {
            $tokens[] = $item->recipient_value;
            $item_ids[] = $item->id;
        }

        $event = \Drupal\node\Entity\Node::load($first_item->event_id);
        $title = $event ? $event->getTitle() : 'Event Notification';

        try {
            // Authenticates once for all tokens in this chunk
            $this->fcmService->sendFcmNotifications($tokens, $title, $first_item->message);

            // Update all as sent
            $time = time();
            $this->database->update('event_notification_queue')
                ->fields([
                    'status' => 'sent',
                    'sent_time' => $time,
                    'attempts' => 1,
                ])
                ->condition('id', $item_ids, 'IN')
                ->execute();

            // Update batch count
            $this->database->update('event_notification_batch')
                ->expression('sent_count', 'sent_count + ' . count($items))
                ->condition('batch_id', $first_item->batch_id)
                ->execute();

            foreach ($item_ids as $id) {
                $this->logAction($first_item->batch_id, $id, 'sent', 'Notification sent successfully (bulk)');
            }

        } catch (\Exception $e) {
            $this->logger->error('Bulk FCM failed for batch @bid: @msg', [
                '@bid' => $first_item->batch_id,
                '@msg' => $e->getMessage()
            ]);

            // Mark all in this chunk as failed/retry
            foreach ($items as $item) {
                $update = ['attempts' => $item->attempts + 1];
                if ($update['attempts'] >= 3) {
                    $update['status'] = 'failed';
                    $update['error_message'] = $e->getMessage();

                    $this->database->update('event_notification_batch')
                        ->expression('failed_count', 'failed_count + 1')
                        ->condition('batch_id', $item->batch_id)
                        ->execute();
                }

                $this->database->update('event_notification_queue')
                    ->fields($update)
                    ->condition('id', $item->id)
                    ->execute();
            }
        }
    }
}
