<?php

namespace Drupal\event_calendar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\event_calendar\Service\EventNotificationQueueService;

/**
 * Controller for notification status polling.
 */
class EventNotificationStatusController extends ControllerBase
{

    protected $queueService;

    public function __construct(EventNotificationQueueService $queue_service)
    {
        $this->queueService = $queue_service;
    }

    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('event_calendar.notification_queue')
        );
    }

    /**
     * Get batch status for AJAX polling.
     */
    public function getStatus($batch_id)
    {
        $status = $this->queueService->getBatchStatus($batch_id);

        if (!$status) {
            return new JsonResponse(['error' => 'Batch not found'], 404);
        }

        return new JsonResponse($status);
    }

    /**
     * Process a chunk for a specific batch.
     */
    public function processBatch($batch_id)
    {
        $processed = $this->queueService->processBatch($batch_id, 100);

        // Return updated status.
        $status = $this->queueService->getBatchStatus($batch_id);

        if (!$status) {
            return new JsonResponse(['error' => 'Batch not found'], 404);
        }

        $status['processed_in_this_step'] = $processed;

        return new JsonResponse($status);
    }
}
