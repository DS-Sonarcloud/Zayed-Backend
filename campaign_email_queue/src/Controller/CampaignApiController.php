<?php

namespace Drupal\campaign_email_queue\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\campaign_email_queue\Service\CampaignEmailLogService;
use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;

/**
 * API Controller for campaign status.
 */
class CampaignApiController extends ControllerBase
{

  protected CampaignEmailLogService $logService;
  protected CampaignEmailQueueService $queueService;

  public function __construct(CampaignEmailLogService $logService, CampaignEmailQueueService $queueService)
  {
    $this->logService = $logService;
    $this->queueService = $queueService;
  }

  public static function create(ContainerInterface $container): static
  {
    return new static(
      $container->get('campaign_email_queue.log'),
      $container->get('campaign_email_queue.queue')
    );
  }

  /**
   * Get real-time status for a specific campaign.
   *
   * @param int $campaign_id
   *   The campaign node ID.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with campaign status.
   */
  public function getCampaignStatus(int $campaign_id): JsonResponse
  {
    $status = $this->logService->getRealTimeStatus($campaign_id);
    $queue_count = $this->queueService->getQueueCount($campaign_id);

    $response = [
      'success' => TRUE,
      'campaign_id' => $campaign_id,
      'status' => $status['status'],
      'progress' => $status['progress'],
      'statistics' => [
        'total' => $status['total'],
        'sent' => $status['sent'],
        'failed' => $status['failed'],
        'pending' => $status['pending'],
        'error' => $status['error'],
      ],
      'queue_count' => $queue_count,
      'timestamps' => [
        'started' => $status['started_time'],
        'completed' => $status['completed_time'],
        'last_updated' => $status['last_updated'],
      ],
      'performance' => [
        'avg_processing_time' => $status['avg_processing_time'],
      ],
    ];

    return new JsonResponse($response);
  }

  /**
   * Get status for all campaigns.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with all campaign statuses.
   */
  public function getAllCampaignsStatus(): JsonResponse
  {
    $all_stats = $this->logService->getAllCampaignStatistics();
    $campaigns = [];

    foreach ($all_stats as $stat) {
      $campaign_id = $stat->campaign_id;
      $status = $this->logService->getRealTimeStatus($campaign_id);
      $queue_count = $this->queueService->getQueueCount($campaign_id);

      $node = \Drupal::entityTypeManager()->getStorage('node')->load($campaign_id);
      $title = $node ? $node->getTitle() : "Campaign #{$campaign_id}";

      $campaigns[] = [
        'campaign_id' => $campaign_id,
        'title' => $title,
        'status' => $status['status'],
        'progress' => $status['progress'],
        'statistics' => [
          'total' => $status['total'],
          'sent' => $status['sent'],
          'failed' => $status['failed'],
          'pending' => $status['pending'],
          'error' => $status['error'],
        ],
        'queue_count' => $queue_count,
        'last_updated' => $status['last_updated'],
      ];
    }

    $response = [
      'success' => TRUE,
      'total_campaigns' => count($campaigns),
      'campaigns' => $campaigns,
      'timestamp' => \Drupal::time()->getRequestTime(),
    ];

    return new JsonResponse($response);
  }

  /**
   * Get detailed email logs for a campaign.
   *
   * @param int $campaign_id
   *   The campaign node ID.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with email logs.
   */
  public function getCampaignLogs(int $campaign_id): JsonResponse
  {
    $logs = $this->logService->getCampaignEmailLogs($campaign_id, 100);
    $formatted_logs = [];

    foreach ($logs as $log) {
      $formatted_logs[] = [
        'id' => $log->id,
        'email' => $log->email,
        'status' => $log->status,
        'attempts' => $log->attempts,
        'error_message' => $log->error_message,
        'queued_time' => $log->queued_time,
        'sent_time' => $log->sent_time,
        'processing_time' => $log->processing_time,
      ];
    }

    $response = [
      'success' => TRUE,
      'campaign_id' => $campaign_id,
      'total_logs' => count($formatted_logs),
      'logs' => $formatted_logs,
    ];

    return new JsonResponse($response);
  }

  /**
   * Get aggregated statistics across all campaigns.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   JSON response with aggregated statistics.
   */
  public function getAggregatedStatistics(): JsonResponse
  {
    $all_stats = $this->logService->getAllCampaignStatistics();

    $totals = [
      'total_campaigns' => count($all_stats),
      'total_emails' => 0,
      'total_sent' => 0,
      'total_failed' => 0,
      'total_pending' => 0,
      'total_error' => 0,
    ];

    $status_breakdown = [
      'completed' => 0,
      'in_progress' => 0,
      'pending' => 0,
      'not_started' => 0,
    ];

    foreach ($all_stats as $stat) {
      $totals['total_emails'] += $stat->total_emails;
      $totals['total_sent'] += $stat->sent_count;
      $totals['total_failed'] += $stat->failed_count;
      $totals['total_pending'] += $stat->pending_count;
      $totals['total_error'] += $stat->error_count;

      if ($stat->pending_count == 0 && $stat->total_emails > 0) {
        $status_breakdown['completed']++;
      } elseif ($stat->sent_count > 0 || $stat->failed_count > 0) {
        $status_breakdown['in_progress']++;
      } elseif ($stat->total_emails > 0) {
        $status_breakdown['pending']++;
      } else {
        $status_breakdown['not_started']++;
      }
    }

    $success_rate = $totals['total_emails'] > 0
      ? round(($totals['total_sent'] / $totals['total_emails']) * 100, 2)
      : 0;

    $response = [
      'success' => TRUE,
      'totals' => $totals,
      'status_breakdown' => $status_breakdown,
      'success_rate' => $success_rate,
      'timestamp' => \Drupal::time()->getRequestTime(),
    ];

    return new JsonResponse($response);
  }
}
