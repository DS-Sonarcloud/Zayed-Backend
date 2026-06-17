<?php

namespace Drupal\zu_personalization\Form;

use Drupal\Core\Database\Connection;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Add / edit a personalization rule.
 *
 * Rule types supported (FRD: Role, Dynamic/Context, Device, Geo, Language,
 * Department, Content-type):
 *  - role         → conditions.roles[]
 *  - device       → conditions.devices[]
 *  - geo          → conditions.countries[], conditions.cities[]
 *  - language     → conditions.langcodes[]
 *  - department   → conditions.department_ids[]
 *  - content_type → conditions.content_types[]
 */
final class PersonalizationRuleForm extends FormBase {

  public function __construct(
    private readonly Connection $database,
    private readonly DateFormatterInterface $dateFormatter,
  ) {}

  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('database'),
      $container->get('date.formatter'),
    );
  }

  public function getFormId(): string {
    return 'zu_personalization_rule_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, int $rule_id = 0): array {
    $rule = $rule_id ? $this->loadRule($rule_id) : NULL;
    $conditions = $rule ? (json_decode((string) ($rule->conditions ?? '{}'), TRUE) ?? []) : [];

    $form['#tree'] = TRUE;

    $form['rule_id'] = ['#type' => 'hidden', '#value' => $rule_id];

    $form['name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Rule Name'),
      '#description' => $this->t('A descriptive name, e.g. "Student – Mobile – Arabic".'),
      '#default_value' => $rule->name ?? '',
      '#required' => TRUE,
      '#maxlength' => 255,
    ];

    $form['rule_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Rule Type'),
      '#description' => $this->t('The primary dimension this rule targets.'),
      '#options' => [
        'role'         => $this->t('Role-Based'),
        'device'       => $this->t('Device-Based'),
        'geo'          => $this->t('Geo-Location'),
        'language'     => $this->t('Language'),
        'department'   => $this->t('Department'),
        'content_type' => $this->t('Content Type'),
      ],
      '#default_value' => $rule->rule_type ?? 'role',
      '#required' => TRUE,
    ];

    $form['priority'] = [
      '#type' => 'number',
      '#title' => $this->t('Priority'),
      '#description' => $this->t('Higher value = evaluated first. Rules with the same priority run in ID order.'),
      '#default_value' => $rule->priority ?? 100,
      '#min' => 0,
      '#max' => 9999,
      '#required' => TRUE,
    ];

    $form['status'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Active'),
      '#description' => $this->t('Inactive rules are stored but never evaluated.'),
      '#default_value' => $rule ? (bool) $rule->status : TRUE,
    ];

    // ── Condition fieldsets, shown/hidden by rule_type via #states ─────────

    $type_selector = ':input[name="rule_type"]';

    $form['conditions'] = ['#type' => 'container', '#tree' => TRUE];

    // Role conditions.
    $form['conditions']['role_group'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Role Conditions'),
      '#description' => $this->t('Rule applies when the user has ANY of the selected roles.'),
      '#states' => ['visible' => [$type_selector => ['value' => 'role']]],
    ];
    $form['conditions']['role_group']['roles'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Roles'),
      '#options' => $this->getDrupalRoleOptions(),
      '#default_value' => (array) ($conditions['roles'] ?? []),
    ];

    // Device conditions.
    $form['conditions']['device_group'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Device Conditions'),
      '#description' => $this->t('Rule applies when the visitor uses ANY of the selected device types.'),
      '#states' => ['visible' => [$type_selector => ['value' => 'device']]],
    ];
    $form['conditions']['device_group']['devices'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Device Types'),
      '#options' => [
        'mobile'  => $this->t('Mobile'),
        'tablet'  => $this->t('Tablet'),
        'desktop' => $this->t('Desktop'),
      ],
      '#default_value' => (array) ($conditions['devices'] ?? []),
    ];

    // Geo conditions.
    $form['conditions']['geo_group'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Geo-Location Conditions'),
      '#description' => $this->t('Rule applies when the visitor is in one of the specified countries / cities.'),
      '#states' => ['visible' => [$type_selector => ['value' => 'geo']]],
    ];
    $form['conditions']['geo_group']['countries'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Countries (ISO codes)'),
      '#description' => $this->t('Comma-separated ISO 3166-1 alpha-2 codes, e.g. <em>AE, SA, US</em>. Leave blank for any country.'),
      '#default_value' => implode(', ', (array) ($conditions['countries'] ?? [])),
    ];
    $form['conditions']['geo_group']['cities'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Cities'),
      '#description' => $this->t('Comma-separated city names, e.g. <em>Dubai, Abu Dhabi</em>. Leave blank for any city.'),
      '#default_value' => implode(', ', (array) ($conditions['cities'] ?? [])),
    ];

    // Language conditions.
    $form['conditions']['language_group'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Language Conditions'),
      '#states' => ['visible' => [$type_selector => ['value' => 'language']]],
    ];
    $form['conditions']['language_group']['langcodes'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Languages'),
      '#options' => ['en' => 'English', 'ar' => 'Arabic'],
      '#default_value' => (array) ($conditions['langcodes'] ?? []),
    ];

    // Department conditions.
    $form['conditions']['department_group'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Department Conditions'),
      '#description' => $this->t('Rule applies to users assigned to any of these department taxonomy term IDs.'),
      '#states' => ['visible' => [$type_selector => ['value' => 'department']]],
    ];
    $form['conditions']['department_group']['department_ids'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Department IDs'),
      '#description' => $this->t('Comma-separated taxonomy term IDs, e.g. <em>12, 34, 56</em>.'),
      '#default_value' => implode(', ', (array) ($conditions['department_ids'] ?? [])),
    ];

    // Content-type conditions.
    $form['conditions']['content_type_group'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Content Type Conditions'),
      '#description' => $this->t('Rule applies only when the requested page is one of these content types.'),
      '#states' => ['visible' => [$type_selector => ['value' => 'content_type']]],
    ];
    $form['conditions']['content_type_group']['content_types'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Content Types'),
      '#description' => $this->t('Comma-separated machine names, e.g. <em>event, news, article</em>.'),
      '#default_value' => implode(', ', (array) ($conditions['content_types'] ?? [])),
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $rule_id ? $this->t('Update Rule') : $this->t('Add Rule'),
      '#button_type' => 'primary',
    ];
    $form['actions']['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Cancel'),
      '#url' => Url::fromRoute('zu_personalization.rule_list'),
      '#attributes' => ['class' => ['button']],
    ];

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $rule_id  = (int) $form_state->getValue('rule_id');
    $rule_type = (string) $form_state->getValue('rule_type');
    $cond_values = (array) ($form_state->getValue('conditions') ?? []);

    $conditions = $this->extractConditions($rule_type, $cond_values);

    $now = \Drupal::time()->getRequestTime();
    $fields = [
      'name'       => (string) $form_state->getValue('name'),
      'rule_type'  => $rule_type,
      'conditions' => json_encode($conditions, JSON_UNESCAPED_UNICODE),
      'priority'   => (int) $form_state->getValue('priority'),
      'status'     => (int) (bool) $form_state->getValue('status'),
      'updated'    => $now,
    ];

    if ($rule_id) {
      $this->database->update('zu_personalization_rule')
        ->fields($fields)
        ->condition('id', $rule_id)
        ->execute();
      $this->messenger()->addStatus($this->t('Personalization rule updated.'));
    }
    else {
      $fields['created']    = $now;
      $fields['created_by'] = (int) \Drupal::currentUser()->id();
      $fields['site_id']    = 0;
      $this->database->insert('zu_personalization_rule')->fields($fields)->execute();
      $this->messenger()->addStatus($this->t('Personalization rule created.'));
    }

    $form_state->setRedirectUrl(Url::fromRoute('zu_personalization.rule_list'));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private function loadRule(int $id): ?object {
    if (!$this->database->schema()->tableExists('zu_personalization_rule')) {
      return NULL;
    }
    return $this->database->select('zu_personalization_rule', 'r')
      ->fields('r')
      ->condition('id', $id)
      ->execute()
      ->fetchObject() ?: NULL;
  }

  private function getDrupalRoleOptions(): array {
    $roles = \Drupal::entityTypeManager()->getStorage('user_role')->loadMultiple();
    $options = [];
    foreach ($roles as $rid => $role) {
      if (in_array($rid, ['anonymous', 'authenticated'], TRUE)) {
        continue;
      }
      $options[$rid] = $role->label();
    }
    return $options;
  }

  private function extractConditions(string $type, array $values): array {
    return match ($type) {
      'role' => [
        'roles' => array_values(array_filter((array) ($values['role_group']['roles'] ?? []))),
      ],
      'device' => [
        'devices' => array_values(array_filter((array) ($values['device_group']['devices'] ?? []))),
      ],
      'geo' => [
        'countries' => $this->splitCsv((string) ($values['geo_group']['countries'] ?? '')),
        'cities'    => $this->splitCsv((string) ($values['geo_group']['cities'] ?? '')),
      ],
      'language' => [
        'langcodes' => array_values(array_filter((array) ($values['language_group']['langcodes'] ?? []))),
      ],
      'department' => [
        'department_ids' => array_map('intval', $this->splitCsv((string) ($values['department_group']['department_ids'] ?? ''))),
      ],
      'content_type' => [
        'content_types' => $this->splitCsv((string) ($values['content_type_group']['content_types'] ?? '')),
      ],
      default => [],
    };
  }

  private function splitCsv(string $raw): array {
    if ($raw === '') {
      return [];
    }
    return array_values(array_filter(array_map('trim', explode(',', $raw))));
  }

}
