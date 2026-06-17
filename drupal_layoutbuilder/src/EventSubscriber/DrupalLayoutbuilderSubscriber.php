<?php

namespace Drupal\drupal_layoutbuilder\EventSubscriber;

use Drupal\Core\Url;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Drupal\drupal_layoutbuilder\DrupalLayoutbuilderPlugin;

/**
 * Initializes the layout builder integration on request.
 */
class DrupalLayoutbuilderSubscriber implements EventSubscriberInterface {

  /**
   * Boot the Elementor-in-Drupal runtime when needed.
   */
  public function drupalLayoutbuilderInit(RequestEvent $event): void {
    if (class_exists(DrupalLayoutbuilderPlugin::class)) {
      DrupalLayoutbuilderPlugin::instance();
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    $events[KernelEvents::REQUEST][] = ['drupalLayoutbuilderInit'];
    return $events;
  }

}
