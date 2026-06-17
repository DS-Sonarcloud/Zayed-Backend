<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Drupal\zu_rest_api\Service\DeploymentLogService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Controller for deployment log management.
 */
class DeploymentLogController extends ControllerBase
{

  /**
   * The deployment log service.
   *
   * @var \Drupal\zu_rest_api\Service\DeploymentLogService
   */
  protected DeploymentLogService $deploymentLogService;

  /**
   * The date formatter service.
   *
   * @var \Drupal\Core\Datetime\DateFormatterInterface
   */
  protected DateFormatterInterface $dateFormatter;

  /**
   * Constructs a DeploymentLogController object.
   */
  public function __construct(DeploymentLogService $deployment_log_service, DateFormatterInterface $date_formatter)
  {
    $this->deploymentLogService = $deployment_log_service;
    $this->dateFormatter = $date_formatter;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('zu_rest_api.deployment_log'),
      $container->get('date.formatter')
    );
  }

  /**
   * Display the deployment log page.
   */
  public function listLogs(Request $request)
  {
    // Get filter parameters
    $filters = [];
    if ($deploy_type = $request->query->get('deploy_type')) {
      $filters['deploy_type'] = $deploy_type;
    }
    if ($status = $request->query->get('status')) {
      $filters['status'] = $status;
    }
    if ($date_from = $request->query->get('date_from')) {
      $filters['date_from'] = $date_from;
    }
    if ($date_to = $request->query->get('date_to')) {
      $filters['date_to'] = $date_to;
    }

    // Pagination
    $page = max(0, (int) $request->query->get('page', 0));
    $limit = 50;
    $offset = $page * $limit;

    // Get data
    $logs = $this->deploymentLogService->getLogs($limit, $offset, $filters);
    $total = $this->deploymentLogService->getLogsCount($filters);
    $deploy_types = $this->deploymentLogService->getDeployTypes();
    $stats = $this->deploymentLogService->getStatistics();

    // Build filter form
    $form = $this->buildFilterForm($filters, $deploy_types);

    // Build statistics summary
    $statistics = $this->buildStatisticsSummary($stats);

    // Build table
    $table = $this->buildLogsTable($logs, $offset);

    // Build pager
    $pager = $this->buildPager($total, $limit, $page, $filters);

    // Build bulk actions
    $bulk_actions = $this->buildBulkActions();

    return [
      '#theme' => 'deployment_log_page',
      '#statistics' => $statistics,
      '#filter_form' => $form,
      '#logs_table' => $table,
      '#pager' => $pager,
      '#bulk_actions' => $bulk_actions,
      '#attached' => [
        'library' => [
          'zu_rest_api/deployment_log',
        ],
      ],
    ];
  }

  /**
   * Build filter form render array.
   */
  protected function buildFilterForm(array $filters, array $deploy_types): array
  {
    $type_options = ['' => '- All Types -'];
    foreach ($deploy_types as $type) {
      $type_options[$type] = ucfirst(str_replace('_', ' ', $type));
    }

    $status_options = [
      '' => '- All Statuses -',
      'success' => 'Success',
      'failed' => 'Failed',
      'pending' => 'Pending',
    ];

    return [
      '#type' => 'container',
      '#attributes' => ['class' => ['deployment-log-filters', 'clearfix']],
      'deploy_type' => [
        '#type' => 'select',
        '#title' => $this->t('Deploy Type'),
        '#name' => 'deploy_type',
        '#options' => $type_options,
        '#default_value' => $filters['deploy_type'] ?? '',
        '#attributes' => ['class' => ['filter-deploy-type']],
      ],
      'status' => [
        '#type' => 'select',
        '#title' => $this->t('Status'),
        '#name' => 'status',
        '#options' => $status_options,
        '#default_value' => $filters['status'] ?? '',
        '#attributes' => ['class' => ['filter-status']],
      ],
      'date_from' => [
        '#type' => 'date',
        '#title' => $this->t('From Date'),
        '#name' => 'date_from',
        '#default_value' => $filters['date_from'] ?? '',
        '#attributes' => ['class' => ['filter-date-from']],
      ],
      'date_to' => [
        '#type' => 'date',
        '#title' => $this->t('To Date'),
        '#name' => 'date_to',
        '#default_value' => $filters['date_to'] ?? '',
        '#attributes' => ['class' => ['filter-date-to']],
      ],
      'actions' => [
        '#type' => 'container',
        '#attributes' => ['class' => ['filter-actions']],
        'submit' => [
          '#type' => 'button',
          '#value' => $this->t('Filter'),
          '#attributes' => ['class' => ['button', 'button--primary', 'filter-submit']],
        ],
        'reset' => [
          '#type' => 'link',
          '#title' => $this->t('Reset'),
          '#url' => Url::fromRoute('zu_rest_api.deployment_log'),
          '#attributes' => ['class' => ['button', 'filter-reset']],
        ],
      ],
    ];
  }

  /**
   * Build statistics summary render array.
   */
  protected function buildStatisticsSummary(array $stats): array
  {
    return [
      '#type' => 'details',
      '#title' => $this->t('Deployment Statistics'),
      '#open' => TRUE,
      '#attributes' => ['class' => ['deployment-stats']],
      'stats_table' => [
        '#type' => 'table',
        '#header' => [
          $this->t('Total Deployments'),
          $this->t('Successful'),
          $this->t('Failed'),
        ],
        '#rows' => [
          [
            ['data' => $stats['total'], 'class' => ['stat-total']],
            ['data' => $stats['success'], 'class' => ['stat-success']],
            ['data' => $stats['failed'], 'class' => ['stat-failed']],
          ],
        ],
      ],
    ];
  }

  /**
   * Build logs table render array.
   */
  protected function buildLogsTable(array $logs, int $offset = 0): array
  {
    $header = [
      ['data' => '', 'class' => ['select-all']],
      ['data' => $this->t('S.No.'), 'class' => ['log-sno']],
      ['data' => $this->t('Type'), 'class' => ['log-type']],
      ['data' => $this->t('Status'), 'class' => ['log-status']],
      ['data' => $this->t('User'), 'class' => ['log-user']],
      ['data' => $this->t('Date/Time'), 'class' => ['log-datetime']],
      ['data' => $this->t('Message'), 'class' => ['log-message']],
      ['data' => $this->t('Actions'), 'class' => ['log-actions']],
    ];

    $rows = [];
    $serial = $offset + 1;
    foreach ($logs as $log) {
      $status_class = 'status-' . $log->status;
      $user = $log->uid ? \Drupal::entityTypeManager()->getStorage('user')->load($log->uid) : NULL;
      $username = $user ? $user->getDisplayName() : $this->t('System');

      $delete_url = Url::fromRoute('zu_rest_api.deployment_log_delete', ['id' => $log->id]);

      $rows[] = [
        'data' => [
          ['data' => ['#markup' => '<input type="checkbox" class="log-checkbox" value="' . $log->id . '" />']],
          $serial++,
          ucfirst(str_replace('_', ' ', $log->deploy_type)),
          ['data' => ['#markup' => '<span class="status-badge ' . $status_class . '">' . ucfirst($log->status) . '</span>']],
          $username,
          $this->dateFormatter->format($log->created, 'custom', 'Y-m-d H:i:s'),
          [
            'data' => ['#markup' => '<span class="log-message-text" title="' . htmlspecialchars($log->message ?? '') . '">' . $this->truncateMessage($log->message) . '</span>'],
            'class' => ['message-cell'],
          ],
          [
            'data' => [
              '#type' => 'link',
              '#title' => $this->t('Delete'),
              '#url' => $delete_url,
              '#attributes' => [
                'class' => ['button', 'button--danger', 'button--small', 'delete-log'],
                'data-id' => $log->id,
              ],
            ],
          ],
        ],
        'class' => [$status_class],
      ];
    }

    if (empty($rows)) {
      $rows[] = [
        'data' => [
          [
            'data' => $this->t('No deployment logs found.'),
            'colspan' => 8,
            'class' => ['empty-message'],
          ],
        ],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#attributes' => ['class' => ['deployment-log-table']],
      '#empty' => $this->t('No deployment logs found.'),
    ];
  }

  /**
   * Truncate message for display.
   */
  protected function truncateMessage(?string $message, int $length = 50): string
  {
    if (empty($message)) {
      return '-';
    }
    if (strlen($message) <= $length) {
      return htmlspecialchars($message);
    }
    return htmlspecialchars(substr($message, 0, $length)) . '...';
  }

  /**
   * Build pager render array.
   */
  protected function buildPager(int $total, int $limit, int $current_page, array $filters): array
  {
    $total_pages = ceil($total / $limit);

    if ($total_pages <= 1) {
      return [];
    }

    $pager_items = [];
    $base_query = $filters;

    // Previous
    if ($current_page > 0) {
      $base_query['page'] = $current_page - 1;
      $pager_items['prev'] = [
        '#type' => 'link',
        '#title' => $this->t('Previous'),
        '#url' => Url::fromRoute('zu_rest_api.deployment_log', [], ['query' => $base_query]),
        '#attributes' => ['class' => ['pager-prev']],
      ];
    }

    // Page numbers
    $start = max(0, $current_page - 2);
    $end = min($total_pages - 1, $current_page + 2);

    for ($i = $start; $i <= $end; $i++) {
      $base_query['page'] = $i;
      $pager_items['page_' . $i] = [
        '#type' => 'link',
        '#title' => $i + 1,
        '#url' => Url::fromRoute('zu_rest_api.deployment_log', [], ['query' => $base_query]),
        '#attributes' => ['class' => $i === $current_page ? ['pager-current'] : ['pager-page']],
      ];
    }

    // Next
    if ($current_page < $total_pages - 1) {
      $base_query['page'] = $current_page + 1;
      $pager_items['next'] = [
        '#type' => 'link',
        '#title' => $this->t('Next'),
        '#url' => Url::fromRoute('zu_rest_api.deployment_log', [], ['query' => $base_query]),
        '#attributes' => ['class' => ['pager-next']],
      ];
    }

    return [
      '#type' => 'container',
      '#attributes' => ['class' => ['deployment-log-pager']],
      'info' => [
        '#markup' => '<span class="pager-info">' . $this->t('Showing @start - @end of @total', [
          '@start' => ($current_page * $limit) + 1,
          '@end' => min(($current_page + 1) * $limit, $total),
          '@total' => $total,
        ]) . '</span>',
      ],
      'pages' => [
        '#type' => 'container',
        '#attributes' => ['class' => ['pager-pages']],
        'items' => $pager_items,
      ],
    ];
  }

  /**
   * Build bulk actions render array.
   */
  protected function buildBulkActions(): array
  {
    return [
      '#type' => 'container',
      '#attributes' => ['class' => ['bulk-actions']],
      'select_all' => [
        '#markup' => '<label class="bulk-select-all"><input type="checkbox" id="select-all-logs" /> ' . $this->t('Select All') . '</label>',
      ],
      'delete_selected' => [
        '#type' => 'button',
        '#value' => $this->t('Delete Selected'),
        '#attributes' => [
          'class' => ['button', 'button--danger', 'bulk-delete'],
          'id' => 'bulk-delete-btn',
          'disabled' => 'disabled',
        ],
      ],
      'delete_old' => [
        '#type' => 'container',
        '#attributes' => ['class' => ['delete-old-container']],
        'days' => [
          '#type' => 'number',
          '#title' => $this->t('Delete logs older than'),
          '#min' => 1,
          '#max' => 365,
          '#default_value' => 30,
          '#attributes' => ['id' => 'delete-old-days', 'class' => ['delete-old-days']],
          '#suffix' => ' ' . $this->t('days'),
        ],
        'submit' => [
          '#type' => 'button',
          '#value' => $this->t('Delete Old Logs'),
          '#attributes' => [
            'class' => ['button', 'button--danger', 'delete-old-btn'],
            'id' => 'delete-old-btn',
          ],
        ],
      ],
    ];
  }

  /**
   * Delete a single log entry.
   */
  public function deleteLog(Request $request, int $id)
  {
    $deleted = $this->deploymentLogService->deleteLog($id);

    if ($request->isXmlHttpRequest()) {
      return new JsonResponse([
        'success' => $deleted,
        'message' => $deleted ? $this->t('Log entry deleted.') : $this->t('Failed to delete log entry.'),
      ]);
    }

    if ($deleted) {
      $this->messenger()->addStatus($this->t('Log entry deleted successfully.'));
    } else {
      $this->messenger()->addError($this->t('Failed to delete log entry.'));
    }

    return new RedirectResponse(Url::fromRoute('zu_rest_api.deployment_log')->toString());
  }

  /**
   * Delete multiple log entries (AJAX).
   */
  public function deleteMultipleLogs(Request $request)
  {
    $ids = $request->request->all('ids');

    if (empty($ids)) {
      return new JsonResponse([
        'success' => FALSE,
        'message' => $this->t('No log entries selected.'),
      ]);
    }

    $deleted = $this->deploymentLogService->deleteLogs($ids);

    return new JsonResponse([
      'success' => $deleted > 0,
      'deleted' => $deleted,
      'message' => $this->t('@count log entries deleted.', ['@count' => $deleted]),
    ]);
  }

  /**
   * Delete old log entries (AJAX).
   */
  public function deleteOldLogs(Request $request)
  {
    $days = (int) $request->request->get('days', 30);

    if ($days < 1) {
      return new JsonResponse([
        'success' => FALSE,
        'message' => $this->t('Invalid number of days.'),
      ]);
    }

    $deleted = $this->deploymentLogService->deleteOldLogs($days);

    return new JsonResponse([
      'success' => TRUE,
      'deleted' => $deleted,
      'message' => $this->t('@count log entries older than @days days deleted.', [
        '@count' => $deleted,
        '@days' => $days,
      ]),
    ]);
  }
}
