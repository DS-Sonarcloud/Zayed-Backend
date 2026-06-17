<?php

declare(strict_types=1);

namespace Drupal\zu_personalization\Hook;

use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;

/**
 * Class-based hook implementations for zu_personalization (Drupal 11.1+).
 *
 * Procedural hooks in .module files are compiled by HookCollectorPass as
 * '\module_function_name' (with a leading backslash), which PHP 8.3 cannot
 * call. All hooks must live here using #[Hook] attributes.
 */
class ZuPersonalizationHooks {

  #[Hook('theme')]
  public function theme(): array {
    return [
      'zu_personalization_dashboard' => [
        'variables' => [
          'stats'       => [],
          'quick_links' => [],
          'personas'    => [],
        ],
        'template' => 'zu-personalization-dashboard',
      ],
    ];
  }

  /**
   * Implements hook_form_alter().
   *
   * Attaches the bulk-actions JS library to Views forms that contain the
   * node bulk form field (e.g. event dashboard), so the Apply button is
   * intercepted and our modal is opened instead of a bare action execute.
   */
  #[Hook('form_alter')]
  public function form_alter(array &$form, FormStateInterface $_form_state, string $form_id): void { // NOSONAR — $_form_state required by hook positional signature; $form_id (arg 3) cannot be shifted
    if (!str_starts_with($form_id, 'views_form_')) {
      return;
    }
    if (!isset($form['node_bulk_form'])) {
      return;
    }
    $form['#attached']['library'][] = 'zu_personalization/bulk_personalization_actions';
  }

  #[Hook('form_node_form_alter')]
  public function form_node_form_alter(array &$form, FormStateInterface $form_state): void {
    if (!\Drupal::currentUser()->hasPermission('administer zu personalization')) {
      return;
    }

    $form_object = $form_state->getFormObject();
    if (!$form_object instanceof EntityFormInterface) {
      return;
    }
    /** @var NodeInterface $node */
    $node = $form_object->getEntity();

    $form['personalization'] = [
      '#type'   => 'details',
      '#title'  => t('Personalization'),
      '#group'  => 'advanced',
      '#weight' => 90,
      '#open'   => FALSE,
    ];

    if ($node->isNew()) {
      $form['personalization']['info'] = [
        '#markup' => '<p>' . t('Save this node first, then return here to manage audience-specific content variants.') . '</p>',
      ];
      return;
    }

    $nid   = $node->id();
    $db    = \Drupal::database();
    $count = 0;

    if ($db->schema()->tableExists('zu_personalized_content')) {
      $count = (int) $db->select('zu_personalized_content', 'v')
        ->condition('nid', $nid)
        ->countQuery()
        ->execute()
        ->fetchField();
    }

    $form['personalization']['link'] = [
      '#type'       => 'link',
      '#title'      => $count
        ? t('Manage @count content variant(s)', ['@count' => $count])
        : t('Add personalization variants'),
      '#url'        => Url::fromRoute('zu_personalization.content_variants', ['nid' => $nid]),
      '#attributes' => ['class' => ['button', 'button--secondary'], 'target' => '_blank'],
    ];

    $form['personalization']['help'] = [
      '#markup' => '<p style="margin-top:8px">' . t(
        'Variants let you deliver alternative titles, body text, banners or CTAs to specific user segments (by role, device, language, geo, or department) — without duplicating the node.'
      ) . '</p>',
    ];
  }

