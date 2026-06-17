<?php

namespace Drupal\event_calendar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Symfony\Component\DependencyInjection\ContainerInterface;

class EventDashboardController extends ControllerBase
{

  public function dashboard()
  {
    $build = [
      '#markup' => '<h2>Welcome to the Event Dashboard</h2>',
    ];

    // You can later add a View embed or custom table of upcoming events here.

    return $build;
  }


}
