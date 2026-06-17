<?php

namespace Drupal\campaign_email_queue\Plugin\QueueWorker;

use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @QueueWorker(
 *   id = "campaign_email_queue_worker",
 *   title = @Translation("Campaign Email Queue Worker"),
 *   cron = {"time" = 60}
 * )
 */
class CampaignEmailQueueWorker extends QueueWorkerBase implements ContainerFactoryPluginInterface
{
  protected CampaignEmailQueueService $campaignQueueService;

  /**
   * Proper constructor for a container factory plugin.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, CampaignEmailQueueService $campaignQueueService)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->campaignQueueService = $campaignQueueService;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static
  {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('campaign_email_queue.queue')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data): void {
    if (!is_array($data) || empty($data['campaign_id'])) {
      return;
    }
    $this->campaignQueueService->startBackgroundSending((int) $data['campaign_id']);
  }
}
