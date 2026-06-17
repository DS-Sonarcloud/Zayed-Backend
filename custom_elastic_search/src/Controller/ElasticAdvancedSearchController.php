<?php

namespace Drupal\custom_elastic_search\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\zu_search_core\Utility\SearchPrefixQueryHelper;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Controller for Elastic Advanced Search.
 *
 * Supports:
 *  - AND / OR query mode (FRD: AND search, OR search)
 *  - Filter by content type / datasource (FRD: Advanced Search)
 *  - Filter by date range (date_from / date_to)
 *  - Filter by language (langcode)
 *  - Filter by media type (docs_media toggle)
 *  - Voice search (handled entirely in JS / voice_to_text.js)
 *  - "Did you mean" spelling suggestions via ES suggest API
 *  - "People also looking for" via zu_search_core analytics logger
 *  - Click-through tracking (POST /elastic-advanced-search/click)
 */
class ElasticAdvancedSearchController extends ControllerBase {

  private const SEARCH_FIELDS = [
    'title^3',
    'body',
    'content_type',
    'event_start_date',
    'event_end_date',
    'field_description',
    'filename',
    'uri',
    'file_relative_url',
  ];

  public function advancedSearchPage(): array {
    return self::buildWidget();
  }

  /**
   * Reusable advanced search form + results (e.g. Super Admin dashboard embed).
   *
   * @return array<string, mixed>
   *   Render array.
   */
  public static function buildWidget(bool $embedded = FALSE): array {
    return [
      '#theme' => 'elastic_advanced_search',
      '#embedded' => $embedded,
      '#attached' => [
        'library' => ['custom_elastic_search/elastic_advanced_search'],
        'drupalSettings' => [
          'elasticSearch' => [
            'ajaxPath'          => Url::fromRoute('custom_elastic_search.ajax_search')->toString(),
            'clickPath'         => Url::fromRoute('custom_elastic_search.track_click')->toString(),
            'autocompletePath'  => Url::fromRoute('zu_search_core.autocomplete')->toString(),
          ],
        ],
      ],
    ];
  }

  /**
   * AJAX search handler.
   *
   * Accepted POST fields:
   *   query         string   — search keyword(s)
   *   query_mode    string   — "AND" | "OR" (default OR)
   *   search_all    bool     — TRUE = ignore all filters, return all results
   *   filters       array    — legacy: lookup_pages, lookup_docs, lookup_news, eservices
   *   content_types string[] — new: array of content-type machine names to restrict
   *   date_from     string   — new: ISO date string "YYYY-MM-DD" (optional)
   *   date_to       string   — new: ISO date string "YYYY-MM-DD" (optional)
   *   langcode      string   — new: language code "en" | "ar" | "" (optional)
   *   media_type    string   — new: "all" | "docs_media" (optional)
   *
   * Returns JSON:
   *   total          int
   *   results        [{title, url, snippet, content_type}]
   *   did_you_mean   string|null
   *   related_queries string[]
   */
  public function ajaxSearch(Request $request): JsonResponse {
    $data = json_decode($request->getContent(), TRUE) ?: $request->request->all();

    $query      = trim((string) ($data['query'] ?? ''));
    $query_mode = strtoupper((string) ($data['query_mode'] ?? 'OR'));
    $search_all = !empty($data['search_all']);

    if ($query === '') {
      return new JsonResponse(['results' => [], 'total' => 0]);
    }

    $combined_filters = $this->build_combined_filters($data, $search_all);

    if (\Drupal::hasService('zu_search_core.search_manager')) {
      return $this->search_via_bridge($query, $query_mode, $combined_filters, $search_all);
    }

    return $this->search_via_direct_es($query, $query_mode, $combined_filters, $request->getSchemeAndHttpHost());
  }

  /**
   * Merges legacy + new filter fields from the raw request data array.
   *
   * Extracted to keep ajaxSearch() below the cognitive-complexity threshold.
   *
   * @param array<string, mixed> $data
   * @return array<string, mixed>
   */
  private function build_combined_filters(array $data, bool $search_all): array {
    // Legacy filter array (lookup_pages, lookup_docs, etc.) — kept for
    // backward compatibility with any existing callers.
    $combined_filters = $search_all ? [] : (array) ($data['filters'] ?? []);

    if ($search_all) {
      return $combined_filters;
    }

    // New advanced filters sent directly from the filter panel UI.
    $content_types = array_values(array_filter(array_map(
      'trim',
      (array) ($data['content_types'] ?? []),
    )));
    $date_from  = trim((string) ($data['date_from'] ?? ''));
    $date_to    = trim((string) ($data['date_to'] ?? ''));
    $langcode   = trim((string) ($data['langcode'] ?? ''));
    $media_type = trim((string) ($data['media_type'] ?? 'all'));

    if (!empty($content_types)) {
      $combined_filters['content_types'] = $content_types;
    }
    if ($date_from !== '') {
      $combined_filters['date_from'] = $date_from;
    }
    if ($date_to !== '') {
      $combined_filters['date_to'] = $date_to;
    }
    if ($langcode !== '') {
      $combined_filters['langcode'] = $langcode;
    }
    if ($media_type !== '' && $media_type !== 'all') {
      $combined_filters['media_type'] = $media_type;
    }

    return $combined_filters;
  }

