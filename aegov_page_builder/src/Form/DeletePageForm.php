<?php

namespace Drupal\aegov_page_builder\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\aegov_page_builder\Controller\PageBuilderController;

/**
 * Confirmation form for deleting a page.
 */
class DeletePageForm extends ConfirmFormBase {

  protected string $pageId;
  protected ?array $page;

  public function getFormId(): string {
    return 'aegov_page_builder_delete_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, ?string $page_id = NULL): array {
    $this->pageId = $page_id ?? '';
    $this->page = PageBuilderController::loadPage($this->pageId);
    return parent::buildForm($form, $form_state);
  }

  public function getQuestion() {
    return $this->t('Delete page "@title"?', ['@title' => $this->page['title'] ?? $this->pageId]);
  }

  public function getCancelUrl(): Url {
    return Url::fromRoute('aegov_page_builder.admin');
  }

  public function getConfirmText() {
    return $this->t('Delete');
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    PageBuilderController::deletePage($this->pageId);
    $this->messenger()->addStatus($this->t('Page deleted.'));
    $form_state->setRedirectUrl($this->getCancelUrl());
  }

}
