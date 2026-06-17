<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;

class BulkImportController extends ControllerBase {
  public function index(): array {
    return ['#markup' => '<div class="zu-placeholder"><h2>Bulk Import Data</h2><p>Upload CSV or JSON files to import content in bulk.</p></div>'];
  }
}
