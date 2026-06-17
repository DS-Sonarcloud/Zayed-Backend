<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\Service;

use Drupal\Core\State\StateInterface;

/**
 * Throttled background sending without Drush (dashboard + admin keep-alive).
 */
final class CampaignSendKeepAlive {

  private const STATE_LAST_DRAIN = 'campaign_email_queue.last_keepalive_drain';

  public function __construct(
    private readonly CampaignEmailQueueService $queueService,
    private readonly CampaignProcessingState $processingState,
    private readonly StateInterface $state,
  ) {}

  /**
   * Run a short send burst if campaigns are active and interval elapsed.
   *
   * @return array{drained: bool, seconds: int, active_campaigns: list<int>}
   */
  public function tick(bool $force = FALSE): array {
    $active = $this->processingState->getActiveCampaignIds();
    if ($active === []) {
      return ['drained' => FALSE, 'seconds' => 0, 'active_campaigns' => []];
    }

    $settings = $this->queueService->getSettings();
    $min_interval = $force
      ? (int) ($settings['poll_drain_min_interval'] ?? 3)
      : $settings['keepalive_min_interval'];
    $now = \Drupal::time()->getRequestTime();
    $last = (int) $this->state->get(self::STATE_LAST_DRAIN, 0);

    if (!$force && ($now - $last) < $min_interval) {
      return ['drained' => FALSE, 'seconds' => 0, 'active_campaigns' => $active];
    }

    $this->state->set(self::STATE_LAST_DRAIN, $now);
    $seconds = $settings['keepalive_drain_seconds'];
    $this->queueService->prepareBackgroundSendingContext();

    foreach ($active as $campaign_id) {
      $this->queueService->ensureBackgroundSending((int) $campaign_id);
    }
    $this->queueService->drainBackgroundSendQueue($seconds);

    return ['drained' => TRUE, 'seconds' => $seconds, 'active_campaigns' => $active];
  }

}
