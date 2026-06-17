<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\zu_rest_api\Constants;
use Drupal\node\Entity\Node;
use Drupal\zu_public_user\Entity\PublicUser;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Controller\ControllerBase;

/**
 * Handles bookmark operations for Public Users.
 */
class FCMConfigurationController extends ControllerBase
{

    /**
     * Bookmark a node for a given public user (JWT or manual ID).
     */
    public function getFCMConfiguration(Request $request): JsonResponse
    {
        $config = $this->config('event_calendar.settings');
        return new JsonResponse(['api_status_code' => Constants::SUCCESS, 'fcm' => json_decode($config->get('firebase_config'))], 200);
    }
}
