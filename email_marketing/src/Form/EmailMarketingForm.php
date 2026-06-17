<?php

namespace Drupal\email_marketing\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Render\Renderer;

/**
 * Email Marketing admin form.
 */
class EmailMarketingForm extends FormBase
{

  /** @var \Drupal\email_marketing\Service\EmailMarketingSender */
  protected $sender;

  /** @var \Drupal\email_marketing\Service\EmailMarketingService */
  protected $service;

  public static function create(ContainerInterface $container)
  {
    $instance = new static();
    $instance->sender = $container->get('email_marketing.sender');
    $instance->service = $container->get('email_marketing.service');
    return $instance;
  }

  /** {@inheritdoc} */
  public function getFormId()
  {
    return 'email_marketing_form';
  }

  /**
   * Load available email templates.
   */
  protected function getTemplateOptions(): array
  {
    $query = \Drupal::entityQuery('node')
      ->condition('status', 1)
      ->condition('type', 'email_template')
      ->sort('created', 'DESC')
      ->accessCheck(FALSE);

    $nids = $query->execute();
    $options = [];
    if ($nids) {
      $nodes = Node::loadMultiple($nids);
      foreach ($nodes as $node) {
        $options[$node->id()] = $node->label();
      }
    }
    return $options;
  }

  /** {@inheritdoc} */
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $form['intro'] = [
      '#markup' => '<p>Select an email template, choose recipients, preview, and send.</p>',
    ];

    $form['subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Email subject'),
      '#required' => TRUE,
    ];

    // Choose an email template (instead of block).
    $form['template_nid'] = [
      '#type' => 'select',
      '#title' => $this->t('Email template'),
      '#required' => TRUE,
      '#options' => $this->getTemplateOptions(),
      '#description' => $this->t('Choose which email template to send.'),
    ];

    // Recipient mode.
    $form['recipient_mode'] = [
      '#type' => 'radios',
      '#title' => $this->t('Recipients'),
      '#options' => [
        'all_subscribers' => $this->t('All subscribers (role: subscriber)'),
        'by_tag' => $this->t('Subscribers by tag'),
        'single' => $this->t('Single email address'),
      ],
      '#default_value' => 'all_subscribers',
    ];

    $form['tags'] = [
      '#type' => 'entity_autocomplete',
      '#title' => $this->t('Tags'),
      '#target_type' => 'taxonomy_term',
      '#tags' => TRUE,
      '#selection_settings' => ['target_bundles' => ['tags']],
      '#states' => [
        'visible' => [
          [':input[name="recipient_mode"]' => ['value' => 'by_tag']],
        ],
      ],
    ];

    $form['single_email'] = [
      '#type' => 'email',
      '#title' => $this->t('Email address'),
      '#states' => [
        'visible' => [
          [':input[name="recipient_mode"]' => ['value' => 'single']],
        ],
      ],
    ];

    $form['preview'] = [
      '#type' => 'submit',
      '#value' => $this->t('Preview'),
      '#submit' => ['::previewSubmit'],
      // '#limit_validation_errors' => [['subject', 'template_nid', 'recipient_mode', 'tags', 'single_email']],
      '#limit_validation_errors' => [['subject'], ['template_nid']],

      '#button_type' => 'secondary',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Send'),
    ];

    if ($form_state->get('preview_render')) {
      $form['render_preview'] = [
        '#type' => 'details',
        '#title' => $this->t('Email preview'),
        '#open' => TRUE,
        'content' => $form_state->get('preview_render'),
      ];
    }

    return $form;
  }

  /** {@inheritdoc} */
  public function validateForm(array &$form, FormStateInterface $form_state)
  {
    if ($form_state->getValue('recipient_mode') === 'single' && empty($form_state->getValue('single_email'))) {
      $form_state->setErrorByName('single_email', $this->t('Please enter an email address.'));
    }
  }

  /** Preview handler. */
  public function previewSubmit(array &$form, FormStateInterface $form_state)
  {
    $subject = $form_state->getValue('subject');
    $nid = $form_state->getValue('template_nid');

    if (empty($nid)) {
      $this->messenger()->addError($this->t('Please select an email template before previewing.'));
      return;
    }

    $render = $this->buildEmailRenderArray($nid, $subject);
    $form_state->set('preview_render', $render);
    $form_state->setRebuild(TRUE);
  }

  /** {@inheritdoc} */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    $subject = $form_state->getValue('subject');
    $nid = $form_state->getValue('template_nid');
    $mode = $form_state->getValue('recipient_mode');

    $recipients = [];
    if ($mode === 'single') {
      $recipients = [$form_state->getValue('single_email')];
    } elseif ($mode === 'all_subscribers') {
      $recipients = $this->loadSubscriberEmails();
    } else { // by_tag
      $term_ids = array_column((array) $form_state->getValue('tags'), 'target_id');
      $recipients = $this->loadSubscriberEmails($term_ids);
    }

    // [$sent, $failed] = $this->sender->sendCampaign($nid, $subject, $recipients);
    $campaign = $this->service->sendFromNode($nid, $subject, $recipients, [
      'mode' => $mode,
      'tags' => $form_state->getValue('tags'),
      'single_email' => $form_state->getValue('single_email'),
    ]);
    list($campaign_id, $sent, $failed) = $campaign;
    $this->messenger()->addStatus($this->t('Emails sent: @sent. Failed: @failed.', [
      '@sent' => $sent,
      '@failed' => $failed,
    ]));
  }

  /**
   * Render email content from node.
   */
  protected function buildEmailRenderArray($nid, $subject)
  {
    $node = Node::load($nid);
    if (!$node) {
      return ['#markup' => $this->t('Template not found.')];
    }

    $view_builder = \Drupal::entityTypeManager()->getViewBuilder('node');
    return $view_builder->view($node, 'full');
  }

  /**
   * Load subscriber emails, optionally filtered by taxonomy term IDs.
   */
  protected function loadSubscriberEmails(array $term_ids = []): array
  {
    $query = \Drupal::entityQuery('user')
      ->condition('status', 1)
      ->condition('roles', 'subscriber')
      ->accessCheck(FALSE);

    $field_definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('user', 'user');
    if (!empty($term_ids) && isset($field_definitions['field_tags'])) {
      $query->condition('field_tags.target_id', $term_ids, 'IN');
    }

    $uids = $query->execute();
    if (!$uids) {
      return [];
    }

    $emails = [];
    $users = User::loadMultiple($uids);
    foreach ($users as $user) {
      if ($mail = $user->getEmail()) {
        $emails[] = $mail;
      }
    }
    return array_values(array_unique($emails));
  }
}
