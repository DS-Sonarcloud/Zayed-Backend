<?php

namespace Drupal\zu_event_notifications\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;

class EventReminderService
{

  protected $entityTypeManager;
  protected $queueFactory;
  protected $logger;
  protected $dateFormatter;
  protected $mailManager;

  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    QueueFactory $queueFactory,
    LoggerChannelFactoryInterface $logger,
    DateFormatterInterface $dateFormatter,
    MailManagerInterface $mailManager
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->queueFactory = $queueFactory;
    $this->logger = $logger->get('zu_event_notifications');
    $this->dateFormatter = $dateFormatter;
    $this->mailManager = $mailManager;
  }

  /**
   * Finds events starting within 24 hours and queues reminder emails.
   */
  public function queueUpcomingEventEmails()
  {
    $queue = $this->queueFactory->get('event_email_queue');

    // Get current and 24-hour timestamps.
    $now = \Drupal::time()->getRequestTime();
    $tomorrow = $now + 24 * 60 * 60;

    $query = $this->entityTypeManager->getStorage('node')->getQuery()
      ->condition('type', 'event')
      ->condition('status', 1)
      ->exists('field_start_date')
      ->accessCheck(FALSE);

    $nids = $query->execute();
    $nodes = Node::loadMultiple($nids);

    foreach ($nodes as $node) {
      $start_date = $node->get('field_start_date')->value;
      $start_time = $node->get('field_start_time')->value;

      if (!empty($start_date)) {
        if (!empty($start_time)) {
          $datetime_string = $start_date . ' ' . $start_time;
        }
        else {
          $datetime_string = $start_date;
        }
        $event_start = strtotime($datetime_string);
        if ($event_start > $now && $event_start < $tomorrow) {
          $event_type = $node->get('field_event_type')->target_id ?? NULL;
          $this->queueEmailsForEvent($queue, $node, $event_type);
        }
      }
    }
  }

  /**
   * Queues emails for bookmarked and subscribed users for a given event.
   */
  protected function queueEmailsForEvent($queue, Node $event, $event_type_id)
  {
    $flag_service = \Drupal::service('flag');
    $bookmark_flag = $flag_service->getFlagById('bookmark');
    $subscribe_flag = $flag_service->getFlagById('subscribe_event');

    $bookmark_flaggings = $this->entityTypeManager->getStorage('flagging')
      ->loadByProperties(['flag_id' => 'bookmark', 'entity_id' => $event->id()]);
    $subscriber_flaggings = [];

    if ($event_type_id) {
      $subscriber_flaggings = $this->entityTypeManager->getStorage('flagging')
        ->loadByProperties(['flag_id' => 'subscribe_event', 'entity_id' => $event_type_id]);
    }

    // Collect unique user IDs.
    $user_ids = [];

    foreach ($bookmark_flaggings as $flagging) {
      $user_ids[] = $flagging->getOwnerId();
    }

    foreach ($subscriber_flaggings as $flagging) {
      $user_ids[] = $flagging->getOwnerId();
    }

    $user_ids = array_unique($user_ids);

    foreach ($user_ids as $uid) {
      $queue->createItem([
        'public_user_id' => $uid,
        'event_id' => $event->id(),
      ]);
    }

    $this->logger->info('Queued reminder emails for event: @title (Users: @count)', [
      '@title' => $event->label(),
      '@count' => count($user_ids),
    ]);
  }
}
