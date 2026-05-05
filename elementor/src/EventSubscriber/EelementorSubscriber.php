<?php

namespace Drupal\elementor\EventSubscriber;

use Drupal\Core\Url;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;  // Update the use statement
use Symfony\Component\HttpKernel\KernelEvents;
use \Drupal\elementor\ElementorPlugin;

/**
 * Redirect .html pages to corresponding Node page.
 */
class EelementorSubscriber implements EventSubscriberInterface
{

    public function elementor_init(RequestEvent $event)  // Fix the type hint
    {
      // Check if the class exists before trying to instantiate it
      if (class_exists('\Drupal\elementor\ElementorPlugin')) {
        ElementorPlugin::instance();
      }
    }

    public static function getSubscribedEvents()
    {
      $events[KernelEvents::REQUEST][] = ['elementor_init'];
      return $events;
    }
}

