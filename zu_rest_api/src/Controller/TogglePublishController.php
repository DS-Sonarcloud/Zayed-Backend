<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;

class TogglePublishController extends ControllerBase
{

  public function toggle(NodeInterface $node)
  {

    /** @var \Drupal\content_moderation\ModerationInformationInterface $moderationInfo */
    $moderationInfo = \Drupal::service('content_moderation.moderation_information');

    $workflow = $moderationInfo->getWorkflowForEntity($node);
    if (!$workflow) {
      $this->messenger()->addError("No moderation workflow found for this content type.");
      return $this->response($node);
    }

    $node_storage = \Drupal::entityTypeManager()->getStorage('node');
    $latest_id = $node_storage->getLatestRevisionId($node->id());
    $latest_node = $latest_id ? $node_storage->loadRevision($latest_id) : $node;

    $editable_node = $latest_node ?: $node;
    $current_state = $editable_node->get('moderation_state')->value;
    $all_transitions = $workflow->getTypePlugin()->getTransitions();

    // Move one step back in workflow
    $target_state = ($current_state === 'published') ? 'needs_review' : 'published';
    $matching_transition = NULL;

    foreach ($all_transitions as $transition) {
      /** @var \Drupal\workflows\Transition $transition */
      $from = $transition->from();
      $to = $transition->to();

      $from_ids = [];
      if (is_array($from)) {
        foreach ($from as $state) {
          if ($state instanceof \Drupal\workflows\StateInterface) {
            $from_ids[] = $state->id();
          }
        }
      } elseif ($from instanceof \Drupal\workflows\StateInterface) {
        $from_ids[] = $from->id();
      }

      $to_id = NULL;
      if ($to instanceof \Drupal\workflows\StateInterface) {
        $to_id = $to->id();
      } elseif (is_array($to) && !empty($to)) {
        $first = reset($to);
        if ($first instanceof \Drupal\workflows\StateInterface) {
          $to_id = $first->id();
        }
      }

      if (in_array($current_state, $from_ids, TRUE) && $to_id === $target_state) {
        $matching_transition = $transition;
        break;
      }
    }

    if (!$matching_transition) {
      $this->messenger()->addWarning("No moderation transition available from '$current_state' to '$target_state'.");
      return $this->response($node);
    }

    $editable_node->set('moderation_state', $target_state);
    $editable_node->setNewRevision(TRUE);
    $editable_node->isDefaultRevision(TRUE);

    // Keep moderation state and publication status aligned.
    $is_published = ($target_state === 'published');
    $editable_node->setPublished($is_published);

    foreach ($editable_node->getTranslationLanguages() as $langcode => $language) {
      $translation = $editable_node->getTranslation($langcode);
      $translation->set('moderation_state', $target_state);
      $translation->setPublished($is_published);
      $translation->set('status', $is_published ? 1 : 0);
    }

    $editable_node->save();

    $this->messenger()->addStatus('Content updated successfully.');

    return $this->response($editable_node);
  }

  private function response(NodeInterface $node)
  {
    if (\Drupal::request()->isXmlHttpRequest()) {

      $response = new \Drupal\Core\Ajax\AjaxResponse();

      $nid = $node->id();
      $state = $node->get('moderation_state')->value;

      if ($state === 'published') {
        $label = "Unpublish";
        $class = 'toggle-Unpublish';
      } else {
        $label = "Publish";
        $class = 'toggle-Publish';
      }

      $url = \Drupal\Core\Url::fromUserInput("/toggle-publish/$nid");
      $url->setOption('attributes', [
        'class' => ['use-ajax', $class],
        'id' => 'toggle-publish-' . $nid,
      ]);
      $url->setOption('query', ['t' => time()]);

      $url_string = $url->toString();

      // Build the updated link
      $link_markup = sprintf(
        '<a href="%s" class="use-ajax %s" id="toggle-publish-%s">%s</a>',
        $url_string,
        $class,
        $nid,
        $label
      );

      // IMPORTANT: Replace wrapper, not inner link
      $response->addCommand(
        new \Drupal\Core\Ajax\ReplaceCommand(
          "#toggle-wrapper-$nid",
          '<div id="toggle-wrapper-' . $nid . '">' . $link_markup . '</div>'
        )
      );

      // Get state label from workflow
      $moderationInfo = \Drupal::service('content_moderation.moderation_information');
      $workflow = $moderationInfo->getWorkflowForEntity($node);
      $stateLabel = $state;
      if ($workflow) {
        $stateObject = $workflow->getTypePlugin()->getState($state);
        $stateLabel = $stateObject->label();
      }

      $response->addCommand(
        new \Drupal\Core\Ajax\ReplaceCommand(
          "#moderation-state-$nid",
          "<span id='moderation-state-$nid'>$stateLabel</span>"
        )
      );

      // $response->addCommand(new \Drupal\Core\Ajax\MessageCommand());

      return $response;
    }

    return $this->goBack($node);
  }


  private function goBack($node = NULL)
  {
    if ($node instanceof NodeInterface && !$node->isPublished()) {
      $bundle = $node->bundle();
      $url = ($bundle === 'event') ? '/event-dashboard' : '/admin/email-templates';
      return new RedirectResponse($url);
    }
    return new RedirectResponse(\Drupal::request()->headers->get('referer') ?? '/event-dashboard');
  }
}
