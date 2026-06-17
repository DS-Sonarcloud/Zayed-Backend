<?php

namespace Drupal\zu_rest_api\Service;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\short_alias\ShortAliasRepository;
use Drupal\zu_rest_api\ContentTransformer\ContentTransformerInterface;
use Drupal\zu_rest_api\ContentTransformer\ForumTransformer;
use Drupal\zu_rest_api\ContentTransformer\PhotoGalleryTransformer;
use Drupal\zu_rest_api\Model\DeployResult;

/**
 *
 * Wires together EntityQueryService + FieldSerializerService + Transformers
 * + DeployApiService to provide a single deploy() method per content type.
 */
class ContentDeployManager {

  protected EntityQueryService $entityQueryService;
  protected FieldSerializerService $fieldSerializer;
  protected DeployApiService $deployApiService;
  protected DeploymentLogService $logService;
  protected ConstantService $constantService;
  protected ConfigFactoryInterface $configFactory;
  protected ShortAliasRepository $shortAliasRepository;

  /**
   * Transformers keyed by bundle name.
   *
   * @var \Drupal\zu_rest_api\ContentTransformer\ContentTransformerInterface[]
   */
  protected array $transformers = [];

  public function __construct(
    EntityQueryService $entity_query_service,
    FieldSerializerService $field_serializer,
    DeployApiService $deploy_api_service,
    DeploymentLogService $log_service,
    ConstantService $constant_service,
    ConfigFactoryInterface $config_factory,
    \Traversable $transformers,
    ShortAliasRepository $short_alias_repository
  ) {
    $this->entityQueryService = $entity_query_service;
    $this->fieldSerializer = $field_serializer;
    $this->deployApiService = $deploy_api_service;
    $this->logService = $log_service;
    $this->constantService = $constant_service;
    $this->configFactory = $config_factory;
    $this->shortAliasRepository = $short_alias_repository;

    foreach ($transformers as $transformer) {
      $this->transformers[$transformer->getBundle()] = $transformer;
    }
  }

