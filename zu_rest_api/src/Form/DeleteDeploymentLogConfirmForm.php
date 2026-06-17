<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\zu_rest_api\Service\DeploymentLogService;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Confirm form for deleting deployment log entries (single or bulk).
 */
class DeleteDeploymentLogConfirmForm extends ConfirmFormBase {

  /**
   * @var \Drupal\zu_rest_api\Service\DeploymentLogService
   */
  protected DeploymentLogService $deploymentLogService;

  /**
   * IDs to delete (bulk).
   *
   * @var array
   */
  protected array $deleteIds = [];

  /**
   * Single log ID from route parameter.
   *
   * @var int
   */
  protected int $singleId = 0;

  /**
   * {@inheritdoc}
   */
  public function __construct(DeploymentLogService $deployment_log_service) {
    $this->deploymentLogService = $deployment_log_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('zu_rest_api.deployment_log')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'delete_deployment_log_confirm_form';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    if ($this->singleId > 0) {
      return $this->t('Are you sure you want to delete this log entry?');
    }
    return $this->t('Are you sure you want to delete @count log entries?', [
      '@count' => count($this->deleteIds),
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('zu_rest_api.deployment_log');
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t('This action cannot be undone.');
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return $this->t('Delete');
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $id = NULL) {
    // Single delete via route parameter.
    if ($id) {
      $this->singleId = (int) $id;
      return parent::buildForm($form, $form_state);
    }

    // Bulk delete via tempstore.
    $tempstore = \Drupal::service('tempstore.private')->get('zu_deployment_log');
    $this->deleteIds = $tempstore->get('delete_ids') ?? [];

    if (empty($this->deleteIds)) {
      $this->messenger()->addWarning($this->t('No items selected for deletion.'));
      return $this->redirect('zu_rest_api.deployment_log');
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Single delete.
    if ($this->singleId > 0) {
      $deleted = $this->deploymentLogService->deleteLog($this->singleId);
      if ($deleted) {
        $this->messenger()->addStatus($this->t('Log entry deleted successfully.'));
      }
      else {
        $this->messenger()->addError($this->t('Failed to delete log entry.'));
      }
      $form_state->setRedirectUrl($this->getCancelUrl());
      return;
    }

    // Bulk delete.
    if (!empty($this->deleteIds)) {
      $deleted = $this->deploymentLogService->deleteLogs($this->deleteIds);
      $this->messenger()->addStatus($this->t('@count log entries deleted.', ['@count' => $deleted]));

      $tempstore = \Drupal::service('tempstore.private')->get('zu_deployment_log');
      $tempstore->delete('delete_ids');
    }

    $form_state->setRedirectUrl($this->getCancelUrl());
  }

}
