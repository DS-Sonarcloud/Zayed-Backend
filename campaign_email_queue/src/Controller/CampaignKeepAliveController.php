<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\Controller;

use Drupal\campaign_email_queue\Service\CampaignSendKeepAlive;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Web keep-alive for campaign sending (no Drush required).
 */
final class CampaignKeepAliveController extends ControllerBase {

  public function __construct(
    private readonly CampaignSendKeepAlive $keepAlive,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('campaign_email_queue.keepalive'),
    );
  }

  public function tick(): JsonResponse {
    if (function_exists('session_write_close') && session_status() === PHP_SESSION_ACTIVE) {
      session_write_close();
    }
    $result = $this->keepAlive->tick(TRUE);
    return new JsonResponse($result);
  }

}