  /**
   * Click-tracking endpoint — records which result a user clicked.
   *
   * POST body: {query, title, url, content_type}
   */
  public function trackClick(Request $request): JsonResponse {
    if (!\Drupal::hasService('zu_search_core.search_manager')) {
      return new JsonResponse(['status' => 'skipped']);
    }
    $data = json_decode($request->getContent(), TRUE) ?: $request->request->all();
    try {
      /** @var \Drupal\zu_search_core\Service\SearchManager $manager */
      $manager = \Drupal::service('zu_search_core.search_manager');
      $manager->click([
        'query'        => (string) ($data['query'] ?? ''),
        'url'          => (string) ($data['url'] ?? ''),
        'content_type' => (string) ($data['content_type'] ?? ''),
        'entity_type'  => 'node',
        'entity_id'    => '',
      ]);
    }
    catch (\Throwable) {
      // Click tracking is non-critical.
    }
    return new JsonResponse(['status' => 'ok']);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private function search_via_bridge(string $query, string $query_mode, array $filters, bool $search_all = FALSE): JsonResponse {
    try {
      /** @var \Drupal\zu_search_core\Service\SearchManager $manager */
      $manager  = \Drupal::service('zu_search_core.search_manager');
      $index_id = (string) (\Drupal::config('zu_search_core.settings')->get('index_id') ?: 'elasticsearch_index');

      $search_filters = $search_all
        // No content-type restriction — personalization rules and the
        // AccessScopeFilter decide what each user actually sees.
        ? ['query_mode' => $query_mode]
        : $this->build_bridge_search_filters($filters, $query_mode);

      $response = $manager->search(
        $index_id,
        $query,
        $search_filters,
        ['offset' => 0, 'limit' => 200],
        TRUE,
      );

      $results = array_map(
        static fn(array $item) => [
          'title'        => (string) ($item['title'] ?? ''),
          'url'          => (string) ($item['url'] ?? ''),
          'snippet'      => (string) ($item['snippet'] ?? ''),
          'content_type' => (string) ($item['content_type'] ?? ''),
        ],
        (array) ($response['results'] ?? []),
      );

      $related = array_values(array_filter(
        (array) ($response['related_queries'] ?? []),
        static fn(string $q) => strtolower(trim($q)) !== strtolower(trim($query)),
      ));

      return new JsonResponse([
        'total'           => (int) ($response['total'] ?? \count($results)),
        'results'         => $results,
        'did_you_mean'    => NULL,
        'related_queries' => $related,
      ]);
    }
    catch (\Throwable $e) {
      \Drupal::logger('custom_elastic_search')->error('Advanced bridge failed: @msg', ['@msg' => $e->getMessage()]);
      return new JsonResponse(['results' => [], 'total' => 0, 'error' => 'Search unavailable.']);
    }
  }

  /**
   * Builds the $search_filters array for the zu_search_core bridge (non-search_all path).
   *
   * Extracted to keep search_via_bridge() below the cognitive-complexity threshold.
   *
   * @param array<string, mixed> $filters
   * @return array<string, mixed>
   */
  private function build_bridge_search_filters(array $filters, string $query_mode): array {
    // Merge legacy checkbox filters with new content_types array.
    [$legacy_types, $datasources] = $this->map_filters_to_types($filters);

    // New content_types array from the filter panel checkboxes.
    $panel_types = array_values(array_filter(array_map(
      'trim',
      (array) ($filters['content_types'] ?? []),
    )));

    // If the media_type toggle is set to docs_media and "file" is not
    // already in the list, add it; also add entity:file datasource.
    if (!empty($filters['media_type']) && $filters['media_type'] === 'docs_media') {
      if (!in_array('file', $panel_types, TRUE)) {
        $panel_types[] = 'file';
      }
      if (!in_array('entity:file', $datasources, TRUE)) {
        $datasources[] = 'entity:file';
      }
    }

    $all_types = array_values(array_unique(array_merge($legacy_types, $panel_types)));

    $search_filters = [
      'query_mode' => $query_mode,
    ];

    if ($all_types !== []) {
      $search_filters['content_type'] = $all_types;
    }
    if ($datasources !== []) {
      $search_filters['datasource'] = $datasources;
    }

    if (!empty($filters['media_type']) && $filters['media_type'] !== 'all') {
      $search_filters['media_type'] = $filters['media_type'];
    }

    // Date range filters — passed straight through to SearchManager so it
    // can apply them as range queries on event_start_date / created fields.
    if (!empty($filters['date_from'])) {
      $search_filters['date_from'] = $filters['date_from'];
    }
    if (!empty($filters['date_to'])) {
      $search_filters['date_to'] = $filters['date_to'];
    }

    // Language filter (empty = all languages).
    if (array_key_exists('langcode', $filters)) {
      $search_filters['langcode'] = trim((string) $filters['langcode']);
    }

    return \Drupal\zu_search_core\Utility\SearchFilterNormalizer::normalize($search_filters);
  }

  private function search_via_direct_es(
    string $query,
    string $query_mode,
    array $filters,
    string $base_url,
  ): JsonResponse {
    $es_url = \Drupal::config('custom_elastic_search.settings')->get('elasticsearch_url')
      ?: 'http://192.168.1.40:9208/elasticsearch_index/_search'; // NOSONAR — local-dev fallback, overridden in config

    $es_operator = ($query_mode === 'AND') ? 'and' : 'or';
    $min_match   = ($query_mode === 'AND') ? '100%' : '50%';

    $text_query = [
      'multi_match' => [
        'query'                => $query,
        'type'                 => 'best_fields',
        'operator'             => $es_operator,
        'fuzziness'            => 'AUTO',
        'minimum_should_match' => $min_match,
        'fields'               => self::SEARCH_FIELDS,
      ],
    ];

    $terms = SearchPrefixQueryHelper::extractTerms($query);
    $text_query = SearchPrefixQueryHelper::wrapQueryWithPrefixMatch(
      $text_query,
      $terms,
    );

    $es_query = [
      'query' => $text_query,
      // Spelling suggestion via ES suggest API (FRD: "spelling corrections").
      'suggest' => [
        'did_you_mean' => [
          'text' => $query,
          'term' => ['field' => 'title', 'suggest_mode' => 'missing'],
        ],
      ],
      '_source' => ['title', 'url', 'filename', 'uri', 'file_relative_url', 'content_type', 'langcode', 'created', 'event_start_date'],
      'size'    => 200,
    ];

    // Collect all filter clauses (type, date range, language, media type).
    $filter_clauses = $this->build_es_filter_clauses($filters);

    if (!empty($filter_clauses)) {
      $es_query['query'] = [
        'bool' => [
          'must'   => [$es_query['query']],
          'filter' => $filter_clauses,
        ],
      ];
    }

    try {
      $raw  = \Drupal::httpClient()->post($es_url, ['json' => $es_query]);
      $data = json_decode((string) $raw->getBody(), TRUE);

      $results      = $this->normalize_es_hits((array) ($data['hits']['hits'] ?? []), $base_url);
      $did_you_mean = $this->extract_suggestion((array) ($data['suggest']['did_you_mean'] ?? []));

      return new JsonResponse([
        'total'           => (int) ($data['hits']['total']['value'] ?? 0),
        'results'         => $results,
        'did_you_mean'    => $did_you_mean,
        'related_queries' => [],
      ]);
    }
    catch (\Throwable $e) {
      \Drupal::logger('custom_elastic_search')->error('Direct ES search failed: @msg', ['@msg' => $e->getMessage()]);
      return new JsonResponse(['results' => [], 'total' => 0, 'error' => 'Search failed.']);
    }
  }

  /**
   * Maps UI checkbox filters → [content_types[], datasources[]].
   *
   * Handles both the legacy lookup_* keys and the new content_types array.
   *
   * @return array{0: string[], 1: string[]}
   */
  private function map_filters_to_types(array $filters): array {
    $types  = [];
    $sources = [];

    // Legacy checkbox keys (kept for backward compatibility).
    if (!empty($filters['lookup_pages']))  { $types[] = 'page'; $sources[] = 'entity:node'; }
    if (!empty($filters['lookup_news']))   { $types[] = 'event'; $types[] = 'news'; $sources[] = 'entity:node'; }
    if (!empty($filters['eservices']))     { $types[] = 'article'; $sources[] = 'entity:node'; }
    if (!empty($filters['lookup_docs']))   { $sources[] = 'entity:file'; }

    return [array_values(array_unique($types)), array_values(array_unique($sources))];
  }

  /**
   * Builds ES filter clauses for content type, date range, language, and
   * media-type from the unified $filters array.
   *
   * Returns an array of ES filter clause arrays ready to embed in a bool query.
   *
   * @return array<int, array<string, mixed>>
   */
  private function build_es_filter_clauses(array $filters): array {
    $must_clauses = [];

    // ── Content-type / datasource filters ────────────────────────────────────
    $should_clauses = $this->build_es_type_should_clauses($filters);
    if (!empty($should_clauses)) {
      $must_clauses[] = [
        'bool' => ['should' => $should_clauses, 'minimum_should_match' => 1],
      ];
    }

    // ── Date range filter ─────────────────────────────────────────────────────
    $date_clause = $this->build_es_date_range_clause($filters);
    if ($date_clause !== NULL) {
      $must_clauses[] = $date_clause;
    }

    // ── Language filter ───────────────────────────────────────────────────────
    $langcode = trim((string) ($filters['langcode'] ?? ''));
    if ($langcode !== '') {
      $must_clauses[] = ['term' => ['langcode' => $langcode]];
    }

    return $must_clauses;
  }

  /**
   * Builds the should-clauses array for content-type / datasource matching.
   *
   * Media-type "docs_media" overrides all other clauses to files only.
   *
   * @param array<string, mixed> $filters
   * @return array<int, array<string, mixed>>
   */
  private function build_es_type_should_clauses(array $filters): array {
    // Media type toggle — "docs_media" restricts to entity:file datasource only.
    if (!empty($filters['media_type']) && $filters['media_type'] === 'docs_media') {
      return [['term' => ['search_api_datasource' => 'entity:file']]];
    }

    $should_clauses = [];

    // Legacy lookup_* keys.
    if (!empty($filters['lookup_pages'])) { $should_clauses[] = ['term' => ['content_type' => 'page']]; }
    if (!empty($filters['lookup_news']))  { $should_clauses[] = ['term' => ['content_type' => 'event']]; }
    if (!empty($filters['eservices']))    { $should_clauses[] = ['term' => ['content_type' => 'article']]; }
    if (!empty($filters['lookup_docs']))  { $should_clauses[] = ['term' => ['search_api_datasource' => 'entity:file']]; }

    // New content_types array from filter panel checkboxes.
    $panel_types = array_values(array_filter(array_map(
      'trim',
      (array) ($filters['content_types'] ?? []),
    )));

    foreach ($panel_types as $ct) {
      $should_clauses[] = $ct === 'file'
        ? ['term' => ['search_api_datasource' => 'entity:file']]
        : ['term' => ['content_type' => $ct]];
    }

    return $should_clauses;
  }

  /**
   * Builds an ES bool/should range clause spanning created and event_start_date,
   * or returns NULL when no date filter is set.
   *
   * @param array<string, mixed> $filters
   * @return array<string, mixed>|null
   */
  private function build_es_date_range_clause(array $filters): ?array {
    $date_from = trim((string) ($filters['date_from'] ?? ''));
    $date_to   = trim((string) ($filters['date_to'] ?? ''));

    if ($date_from === '' && $date_to === '') {
      return NULL;
    }

    $range = [];
    if ($date_from !== '') { $range['gte'] = $date_from; }
    if ($date_to !== '')   { $range['lte'] = $date_to; }

    // Try to match on created date (node) or event_start_date (events).
    // Use a should so either field satisfying the range is acceptable.
    return [
      'bool' => [
        'should' => [
          ['range' => ['created'          => $range]],
          ['range' => ['event_start_date' => $range]],
        ],
        'minimum_should_match' => 1,
      ],
    ];
  }

  /** @param array<int, array<string, mixed>> $hits */
  private function normalize_es_hits(array $hits, string $base_url): array {
    $results = [];
    foreach ($hits as $hit) {
      $src      = (array) ($hit['_source'] ?? []);
      $title    = $this->scalar($src['title'] ?? '');
      $filename = $this->scalar($src['filename'] ?? '');
      $raw_url  = $this->scalar($src['url'] ?? '');
      $rel_url  = $this->scalar($src['file_relative_url'] ?? '');

      $url = '';
      if ($raw_url !== '') {
        $path = (string) (parse_url($raw_url, PHP_URL_PATH) ?? '');
        $url  = $base_url . $path;
      }
      elseif ($rel_url !== '') {
        $url = $base_url . $rel_url;
      }

      if ($url === '') {
        continue;
      }

      $results[] = [
        'title'        => $title ?: $filename,
        'url'          => $url,
        'snippet'      => '',
        'content_type' => $this->scalar($src['content_type'] ?? ''),
      ];
    }
    return $results;
  }

  /** @param array<int, array<string, mixed>> $suggest */
  private function extract_suggestion(array $suggest): ?string {
    foreach ($suggest as $entry) {
      $options = (array) ($entry['options'] ?? []);
      if (!empty($options[0]['text'])) {
        return (string) $options[0]['text'];
      }
    }
    return NULL;
  }

  /** Normalises ES fields that may be returned as array or scalar. */
  private function scalar(mixed $val): string {
    if (!\is_array($val)) {
      return (string) $val;
    }
    $first = reset($val);
    return $first !== FALSE ? (string) $first : '';
  }

}
