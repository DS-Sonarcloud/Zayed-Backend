<?php

declare(strict_types=1);

namespace Drupal\zu_personalization\Form;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\CloseModalDialogCommand;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Ajax\InvokeCommand;
use Drupal\Core\Database\Connection;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Modal form for bulk-assigning or bulk-removing personalization rules.
 *
 * Opened via AJAX from the event dashboard bulk-actions JS.
 * Route params:  action_type = 'assign' | 'remove'
 * Query params:  nids = comma-separated node IDs
 */
final class BulkPersonalizationModalForm extends FormBase {

  public function __construct(
    private readonly Connection $database,
    private readonly TimeInterface $time,
  ) {}

  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('database'),
      $container->get('datetime.time'),
    );
  }

  public function getFormId(): string {
    return 'zu_personalization_bulk_modal_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, string $action_type = 'assign'): array {
    $nids     = $this->parseNids($this->getRequest()->query->get('nids', ''));
    $is_assign = $action_type === 'assign';
    $rules    = $is_assign ? $this->loadActiveRules() : $this->loadRulesForNodes($nids);

    // ── Pass hidden context ────────────────────────────────────────────────
    $form['action_type'] = ['#type' => 'hidden', '#value' => $action_type];
    $form['nids']        = ['#type' => 'hidden', '#value' => implode(',', $nids)];

    // ── Node count info ───────────────────────────────────────────────────
    $form['info'] = [
      '#markup' => '<p class="zp-bulk-modal__info">' .
        ($is_assign
          ? $this->formatPlural(count($nids), 'Assigning rules to <strong>1 node</strong>.', 'Assigning rules to <strong>@count nodes</strong>.')
          : $this->formatPlural(count($nids), 'Removing rules from <strong>1 node</strong>.', 'Removing rules from <strong>@count nodes</strong>.')
        ) . '</p>',
    ];

    // ── Error container (populated by AJAX on validation failure) ─────────
    $form['messages'] = [
      '#type'       => 'container',
      '#attributes' => ['id' => 'zp-bulk-modal-messages', 'class' => ['zp-bulk-modal__messages']],
    ];

    if (empty($rules)) {
      $form['empty'] = [
        '#markup' => '<p class="messages messages--warning">' .
          ($is_assign
            ? $this->t('No active personalization rules found. <a href="/admin/config/zu-personalization/rules">Create rules first.</a>')
            : $this->t('None of the selected nodes have personalization rules assigned.')
          ) . '</p>',
      ];
      return $form;
    }

    // ── Search / filter ────────────────────────────────────────────────────
    $form['filter'] = [
      '#type'        => 'search',
      '#title'       => $this->t('Filter rules'),
      '#title_display' => 'invisible',
      '#placeholder' => $this->t('Search rules…'),
      '#attributes'  => [
        'class'          => ['zp-bulk-modal__filter'],
        'data-filter-target' => '#zp-bulk-rule-list',
        'autocomplete'   => 'off',
      ],
    ];

    // ── Rule checkboxes ────────────────────────────────────────────────────
    $options = [];
    foreach ($rules as $rule) {
      $label = $rule->name . ' <span class="zp-rule-meta">(' . ucfirst((string) $rule->rule_type) . ', P' . $rule->priority . ')</span>';
      if (!$is_assign && isset($rule->node_count)) {
        $label .= ' <span class="zp-rule-meta">' . $this->formatPlural((int) $rule->node_count, '1 of selected', '@count of selected') . '</span>';
      }
      $options[$rule->id] = $label;
    }

    $form['rule_ids'] = [
      '#type'          => 'checkboxes',
      '#title'         => $this->t('Rules'),
      '#title_display' => 'invisible',
      '#options'       => $options,
      '#required'      => TRUE,
      '#attributes'    => [
        'id'    => 'zp-bulk-rule-list',
        'class' => ['zp-bulk-modal__rule-list'],
      ],
    ];

    // ── Language (assign only) ────────────────────────────────────────────
    if ($is_assign) {
      $form['langcode'] = [
        '#type'          => 'select',
        '#title'         => $this->t('Language'),
        '#options'       => ['en' => $this->t('English'), 'ar' => $this->t('Arabic')],
        '#default_value' => 'en',
        '#attributes'    => ['class' => ['zp-bulk-modal__lang']],
      ];

      $form['overwrite'] = [
        '#type'        => 'checkbox',
        '#title'       => $this->t('Overwrite existing variant content'),
        '#description' => $this->t('If checked, existing variant content is cleared. Leave unchecked to preserve editor work.'),
      ];
    }

    // ── Language scope (remove only) ──────────────────────────────────────
    if (!$is_assign) {
      $form['langcode'] = [
        '#type'          => 'select',
        '#title'         => $this->t('Language scope'),
        '#options'       => [
          ''   => $this->t('All languages'),
          'en' => $this->t('English only'),
          'ar' => $this->t('Arabic only'),
        ],
        '#default_value' => '',
      ];
    }

    // ── Submit ────────────────────────────────────────────────────────────
    $form['actions'] = [
      '#type'   => 'actions',
      '#weight' => 100,
    ];
    $form['actions']['submit'] = [
      '#type'   => 'submit',
      '#value'  => $is_assign ? $this->t('Assign rules') : $this->t('Remove rules'),
      '#button_type' => 'primary',
      '#ajax'   => [
        'callback' => '::ajaxSubmit',
        'wrapper'  => 'zp-bulk-modal-messages',
        'progress' => ['type' => 'throbber'],
      ],
      '#attributes' => ['class' => ['zp-bulk-modal__submit']],
    ];
    $form['actions']['cancel'] = [
      '#type'       => 'button',
      '#value'      => $this->t('Cancel'),
      '#attributes' => ['class' => ['dialog-cancel', 'zp-bulk-modal__cancel']],
      '#limit_validation_errors' => [],
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $selected = array_filter((array) $form_state->getValue('rule_ids', []));
    if (empty($selected)) {
      $form_state->setErrorByName('rule_ids', $this->t('Select at least one rule.'));
    }
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    // Actual processing done in ajaxSubmit().
  }

  public function ajaxSubmit(array &$form, FormStateInterface $form_state): AjaxResponse {
    $response = new AjaxResponse();

    if ($form_state->hasAnyErrors()) {
      $messages = ['#type' => 'status_messages'];
      $response->addCommand(new HtmlCommand('#zp-bulk-modal-messages', $messages));
      return $response;
    }

    $nids      = $this->parseNids((string) $form_state->getValue('nids', ''));
    $rule_ids  = array_values(array_map('intval', array_filter((array) $form_state->getValue('rule_ids', []))));
    $langcode  = (string) $form_state->getValue('langcode', 'en');
    $overwrite = (bool) $form_state->getValue('overwrite', FALSE);
    $action    = (string) $form_state->getValue('action_type', 'assign');

    try {
      if ($action === 'assign') {
        [$assigned, $skipped] = $this->processAssign($nids, $rule_ids, $langcode, $overwrite);
        $msg = $this->t('Assigned @r rule(s) to @n node(s). @s assignment(s) skipped (already exist).', [
          '@r' => count($rule_ids),
          '@n' => $assigned,
          '@s' => $skipped,
        ]);
      }
      else {
        $deleted = $this->processRemove($nids, $rule_ids, $langcode);
        $msg = $this->t('Removed @r rule(s) from @n node(s).', [
          '@r' => count($rule_ids),
          '@n' => $deleted,
        ]);
      }

      $response->addCommand(new CloseModalDialogCommand());
      $response->addCommand(new InvokeCommand(
        '#zu-personalization-bulk-status',
        'text',
        [$msg->__toString()]
      ));
      $response->addCommand(new InvokeCommand(
        '#zu-personalization-bulk-status',
        'show',
        []
      ));
    }
    catch (\Throwable $e) {
      $response->addCommand(new HtmlCommand(
        '#zp-bulk-modal-messages',
        '<div class="messages messages--error">' . $this->t('Error: @msg', ['@msg' => $e->getMessage()]) . '</div>'
      ));
    }

    return $response;
  }

  // ── Processing ─────────────────────────────────────────────────────────────

  /**
   * @param list<int> $nids
   * @param list<int> $rule_ids
   * @return array{0: int, 1: int}  [assigned_count, skipped_count]
   */
  private function processAssign(array $nids, array $rule_ids, string $langcode, bool $overwrite): array {
    $assigned = 0;
    $skipped  = 0;
    $now      = $this->time->getRequestTime();

    foreach ($nids as $nid) {
      foreach ($rule_ids as $rule_id) {
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
            $assigned++;
          }
          else {
            $skipped++;
          }
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
        $assigned++;
      }
    }

    return [$assigned, $skipped];
  }

  /**
   * @param list<int> $nids
   * @param list<int> $rule_ids
   */
  private function processRemove(array $nids, array $rule_ids, string $langcode): int {
    $query = $this->database->delete('zu_personalized_content')
      ->condition('nid', $nids, 'IN')
      ->condition('rule_id', $rule_ids, 'IN');

    if ($langcode !== '') {
      $query->condition('langcode', $langcode);
    }

    return (int) $query->execute();
  }

  // ── Data loaders ──────────────────────────────────────────────────────────

  /**
   * @return list<object{id:int,name:string,rule_type:string,priority:int}>
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

  /**
   * For remove: load rules currently assigned to at least one of the given nodes.
   *
   * @param list<int> $nids
   * @return list<object{id:int,name:string,rule_type:string,priority:int,node_count:int}>
   */
  private function loadRulesForNodes(array $nids): array {
    if (empty($nids) || !$this->database->schema()->tableExists('zu_personalized_content')) {
      return [];
    }

    $query = $this->database->select('zu_personalized_content', 'pc');
    $query->join('zu_personalization_rule', 'r', 'r.id = pc.rule_id');
    $query->fields('r', ['id', 'name', 'rule_type', 'priority']);
    $query->addExpression('COUNT(DISTINCT pc.nid)', 'node_count');
    $query->condition('pc.nid', $nids, 'IN');
    $query->condition('r.status', 1);
    $query->groupBy('r.id');
    $query->groupBy('r.name');
    $query->groupBy('r.rule_type');
    $query->groupBy('r.priority');
    $query->orderBy('r.priority', 'DESC');

    return $query->execute()->fetchAll();
  }

  /**
   * @return list<int>
   */
  private function parseNids(string $raw): array {
    if ($raw === '') {
      return [];
    }
    return array_values(array_filter(array_map('intval', explode(',', $raw))));
  }

}
