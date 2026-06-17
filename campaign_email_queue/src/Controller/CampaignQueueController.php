<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\Controller;

use Drupal\campaign_email_queue\EventSubscriber\CampaignEmailQueueSubscriber;
use Drupal\campaign_email_queue\Service\CampaignEmailLogService;
use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\State\StateInterface;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Campaign queue control (Process, Clear, Re-run).
 */
class CampaignQueueController extends ControllerBase {

  public function __construct(
    protected QueueFactory $queueFactory,
    protected CampaignEmailQueueService $campaignQueueService,
    protected CampaignEmailLogService $logService,
    protected StateInterface $state,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('queue'),
      $container->get('campaign_email_queue.queue'),
      $container->get('campaign_email_queue.log'),
      $container->get('state'),
    );
  }

  public function processQueue(NodeInterface $node) {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'manage')) {
      $this->messenger()->addError($this->t('You do not have permission to process the queue for this campaign.'));
      return $this->redirect('campaign_email_queue.dashboard');
    }
    $this->campaignQueueService->startBackgroundSending((int) $node->id());
    $this->messenger()->addStatus($this->t('Campaign sending started in the background.'));
    return $this->redirect('campaign_email_queue.dashboard');
  }

  public function clearQueue(NodeInterface $node) {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'manage')) {
      $this->messenger()->addError($this->t('You do not have permission to clear the queue for this campaign.'));
      return $this->redirect('campaign_email_queue.dashboard');
    }
    $this->clearCampaignQueue((int) $node->id());
    $this->campaignQueueService->stopBackgroundSending((int) $node->id());
    $this->messenger()->addMessage($this->t('Cleared the queue for campaign @id.', ['@id' => $node->id()]));
    return $this->redirect('campaign_email_queue.dashboard');
  }

  public function togglePause(NodeInterface $node) {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'manage')) {
      $this->messenger()->addError($this->t('You do not have permission to pause/resume this campaign.'));
      return $this->redirect('campaign_email_queue.dashboard');
    }
    $paused = (bool) $node->get('field_queue_paused')->value;
    $node->set('field_queue_paused', !$paused);
    $node->save();
    if (!$paused) {
      $this->campaignQueueService->stopBackgroundSending((int) $node->id());
    }
    $msg = $paused ? 'resumed' : 'paused';
    $this->messenger()->addMessage($this->t('Queue has been @msg for campaign @id.', ['@msg' => $msg, '@id' => $node->id()]));
    return $this->redirect('campaign_email_queue.dashboard');
  }

  public function rerunCampaign(NodeInterface $node) {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'manage')) {
      $this->messenger()->addError($this->t('You do not have permission to re-run this campaign.'));
      return $this->redirect('campaign_email_queue.dashboard');
    }
    $campaign_id = (int) $node->id();
    $this->campaignQueueService->stopBackgroundSending($campaign_id);
    $run_id = $this->logService->logRerun($campaign_id, (int) $this->currentUser()->id());
    $this->campaignQueueService->deleteQueueForCampaign($campaign_id, FALSE);
    $this->campaignQueueService->initializeQueueForCampaign($node, $run_id);
    $this->messenger()->addMessage($this->t('Campaign @id re-initialized (Run #@run). Queue: @count', [
      '@id' => $campaign_id,
      '@run' => $run_id,
      '@count' => $this->campaignQueueService->getQueueCount($campaign_id),
    ]));
    return $this->redirect('campaign_email_queue.dashboard');
  }

  /**
   * Start background sending (returns immediately).
   */
  public function ajaxProcessQueue(NodeInterface $node): JsonResponse {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'manage')) {
      return new JsonResponse(['error' => 'Access denied'], 403);
    }

    $campaign_id = (int) $node->id();

    if ($node->get('field_queue_paused')->value) {
      return new JsonResponse([
        'error' => (string) $this->t('Campaign is paused. Please resume first.'),
        'status' => 'paused',
      ], 409);
    }

    if (!$node->get('field_scheduled_time')->isEmpty()) {
      $scheduled_time = (int) $node->get('field_scheduled_time')->value;
      if ($scheduled_time > \Drupal::time()->getRequestTime()) {
        $formatted_time = \Drupal::service('date.formatter')->format($scheduled_time, 'medium');
        return new JsonResponse([
          'error' => (string) $this->t('Campaign is scheduled for @time.', ['@time' => $formatted_time]),
          'status' => 'scheduled',
        ], 409);
      }
    }

    if ($this->campaignQueueService->getQueueCount($campaign_id) === 0) {
      $counts = $this->logService->getLogStatusCounts($campaign_id);
      if ($counts['pending'] === 0) {
        return new JsonResponse([
          'error' => (string) $this->t('No pending emails in queue.'),
          'status' => 'empty',
        ], 409);
      }
    }

    $settings = $this->campaignQueueService->getSettings();
    $this->campaignQueueService->startBackgroundSending($campaign_id);
    CampaignEmailQueueSubscriber::requestShutdownDrain($this->state, $settings['shutdown_drain_seconds']);

    return new JsonResponse($this->campaignQueueService->getDashboardStatus($campaign_id));
  }

  public function ajaxStatus(NodeInterface $node): JsonResponse {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'view')) {
      return new JsonResponse(['error' => 'Access denied'], 403);
    }
    return new JsonResponse($this->campaignQueueService->getDashboardStatus((int) $node->id()));
  }

  public function ajaxClearQueue(NodeInterface $node): JsonResponse {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'manage')) {
      return new JsonResponse(['error' => 'Access denied'], 403);
    }
    $campaign_id = (int) $node->id();
    $this->clearCampaignQueue($campaign_id);
    $this->campaignQueueService->stopBackgroundSending($campaign_id);
    return new JsonResponse($this->campaignQueueService->getDashboardStatus($campaign_id));
  }

  public function ajaxRerunCampaign(NodeInterface $node): JsonResponse {
    if (!$this->campaignQueueService->checkCampaignAccess($node, $this->currentUser(), 'manage')) {
      return new JsonResponse(['error' => 'Access denied'], 403);
    }
    $campaign_id = (int) $node->id();
    $this->campaignQueueService->stopBackgroundSending($campaign_id);
    $run_id = $this->logService->logRerun($campaign_id, (int) $this->currentUser()->id());
    $this->campaignQueueService->deleteQueueForCampaign($campaign_id, FALSE);
    $this->campaignQueueService->initializeQueueForCampaign($node, $run_id);
    $status = $this->campaignQueueService->getDashboardStatus($campaign_id);
    $status['run_id'] = $run_id;
    return new JsonResponse($status);
  }

  private function clearCampaignQueue(int $campaign_id): void {
    $queue = $this->queueFactory->get('campaign_email_queue_' . $campaign_id);
    while ($item = $queue->claimItem(1)) {
      $queue->deleteItem($item);
    }
  }

}
