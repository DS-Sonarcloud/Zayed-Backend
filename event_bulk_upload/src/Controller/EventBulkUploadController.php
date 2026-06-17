<?php

namespace Drupal\event_bulk_upload\Controller;

use Drupal\Core\Controller\ControllerBase;

class EventBulkUploadController extends ControllerBase
{

    public function result()
    {
        return [
            '#markup' => '<div class="messages messages--status">Event CSV uploaded successfully.</div>',
        ];
    }
}
