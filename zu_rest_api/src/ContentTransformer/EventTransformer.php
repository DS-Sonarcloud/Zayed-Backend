<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use DateTimeImmutable;
use DateTimeZone;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\node\NodeInterface;
use Drupal\webform\Entity\Webform;
use Drupal\zu_rest_api\Service\ConstantService;
use Drupal\zu_rest_api\Utility\UrlHelper;
use Symfony\Component\Yaml\Yaml;

/**
 * Transformer for event content type.
 */
class EventTransformer implements ContentTransformerInterface
{

  protected $shortAliasRepository;
  protected ConstantService $constantService;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected ConfigFactoryInterface $configFactory;
  protected RendererInterface $renderer;
  protected $displayRepository;
  protected array $preloadedAliases = [];
  protected ?array $cachedResponsiveConfig = NULL;
  protected ?array $cachedWebformRules = NULL;
  protected ?array $cachedMultimediaAcceptedFormats = NULL;

  public function __construct(
    $short_alias_repository,
    ConstantService $constant_service,
    EntityTypeManagerInterface $entity_type_manager,
    ConfigFactoryInterface $config_factory,
    RendererInterface $renderer,
    $display_repository
  ) {
    $this->shortAliasRepository = $short_alias_repository;
    $this->constantService = $constant_service;
    $this->entityTypeManager = $entity_type_manager;
    $this->configFactory = $config_factory;
    $this->renderer = $renderer;
    $this->displayRepository = $display_repository;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(): string
  {
    return 'event';
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldAliasMap(): array
  {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getExcludedFields(): array
  {
    return [];
  }

  /**
   * Set pre-loaded short aliases to avoid N+1 queries.
   */
  public function setPreloadedAliases(array $aliases): void
  {
    $this->preloadedAliases = $aliases;
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $item, NodeInterface $node): array
  {
    $baseDomain = $this->constantService->getConstant('BACKEND_API_BASE_URL');

    // --- Value format fixes ---

    // nid must be string.
    $item['nid'] = (string) $item['nid'];

    $item['type'] = 'event';

    // download_ics_file_url: computed.
    $item['download_ics_file_url'] = '/event/' . $item['nid'] . '/calendar.ics';
    // Also provide calendar data as JSON so frontend can generate .ics locally.
    $item['calendar_data'] = $this->buildCalendarJson($node);

    // start_date / end_date from field_event_date (daterange).
    // if (isset($item['field_event_date'])) {
    //   if (is_array($item['field_event_date'])) {
    //     $item['start_date'] = $item['field_event_date']['value'] ?? '';
    //     $item['end_date'] = $item['field_event_date']['end_value'] ?? '';
    //   }
    //   else {
    //     $item['start_date'] = $item['field_event_date'];
    //     $item['end_date'] = '';
    //   }
    // }
    // else {
    //   $item['start_date'] = '';
    //   $item['end_date'] = '';
    // }

    // Boolean fields → "Yes"/"No" strings.
    $boolean_fields = [
      'field_registration',
      'field_if_require_singin',
      'field_domain_all_affiliates',
    ];
    foreach ($boolean_fields as $bf) {
      if (array_key_exists($bf, $item)) {
        $item[$bf] = $this->boolToYesNo($item[$bf]);
      }
    }

    // category + category_id from field_event_type taxonomy term.
    // $item['category'] = $item['field_event_type'] ?? '';
    $item['category_id'] = '';
    if ($node->hasField('field_event_type') && !$node->get('field_event_type')->isEmpty()) {
      $term = $node->get('field_event_type')->entity;
      if ($term) {
        $item['category'] = $term->label();
        $item['category_id'] = (string) $term->id();
      }
    }

    // Entity reference node fields → string label only.
    $label_only_fields = ['field_organizer_name', 'field_speakers'];
    foreach ($label_only_fields as $lf) {
      if (isset($item[$lf]) && is_array($item[$lf])) {
        $item[$lf] = $item[$lf]['title'] ?? '';
      }
    }

    // view_mode.
    $item['view_mode'] = '';


    // Webform processing.
    if (!empty($item['field_select_webform'])) {
      $webform_machine_name = is_array($item['field_select_webform'])
        ? ($item['field_select_webform']['target_id'] ?? '')
        : $item['field_select_webform'];

      if ($webform_machine_name) {
        $webform_entity = Webform::load($webform_machine_name);
        if ($webform_entity) {
          $webform_array = $webform_entity->toArray();
          $allowed_keys = ['uuid', 'langcode', 'status', 'id', 'title', 'description', 'elements'];
          $clean_webform = array_intersect_key($webform_array, array_flip($allowed_keys));

          if (!empty($clean_webform['elements']) && is_string($clean_webform['elements'])) {
            try {
              $clean_webform['elements'] = Yaml::parse($clean_webform['elements']);
            } catch (\Exception $e) {
            }
          }

          // Load webform ajax conditions.
          if ($this->cachedWebformRules === NULL) {
            $config = $this->configFactory->get('webform_ajax_condition.rules');
            $this->cachedWebformRules = $config->get('rules') ?? [];
          }
          $rules = $this->cachedWebformRules;
          $conditions_output = [];

          foreach ($rules as $rule) {
            if (!empty($rule['webform_id']) && $rule['webform_id'] === $webform_machine_name) {
              $states = [];
              $mapping_text = trim($rule['mapping'] ?? '');

              if (!empty($mapping_text)) {
                $lines = preg_split('/\r\n|\r|\n/', $mapping_text);
                $current_value = '';

                foreach ($lines as $line) {
                  if (preg_match('/^(\S+):$/', trim($line), $matches)) {
                    $current_value = $matches[1];
                  } elseif (preg_match('/^\s*-\s*(.+)$/', $line, $matches) && $current_value) {
                    $child_option = trim($matches[1]);
                    $states[$child_option] = [
                      ":input[name=\"{$rule['parent_field']}\"]" => [
                        "value" => $current_value,
                      ],
                    ];
                  }
                }
              }

              $conditions_output[] = [
                'name' => $rule['name'] ?? '',
                'parent_field' => $rule['parent_field'] ?? '',
                'child_field' => $rule['child_field'] ?? '',
                'states' => $states,
              ];
            }
          }

          $item['field_select_webform'] = [
            'webform' => $clean_webform,
            'conditions' => $conditions_output,
          ];
        }
      }
    }

    // Fix inline images in description.
    if (!empty($item['description']) && is_string($item['description'])) {
      $item['description'] = UrlHelper::fixInlineImageUrls($item['description'], $baseDomain);
    }

    // Expose accepted multimedia formats for frontend upload/validation parity.
    $item['field_multimedia_accepted_formats'] = $this->getMultimediaAcceptedFormats();

    unset($item['field_multimedia_urls']);

    // Normalize URL: detect language, ensure /event-calendar/ prefix.
    $langcode = 'en';
    if (!empty($item['url'])) {
      $u = UrlHelper::normalizeUrl($item['url']);
      $langcode = UrlHelper::detectLangFromUrl($u);
      $u = UrlHelper::stripLangPrefix($u);
      $u = UrlHelper::ensurePathPrefix($u, 'event-calendar');
      $u = '/' . $langcode . $u;
      $u = preg_replace('#/+#', '/', $u);
      $item['url'] = $u;
    }

    // Responsive HTML view modes.
    if ($node->bundle() === 'event') {
      // Cache responsive config to avoid per-node config reads.
      if ($this->cachedResponsiveConfig === NULL) {
        $this->cachedResponsiveConfig = $this->configFactory
          ->get('event_responsive_config.settings')
          ->get('breakpoints') ?: [];
      }
      $responsive_config = $this->cachedResponsiveConfig;

      $view_builder = $this->entityTypeManager->getViewBuilder('node');
      $item['responsive_html'] = [];

      foreach ($responsive_config as $vm_id => $vm_settings) {
        if (!empty($vm_settings['active']) && $vm_id !== 'full' && $vm_id !== 'default') {
          $vm_build = $view_builder->view($node, $vm_id);
          $this->cleanRenderArray($vm_build);
          $rendered = (string) $this->renderer->renderPlain($vm_build);
          $rendered = $this->stripThemeDebugComments($rendered);
          $item['responsive_html'][$vm_id] = $rendered;
        }
      }
    }

    // Short alias with language prefix.
    $nid_int = (int) $item['nid'];
    $alias_key = $nid_int . '_' . $langcode;
    if (!empty($this->preloadedAliases) && isset($this->preloadedAliases[$alias_key])) {
      $item['short_alias'] = $this->preloadedAliases[$alias_key];
    } else {
      $short_alias = $this->shortAliasRepository
        ->findByDestinationUri(["internal:/node/" . $item['nid']], $langcode);
      if ($short_alias) {
        $item['short_alias'] = '/' . $langcode . '/' . ltrim($short_alias->getSourcePathWithQuery(), '/');
      } else {
        $item['short_alias'] = '';
      }
    }

    $item['langcode'] = $langcode;
    return $item;
  }

  /**
   * Build JSON-safe calendar payload with UAE/UTC-safe timestamps.
   *
   * Uses all four event fields:
   * - field_start_date / field_end_date: datetime storage, date-only (YYYY-MM-DD).
   * - field_start_time / field_end_time: time_field storage (seconds since midnight).
   */
  private function buildCalendarJson(NodeInterface $node): array
  {
    $timezone = 'Asia/Dubai';

    $title = $node->label();
    $description = '';
    if ($node->hasField('field_description') && !$node->get('field_description')->isEmpty()) {
      $description = strip_tags((string) $node->get('field_description')->value);
    }

    $startDateRaw = $this->normalizeDateYmd($this->getFieldDateValue($node, 'field_start_date'));
    $endDateRawInput = $this->getFieldDateValue($node, 'field_end_date');
    $endDateRaw = $this->normalizeDateYmd($endDateRawInput !== '' ? $endDateRawInput : $startDateRaw);

    $startSeconds = $this->getTimeFieldSeconds($node, 'field_start_time');
    $endSeconds = $this->getTimeFieldSeconds($node, 'field_end_time');

    $startTimeHms = $this->secondsSinceMidnightToHms($startSeconds);
    $endTimeHms = $this->resolveEndTimeHms($endSeconds);

    $startDubai = $this->buildDubaiDateTime($startDateRaw, $startTimeHms);
    $endDubai = $this->buildDubaiDateTime($endDateRaw, $endTimeHms);
    if ($startDubai && !$endDubai) {
      $endDubai = $startDubai;
    }
    if ($startDubai && $endDubai && $endDubai <= $startDubai) {
      $endDubai = $startDubai->modify('+1 minute');
    }

    $startUtc = $startDubai ? $startDubai->setTimezone(new DateTimeZone('UTC')) : NULL;
    $endUtc = $endDubai ? $endDubai->setTimezone(new DateTimeZone('UTC')) : NULL;

    $uid = $node->id() . '@zayed-university';
    $icsContent = $this->buildIcsContent($uid, $title, $description, $startUtc, $endUtc);

    return [
      'timezone' => $timezone,
      'uid' => $uid,
      'title' => $title,
      'description' => $description,
      'fields' => [
        'field_start_date' => $startDateRaw,
        'field_end_date' => $endDateRawInput !== '' ? $this->normalizeDateYmd($endDateRawInput) : '',
        'field_start_time' => [
          'seconds_since_midnight' => $startSeconds,
          'hms' => $startTimeHms,
        ],
        'field_end_time' => [
          'seconds_since_midnight' => $endSeconds,
          'hms' => $endTimeHms,
        ],
      ],
      'start' => [
        'dubai_iso' => $startDubai?->format(DateTimeImmutable::ATOM) ?? '',
        'utc_iso' => $startUtc?->format(DateTimeImmutable::ATOM) ?? '',
        'ics_utc' => $startUtc?->format('Ymd\THis\Z') ?? '',
      ],
      'end' => [
        'dubai_iso' => $endDubai?->format(DateTimeImmutable::ATOM) ?? '',
        'utc_iso' => $endUtc?->format(DateTimeImmutable::ATOM) ?? '',
        'ics_utc' => $endUtc?->format('Ymd\THis\Z') ?? '',
      ],
      'ics_content' => $icsContent,
    ];
  }

  /**
   * Normalizes stored datetime/date string to Y-m-d (site storage is not TZ-dependent for date-only).
   */
  private function normalizeDateYmd(string $raw): string
  {
    $raw = trim($raw);
    if ($raw === '') {
      return '';
    }
    if (preg_match('/^(\d{4}-\d{2}-\d{2})/', $raw, $m)) {
      return $m[1];
    }
    return substr($raw, 0, 10);
  }

  /**
   * Return a field date value if available.
   */
  private function getFieldDateValue(NodeInterface $node, string $fieldName): string
  {
    if (!$node->hasField($fieldName) || $node->get($fieldName)->isEmpty()) {
      return '';
    }

    $values = $node->get($fieldName)->getValue();
    if (empty($values[0]) || !is_array($values[0])) {
      return '';
    }

    $first = $values[0];

    if (!empty($first['end_value'])) {
      return (string) $first['end_value'];
    }
    if (!empty($first['value'])) {
      return (string) $first['value'];
    }

    return '';
  }

  /**
   * Seconds since midnight from time_field (field type: time), or NULL if empty.
   */
  private function getTimeFieldSeconds(NodeInterface $node, string $fieldName): ?int
  {
    if (!$node->hasField($fieldName) || $node->get($fieldName)->isEmpty()) {
      return NULL;
    }
    $values = $node->get($fieldName)->getValue();
    if (empty($values[0]) || !is_array($values[0]) || !array_key_exists('value', $values[0])) {
      return NULL;
    }
    $value = $values[0]['value'];
    if ($value === NULL || $value === '') {
      return NULL;
    }
    return (int) $value;
  }

  /**
   * Converts seconds since midnight to H:i:s (wall clock, not UTC offset).
   */
  private function secondsSinceMidnightToHms(?int $seconds): string
  {
    if ($seconds === NULL) {
      return '00:00:00';
    }
    $seconds = max(0, min(86399, $seconds));
    return gmdate('H:i:s', $seconds);
  }

  /**
   * Resolves end time when field_end_time is empty (end of day in Dubai on end date).
   */
  private function resolveEndTimeHms(?int $endSeconds): string {
    if ($endSeconds !== NULL) {
      return $this->secondsSinceMidnightToHms($endSeconds);
    }
    return '23:59:59';
  }

  /**
   * Parse a date-time value and normalize as Dubai timezone.
   */
  private function buildDubaiDateTime(string $dateRaw, string $time): ?DateTimeImmutable
  {
    if ($dateRaw === '') {
      return NULL;
    }

    $tzDubai = new DateTimeZone('Asia/Dubai');
    $normalizedDate = substr($dateRaw, 0, 10);

    try {
      return new DateTimeImmutable($normalizedDate . ' ' . $time, $tzDubai);
    }
    catch (\Exception $e) {
      return NULL;
    }
  }

  /**
   * Build plain ICS content string for clients that still need it.
   */
  private function buildIcsContent(
    string $uid,
    string $title,
    string $description,
    ?DateTimeImmutable $startUtc,
    ?DateTimeImmutable $endUtc
  ): string {
    $dtStamp = gmdate('Ymd\THis\Z');
    $dtStart = $startUtc?->format('Ymd\THis\Z') ?? '';
    $dtEnd = $endUtc?->format('Ymd\THis\Z') ?? $dtStart;

    return "BEGIN:VCALENDAR\n" .
      "VERSION:2.0\n" .
      "PRODID:-//Drupal Event Calendar//EN\n" .
      "BEGIN:VEVENT\n" .
      "UID:" . addslashes($uid) . "\n" .
      "DTSTAMP:" . $dtStamp . "\n" .
      "DTSTART:" . $dtStart . "\n" .
      "DTEND:" . $dtEnd . "\n" .
      "SUMMARY:" . addslashes($title) . "\n" .
      "DESCRIPTION:" . addslashes($description) . "\n" .
      "END:VEVENT\n" .
      "END:VCALENDAR";
  }

  /**
   * Returns accepted multimedia formats for event field_multimedia.
   */
  private function getMultimediaAcceptedFormats(): array
  {
    if ($this->cachedMultimediaAcceptedFormats !== NULL) {
      return $this->cachedMultimediaAcceptedFormats;
    }

    $result = [
      'field' => 'field_multimedia',
      'bundles' => [],
      'extensions' => [],
      'providers' => [],
    ];

    $field_config = $this->configFactory->get('field.field.node.event.field_multimedia');
    $target_bundles = $field_config->get('settings.handler_settings.target_bundles') ?? [];
    if (empty($target_bundles) || !is_array($target_bundles)) {
      $this->cachedMultimediaAcceptedFormats = $result;
      return $result;
    }

    $entity_field_manager = \Drupal::service('entity_field.manager');
    foreach ($target_bundles as $bundle) {
      $bundle = (string) $bundle;
      if ($bundle === '') {
        continue;
      }

      $bundle_info = [
        'source' => '',
        'source_field' => '',
        'extensions' => [],
        'providers' => [],
      ];

      $media_type = $this->configFactory->get('media.type.' . $bundle);
      $bundle_info['source'] = (string) ($media_type->get('source') ?? '');
      $bundle_info['source_field'] = (string) ($media_type->get('source_configuration.source_field') ?? '');
      $bundle_info['providers'] = array_values($media_type->get('source_configuration.providers') ?? []);

      if ($bundle_info['source_field'] !== '') {
        $media_fields = $entity_field_manager->getFieldDefinitions('media', $bundle);
        if (isset($media_fields[$bundle_info['source_field']])) {
          $source_def = $media_fields[$bundle_info['source_field']];
          $ext_string = (string) ($source_def->getSetting('file_extensions') ?? '');
          if ($ext_string !== '') {
            $extensions = preg_split('/\s+/', trim($ext_string)) ?: [];
            $bundle_info['extensions'] = array_values(array_filter(array_unique($extensions)));
          }
        }
      }

      $result['bundles'][$bundle] = $bundle_info;
      if (!empty($bundle_info['extensions'])) {
        $result['extensions'] = array_merge($result['extensions'], $bundle_info['extensions']);
      }
      if (!empty($bundle_info['providers'])) {
        $result['providers'] = array_merge($result['providers'], $bundle_info['providers']);
      }
    }

    $result['extensions'] = array_values(array_unique($result['extensions']));
    sort($result['extensions']);

    $result['providers'] = array_values(array_unique($result['providers']));
    sort($result['providers']);

    $this->cachedMultimediaAcceptedFormats = $result;
    return $result;
  }

  /**
   * Convert boolean-ish value to "Yes"/"No" string.
   */
  private function boolToYesNo($value): string
  {
    if (is_bool($value)) {
      return $value ? 'Yes' : 'No';
    }
    if (is_numeric($value)) {
      return ((int) $value) ? 'Yes' : 'No';
    }
    if (is_string($value)) {
      return (strtolower($value) === 'yes' || $value === '1') ? 'Yes' : 'No';
    }
    return 'No';
  }

  /**
   * Strip Twig THEME DEBUG HTML comments from rendered output.
   */
  private function stripThemeDebugComments(string $html): string
  {
    return preg_replace('/<!--.*?-->/s', '', $html);
  }

  /**
   * {@inheritdoc}
   */
  public function getDeployConfig(): array
  {
    return [
      'fileName' => 'zu-event-list',
      'contentKey' => 'eventsData',
      'deployType' => 'events',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExtraPayloadData(string $langcode): array
  {
    $responsive_breakpoints = $this->configFactory
      ->get('event_responsive_config.settings')
      ->get('breakpoints') ?: [];

    $alias_map = $this->getFieldAliasMap();

    // Get field definitions to extract labels.
    $field_definitions = \Drupal::service('entity_field.manager')
      ->getFieldDefinitions('node', 'event');

    foreach ($responsive_breakpoints as $id => &$settings) {
      $settings['active'] = !empty($settings['active']) ? 1 : 0;
      if ($settings['active']) {
        $display = $this->displayRepository->getViewDisplay('node', 'event', $id);
        if ($display) {
          $components = $display->getComponents();
          $enabled_fields = [];

          foreach ($components as $field_name => $component) {
            // Get the field label from field definition.
            $field_type = '';
            $field_label = $field_name;
            if (isset($field_definitions[$field_name])) {
              $field_label = (string) $field_definitions[$field_name]->getLabel();
              $field_type = $field_definitions[$field_name]->getType();

              // For entity_reference fields, append the target type for frontend
              if ($field_type === 'entity_reference' || $field_type === 'entity_reference_revisions') {
                $target_type = $field_definitions[$field_name]->getSetting('target_type');
                if ($target_type) {
                  $field_type = $field_type . ':' . $target_type;
                }
              }
            }

            $enabled_fields[] = [
              'machineName' => $field_name,
              'fieldName' => $field_label,
              'fieldType' => $field_type,
              'weight' => (int) ($component['weight'] ?? 0),
              'viewMode' => $component['label'] ?? 'above',
            ];
          }

          // Sort by weight ascending.
          usort($enabled_fields, function ($a, $b) {
            return $a['weight'] <=> $b['weight'];
          });

          $settings['enabled_fields'] = $enabled_fields;
        }
      }
    }

    // Ensure default is at the end of the array to act as a fallback in frontend logic
    if (isset($responsive_breakpoints['default'])) {
      $default_bp = $responsive_breakpoints['default'];
      unset($responsive_breakpoints['default']);
      $responsive_breakpoints['default'] = $default_bp;
    }

    return [
      'responsiveBreakpoints' => $responsive_breakpoints,
    ];
  }

  /**
   * Clean render array
   */
  private function cleanRenderArray(&$build): void
  {
    if (!is_array($build)) {
      return;
    }

    foreach ($build as $key => &$value) {
      if (is_string($key) && str_contains($key, 'flag')) {
        unset($build[$key]);
        continue;
      }
      if (is_array($value) && isset($value['#theme']) && $value['#theme'] === 'flag') {
        unset($build[$key]);
        continue;
      }
      if ($key === '#contextual_links' || $key === 'contextual') {
        unset($build[$key]);
        continue;
      }
      if (is_array($value) && isset($value['#attributes'])) {
        unset($value['#attributes']['data-contextual-id']);
        unset($value['#attributes']['data-contextual-token']);
        unset($value['#attributes']['class']['contextual-region']);
      }
      if (is_array($value) && isset($value['#attached']['library'])) {
        $value['#attached']['library'] = array_filter(
          $value['#attached']['library'],
          fn($lib) =>
          !str_starts_with($lib, 'contextual') &&
          !str_starts_with($lib, 'flag') &&
          !str_starts_with($lib, 'toolbar')
        );
      }
      if (is_array($value)) {
        $this->cleanRenderArray($value);
      }
    }
  }

}
