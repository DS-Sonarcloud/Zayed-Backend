<?php

namespace Drupal\zu_rest_api\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

class RouteSubscriber extends RouteSubscriberBase
{
    protected function alterRoutes(RouteCollection $collection)
    {
        if ($route = $collection->get('rest.resource.my_custom_resource')) {
            $route->setRequirement('_csrf_token', 'FALSE');
        }
    }
}
