<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\Service;

use Drupal\Core\State\StateInterface;

/**
 * Tracks campaigns explicitly started for sending (Process or schedule).
 */
final class CampaignProcessingState {

  private const STATE_KEY = 'campaign_email_queue.background_active';

  public function __construct(
    private readonly StateInterface $state,
  ) {}

  public function mark(int $campaign_id, ?int $run_id = NULL): void {
    $active = $this->loadActive();
    $active[$campaign_id] = [
      'started' => \Drupal::time()->getRequestTime(),
      'run_id' => $run_id ?? ($active[$campaign_id]['run_id'] ?? 0),
    ];
    $this->state->set(self::STATE_KEY, $active);
  }

  public function isActive(int $campaign_id): bool {
    return isset($this->loadActive()[$campaign_id]);
  }

  public function getRunId(int $campaign_id): ?int {
    $entry = $this->loadActive()[$campaign_id] ?? NULL;
    if (!is_array($entry)) {
      return NULL;
    }
    $run_id = (int) ($entry['run_id'] ?? 0);
    return $run_id > 0 ? $run_id : NULL;
  }

  /**
   * @return list<int>
   */
  public function getActiveCampaignIds(): array {
    return array_map('intval', array_keys($this->loadActive()));
  }

  public function clear(int $campaign_id): void {
    $active = $this->loadActive();
    unset($active[$campaign_id]);
    if ($active === []) {
      $this->state->delete(self::STATE_KEY);
    }
    else {
      $this->state->set(self::STATE_KEY, $active);
    }
  }

  /**
   * @return array<int, array{started: int, run_id: int}>
   */
  private function loadActive(): array {
    $value = $this->state->get(self::STATE_KEY, []);
    if (!is_array($value)) {
      return [];
    }

    $normalized = [];
    foreach ($value as $campaign_id => $entry) {
      $campaign_id = (int) $campaign_id;
      if ($campaign_id <= 0) {
        continue;
      }
      if (is_int($entry)) {
        $normalized[$campaign_id] = ['started' => $entry, 'run_id' => 0];
        continue;
      }
      if (is_array($entry)) {
        $normalized[$campaign_id] = [
          'started' => (int) ($entry['started'] ?? 0),
          'run_id' => (int) ($entry['run_id'] ?? 0),
        ];
      }
    }
    return $normalized;
  }

}
