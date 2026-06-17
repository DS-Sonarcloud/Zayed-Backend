<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;

class SystemMonitoringController extends ControllerBase {
  public function index(): array {
    $metrics = [
      'php_version'    => PHP_VERSION,
      'drupal_version' => \Drupal::VERSION,
      'memory_limit'   => ini_get('memory_limit'),
      'memory_usage'   => round(memory_get_usage(TRUE) / 1024 / 1024, 2) . ' MB',
      'peak_memory'    => round(memory_get_peak_usage(TRUE) / 1024 / 1024, 2) . ' MB',
    ];
    return ['#theme' => 'zu_system_monitoring', '#metrics' => $metrics, '#cache' => ['max-age' => 60]];
  }
}