  /**
   * Deploy a content type by bundle name.
   *
   * Generic orchestration flow:
   * 1. Get transformer for bundle
   * 2. Load all published nodes 
   * 3. Serialize each node via FieldSerializerService
   * 4. Transform each item via transformer
   * 5. Group by language
   * 6. Send per-language payloads
   * 7. Log results
   *
   * @param string $bundle
   *   The node bundle to deploy (e.g. 'blog', 'news', 'event', 'job').
   *
   * @return \Drupal\zu_rest_api\Model\DeployResult
   */
  public function deploy(string $bundle): DeployResult {
    $transformer = $this->getTransformer($bundle);
    if (!$transformer) {
      return DeployResult::failure("No transformer registered for bundle: $bundle");
    }

    // Special handling for forum (hierarchical grouping).
    if ($bundle === 'forum') {
      return $this->deployForum();
    }

    // Special handling for photo_gallery (year grouping, per-language fetch).
    if ($bundle === 'photo_gallery') {
      return $this->deployPhotoGallery();
    }

    try {
      // Load all published nodes with translations.
      $nodes = $this->entityQueryService->loadPublishedNodesAllTranslations($bundle);

      if (empty($nodes)) {
        return DeployResult::failure("No published $bundle nodes found.");
      }

      // Get field definitions and alias map.
      $fieldDefinitions = $this->entityQueryService->getContentFieldDefinitions($bundle);
      $aliasMap = $transformer->getFieldAliasMap();
      $excludeFields = $transformer->getExcludedFields();

      $nids = array_map(fn($node) => (int) $node->id(), $nodes);
      $nids = array_unique($nids);
      $preloadedAliases = $this->shortAliasRepository->findMultipleByNodeIds($nids);
      if (method_exists($transformer, 'setPreloadedAliases')) {
        $transformer->setPreloadedAliases($preloadedAliases);
      }

      // Serialize and transform each node.
      $items_by_lang = ['en' => [], 'ar' => []];

      foreach ($nodes as $node) {
        // Serialize node fields.
        $item = $this->fieldSerializer->serializeNode(
          $node,
          $fieldDefinitions,
          $aliasMap,
          $excludeFields
        );

        // Apply transformer post-processing.
        $item = $transformer->transform($item, $node);

        // Group by language.
        $langcode = $item['langcode'] ?? 'en';
        $items_by_lang[$langcode][] = $item;
      }

      // Deploy per language.
      $config = $transformer->getDeployConfig();
      return $this->sendByLanguage($items_by_lang, $config, $transformer);

    }
    catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error("DEPLOY ERROR ($bundle): " . $e->getMessage());
      $config = $transformer->getDeployConfig();
      $this->logService->logFailure(
        $config['deployType'],
        'ContentDeployManager',
        'all',
        "Deployment failed: " . $e->getMessage()
      );
      return DeployResult::failure($e->getMessage());
    }
  }

  /**
   * Deploy forum topics with hierarchical container grouping.
   */
  public function deployForum(): DeployResult {
    $transformer = $this->getTransformer('forum');
    if (!$transformer || !($transformer instanceof ForumTransformer)) {
      return DeployResult::failure("Forum transformer not available.");
    }

    try {
      $nodes = $this->entityQueryService->loadPublishedNodesAllTranslations('forum');

      if (empty($nodes)) {
        return DeployResult::failure("No published forum topics found.");
      }

      $nids = array_map(fn($node) => (int) $node->id(), $nodes);
      $transformer->preloadCommentCounts(array_unique($nids));

      // Transform each node (forum uses custom transform, not auto-serialization).
      $flat_items = [];
      foreach ($nodes as $node) {
        $flat_items[] = $transformer->transform([], $node);
      }

      // Group into containers by tid.
      $by_lang = $transformer->groupIntoContainers($flat_items);

      $config = $transformer->getDeployConfig();
      $all_success = TRUE;
      $total_items = 0;

      foreach (['en', 'ar'] as $lang) {
        if (empty($by_lang[$lang])) {
          continue;
        }

        $topics_count = 0;
        foreach ($by_lang[$lang] as $container) {
          $topics_count += count($container['topics'] ?? []);
        }

        $payload = [
          'pathName' => 'api/' . $lang . '/',
          'fileName' => $config['fileName'],
          'content' => [
            $config['contentKey'] => $by_lang[$lang],
          ],
        ];

        $response = $this->deployApiService->sendDeployRequest($payload);
        if ($response) {
          $total_items += $topics_count;
        }
        else {
          $all_success = FALSE;
        }
      }

      return $this->logAndReturn($all_success, $total_items, $config);

    }
    catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error("FORUM DEPLOY ERROR: " . $e->getMessage());
      $this->logService->logFailure('forum', 'ContentDeployManager', 'all', $e->getMessage());
      return DeployResult::failure($e->getMessage());
    }
  }

  /**
   * Deploy photo gallery with year grouping and per-language fetch.
   */
  public function deployPhotoGallery(): DeployResult {
    $transformer = $this->getTransformer('photo_gallery');
    if (!$transformer || !($transformer instanceof PhotoGalleryTransformer)) {
      return DeployResult::failure("PhotoGallery transformer not available.");
    }

    try {
      $fieldDefinitions = $this->entityQueryService->getContentFieldDefinitions('photo_gallery');
      $aliasMap = $transformer->getFieldAliasMap();
      $excludeFields = $transformer->getExcludedFields();

      $config = $transformer->getDeployConfig();
      $all_success = TRUE;
      $total_items = 0;

      foreach (['en', 'ar'] as $langcode) {
        $nodes = $this->entityQueryService->loadPublishedNodes('photo_gallery', $langcode);

        if (empty($nodes)) {
          continue;
        }

        $items = [];
        foreach ($nodes as $node) {
          if ($node->hasTranslation($langcode)) {
            $node = $node->getTranslation($langcode);
          }

          $item = $this->fieldSerializer->serializeNode(
            $node,
            $fieldDefinitions,
            $aliasMap,
            $excludeFields
          );
          $item = $transformer->transform($item, $node);
          $items[] = $item;
        }

        // Group by year.
        $grouped = $transformer->groupByYear($items);

        $payload = [
          'pathName' => 'api/' . $langcode . '/',
          'fileName' => $config['fileName'],
          'content' => [
            $config['contentKey'] => $grouped,
          ],
        ];

        $response = $this->deployApiService->sendDeployRequest($payload);
        if ($response) {
          $total_items += count($grouped);
        }
        else {
          $all_success = FALSE;
        }
      }

      return $this->logAndReturn($all_success, $total_items, $config);

    }
    catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error("PHOTO GALLERY DEPLOY ERROR: " . $e->getMessage());
      $this->logService->logFailure('photo_gallery', 'ContentDeployManager', 'all', $e->getMessage());
      return DeployResult::failure($e->getMessage());
    }
  }

  /**
   * Deploy colleges and faculty (two bundles, two separate payloads).
   */
  public function deployCollegesAndFaculty(): array {
    $results = [];
    $results['colleges'] = $this->deploy('colleges');
    $results['faculty'] = $this->deploy('faculty_staff');
    return $results;
  }

  /**
   * Deploy events (used by both EventsDeployForm and DeployController).
   */
  public function deployEvents(): DeployResult {
    return $this->deploy('event');
  }

  /**
   * Send items grouped by language and return result.
   */
  protected function sendByLanguage(
    array $items_by_lang,
    array $config,
    ContentTransformerInterface $transformer
  ): DeployResult {
    $all_success = TRUE;
    $total_items = 0;

    foreach ($items_by_lang as $langcode => $items) {
      if (empty($items)) {
        continue;
      }

      $content = [
        $config['contentKey'] => $items,
      ];

      // Merge extra payload data (e.g. responsiveBreakpoints for events).
      $extra = $transformer->getExtraPayloadData($langcode);
      if (!empty($extra)) {
        $content = array_merge($content, $extra);
      }

      $payload = [
        'pathName' => 'api/' . $langcode . '/',
        'fileName' => $config['fileName'],
        'content' => $content,
      ];

      //dd($payload);
      $response = $this->deployApiService->sendDeployRequest($payload);
      if ($response) {
        $total_items += count($items);
      }
      else {
        $all_success = FALSE;
      }
    }

    return $this->logAndReturn($all_success, $total_items, $config);
  }

  /**
   * Log result and return DeployResult.
   */
  protected function logAndReturn(bool $all_success, int $total_items, array $config): DeployResult {
    if ($total_items > 0 && $all_success) {
      $this->logService->logSuccess(
        $config['deployType'],
        'ContentDeployManager',
        'all',
        $total_items,
        ucfirst($config['deployType']) . ' deployment completed successfully.'
      );
      return DeployResult::success($total_items);
    }

    if (!$all_success) {
      $this->logService->logFailure(
        $config['deployType'],
        'ContentDeployManager',
        'all',
        'Failed to deploy ' . $config['deployType'] . '.'
      );
      return DeployResult::failure('Deployment failed for ' . $config['deployType']);
    }

    return DeployResult::failure('No items found to deploy for ' . $config['deployType']);
  }

  /**
   * Get a transformer by bundle name.
   */
  protected function getTransformer(string $bundle): ?ContentTransformerInterface {
    return $this->transformers[$bundle] ?? NULL;
  }

}