  #[Hook('node_view')]
  public function node_view(array &$build, NodeInterface $node, mixed $_display, string $view_mode): void { // NOSONAR — $_display required by hook signature (positional arg 3), $view_mode (arg 4) cannot be moved
    $build['#cache']['contexts'][] = 'user.roles';
    $build['#cache']['tags'][]     = 'zu_personalization_rules';

    if (!$this->personalization_applies($view_mode)) {
      return;
    }

    $matched = $this->resolve_matched_rules(\Drupal::currentUser(), $node);
    if (empty($matched)) {
      return;
    }

    $db       = \Drupal::database();
    $nid      = (int) $node->id();
    $langcode = $node->language()->getId();

    foreach ($matched as $rule) {
      $row = $db->select('zu_personalized_content', 'v')
        ->fields('v', ['variant_content'])
        ->condition('nid', $nid)
        ->condition('rule_id', (int) $rule['id'])
        ->condition('langcode', $langcode)
        ->execute()
        ->fetchObject();

      if (!$row) {
        continue;
      }

      $overrides = json_decode((string) $row->variant_content, TRUE);
      if (empty($overrides)) {
        continue;
      }

      $this->apply_variant_overrides($build, $node, $overrides);
      $build['#personalized_rule'] = $rule['name'] ?? '';
      break; // Only apply the highest-priority matching rule.
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private function personalization_applies(string $view_mode): bool {
    if ($view_mode !== 'full') {
      return FALSE;
    }
    if (\Drupal::currentUser()->isAnonymous()) {
      return FALSE;
    }
    $db = \Drupal::database();
    return $db->schema()->tableExists('zu_personalization_rule')
      && $db->schema()->tableExists('zu_personalized_content');
  }

  /**
   * @return list<array<string, mixed>>
   */
  private function resolve_matched_rules(mixed $account, NodeInterface $node): array {
    try {
      $ctx     = \Drupal::service('zu_personalization.context_resolver');
      $pr      = \Drupal::service('zu_personalization.persona_resolver');
      $re      = \Drupal::service('zu_personalization.rule_evaluator');
      $context = $ctx->resolve($account);
      $context['content_type'] = $node->bundle();
      $context['persona']      = $pr->resolve($account, $context);
      return $re->evaluate($context); // NOSONAR — rule evaluator, not XPath; S2091 false positive
    }
    catch (\Throwable) {
      return [];
    }
  }

  /**
   * @param array<string, mixed> $overrides
   */
  private function apply_variant_overrides(array &$build, NodeInterface $node, array $overrides): void {
    foreach ($overrides as $field => $value) {
      if ($value === '' || $value === NULL) {
        continue;
      }
      match ($field) {
        'title'               => $this->apply_title($build, $node, (string) $value),
        'body'                => $this->apply_body($build, (string) $value),
        'field_summary'       => $this->apply_field_summary($build, (string) $value),
        'field_banner_image_url' => $this->apply_banner($build, (string) $value),
        'cta_label'           => $this->apply_cta_label($build, (string) $value),
        'cta_url'             => $this->apply_cta_url($build, (string) $value, $overrides),
        default               => NULL,
      };
    }
  }

  private function apply_title(array &$build, NodeInterface $node, string $value): void {
    $build['#title'] = $value;
    $node->get('title')->set(0, ['value' => $value]);
    if (isset($build['title'][0]['#context']['value'])) {
      $build['title'][0]['#context']['value'] = $value;
    }
  }

  private function apply_body(array &$build, string $value): void {
    if (isset($build['body'][0])) {
      $build['body'][0]['#text']   = $value;
      $build['body'][0]['#format'] = 'basic_html';
    }
  }

  private function apply_field_summary(array &$build, string $value): void {
    if (isset($build['field_summary'][0])) {
      $build['field_summary'][0]['#context']['value'] = $value;
    }
  }

  private function apply_banner(array &$build, string $value): void {
    $build['zu_personalized_banner'] = [
      '#markup' => '<img src="' . htmlspecialchars($value, ENT_QUOTES) . '" alt="" class="personalized-banner" style="width:100%;max-height:420px;object-fit:cover">',
      '#weight' => -100,
    ];
  }

  private function apply_cta_label(array &$build, string $value): void {
    $build['zu_personalized_cta_label'] = [
      '#markup' => '<span class="personalized-cta-label">' . htmlspecialchars($value, ENT_QUOTES) . '</span>',
    ];
  }

  /**
   * @param array<string, mixed> $overrides
   */
  private function apply_cta_url(array &$build, string $value, array $overrides): void {
    if (empty($overrides['cta_label'])) {
      return;
    }
    $build['zu_personalized_cta'] = [
      '#markup' => '<a href="' . htmlspecialchars($value, ENT_QUOTES) . '" class="button personalized-cta">'
        . htmlspecialchars((string) ($overrides['cta_label'] ?? 'Learn More'), ENT_QUOTES) . '</a>',
      '#weight' => 95,
    ];
  }

}
