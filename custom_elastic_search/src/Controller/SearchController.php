<?php

namespace Drupal\custom_elastic_search\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class SearchController extends ControllerBase
{

  public function search(Request $request)
  {
    $query = $request->query->get('q');

    if (empty($query)) {
      return new JsonResponse([]);
    }

    if (\Drupal::hasService('zu_search_core.search_manager')) {
      try {
        /** @var \Drupal\zu_search_core\Service\SearchManager $manager */
        $manager = \Drupal::service('zu_search_core.search_manager');
        $config = \Drupal::config('zu_search_core.settings');
        $index_id = (string) ($config->get('index_id') ?: 'elasticsearch_index');
        $limit = (int) ($config->get('autocomplete_limit') ?: 10);
        $items = $manager->autocomplete($index_id, (string) $query, $limit);

        $suggestions = [];
        foreach ($items as $item) {
          $suggestions[] = [
            'title' => (string) ($item['title'] ?? ''),
            'filename' => '',
            'url' => (string) ($item['url'] ?? ''),
            'file_relative_url' => '',
          ];
        }
        return new JsonResponse($suggestions);
      }
      catch (\Throwable $e) {
        \Drupal::logger('custom_elastic_search')->error('Search bridge failed: @msg', ['@msg' => $e->getMessage()]);
      }
    }

    $config = \Drupal::config('custom_elastic_search.settings');
    $es_url = $config->get('elasticsearch_url') ?: 'https://192.168.1.40:9208/elasticsearch_index/_search';

    $payload = [
      'query' => [
        'bool' => [
          'should' => [
            [
              'multi_match' => [
                'query' => $query,
                'type' => 'best_fields',
                'operator' => 'or',
                'fuzziness' => 'AUTO',
                'minimum_should_match' => '50%',
                'fields' => [
                  'title^3',
                  'body',
                  'content_type',
                  'event_start_date',
                  'event_end_date',
                  'field_description',
                  'filename',
                  'uri',
                  'file_relative_url',
                ],
              ],
            ],
            [
              'wildcard' => [
                'url' => [
                  'value' => '*' . strtolower($query) . '*',
                ],
              ],
            ],
          ],
        ],
      ],
      '_source' => ['title', 'url', 'nid', 'filename', 'uri', 'file_relative_url'],
      'size' => 20,
    ];

    try {
      $client = \Drupal::httpClient();
      $response = $client->post($es_url, ['json' => $payload]);
      $data = json_decode($response->getBody()->getContents(), TRUE);
      $suggestions = [];

      $current_base_url = $request->getSchemeAndHttpHost();

      if (!empty($data['hits']['hits']) && is_array($data['hits']['hits'])) {
        foreach ($data['hits']['hits'] as $hit) {
          $source = $hit['_source'] ?? [];

          // Normalize fields that can be arrays or strings
          $title = is_array($source['title'] ?? '') ? reset($source['title']) : ($source['title'] ?? '');
          $filename = is_array($source['filename'] ?? '') ? reset($source['filename']) : ($source['filename'] ?? '');
          $original_url = is_array($source['url'] ?? '') ? reset($source['url']) : ($source['url'] ?? '');
          $file_relative_url = is_array($source['file_relative_url'] ?? '') ? reset($source['file_relative_url']) : ($source['file_relative_url'] ?? '');

          $normalized_url = '';

          if (!empty($original_url) && is_string($original_url)) {
            $parsed = @parse_url($original_url);
            $path = $parsed['path'] ?? '';
            $normalized_url = $current_base_url . $path;
          } elseif (!empty($file_relative_url) && is_string($file_relative_url)) {
            $normalized_url = $current_base_url . $file_relative_url;
          }

          if (empty($normalized_url)) {
            continue;
          }

          $suggestions[] = [
            'title' => $title,
            'filename' => $filename,
            'url' => $normalized_url,
            'file_relative_url' => $file_relative_url,
          ];
        }
      }

      return new JsonResponse($suggestions);
    } catch (\Throwable $e) {
      \Drupal::logger('custom_elastic_search')->error('SearchController failed: @msg', [
        '@msg' => $e->getMessage(),
      ]);
      return new JsonResponse(['error' => 'Search failed. Check logs.'], 500);
    }
  }
}
