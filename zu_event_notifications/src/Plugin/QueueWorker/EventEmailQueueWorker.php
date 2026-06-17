<?php

namespace Drupal\zu_event_notifications\Plugin\QueueWorker;

use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;

/**
 * Processes event reminder emails.
 *
 * @QueueWorker(
 *   id = "event_email_queue",
 *   title = @Translation("Event Email Reminder Queue"),
 *   cron = {"time" = 60}
 * )
 */
class EventEmailQueueWorker extends QueueWorkerBase
{
    public function processItem($data)
    {
        // Load public user
        $storage = \Drupal::entityTypeManager()->getStorage('public_user');
        /** @var \Drupal\zu_public_user\Entity\PublicUser $user */
        $user = $storage->load($data['public_user_id']);
        // Load event node
        $event = Node::load($data['event_id']);

        if (!$user || !$event) {
            return;
        }

        $mailManager = \Drupal::service('plugin.manager.mail');
        $module = 'zu_event_notifications';
        $key = 'event_reminder';
        $to = $user->get('email')->value;

        $start_date = $event->get('field_start_date')->value;
        $start_time = $event->get('field_start_time')->value;

        $event_datetime = $start_date;
        if (!empty($start_time)) {
        $event_datetime .= ' ' . $start_time;
        }

        $params = [
            'subject' => 'Reminder: Upcoming event - ' . $event->label(),
            'username' => $user->get('name')->value,
            'event_title' => $event->label(),
            'event_date' => $event_datetime,
            'event_link' => $event->toUrl('canonical', ['absolute' => TRUE])->toString(),
        ];
        $mailManager->mail($module, $key, $to, 'en', $params);
    }
}
