<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\zu_admin\Service\AuditService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Controller for the centralised audit log UI.
 *
 * Routes:
 *   GET  /zu-admin/audit-logs          → index()  — filterable table
 *   GET  /zu-admin/audit-logs/export   → export() — CSV download
 */
class AuditLogsController extends ControllerBase {

  private const PAGE_SIZE = 50;

  protected AuditService $auditService;

  public function __construct(AuditService $audit) {
    $this->auditService = $audit;
  }

  public static function create(ContainerInterface $container): static {
    return new static($container->get('zu_admin.audit_service'));
  }

  /**
   * Main audit log page — filterable, paginated table.
   */
  public function index(Request $request): array {
    // ── Read filter params from query string ─────────────────────────────────
    $event_type = trim($request->query->get('event_type', ''));
    $uid        = (int) $request->query->get('uid', 0);
    $search     = trim($request->query->get('search', ''));
    $date_from  = $this->parseDate($request->query->get('date_from', ''));
    $date_to    = $this->parseDate($request->query->get('date_to', ''), end_of_day: TRUE);
    $page       = max(1, (int) $request->query->get('page', 1));
    $offset     = ($page - 1) * self::PAGE_SIZE;

    // ── Fetch data ────────────────────────────────────────────────────────────
    $total = $this->auditService->countEntries($event_type, $uid, $date_from, $date_to, $search);
    $entries = $this->auditService->getEntries(
      self::PAGE_SIZE, $offset, $event_type, $uid, $date_from, $date_to, $search
    );
    $event_types = $this->auditService->getEventTypes();

    // ── Build table rows ──────────────────────────────────────────────────────
    $date_formatter = \Drupal::service('date.formatter');
    $rows = [];
    foreach ($entries as $log) {
      $category = explode('.', $log['event_type'])[0];
      $rows[] = [
        'id'         => $log['id'],
        'timestamp'  => $date_formatter->format($log['timestamp'], 'custom', 'Y-m-d H:i:s'),
        'event_type' => $log['event_type'],
        'category'   => $category,
        'message'    => $log['message'],
        'uid'        => $log['uid'],
        'username'   => $log['username'] ?? ('uid:' . $log['uid']),
        'ip_address' => $log['ip_address'],
      ];
    }

    // ── Pagination ────────────────────────────────────────────────────────────
    $total_pages = $total > 0 ? (int) ceil($total / self::PAGE_SIZE) : 1;
    $base_params = array_filter([
      'event_type' => $event_type,
      'uid'        => $uid ?: '',
      'search'     => $search,
      'date_from'  => $request->query->get('date_from', ''),
      'date_to'    => $request->query->get('date_to', ''),
    ]);

    return [
      '#theme'       => 'zu_audit_logs',
      '#logs'        => $rows,
      '#event_types' => $event_types,
      '#total'       => $total,
      '#page'        => $page,
      '#total_pages' => $total_pages,
      '#page_size'   => self::PAGE_SIZE,
      '#filters'     => [
        'event_type' => $event_type,
        'uid'        => $uid ?: '',
        'search'     => $search,
        'date_from'  => $request->query->get('date_from', ''),
        'date_to'    => $request->query->get('date_to', ''),
      ],
      '#base_params' => $base_params,
      '#export_url'  => \Drupal\Core\Url::fromRoute('zu_admin.audit_logs.export', [], [
        'query' => $base_params,
      ])->toString(),
      '#cache'       => ['max-age' => 0],
    ];
  }

  /**
   * CSV export — streams all matching rows without paging.
   */
  public function export(Request $request): Response {
    $event_type = trim($request->query->get('event_type', ''));
    $uid        = (int) $request->query->get('uid', 0);
    $search     = trim($request->query->get('search', ''));
    $date_from  = $this->parseDate($request->query->get('date_from', ''));
    $date_to    = $this->parseDate($request->query->get('date_to', ''), end_of_day: TRUE);

    $entries = $this->auditService->getEntries(
      limit: 0, offset: 0,
      event_type: $event_type, uid: $uid,
      date_from: $date_from, date_to: $date_to,
      search: $search,
    );

    $date_formatter = \Drupal::service('date.formatter');
    $filename = 'audit-log-' . date('Y-m-d-His') . '.csv';

    $response = new StreamedResponse(function () use ($entries, $date_formatter) {
      $fh = fopen('php://output', 'w');
      fputcsv($fh, ['ID', 'Timestamp', 'Event Type', 'Message', 'UID', 'Username', 'IP Address']);
      foreach ($entries as $log) {
        fputcsv($fh, [
          $log['id'],
          $date_formatter->format($log['timestamp'], 'custom', 'Y-m-d H:i:s'),
          $log['event_type'],
          $log['message'],
          $log['uid'],
          $log['username'] ?? '',
          $log['ip_address'],
        ]);
      }
      fclose($fh);
    });

    $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
    $response->headers->set('Content-Disposition', "attachment; filename=\"{$filename}\"");
    $response->headers->set('Cache-Control', 'no-store, no-cache');
    return $response;
  }

  /**
   * Parse a date string (YYYY-MM-DD) to a Unix timestamp, or 0 on failure.
   *
   * @param string $value     Raw query-string value.
   * @param bool   $end_of_day  If TRUE, returns 23:59:59 of the given day.
   */
  private function parseDate(string $value, bool $end_of_day = FALSE): int {
    $value = trim($value);
    if (!$value || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
      return 0;
    }
    $ts = strtotime($end_of_day ? $value . ' 23:59:59' : $value . ' 00:00:00');
    return $ts ?: 0;
  }

}
