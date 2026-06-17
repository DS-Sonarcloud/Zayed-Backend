<?php

namespace Drupal\zu_rest_api\Plugin\Action;

use Drupal\Core\Action\ActionBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\NodeInterface;

/**
 * Provides a 'Publish Events' action.
 *
 * @Action(
 *   id = "moderated_publish",
 *   label = @Translation("Publish Events"),
 *   type = "node",
 *   ui = TRUE
 * )
 */
class ModeratedPublish extends ActionBase {

  /**
   * {@inheritdoc}
   */
  public function execute($entity = NULL) {
    if (!$entity instanceof NodeInterface) {
      return;
    }

    /** @var \Drupal\content_moderation\ModerationInformationInterface $moderation */
    $moderation = \Drupal::service('content_moderation.moderation_information');

    // If not a moderated entity, fall back to regular publish.
    if (!$moderation->isModeratedEntity($entity)) {
      $entity->setPublished(TRUE);
      $entity->set('status', 1);
      $entity->save();
      return;
    }

    $workflow = $moderation->getWorkflowForEntity($entity);
    if (!$workflow) {
      return;
    }

    $current_state = $entity->get('moderation_state')->value;
    $target_state = 'published';

    if ($current_state === $target_state) {
      return;
    }

    // Find a transition to the target_state and apply it.
    foreach ($workflow->getTypePlugin()->getTransitions() as $transition) {
      // $transition->from() can be a state or array of states.
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
        $entity->setPublished(TRUE);
        $entity->set('status', 1);
        $entity->setNewRevision(TRUE);
        $entity->isDefaultRevision(TRUE);

        foreach ($entity->getTranslationLanguages() as $langcode => $language) {
          $translation = $entity->getTranslation($langcode);
          $translation->set('moderation_state', $target_state);
          $translation->setPublished(TRUE);
          $translation->set('status', 1);
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
