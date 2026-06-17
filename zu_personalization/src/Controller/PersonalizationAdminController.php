<?php

namespace Drupal\zu_personalization\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Admin controller for personalization rules, personas, and content variants.
 */
final class PersonalizationAdminController extends ControllerBase {

  public function __construct(
    private readonly Connection $database,
  ) {}

  public static function create(ContainerInterface $container): static {
    return new static($container->get('database'));
  }

  /**
   * Dashboard: stats overview + quick links.
   */
  public function dashboard(): array {
    $rule_count = $this->safeCount('zu_personalization_rule');
    $persona_count = $this->safeCount('zu_user_persona');
    $variant_count = $this->safeCount('zu_personalized_content');
    $active_rules = $this->safeCount('zu_personalization_rule', ['status' => 1]);

    $stats = [
      ['label' => 'Total Rules', 'value' => $rule_count, 'class' => 'stat-primary'],
      ['label' => 'Active Rules', 'value' => $active_rules, 'class' => 'stat-success'],
      ['label' => 'User Personas Tracked', 'value' => $persona_count, 'class' => 'stat-info'],
      ['label' => 'Content Variants', 'value' => $variant_count, 'class' => 'stat-warning'],
    ];

    $quick_links = [
      Link::fromTextAndUrl('+ Add Rule', Url::fromRoute('zu_personalization.rule_add'))->toRenderable(),
      Link::fromTextAndUrl('View All Rules', Url::fromRoute('zu_personalization.rule_list'))->toRenderable(),
    ];

    $personas = [];
    if ($this->database->schema()->tableExists('zu_user_persona')) {
      $query = $this->database->select('zu_user_persona', 'p');
      $query->addField('p', 'persona_type');
      $query->addExpression('AVG(p.confidence_score)', 'avg_confidence');
      $query->addExpression('COUNT(*)', 'count');
      $query->groupBy('p.persona_type');
      $rows = $query->execute()->fetchAll();

      foreach ($rows as $row) {
        $personas[] = [
          'type' => $row->persona_type,
          'count' => (int) $row->count,
          'avg_confidence' => round((float) $row->avg_confidence, 2),
        ];
      }
    }

    return [
      '#theme' => 'zu_personalization_dashboard',
      '#stats' => $stats,
      '#quick_links' => $quick_links,
      '#personas' => $personas,
      '#cache' => ['max-age' => 60, 'tags' => ['zu_personalization_rules']],
    ];
  }

  /**
   * Table of all personalization rules with edit/delete/toggle actions.
   */
  public function ruleList(): array {
    $header = [
      ['data' => 'ID', 'field' => 'id', 'sort' => 'asc'],
      ['data' => 'Name', 'field' => 'name'],
      ['data' => 'Type', 'field' => 'rule_type'],
      ['data' => 'Priority', 'field' => 'priority'],
      ['data' => 'Status'],
      ['data' => 'Conditions'],
      ['data' => 'Operations'],
    ];

    $rows = [];

    if ($this->database->schema()->tableExists('zu_personalization_rule')) {
      $results = $this->database->select('zu_personalization_rule', 'r')
        ->fields('r')
        ->orderBy('priority', 'DESC')
        ->orderBy('id', 'ASC')
        ->execute()
        ->fetchAll();

      foreach ($results as $rule) {
        $conditions = json_decode((string) ($rule->conditions ?? '{}'), TRUE) ?? [];
        $cond_summary = $this->formatConditionSummary((string) $rule->rule_type, $conditions);

        $ops = [];
        $ops[] = Link::fromTextAndUrl('Edit', Url::fromRoute('zu_personalization.rule_edit', ['rule_id' => $rule->id]))->toString();
        $ops[] = Link::fromTextAndUrl('Delete', Url::fromRoute('zu_personalization.rule_delete', ['rule_id' => $rule->id]))->toString();

        $status_markup = $rule->status
          ? '<span style="color:#0f6e56;font-weight:600;">● Active</span>'
          : '<span style="color:#999;">○ Inactive</span>';

        $rows[] = [
          $rule->id,
          $rule->name,
          ucfirst((string) $rule->rule_type),
          $rule->priority,
          ['data' => ['#markup' => $status_markup]],
          $cond_summary,
          ['data' => ['#markup' => implode(' | ', $ops)]],
        ];
      }
    }

    $add_link = Link::fromTextAndUrl('+ Add New Rule', Url::fromRoute('zu_personalization.rule_add'))->toRenderable();

    return [
      'add_link' => $add_link,
      'table' => [
        '#type' => 'table',
        '#header' => $header,
        '#rows' => $rows,
        '#empty' => 'No personalization rules found. Add one to start delivering targeted content.',
        '#allowed_tags' => ['span', 'a'],
      ],
      '#cache' => ['max-age' => 0],
    ];
  }

