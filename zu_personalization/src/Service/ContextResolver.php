<?php

namespace Drupal\zu_personalization\Service;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Resolves runtime personalization context (uid, lang, device, geo, roles).
 */
final class ContextResolver {

  public function __construct(
    private readonly Connection $database,
    private readonly LanguageManagerInterface $languageManager,
    private readonly RequestStack $requestStack,
    private readonly CacheBackendInterface $cache,
  ) {}

  /**
   * @param array<string, mixed> $overrides
   *
   * @return array<string, mixed>
   */
  public function resolve(AccountInterface $account, array $overrides = []): array {
    $request   = $this->requestStack->getCurrentRequest();
    $host      = (string) ($request?->getHost() ?? 'default');
    $langcode  = (string) ($overrides['langcode'] ?? $this->languageManager->getCurrentLanguage()->getId());
    $site_id   = (string) ($overrides['site_id'] ?? $host);
    $client_ip = (string) ($request?->getClientIp() ?? '');

    return [
      'uid'            => (int) $account->id(),
      'langcode'       => $langcode,
      'site_id'        => $site_id,
      'host'           => $host,
      'path'           => (string) ($request?->getPathInfo() ?? ''),
      'department_ids' => $this->departmentIds((int) $account->id()),
      'roles'          => $account->getRoles(),
      'device'         => $this->detectDevice((string) ($request?->headers->get('User-Agent') ?? '')),
      'geo'            => $this->resolve_geo($client_ip, $request?->headers->all() ?? []),
      ...$overrides,
    ];
  }

  /**
   * Geo-location resolution — header chain first, then ip-api.com (cached).
   *
   * Tier 1: CloudFlare CF-IPCountry (instant, no external call).
   * Tier 2: X-Country-Code (WAF / reverse proxy header).
   * Tier 3: X-Geo-Country (Azure Front Door / Akamai).
   * Tier 4: ip-api.com free JSON endpoint, result cached 24 h per IP.
   *
   * @param array<string, array<string>> $headers
   * @return array{country: string, city: string, region: string}
   */
  private function resolve_geo(string $ip, array $headers): array {
    $empty = ['country' => '', 'city' => '', 'region' => ''];

    $country = $this->header_first($headers, ['cf-ipcountry', 'x-country-code', 'x-geo-country']);
    if ($country !== '') {
      $city = $this->header_first($headers, ['cf-ipcity', 'x-geo-city']);
      return ['country' => strtoupper($country), 'city' => $city, 'region' => ''];
    }

    if ($ip === '' || $this->is_private_ip($ip)) {
      return $empty;
    }

    return $this->fetch_geo_from_api($ip, $empty);
  }

  /**
   * Calls ip-api.com and caches the result per IP for 24 hours.
   *
   * @param array{country: string, city: string, region: string} $empty
   * @return array{country: string, city: string, region: string}
   */
  private function fetch_geo_from_api(string $ip, array $empty): array {
    $cid = "zu_personalization_geo:{$ip}";
    $cached = $this->cache->get($cid);
    if ($cached !== FALSE) {
      return (array) $cached->data;
    }

    $geo = $empty;
    try {
      $response = \Drupal::httpClient()->get(
        "http://ip-api.com/json/{$ip}?fields=countryCode,city,regionName",
        ['timeout' => 3, 'http_errors' => FALSE]
      );
      $data = json_decode((string) $response->getBody(), TRUE);
      if (!empty($data['countryCode'])) {
        $geo = [
          'country' => strtoupper((string) $data['countryCode']),
          'city'    => (string) ($data['city'] ?? ''),
          'region'  => (string) ($data['regionName'] ?? ''),
        ];
      }
    }
    catch (\Throwable) {
      // Geo is best-effort; silent failure is correct.
    }

    $this->cache->set($cid, $geo, \Drupal::time()->getRequestTime() + 86400);
    return $geo;
  }

  /**
   * Returns the first non-empty value found across a list of header names.
   *
   * @param array<string, array<string>> $headers
   */
  private function header_first(array $headers, array $names): string {
    foreach ($names as $name) {
      $val = trim((string) ($headers[$name][0] ?? $headers[strtolower($name)][0] ?? ''));
      if ($val !== '' && $val !== 'XX') {
        return $val;
      }
    }
    return '';
  }

  private function is_private_ip(string $ip): bool {
    return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === FALSE;
  }

  /**
   * @return list<int>
   */
  private function departmentIds(int $uid): array {
    if ($uid <= 0) {
      return [];
    }
    try {
      $ids = $this->database->select('user__field_event_department', 'd')
        ->fields('d', ['field_event_department_target_id'])
        ->condition('entity_id', $uid)
        ->execute()
        ->fetchCol();
      return array_values(array_map('intval', $ids ?: []));
    }
    catch (\Throwable) {
      return [];
    }
  }

  private function detectDevice(string $user_agent): string {
    $ua = strtolower($user_agent);
    if (preg_match('/iphone|android.+mobile|windows phone|blackberry|bb10|opera mini|mobile safari/i', $ua)) {
      return 'mobile';
    }
    if (preg_match('/ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i', $ua)) {
      return 'tablet';
    }
    return 'desktop';
  }

}
