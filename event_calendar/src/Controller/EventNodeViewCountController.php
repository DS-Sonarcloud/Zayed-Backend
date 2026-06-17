<?php

namespace Drupal\event_calendar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;

class EventNodeViewCountController extends ControllerBase {
  public function incrementCount(Node $node) {
    // You can store the count in a custom field or a custom table
    $current = $node->get('field_view_count')->value ?? 0;
    $node->set('field_view_count', $current + 1);
    $node->save();

    return new JsonResponse(['status' => 200, 'views' => $current + 1]);
  }
}