  /**
   * Per-node variant manager: lists all active rules and their variant status.
   */
  public function contentVariants(int $nid): array {
    $node = \Drupal::entityTypeManager()->getStorage('node')->load($nid);
    if (!$node) {
      return ['#markup' => $this->t('Node @nid not found.', ['@nid' => $nid])];
    }

    $header = ['Rule', 'Type', 'Priority', 'Variant Status', 'Operations'];
    $rows = [];

    if ($this->database->schema()->tableExists('zu_personalization_rule')) {
      $rules = $this->database->select('zu_personalization_rule', 'r')
        ->fields('r', ['id', 'name', 'rule_type', 'priority'])
        ->condition('status', 1)
        ->orderBy('priority', 'DESC')
        ->execute()
        ->fetchAll();

      foreach ($rules as $rule) {
        $has_variant = FALSE;
        if ($this->database->schema()->tableExists('zu_personalized_content')) {
          $has_variant = (bool) $this->database->select('zu_personalized_content', 'v')
            ->condition('nid', $nid)
            ->condition('rule_id', $rule->id)
            ->countQuery()->execute()->fetchField();
        }

        $status = $has_variant
          ? '<span style="color:green">✓ Variant set</span>'
          : '<span style="color:#999">— No variant</span>';

        $edit_url = Url::fromRoute('zu_personalization.variant_save', ['nid' => $nid, 'rule_id' => $rule->id]);
        $rows[] = [
          $rule->name,
          ucfirst((string) $rule->rule_type),
          $rule->priority,
          ['data' => ['#markup' => $status]],
          ['data' => ['#markup' => Link::fromTextAndUrl($has_variant ? 'Edit Variant' : 'Add Variant', $edit_url)->toString()]],
        ];
      }
    }

    return [
      'title' => [
        '#markup' => '<h2>' . $this->t('Variants for: @title', ['@title' => $node->label()]) . '</h2>',
      ],
      'table' => [
        '#type' => 'table',
        '#header' => $header,
        '#rows' => $rows,
        '#empty' => 'No active rules found. Create personalization rules first.',
        '#allowed_tags' => ['span', 'a'],
      ],
      '#cache' => ['max-age' => 0],
    ];
  }

  private function safeCount(string $table, array $conditions = []): int {
    if (!$this->database->schema()->tableExists($table)) {
      return 0;
    }
    $q = $this->database->select($table, 't');
    foreach ($conditions as $field => $value) {
      $q->condition('t.' . $field, $value);
    }
    return (int) $q->countQuery()->execute()->fetchField();
  }

  private function formatConditionSummary(string $type, array $conditions): string {
    return match ($type) {
      'role'        => 'Roles: ' . implode(', ', (array) ($conditions['roles'] ?? ['any'])),
      'device'      => 'Devices: ' . implode(', ', (array) ($conditions['devices'] ?? ['any'])),
      'geo'         => 'Countries: ' . implode(', ', (array) ($conditions['countries'] ?? ['any'])),
      'language'    => 'Languages: ' . implode(', ', (array) ($conditions['langcodes'] ?? ['any'])),
      'department'  => 'Dept IDs: ' . implode(', ', (array) ($conditions['department_ids'] ?? ['any'])),
      'content_type'=> 'Types: ' . implode(', ', (array) ($conditions['content_types'] ?? ['any'])),
      default       => json_encode($conditions),
    };
  }

}
