<?php

declare(strict_types=1);

namespace Drupal\zu_personalization\Plugin\Action;

use Drupal\Core\Action\ConfigurableActionBase;
use Drupal\Core\Database\Connection;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Bulk-removes personalization rule assignments from selected nodes.
 *
 * Deletes rows from zu_personalized_content for the configured rules.
 * Does not delete the rules themselves, only the node→rule linkages.
 *
 * @Action(
 *   id = "zu_personalization_bulk_remove_rules",
 *   label = @Translation("Remove personalization rules"),
 *   type = "node"
 * )
 */
final class BulkRemovePersonalizationRules extends ConfigurableActionBase implements ContainerFactoryPluginInterface {

  public function __construct(
    array $configuration,
    string $pluginId,
    mixed $pluginDefinition,
    private readonly Connection $database,
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
  }

  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): static {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('database'),
    );
  }

  // ── Configuration ──────────────────────────────────────────────────────────

  public function defaultConfiguration(): array {
    return [
      'rule_ids'    => [],
      'langcode'    => '',   // '' = all languages
    ];
  }

  public function buildConfigurationForm(array $form, FormStateInterface $form_state): array {
    $rules = $this->loadActiveRules();

    if (empty($rules)) {
      $form['notice'] = [
        '#markup' => '<p class="messages messages--warning">' .
          $this->t('No active personalization rules found.') .
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
      '#title'         => $this->t('Rules to remove'),
      '#options'       => $options,
      '#default_value' => array_map('strval', (array) ($this->configuration['rule_ids'] ?? [])),
      '#required'      => TRUE,
      '#description'   => $this->t('The rule→node link (and any variant content) will be deleted for every selected node. The rule itself is not affected.'),
    ];

    $form['langcode'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Language scope'),
      '#options'       => [
        ''   => $this->t('All languages'),
        'en' => $this->t('English only'),
        'ar' => $this->t('Arabic only'),
      ],
      '#default_value' => $this->configuration['langcode'] ?? '',
      '#description'   => $this->t('Restrict deletion to a specific language, or remove all language variants.'),
    ];

    $form['confirm_note'] = [
      '#markup' => '<p class="messages messages--warning"><strong>' .
        $this->t('Warning:') . '</strong> ' .
        $this->t('This deletes variant content. This action cannot be undone.') .
        '</p>',
    ];

    return $form;
  }

  public function validateConfigurationForm(array &$form, FormStateInterface $form_state): void {
    $selected = array_filter((array) $form_state->getValue('rule_ids'));
    if (empty($selected)) {
      $form_state->setErrorByName('rule_ids', $this->t('Select at least one rule to remove.'));
    }
  }

  public function submitConfigurationForm(array &$form, FormStateInterface $form_state): void {
    $this->configuration['rule_ids'] = array_values(array_map('intval', array_filter((array) $form_state->getValue('rule_ids'))));
    $this->configuration['langcode'] = (string) $form_state->getValue('langcode');
  }

  // ── Execution ──────────────────────────────────────────────────────────────

  public function execute(mixed $entity = NULL): void {
    if ($entity === NULL || !method_exists($entity, 'id')) {
      return;
    }

    $nid      = (int) $entity->id();
    $rule_ids = array_map('intval', (array) ($this->configuration['rule_ids'] ?? []));
    $langcode = (string) ($this->configuration['langcode'] ?? '');

    if (empty(array_filter($rule_ids))) {
      return;
    }

    $query = $this->database->delete('zu_personalized_content')
      ->condition('nid', $nid)
      ->condition('rule_id', array_filter($rule_ids), 'IN');

    if ($langcode !== '') {
      $query->condition('langcode', $langcode);
    }

    $query->execute();
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
