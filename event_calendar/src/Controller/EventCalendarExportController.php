<?php

namespace Drupal\event_calendar\Controller;

use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;

class EventCalendarExportController extends ControllerBase {

  public function generateIcs(Node $node) {
    if ($node->bundle() !== 'event') {
      throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
    }

    $title = $node->label();
    $start = $node->get('field_start_date')->value;
    $end = $node->get('field_end_date')->end_value ?? $start;
    $description = strip_tags($node->get('field_description')->value);
    // $location = $node->get('field_location')->value ?? '';
    //LOCATION:" . addslashes($location) . "

    $ics = "BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Drupal Event Calendar//EN
BEGIN:VEVENT
UID:" . $node->id() . "@yourdomain.com
DTSTAMP:" . gmdate('Ymd\THis\Z') . "
DTSTART:" . gmdate('Ymd\THis\Z', strtotime($start)) . "
DTEND:" . gmdate('Ymd\THis\Z', strtotime($end)) . "
SUMMARY:" . addslashes($title) . "
DESCRIPTION:" . addslashes($description) . "
END:VEVENT
END:VCALENDAR";

    return new Response($ics, 200, [
      'Content-Type' => 'text/calendar',
      'Content-Disposition' => 'attachment; filename="event.ics"',
    ]);
  }
}
