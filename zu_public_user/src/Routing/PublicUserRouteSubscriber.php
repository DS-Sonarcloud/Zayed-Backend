<?php

namespace Drupal\zu_public_user\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Override the default collection route to use our custom listing form.
 */
class PublicUserRouteSubscriber extends RouteSubscriberBase {

  protected function alterRoutes(RouteCollection $collection) {
    if ($route = $collection->get('entity.public_user.collection')) {
      $route->setDefaults([
        '_form' => '\Drupal\zu_public_user\Form\PublicUserList',
        '_title' => 'Public Users',
      ]);
    }
  }

}
