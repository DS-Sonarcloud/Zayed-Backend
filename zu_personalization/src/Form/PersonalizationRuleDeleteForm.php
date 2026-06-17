<?php

namespace Drupal\zu_personalization\Form;

use Drupal\Core\Database\Connection;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Confirmation form for deleting a personalization rule.
 *
 * Also deletes all content variants that reference the rule.
 */
final class PersonalizationRuleDeleteForm extends ConfirmFormBase {

  private ?object $rule = NULL;

  public function __construct(
    private readonly Connection $database,
  ) {}

  public static function create(ContainerInterface $container): static {
    return new static($container->get('database'));
  }

  public function getFormId(): string {
    return 'zu_personalization_rule_delete_form';
  }

  public function getQuestion() {
    return $this->t('Delete personalization rule "@name"?', ['@name' => $this->rule?->name ?? '']);
  }

  public function getDescription() {
    return $this->t(
      'This will permanently delete the rule and all content variants that reference it. This action cannot be undone.'
    );
  }

  public function getCancelUrl(): Url {
    return Url::fromRoute('zu_personalization.rule_list');
  }

  public function buildForm(array $form, FormStateInterface $form_state, int $rule_id = 0): array {
    $this->rule = $this->database->schema()->tableExists('zu_personalization_rule')
      ? ($this->database->select('zu_personalization_rule', 'r')
          ->fields('r', ['id', 'name'])
          ->condition('id', $rule_id)
          ->execute()
          ->fetchObject() ?: NULL)
      : NULL;

    if (!$this->rule) {
      $this->messenger()->addError($this->t('Rule not found.'));
      return $form;
    }

    $form['rule_id'] = ['#type' => 'hidden', '#value' => $rule_id];
    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $rule_id = (int) $form_state->getValue('rule_id');

    if ($this->database->schema()->tableExists('zu_personalized_content')) {
      $this->database->delete('zu_personalized_content')
        ->condition('rule_id', $rule_id)
        ->execute();
    }

    if ($this->database->schema()->tableExists('zu_personalization_rule')) {
      $this->database->delete('zu_personalization_rule')
        ->condition('id', $rule_id)
        ->execute();
    }

    $this->messenger()->addStatus($this->t('Personalization rule and all associated variants have been deleted.'));
    $form_state->setRedirectUrl(Url::fromRoute('zu_personalization.rule_list'));
  }

}
