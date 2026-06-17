<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;

class MlsIntegrationController extends ControllerBase {
  public function index(): array {
    return ['#markup' => '<div class="zu-placeholder"><h2>MLS Integration</h2><p>Manage MLS data feeds and synchronization settings.</p></div>'];
  }
}
