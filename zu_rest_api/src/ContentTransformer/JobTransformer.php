<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\node\NodeInterface;
use Drupal\zu_rest_api\Service\ConstantService;
use Drupal\zu_rest_api\Utility\UrlHelper;

/**
 * Transformer for job content type.
 */
class JobTransformer implements ContentTransformerInterface {

  protected $shortAliasRepository;
  protected ConstantService $constantService;
  protected array $preloadedAliases = [];

  public function __construct($short_alias_repository, ConstantService $constant_service) {
    $this->shortAliasRepository = $short_alias_repository;
    $this->constantService = $constant_service;
  }

  /**
   * Set pre-loaded short aliases.
   */
  public function setPreloadedAliases(array $aliases): void {
    $this->preloadedAliases = $aliases;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(): string {
    return 'jobs';
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldAliasMap(): array {
    return [
      'body' => 'description',
      'field_job_department' => 'job_department',
      'field_job_type' => 'job_type',
      'field_location' => 'location',
      'field_requirements' => 'requirements',
      'field_salary' => 'salary',
      'field_yes_no' => 'application_state',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExcludedFields(): array {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $item, NodeInterface $node): array {
    $baseDomain = $this->constantService->getConstant('BACKEND_API_BASE_URL');

    // nid as string.
    $item['nid'] = (string) $item['nid'];

    $item['type'] = 'job';

    // Short alias.
    $nid_int = (int) $item['nid'];
    if (!empty($this->preloadedAliases) && isset($this->preloadedAliases[$nid_int])) {
      $item['short_alias'] = $this->preloadedAliases[$nid_int];
    }
    else {
      $short_alias = $this->shortAliasRepository
        ->findByDestinationUri(["internal:/node/" . $item['nid']]);
      $item['short_alias'] = $short_alias ? $short_alias->getSourcePathWithQuery() : '';
    }

    // application_state: convert boolean to "Open"/"Close".
    if (isset($item['application_state'])) {
      $val = $item['application_state'];
      if (is_bool($val)) {
        $item['application_state'] = $val ? 'Open' : 'Close';
      }
      elseif (is_numeric($val)) {
        $item['application_state'] = ((int) $val) ? 'Open' : 'Close';
      }
      elseif (is_string($val) && ($val === '1' || strtolower($val) === 'yes' || strtolower($val) === 'open')) {
        $item['application_state'] = 'Open';
      }
      else {
        $item['application_state'] = 'Close';
      }
    }
    else {
      $item['application_state'] = 'Close';
    }

    // apply_link: computed HTML.
    $item['apply_link'] = '<a href="/form/job-application?job_id=' . $item['nid']
      . '?job_title=' . htmlspecialchars($node->getTitle(), ENT_QUOTES)
      . '" class="apply-button">Apply Now</a>';

    // Fix inline images in description.
    if (!empty($item['description']) && is_string($item['description'])) {
      $item['description'] = UrlHelper::fixInlineImageUrls($item['description'], $baseDomain);
    }

    // Fix inline images in requirements.
    if (!empty($item['requirements']) && is_string($item['requirements'])) {
      $item['requirements'] = UrlHelper::fixInlineImageUrls($item['requirements'], $baseDomain);
    }

    // Normalize URL.
    $langcode = 'en';
    if (!empty($item['url'])) {
      $url = UrlHelper::normalizeUrl($item['url']);
      $langcode = UrlHelper::detectLangFromUrl($url);
      $clean_url = UrlHelper::stripLangPrefix($url);
      $clean_url = UrlHelper::stripPathPrefix($clean_url, 'jobs');
      $item['url'] = $clean_url;
    }

    $item['langcode'] = $langcode;
    return $item;
  }

  /**
   * {@inheritdoc}
   */
  public function getDeployConfig(): array {
    return [
      'fileName' => 'zu-job-list',
      'contentKey' => 'jobData',
      'deployType' => 'job',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExtraPayloadData(string $langcode): array {
    return [];
  }

}
