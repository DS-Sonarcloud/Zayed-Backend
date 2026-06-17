<?php

declare(strict_types=1);

namespace Drupal\zu_personalization\Plugin\Action;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Action\ConfigurableActionBase;
use Drupal\Core\Database\Connection;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Bulk-assigns personalization rules to selected nodes.
 *
 * Admin creates one or more named instances at /admin/config/system/actions,
 * configures which rules/langcode/overwrite flag to use, then the instance
 * appears in the Views bulk-operations dropdown on any node listing.
 *
 * @Action(
 *   id = "zu_personalization_bulk_assign_rules",
 *   label = @Translation("Assign personalization rules"),
 *   type = "node"
 * )
 */
final class BulkAssignPersonalizationRules extends ConfigurableActionBase implements ContainerFactoryPluginInterface {

  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    private readonly Connection $database,
    private readonly TimeInterface $time,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('database'),
      $container->get('datetime.time'),
    );
  }

  // ── Configuration ──────────────────────────────────────────────────────────

  public function defaultConfiguration(): array {
    return [
      'rule_ids'  => [],
      'langcode'  => 'en',
      'overwrite' => FALSE,
    ];
  }

  public function buildConfigurationForm(array $form, FormStateInterface $form_state): array {
    $rules = $this->loadActiveRules();

    if (empty($rules)) {
      $form['notice'] = [
        '#markup' => '<p class="messages messages--warning">' .
          $this->t('No active personalization rules found. <a href="/admin/config/zu-personalization/rules">Create rules first</a>, then return here to configure this action.') .
          '</p>',
      ];
      return $form;
    }

    $options = [];
    foreach ($rules as $rule) {
      $options[$rule->id] = $this->t('@name (@type, priority @p)', [
        '@name' => $rule->name,
        '@type' => ucfirst((string) $rule->rule_type),
        '@p'    => $rule->priority,
      ]);
    }

    $form['rule_ids'] = [
      '#type'          => 'checkboxes',
      '#title'         => $this->t('Rules to assign'),
      '#options'       => $options,
      '#default_value' => array_map('strval', (array) ($this->configuration['rule_ids'] ?? [])),
      '#required'      => TRUE,
      '#description'   => $this->t('Every checked rule will be linked to all selected nodes. An empty variant placeholder is created so editors can fill in variant content per node via the personalization admin.'),
    ];

    $form['langcode'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Language'),
      '#options'       => ['en' => $this->t('English'), 'ar' => $this->t('Arabic')],
      '#default_value' => $this->configuration['langcode'] ?? 'en',
      '#description'   => $this->t('Creates a variant record for this language. Run the action twice (EN + AR) for bilingual content.'),
    ];

    $form['overwrite'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Overwrite existing variant content'),
      '#default_value' => (bool) ($this->configuration['overwrite'] ?? FALSE),
      '#description'   => $this->t('If checked, existing variant_content for matching nid/rule/langcode is cleared. Leave unchecked to preserve content already entered by editors.'),
    ];

    return $form;
  }

  public function validateConfigurationForm(array &$form, FormStateInterface $form_state): void {
    $selected = array_filter((array) $form_state->getValue('rule_ids'));
    if (empty($selected)) {
      $form_state->setErrorByName('rule_ids', $this->t('Select at least one personalization rule.'));
    }
  }

  public function submitConfigurationForm(array &$form, FormStateInterface $form_state): void {
    $this->configuration['rule_ids'] = array_values(array_map('intval', array_filter((array) $form_state->getValue('rule_ids'))));
    $this->configuration['langcode'] = (string) $form_state->getValue('langcode');
    $this->configuration['overwrite'] = (bool) $form_state->getValue('overwrite');
  }

  // ── Execution ──────────────────────────────────────────────────────────────

  public function execute(mixed $entity = NULL): void {
    if ($entity === NULL || !method_exists($entity, 'id')) {
      return;
    }

    $nid      = (int) $entity->id();
    $rule_ids = array_map('intval', (array) ($this->configuration['rule_ids'] ?? []));
    $langcode = (string) ($this->configuration['langcode'] ?? 'en');
    $overwrite = (bool) ($this->configuration['overwrite'] ?? FALSE);
    $now      = $this->time->getRequestTime();

    foreach (array_filter($rule_ids) as $rule_id) {
      $existing = $this->database->select('zu_personalized_content', 'p')
        ->fields('p', ['id'])
        ->condition('nid', $nid)
        ->condition('rule_id', $rule_id)
        ->condition('langcode', $langcode)
        ->range(0, 1)
        ->execute()
        ->fetchField();

      if ($existing) {
        if ($overwrite) {
          $this->database->update('zu_personalized_content')
            ->fields(['variant_content' => NULL, 'created' => $now])
            ->condition('id', (int) $existing)
            ->execute();
        }
        // Not overwrite → keep existing variant_content untouched.
        continue;
      }

      $this->database->insert('zu_personalized_content')
        ->fields([
          'nid'             => $nid,
          'rule_id'         => $rule_id,
          'variant_content' => NULL,
          'langcode'        => $langcode,
          'created'         => $now,
        ])
        ->execute();
    }
  }

  public function access(mixed $object, AccountInterface $account = NULL, $return_as_object = FALSE): mixed {
    return $object->access('update', $account, $return_as_object);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * @return list<object{id:int, name:string, rule_type:string, priority:int}>
   */
  private function loadActiveRules(): array {
    if (!$this->database->schema()->tableExists('zu_personalization_rule')) {
      return [];
    }
    return $this->database->select('zu_personalization_rule', 'r')
      ->fields('r', ['id', 'name', 'rule_type', 'priority'])
      ->condition('status', 1)
      ->orderBy('priority', 'DESC')
      ->orderBy('name', 'ASC')
      ->execute()
      ->fetchAll();
  }

}
