<?php

namespace Drupal\zu_personalization\Form;

use Drupal\Core\Database\Connection;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Edit per-node field overrides for a given personalization rule.
 *
 * The variant_content JSON stores key → override pairs that hook_node_view
 * applies at render time when the visitor's persona matches the rule.
 */
final class ContentVariantForm extends FormBase {

  public function __construct(
    private readonly Connection $database,
  ) {}

  public static function create(ContainerInterface $container): static {
    return new static($container->get('database'));
  }

  public function getFormId(): string {
    return 'zu_personalization_content_variant_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, int $nid = 0, int $rule_id = 0): array {
    $node = \Drupal::entityTypeManager()->getStorage('node')->load($nid);
    $rule = $this->loadRule($rule_id);

    if (!$node || !$rule) {
      $this->messenger()->addError($this->t('Node or rule not found.'));
      $form_state->setRedirectUrl(Url::fromRoute('zu_personalization.rule_list'));
      return $form;
    }

    $existing = $this->loadVariant($nid, $rule_id, $node->language()->getId());
    $overrides = $existing ? (json_decode((string) $existing->variant_content, TRUE) ?? []) : [];

    $form['nid']     = ['#type' => 'hidden', '#value' => $nid];
    $form['rule_id'] = ['#type' => 'hidden', '#value' => $rule_id];
    $form['langcode'] = ['#type' => 'hidden', '#value' => $node->language()->getId()];

    $form['info'] = [
      '#type' => 'item',
      '#markup' => $this->t(
        '<strong>Node:</strong> @title &nbsp;|&nbsp; <strong>Rule:</strong> @rule (@type) &nbsp;|&nbsp; <strong>Language:</strong> @lang',
        [
          '@title' => $node->label(),
          '@rule'  => $rule->name,
          '@type'  => ucfirst((string) $rule->rule_type),
          '@lang'  => strtoupper($node->language()->getId()),
        ]
      ),
    ];

    $form['overrides'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Field Overrides'),
      '#description' => $this->t(
        'Set alternative values for this node when the visitor matches the rule. Leave blank to keep the original value.'
      ),
    ];

    $form['overrides']['title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Title Override'),
      '#description' => $this->t('Replace the node title for this audience segment.'),
      '#default_value' => (string) ($overrides['title'] ?? ''),
      '#maxlength' => 255,
    ];

    $form['overrides']['body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body Override'),
      '#description' => $this->t('Replace the body / main content field. Supports basic HTML.'),
      '#default_value' => (string) ($overrides['body'] ?? ''),
      '#rows' => 8,
    ];

    $form['overrides']['field_summary'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Summary Override'),
      '#description' => $this->t('Override field_summary / teaser text.'),
      '#default_value' => (string) ($overrides['field_summary'] ?? ''),
      '#rows' => 3,
    ];

    $form['overrides']['field_banner_image_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Banner Image URL Override'),
      '#description' => $this->t('Full URL to an alternative banner image for this audience.'),
      '#default_value' => (string) ($overrides['field_banner_image_url'] ?? ''),
    ];

    $form['overrides']['cta_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Call-to-Action Label Override'),
      '#description' => $this->t('Override a CTA / button label shown on the page.'),
      '#default_value' => (string) ($overrides['cta_label'] ?? ''),
      '#maxlength' => 128,
    ];

    $form['overrides']['cta_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Call-to-Action URL Override'),
      '#default_value' => (string) ($overrides['cta_url'] ?? ''),
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Variant'),
      '#button_type' => 'primary',
    ];

    if ($existing) {
      $form['actions']['delete'] = [
        '#type' => 'submit',
        '#value' => $this->t('Remove Variant'),
        '#submit' => ['::deleteVariant'],
        '#button_type' => 'danger',
        '#attributes' => ['onclick' => 'return confirm("Remove this content variant?")'],
      ];
    }

    $form['actions']['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Cancel'),
      '#url' => Url::fromRoute('zu_personalization.content_variants', ['nid' => $nid]),
      '#attributes' => ['class' => ['button']],
    ];

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $nid      = (int) $form_state->getValue('nid');
    $rule_id  = (int) $form_state->getValue('rule_id');
    $langcode = (string) $form_state->getValue('langcode');

    $overrides = array_filter([
      'title'                 => (string) $form_state->getValue(['overrides', 'title']),
      'body'                  => (string) $form_state->getValue(['overrides', 'body']),
      'field_summary'         => (string) $form_state->getValue(['overrides', 'field_summary']),
      'field_banner_image_url'=> (string) $form_state->getValue(['overrides', 'field_banner_image_url']),
      'cta_label'             => (string) $form_state->getValue(['overrides', 'cta_label']),
      'cta_url'               => (string) $form_state->getValue(['overrides', 'cta_url']),
    ]);

    $existing = $this->loadVariant($nid, $rule_id, $langcode);
    $now = \Drupal::time()->getRequestTime();

    if ($existing) {
      $this->database->update('zu_personalized_content')
        ->fields(['variant_content' => json_encode($overrides, JSON_UNESCAPED_UNICODE)])
        ->condition('id', $existing->id)
        ->execute();
    }
    else {
      $this->database->insert('zu_personalized_content')
        ->fields([
          'nid'             => $nid,
          'rule_id'         => $rule_id,
          'variant_content' => json_encode($overrides, JSON_UNESCAPED_UNICODE),
          'langcode'        => $langcode,
          'created'         => $now,
        ])
        ->execute();
    }

    $this->messenger()->addStatus($this->t('Content variant saved.'));
    $form_state->setRedirectUrl(Url::fromRoute('zu_personalization.content_variants', ['nid' => $nid]));
  }

  public function deleteVariant(array &$form, FormStateInterface $form_state): void {
    $nid     = (int) $form_state->getValue('nid');
    $rule_id = (int) $form_state->getValue('rule_id');
    $langcode = (string) $form_state->getValue('langcode');

    $this->database->delete('zu_personalized_content')
      ->condition('nid', $nid)
      ->condition('rule_id', $rule_id)
      ->condition('langcode', $langcode)
      ->execute();

    $this->messenger()->addStatus($this->t('Content variant removed.'));
    $form_state->setRedirectUrl(Url::fromRoute('zu_personalization.content_variants', ['nid' => $nid]));
  }

  private function loadRule(int $id): ?object {
    if (!$this->database->schema()->tableExists('zu_personalization_rule')) {
      return NULL;
    }
    return $this->database->select('zu_personalization_rule', 'r')
      ->fields('r', ['id', 'name', 'rule_type'])
      ->condition('id', $id)
      ->execute()
      ->fetchObject() ?: NULL;
  }

  private function loadVariant(int $nid, int $rule_id, string $langcode): ?object {
    if (!$this->database->schema()->tableExists('zu_personalized_content')) {
      return NULL;
    }
    return $this->database->select('zu_personalized_content', 'v')
      ->fields('v')
      ->condition('nid', $nid)
      ->condition('rule_id', $rule_id)
      ->condition('langcode', $langcode)
      ->execute()
      ->fetchObject() ?: NULL;
  }

}
