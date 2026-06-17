<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\EventSubscriber;

use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Drupal\Core\State\StateInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\TerminateEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Continues background sending after the HTTP response (Process click).
 */
final class CampaignEmailQueueSubscriber implements EventSubscriberInterface {

  private const SHUTDOWN_KEY = 'campaign_email_queue.shutdown_drain_seconds';

  public function __construct(
    private readonly CampaignEmailQueueService $queueService,
    private readonly StateInterface $state,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [
      KernelEvents::TERMINATE => ['onTerminate', -50],
    ];
  }

  public function onTerminate(TerminateEvent $event): void {
    if (!$event->isMainRequest()) {
      return;
    }

    $seconds = (int) $this->state->get(self::SHUTDOWN_KEY, 0);
    if ($seconds <= 0) {
      return;
    }
    $this->state->delete(self::SHUTDOWN_KEY);

    if (function_exists('session_write_close')) {
      session_write_close();
    }
    @set_time_limit($seconds + 30);
    @ignore_user_abort(TRUE);

    $this->queueService->drainBackgroundSendQueue($seconds);
  }

  public static function requestShutdownDrain(StateInterface $state, int $seconds): void {
    if ($seconds <= 0) {
      return;
    }
    $current = (int) $state->get(self::SHUTDOWN_KEY, 0);
    $state->set(self::SHUTDOWN_KEY, max($current, $seconds));
  }

}
