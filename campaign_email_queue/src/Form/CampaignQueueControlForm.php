<?php

namespace Drupal\campaign_email_queue\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\NodeInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Symfony\Component\DependencyInjection\ContainerInterface;

class CampaignQueueControlForm extends FormBase
{
  protected EntityTypeManagerInterface $entityTypeManager;
  protected CampaignEmailQueueService $queueService;
  public function __construct(EntityTypeManagerInterface $entityTypeManager, CampaignEmailQueueService $queueService)
  {
    $this->entityTypeManager = $entityTypeManager;
    $this->queueService = $queueService;
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('campaign_email_queue.queue')
    );
  }

  public function getFormId()
  {
    return 'campaign_email_queue_control_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, NodeInterface $node = NULL)
  {
    /** @var \Drupal\node\NodeInterface $node */
    $node = $this->entityTypeManager->getStorage('node')->load($node->id());
    $paused = (bool) $node->get('field_queue_paused')->value;

    $form['node_id'] = [
      '#type' => 'hidden',
      '#value' => $node->id(),
    ];
    $form['paused'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Pause email queue'),
      '#default_value' => $paused,
    ];
    $form['actions'] = [
      '#type' => 'actions',
    ];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state)
  {
    // Nothing additional
  }
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $nid = $form_state->getValue('node_id');
    $pause = $form_state->getValue('paused') ? 1 : 0;

    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    if ($node) {
      $node->set('field_queue_paused', $pause);
      $node->save();
      $this->messenger()->addMessage($this->t('Queue status updated.'));
    } else {
      $this->messenger()->addError($this->t('Campaign not found.'));
    }

    $form_state->setRedirect('campaign_email_queue.dashboard');
  }
}
