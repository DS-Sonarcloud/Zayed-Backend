<?php

namespace Drupal\zu_rest_api\Plugin\Action;

use Drupal\Core\Action\ActionBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\NodeInterface;

/**
 * Provides an 'Unpublish Events' action.
 *
 * @Action(
 *   id = "moderated_unpublish",
 *   label = @Translation("Unpublish Events"),
 *   type = "node",
 *   ui = TRUE
 * )
 */
class ModeratedUnpublish extends ActionBase {

  /**
   * {@inheritdoc}
   */
  public function execute($entity = NULL) {
    if (!$entity instanceof NodeInterface) {
      return;
    }

    $moderation = \Drupal::service('content_moderation.moderation_information');

    // If not moderated, fall back to standard unpublish.
    if (!$moderation->isModeratedEntity($entity)) {
      $entity->setPublished(FALSE);
      $entity->set('status', 0);
      $entity->save();
      return;
    }

    $workflow = $moderation->getWorkflowForEntity($entity);
    if (!$workflow) {
      return;
    }

    $current_state = $entity->get('moderation_state')->value;
    // Adjust target state to match your workflow (commonly 'draft' or 'archived').
    $target_state = 'draft';

    if ($current_state === $target_state) {
      return;
    }

    foreach ($workflow->getTypePlugin()->getTransitions() as $transition) {
      $from_states = (array) $transition->from();
      $from_ids = [];
      foreach ($from_states as $fs) {
        if ($fs instanceof \Drupal\workflows\StateInterface) {
          $from_ids[] = $fs->id();
        } elseif (is_string($fs)) {
          $from_ids[] = $fs;
        }
      }

      $to = $transition->to();
      $to_id = ($to instanceof \Drupal\workflows\StateInterface) ? $to->id() : (is_string($to) ? $to : NULL);

      if (in_array($current_state, $from_ids, TRUE) && $to_id === $target_state) {
        $entity->set('moderation_state', $target_state);
        $entity->setPublished(FALSE);
        $entity->set('status', 0);
        $entity->setNewRevision(TRUE);
        $entity->isDefaultRevision(TRUE);

        foreach ($entity->getTranslationLanguages() as $langcode => $language) {
          $translation = $entity->getTranslation($langcode);
          $translation->set('moderation_state', $target_state);
          $translation->setPublished(FALSE);
          $translation->set('status', 0);
        }

        $entity->save();
        return;
      }
    }
  }

  /**
   * Only allow action if user can update the entity.
   *
   * @inheritdoc
   */
  public function access($object, AccountInterface $account = NULL, $return_as_object = FALSE) {
    return $object->access('update', $account, $return_as_object);
  }

}
