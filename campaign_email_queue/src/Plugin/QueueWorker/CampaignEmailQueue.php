<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\Plugin\QueueWorker;

use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Drupal\campaign_email_queue\Service\CampaignProcessingState;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Legacy queue name "campaign_email_queue" — routes items to per-campaign queues.
 *
 * Recipient data must live in campaign_email_queue_{nid}. This worker only
 * relocates or triggers background sending; it does not send with unsafe data.
 *
 * @QueueWorker(
 *   id = "campaign_email_queue",
 *   title = @Translation("Campaign email queue (legacy name)")
 * )
 */
final class CampaignEmailQueue extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    private readonly CampaignEmailQueueService $queueService,
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
      $container->get('campaign_email_queue.processing_state'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data): void {
    if (!is_array($data)) {
      \Drupal::logger('campaign_email_queue')->warning('Skipped legacy queue item: expected array, got @type.', [
        '@type' => get_debug_type($data),
      ]);
      return;
    }

    $campaign_id = (int) ($data['campaign_id'] ?? 0);
    if ($campaign_id <= 0) {
      \Drupal::logger('campaign_email_queue')->warning('Skipped legacy queue item: missing campaign_id.');
      return;
    }

    $node = \Drupal::entityTypeManager()->getStorage('node')->load($campaign_id);
    if (!$node instanceof NodeInterface || $node->bundle() !== 'campaign') {
      \Drupal::logger('campaign_email_queue')->warning('Skipped legacy queue item: campaign @id not found.', [
        '@id' => $campaign_id,
      ]);
      return;
    }

    if ($node->hasField('field_queue_paused') && !$node->get('field_queue_paused')->isEmpty()) {
      if ((bool) $node->get('field_queue_paused')->value) {
        return;
      }
    }

    $email = isset($data['email']) ? trim((string) $data['email']) : '';

    if ($email === '') {
      $this->processingState->mark($campaign_id);
      $this->queueService->startBackgroundSending($campaign_id);
      return;
    }

    $this->queueService->enqueueLegacyItem($campaign_id, $data);
    if (!$this->processingState->isActive($campaign_id)) {
      $this->processingState->mark($campaign_id);
      $this->queueService->startBackgroundSending($campaign_id);
    }
  }

}
