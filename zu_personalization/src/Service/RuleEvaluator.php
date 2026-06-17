<?php

namespace Drupal\zu_personalization\Service;

use Drupal\Core\Database\Connection;

/**
 * Evaluates personalization rules against request context.
 */
final class RuleEvaluator {

  public function __construct(
    private readonly Connection $database,
  ) {}

  /**
   * @param array<string, mixed> $context
   * @param array<string, mixed> $filters
   *
   * @return list<array<string, mixed>>
   */
  public function evaluate(array $context, array $filters = []): array {
    $rows = $this->database->select('zu_personalization_rule', 'r')
      ->fields('r', ['id', 'name', 'rule_type', 'conditions', 'priority'])
      ->condition('status', 1)
      ->orderBy('priority', 'DESC')
      ->execute()
      ->fetchAllAssoc('id');

    $matched = [];
    foreach ($rows as $row) {
      $conditions = json_decode((string) ($row->conditions ?? '{}'), TRUE);
      if (!is_array($conditions)) {
        $conditions = [];
      }
      if ($this->matches($conditions, $context, $filters)) {
        $matched[] = [
          'id' => (int) $row->id,
          'name' => (string) $row->name,
          'type' => (string) $row->rule_type,
          'priority' => (int) $row->priority,
          'conditions' => $conditions,
        ];
      }
    }
    return $matched;
  }

  /**
   * Returns TRUE only when every condition in the rule matches the context.
   *
   * Each condition type is delegated to a single-purpose helper so this
   * method stays at cognitive complexity 1 with a single return point.
   *
   * @param array<string, mixed> $conditions
   * @param array<string, mixed> $context
   * @param array<string, mixed> $filters
   */
  private function matches(array $conditions, array $context, array $filters): bool {
    return $this->check_persona($conditions, $context)
      && $this->check_roles($conditions, $context)
      && $this->check_devices($conditions, $context)
      && $this->check_geo_countries($conditions, $context)
      && $this->check_geo_cities($conditions, $context)
      && $this->check_langcodes($conditions, $context)
      && $this->check_site($conditions, $context)
      && $this->check_departments($conditions, $context)
      && $this->check_content_types($conditions, $context, $filters);
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_persona(array $conditions, array $ctx): bool {
    return !isset($conditions['persona'])
      || (string) $conditions['persona'] === (string) ($ctx['persona'] ?? '');
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_roles(array $conditions, array $ctx): bool {
    return empty($conditions['roles'])
      || !empty(array_intersect((array) $conditions['roles'], (array) ($ctx['roles'] ?? [])));
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_devices(array $conditions, array $ctx): bool {
    return empty($conditions['devices'])
      || in_array((string) ($ctx['device'] ?? 'desktop'), (array) $conditions['devices'], TRUE);
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_geo_countries(array $conditions, array $ctx): bool {
    if (empty($conditions['countries'])) {
      return TRUE;
    }
    $visitor = strtoupper((string) (($ctx['geo'] ?? [])['country'] ?? ''));
    $allowed = array_map('strtoupper', (array) $conditions['countries']);
    return $visitor !== '' && in_array($visitor, $allowed, TRUE);
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_geo_cities(array $conditions, array $ctx): bool {
    if (empty($conditions['cities'])) {
      return TRUE;
    }
    $visitor = strtolower((string) (($ctx['geo'] ?? [])['city'] ?? ''));
    $lower   = array_map('strtolower', (array) $conditions['cities']);
    return !empty(array_filter($lower, static fn(string $c) => str_contains($visitor, $c)));
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_langcodes(array $conditions, array $ctx): bool {
    $lang = (string) ($ctx['langcode'] ?? '');
    if (!empty($conditions['langcodes']) && !in_array($lang, (array) $conditions['langcodes'], TRUE)) {
      return FALSE;
    }
    return !isset($conditions['langcode']) || (string) $conditions['langcode'] === $lang;
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_site(array $conditions, array $ctx): bool {
    return !isset($conditions['site_id'])
      || (string) $conditions['site_id'] === (string) ($ctx['site_id'] ?? '');
  }

  /** @param array<string, mixed> $conditions @param array<string, mixed> $ctx */
  private function check_departments(array $conditions, array $ctx): bool {
    if (empty($conditions['department_ids'])) {
      return TRUE;
    }
    $ctx_depts  = array_map('intval', (array) ($ctx['department_ids'] ?? []));
    $rule_depts = array_map('intval', (array) $conditions['department_ids']);
    return !empty(array_intersect($ctx_depts, $rule_depts));
  }

  /**
   * @param array<string, mixed> $conditions
   * @param array<string, mixed> $ctx
   * @param array<string, mixed> $filters
   */
  private function check_content_types(array $conditions, array $ctx, array $filters): bool {
    if (empty($conditions['content_types'])) {
      return TRUE;
    }
    // Flatten and cast to string explicitly to avoid Array-to-string warnings
    // when $filters['content_type'] contains nested arrays.
    $raw = array_merge(
      [$ctx['content_type'] ?? ''],
      (array) ($filters['content_type'] ?? []),
    );
    $actual = array_filter(array_map('strval', array_filter($raw, 'is_scalar')));
    return !empty(array_intersect((array) $conditions['content_types'], $actual));
  }

}
