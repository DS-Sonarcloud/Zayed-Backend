<?php

namespace Drupal\zu_personalization\Service;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Database\Connection;

/**
 * Reranks results using persona/context/rules and lightweight behavior signals.
 */
final class ScoringBooster {

  public function __construct(
    private readonly Connection $database,
    private readonly TimeInterface $time,
  ) {}

  /**
   * @param array<int, array<string, mixed>> $results
   * @param array<string, mixed> $context
   * @param array<int, array<string, mixed>> $rules
   * @param array<string, mixed> $options
   *
   * @return array<int, array<string, mixed>>
   */
  public function rerank(array $results, array $context, array $rules, array $options = []): array {
    $persona = (string) ($context['persona'] ?? 'general');
    $site_id = (string) ($context['site_id'] ?? '');
    $langcode = (string) ($context['langcode'] ?? '');
    $uid = (int) ($context['uid'] ?? 0);
    $recent_days = max(0, (int) ($options['recent_boost_days'] ?? 30));
    $recent_cutoff = $recent_days > 0 ? ($this->time->getRequestTime() - (86400 * $recent_days)) : 0;

    $click_pref = $this->loadClickPreferences($uid);

    foreach ($results as $i => $result) {
      $score = 1.0;

      // Persona/content-type priors.
      $content_type = strtolower((string) ($result['content_type'] ?? ''));
      if ($persona === 'student' && in_array($content_type, ['course', 'program', 'faculty_staff', 'event'], TRUE)) {
        $score += 2.0;
      }
      if ($persona === 'staff' && in_array($content_type, ['policy', 'article', 'page', 'event'], TRUE)) {
        $score += 1.6;
      }
      if ($persona === 'faculty' && in_array($content_type, ['research', 'event', 'article', 'page'], TRUE)) {
        $score += 1.8;
      }
      if ($persona === 'admin') {
        $score += 0.6;
      }

      // Site/language boosts.
      $url = (string) ($result['url'] ?? '');
      if ($site_id !== '' && str_contains($url, $site_id)) {
        $score += 0.8;
      }
      if ($langcode !== '' && (string) ($result['langcode'] ?? '') === $langcode) {
        $score += 0.4;
      }

      // Behavior boost by historically clicked content type.
      if ($content_type !== '' && isset($click_pref[$content_type])) {
        $score += min(1.2, $click_pref[$content_type] / 10);
      }

      // Rule-driven boosts.
      foreach ($rules as $rule) {
        $conditions = (array) ($rule['conditions'] ?? []);
        $rule_boost = (float) ($conditions['boost'] ?? 0.5);
        if (!empty($conditions['content_type'])) {
          $types = array_map('strtolower', (array) $conditions['content_type']);
          if (in_array($content_type, $types, TRUE)) {
            $score += $rule_boost;
          }
        }
        else {
          $score += $rule_boost * 0.2;
        }
      }

      // Optional freshness boost when created timestamp is present.
      $created = (int) ($result['fields']['created'] ?? 0);
      if ($recent_cutoff > 0 && $created >= $recent_cutoff) {
        $score += 0.3;
      }

      $result['score'] = round($score, 4);
      $results[$i] = $result;
    }

    usort($results, static fn(array $a, array $b): int => (($b['score'] ?? 0) <=> ($a['score'] ?? 0)));
    return $results;
  }

  /**
   * @return array<string, int>
   */
  private function loadClickPreferences(int $uid): array {
    if ($uid <= 0 || !$this->database->schema()->tableExists('zu_search_click_log')) {
      return [];
    }

    $query = $this->database->select('zu_search_click_log', 'c');
    $query->addExpression('COUNT(c.id)', 'hit_count');
    $query->fields('c', ['content_type']);
    $query->condition('uid', $uid);
    $query->condition('content_type', '', '<>');
    $query->groupBy('content_type');
    $query->orderBy('hit_count', 'DESC');
    $query->range(0, 15);

    $rows = $query->execute()->fetchAll();
    $out = [];
    foreach ($rows as $row) {
      $out[(string) $row->content_type] = (int) $row->hit_count;
    }
    return $out;
  }

}
