<?php

namespace Drupal\zu_personalization\Service;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Database\Connection;

/**
 * Persists inferred user persona/profile signals.
 */
final class ProfileIngestor {

  public function __construct(
    private readonly Connection $database,
    private readonly TimeInterface $time,
  ) {}

  /**
   * @param array<string, mixed> $attributes
   */
  public function upsertPersona(int $uid, string $persona_type, array $attributes = [], float $confidence = 0.6): void {
    if ($uid <= 0 || $persona_type === '') {
      return;
    }

    // Atomic upsert keyed on uid_type (uid, persona_type). The old SELECT +
    // INSERT pattern caused duplicate-key errors under concurrent requests.
    $this->database->upsert('zu_user_persona')
      ->key('uid_type')
      ->fields([
        'uid'              => $uid,
        'public_user_id'   => 0,
        'persona_type'     => $persona_type,
        'attributes'       => json_encode($attributes, JSON_UNESCAPED_UNICODE),
        'confidence_score' => $confidence,
        'updated'          => $this->time->getRequestTime(),
      ])
      ->execute();
  }

}
