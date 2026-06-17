<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\Plugin\QueueWorker;

use Drupal\campaign_email_queue\Service\CampaignEmailLogService;
use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Drupal\campaign_email_queue\Service\CampaignProcessingState;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Sends campaign emails in the background (cron + queue workers).
 *
 * @QueueWorker(
 *   id = "campaign_email_queue_send",
 *   title = @Translation("Campaign email background send"),
 *   cron = {"time" = 55}
 * )
 */
final class CampaignSendQueueWorker extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private readonly CampaignEmailQueueService $queueService,
    private readonly CampaignEmailLogService $logService,
    private readonly CampaignProcessingState $processingState,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('campaign_email_queue.queue'),
      $container->get('campaign_email_queue.log'),
      $container->get('campaign_email_queue.processing_state'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data): void {
    $campaign_id = (int) ($data['campaign_id'] ?? 0);
    if ($campaign_id <= 0) {
      return;
    }

    if (!$this->processingState->isActive($campaign_id)) {
      return;
    }

    $node = \Drupal::entityTypeManager()->getStorage('node')->load($campaign_id);
    if (!$node instanceof NodeInterface) {
      $this->processingState->clear($campaign_id);
      return;
    }

    if ($node->hasField('field_queue_paused') && !empty($node->get('field_queue_paused')->value)) {
      return;
    }

    $lock_name = 'campaign_email_queue_send_' . $campaign_id;
    if (!\Drupal::lock()->acquire($lock_name, 120)) {
      $this->queueService->startBackgroundSending($campaign_id);
      return;
    }

    try {
      $settings = $this->queueService->getSettings();
      $this->queueService->processCampaignQueue($campaign_id, $settings['cron_batch_size'], TRUE);

      $remaining = $this->queueService->getQueueCount($campaign_id);
      $counts = $this->logService->getLogStatusCounts($campaign_id);

      if ($remaining > 0 || $counts['pending'] > 0) {
        $this->queueService->startBackgroundSending($campaign_id);
      }
      else {
        $this->processingState->clear($campaign_id);
      }
    }
    finally {
      \Drupal::lock()->release($lock_name);
    }
  }

}
