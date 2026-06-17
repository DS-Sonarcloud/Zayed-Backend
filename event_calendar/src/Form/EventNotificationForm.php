<?php

namespace Drupal\event_calendar\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\zu_public_user\Entity\PublicUser;
use Drupal\user\Entity\User;
use GuzzleHttp\Client;
use Google\Auth\Credentials\ServiceAccountCredentials;

class EventNotificationForm extends FormBase
{

  /**
   * {@inheritdoc}
   */
  public function getFormId()
  {
    return 'event_calendar_manual_notification_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $form['#prefix'] = '<div id="event-notification-form-wrapper">';
    $form['#suffix'] = '</div>';

    $form['heading'] = [
      '#markup' => '<h3>' . $this->t('Send Notification to All Bookmarked User') . '</h3>',
    ];

    // Event autocomplete.
    $form['event_id'] = [
      '#type' => 'entity_autocomplete',
      '#title' => $this->t('Select an Event'),
      '#target_type' => 'node',
      '#selection_handler' => 'event_calendar_user_events',
      '#selection_settings' => [
        'target_bundles' => ['event'],
      ],
      '#required' => TRUE,
    ];

    $form['message'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Notification Message'),
      '#required' => TRUE,
      '#default_value' => 'Your bookmarked event has been updated!',
    ];

    $form['progress'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'notification-progress-bar', 'style' => 'display:none; margin: 10px 0;'],
      'bar' => [
        '#markup' => '<div class="progress-bar-wrapper"><div class="progress-bar-inner" style="width:0%; height:20px; background:#007bff;"></div></div><div class="progress-status">' . $this->t('Starting...') . '</div>',
      ],
    ];

    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Send'),
      '#button_type' => 'primary',
      '#attributes' => ['class' => ['button', 'button--primary']],
      '#ajax' => [
        'callback' => '::ajaxSubmit',
        'wrapper' => 'event-notification-form-wrapper',
        'progress' => [
          'type' => 'throbber',
          'message' => $this->t('Identifying recipients...'),
        ],
      ],
    ];

    // $form['#attached']['library'][] = 'zu/event-dashboard-admin';
    $form['#attached']['library'][] = 'event_calendar/notification_form';

    // Check for active batch to allow auto resume on refresh
    $database = \Drupal::database();
    $active_batch = $database->select('event_notification_batch', 'b')
      ->fields('b', ['batch_id', 'total_count', 'event_id'])
      ->condition('created_by', \Drupal::currentUser()->id())
      ->condition('status', ['queued', 'processing'], 'IN')
      ->orderBy('batch_id', 'DESC')
      ->range(0, 1)
      ->execute()
      ->fetchObject();

    if ($active_batch) {
      $form['#attached']['drupalSettings']['eventNotification'] = [
        'activeBatch' => [
          'batch_id' => $active_batch->batch_id,
          'total' => (int) $active_batch->total_count,
        ]
      ];
      $form['event_id']['#default_value'] = Node::load($active_batch->event_id);
    }

    return $form;
  }

  /**
   * AJAX callback for the form submission.
   */
  public function ajaxSubmit(array &$form, FormStateInterface $form_state)
  {
    if ($form_state->hasAnyErrors()) {
      return $form;
    }

    $event_id = $form_state->getValue('event_id');
    $message = $form_state->getValue('message');

    // Load event and flagged users
    $event = Node::load($event_id);
    if (!$event) {
      $response = new \Drupal\Core\Ajax\AjaxResponse();
      $response->addCommand(new \Drupal\Core\Ajax\MessageCommand($this->t('Invalid event selected.'), '#event-notification-form-wrapper', ['type' => 'error']));
      return $response;
    }

    $flag = \Drupal\flag\Entity\Flag::load('bookmark');
    $flagging_storage = \Drupal::entityTypeManager()->getStorage('flagging');
    $flagging_ids = $flagging_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('flag_id', $flag->id())
      ->condition('entity_id', $event_id)
      ->execute();

    if (empty($flagging_ids)) {
      $response = new \Drupal\Core\Ajax\AjaxResponse();
      $response->addCommand(new \Drupal\Core\Ajax\MessageCommand($this->t('No users have bookmarked this event.'), '#event-notification-form-wrapper', ['type' => 'warning']));
      return $response;
    }

    $flaggings = $flagging_storage->loadMultiple($flagging_ids);
    $public_storage = \Drupal::entityTypeManager()->getStorage('public_user');

    $emails = [];
    $tokens = [];

    foreach ($flaggings as $flagging) {
      $uid = $flagging->getOwnerId();
      if ($uid) {
        $publicUser = $public_storage->load($uid);
        if ($publicUser) {
          if (!$publicUser->get('email')->isEmpty()) {
            $emails[] = $publicUser->get('email')->value;
          }
          if ($publicUser->hasField('fcm_token') && !$publicUser->get('fcm_token')->isEmpty()) {
            $tokens[] = $publicUser->get('fcm_token')->value;
          }
        }
      }
    }

    // Create batch using queue service
    $queue_service = \Drupal::service('event_calendar.notification_queue');
    $batch_id = $queue_service->createBatch($event_id, $message, $emails, $tokens);

    $response = new \Drupal\Core\Ajax\AjaxResponse();

    // Trigger JS polling 
    $response->addCommand(new \Drupal\Core\Ajax\InvokeCommand(NULL, 'startNotificationPolling', [
      [
        'batch_id' => $batch_id,
        'total' => count($emails) + count($tokens),
      ]
    ]));

    return $response;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {

  }


  public static function processEmailBatch(array $emails, string $title, string $message, array &$context)
  {
    $mailManager = \Drupal::service('plugin.manager.mail');
    $langcode = \Drupal::languageManager()->getDefaultLanguage()->getId();

    if (!isset($context['results']['email_count'])) {
      $context['results']['email_count'] = 0;
    }

    foreach ($emails as $email) {
      $params = [
        'subject' => 'Event Notification: ' . $title,
        'message' => $message,
      ];
      $mailManager->mail('event_calendar', 'manual_event_notification', $email, $langcode, $params);
      $context['results']['email_count']++;
    }
    $context['message'] = t('Sent emails to @count users.', ['@count' => count($emails)]);
  }

  public static function processFcmBatch(array $tokens, string $title, string $message, array &$context)
  {
    $service = \Drupal::service('event_calendar.fcm_service');
    if (!isset($context['results']['fcm_count'])) {
      $context['results']['fcm_count'] = 0;
    }

    $service->sendFcmNotifications($tokens, $title, $message);
    $context['results']['fcm_count'] += count($tokens);
    $context['message'] = t('Sent FCM notifications to @count devices.', ['@count' => count($tokens)]);
  }

  public static function batchFinished($success, $results, $operations)
  {
    $email_total = $results['email_count'] ?? 0;
    $fcm_total = $results['fcm_count'] ?? 0;
    $total = $email_total + $fcm_total;
    if ($success) {
      \Drupal::messenger()->addStatus(t(
        'Notifications sent successfully. Emails: @emails, FCM: @fcm, Total: @total.',
        [
          '@emails' => $email_total,
          '@fcm' => $fcm_total,
          '@total' => $total,
        ]
      ));
    } else {
      \Drupal::messenger()->addError(t('Some errors occurred while sending notifications.'));
    }
  }
}
