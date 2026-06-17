<?php

namespace Drupal\zu_personalization\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Session\AccountInterface;

/**
 * Resolves persona for a user based on roles and inferred profile.
 */
final class PersonaResolver {

  public function __construct(
    private readonly Connection $database,
  ) {}

  /**
   * @param array<string, mixed> $context
   */
  public function resolve(AccountInterface $account, array $context = []): string {
    if ($account->isAnonymous()) {
      return 'anonymous';
    }

    $roles = array_map('strtolower', $account->getRoles());
    if ($this->containsAny($roles, ['super_admin', 'administrator', 'admin'])) {
      return 'admin';
    }
    if ($this->containsAny($roles, ['faculty', 'professor'])) {
      return 'faculty';
    }
    if ($this->containsAny($roles, ['staff', 'employee'])) {
      return 'staff';
    }
    if ($this->containsAny($roles, ['student'])) {
      return 'student';
    }

    // Fallback to last inferred persona.
    $inferred = $this->database->select('zu_user_persona', 'p')
      ->fields('p', ['persona_type'])
      ->condition('uid', (int) $account->id())
      ->orderBy('confidence_score', 'DESC')
      ->range(0, 1)
      ->execute()
      ->fetchField();
    if (is_string($inferred) && $inferred !== '') {
      return $inferred;
    }

    return 'general';
  }

  /**
   * @param array<int, string> $haystack
   * @param array<int, string> $needles
   */
  private function containsAny(array $haystack, array $needles): bool {
    foreach ($haystack as $value) {
      foreach ($needles as $needle) {
        if (str_contains($value, $needle)) {
          return TRUE;
        }
      }
    }
    return FALSE;
  }

}
