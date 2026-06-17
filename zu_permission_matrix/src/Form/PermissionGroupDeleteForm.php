<?php

namespace Drupal\zu_permission_matrix\Form;

use Drupal\Core\Entity\EntityConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

/**
 * Confirmation form for deleting a Permission Group.
 */
class PermissionGroupDeleteForm extends EntityConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to delete the permission group %name?', [
      '%name' => $this->entity->label(),
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t('This will remove the permission group. Roles that had this group assigned will lose the permissions from this group on the next sync. This action cannot be undone.');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('entity.permission_group.collection');
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
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->entity->delete();

    // Remove from role assignments.
    $config = \Drupal::configFactory()->getEditable('zu_permission_matrix.role_assignments');
    $assignments = $config->get('assignments') ?: [];
    $group_id = $this->entity->id();
    $changed = FALSE;

    foreach ($assignments as $role_id => &$group_ids) {
      $key = array_search($group_id, $group_ids);
      if ($key !== FALSE) {
        unset($group_ids[$key]);
        $group_ids = array_values($group_ids);
        $changed = TRUE;
      }
    }

    if ($changed) {
      $config->set('assignments', $assignments)->save();
      // Re-sync role permissions.
      \Drupal::service('zu_permission_matrix.sync')->syncAll();
    }

    $this->messenger()->addStatus($this->t('Permission group %label has been deleted.', [
      '%label' => $this->entity->label(),
    ]));

    $form_state->setRedirectUrl($this->getCancelUrl());
  }

}
