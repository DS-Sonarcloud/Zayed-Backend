<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Service;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\State\StateInterface;

/**
 * Per-user recently visited admin paths for the super-admin dashboard.
 */
final class AdminVisitHistoryService {

  private const STATE_PREFIX = 'zu_super_admin_dashboard.admin_visits.';

  private const MAX_STORED = 20;

  public function __construct(
    private readonly StateInterface $state,
    private readonly AccountProxyInterface $currentUser,
    private readonly DateFormatterInterface $dateFormatter,
  ) {}

  /**
   * Records an admin page visit for the current user.
   */
  public function record(string $path, string $title, string $route_name): void {
    $uid = (int) $this->currentUser->id();
    if ($uid <= 0) {
      return;
    }

    $path = $this->normalizePath($path);
    $title = trim($title);
    if ($path === '' || $title === '') {
      return;
    }

    $entries = $this->loadEntries($uid);
    $entries = array_values(array_filter(
      $entries,
      static fn(array $entry): bool => ($entry['path'] ?? '') !== $path,
    ));

    array_unshift($entries, [
      'path' => $path,
      'title' => $title,
      'route' => $route_name,
      'visited' => \Drupal::time()->getRequestTime(),
    ]);

    if (count($entries) > self::MAX_STORED) {
      $entries = array_slice($entries, 0, self::MAX_STORED);
    }

    $this->state->set(self::STATE_PREFIX . $uid, $entries);
  }

  /**
   * @return list<array{title: string, url: string, description: string}>
   */
  public function getRecentForDashboard(int $limit = 8): array {
    $uid = (int) $this->currentUser->id();
    if ($uid <= 0) {
      return [];
    }

    $items = [];
    foreach (array_slice($this->loadEntries($uid), 0, max(1, $limit)) as $entry) {
      $visited = (int) ($entry['visited'] ?? 0);
      $items[] = [
        'title' => (string) ($entry['title'] ?? ''),
        'url' => (string) ($entry['path'] ?? ''),
        'description' => $visited > 0
          ? (string) t('Visited @time ago', [
            '@time' => $this->dateFormatter->formatTimeDiffSince($visited),
          ])
          : '',
      ];
    }

    return $items;
  }

  /**
   * @return list<array{path: string, title: string, route: string, visited: int}>
   */
  private function loadEntries(int $uid): array {
    $stored = $this->state->get(self::STATE_PREFIX . $uid, []);
    if (!is_array($stored)) {
      return [];
    }

    $entries = [];
    foreach ($stored as $entry) {
      if (!is_array($entry) || empty($entry['path']) || empty($entry['title'])) {
        continue;
      }
      $entries[] = [
        'path' => (string) $entry['path'],
        'title' => (string) $entry['title'],
        'route' => (string) ($entry['route'] ?? ''),
        'visited' => (int) ($entry['visited'] ?? 0),
      ];
    }

    return $entries;
  }

  private function normalizePath(string $path): string {
    $path = '/' . trim($path, '/');
    return $path === '/' ? '' : $path;
  }

}
