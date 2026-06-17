<?php

namespace Drupal\campaign_dashboard\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\user\Entity\User;
use Drupal\Core\Database\Database;

class DashboardController extends ControllerBase {

  /**
   * Dashboard page.
   */
  public function dashboard() {
    $build = [];

    // --- KPI Counts ---
    $campaign_count = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->getQuery()
      ->condition('type', 'campaign')
      ->accessCheck(FALSE)
      ->count()
      ->execute();

    $template_count = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->getQuery()
      ->condition('type', 'email_template')
      ->accessCheck(FALSE)
      ->count()
      ->execute();

    $new_users = \Drupal::entityTypeManager()
      ->getStorage('user')
      ->getQuery()
      ->condition('status', 1)
      ->accessCheck(FALSE)
      ->count()
      ->execute();

    // --- Jobs table (mock data for now, replace with real source) ---
    $jobs = [
      [
        'date' => '2025-08-01',
        'template' => 'Faculty Member',
        'category' => 'Campus Announcement',
        'status' => 'Running',
        'action' => 'Delete / Pause',
      ],
      [
        'date' => '2025-08-01',
        'template' => 'Faculty Member',
        'category' => 'Campus Announcement',
        'status' => 'Running',
        'action' => 'Resume',
      ],
    ];

    // Pass data to twig template
    $build['#theme'] = 'campaign_dashboard';
    $build['#data'] = [
      'campaign_count' => $campaign_count,
      'template_count' => $template_count,
      'new_users' => $new_users,
      'jobs' => $jobs,
    ];

    return $build;
  }
}
