<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\zu_rest_api\Service\DeploymentLogService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Deployment log listing form with filters, tableselect and bulk delete.
 */
class DeploymentLogForm extends FormBase {

  /**
   * @var \Drupal\zu_rest_api\Service\DeploymentLogService
   */
  protected DeploymentLogService $deploymentLogService;

  /**
   * @var \Drupal\Core\Datetime\DateFormatterInterface
   */
  protected DateFormatterInterface $dateFormatter;

  /**
   * {@inheritdoc}
   */
  public function __construct(DeploymentLogService $deployment_log_service, DateFormatterInterface $date_formatter, RequestStack $request_stack) {
    $this->deploymentLogService = $deployment_log_service;
    $this->dateFormatter = $date_formatter;
    $this->requestStack = $request_stack;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('zu_rest_api.deployment_log'),
      $container->get('date.formatter'),
      $container->get('request_stack')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'deployment_log_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Disable page cache so filter values always reflect URL params.
    $form['#cache'] = ['max-age' => 0];

    $request = $this->requestStack->getCurrentRequest();

    // Read filter values from query string.
    $filter_deploy_type = $request->query->get('deploy_type', '');
    $filter_status = $request->query->get('status', '');
    $filter_date_from = $request->query->get('date_from', '');
    $filter_date_to = $request->query->get('date_to', '');

    $filters = [];
    if ($filter_deploy_type !== '') {
      $filters['deploy_type'] = $filter_deploy_type;
    }
    if ($filter_status !== '') {
      $filters['status'] = $filter_status;
    }
    if ($filter_date_from !== '') {
      $filters['date_from'] = $filter_date_from;
    }
    if ($filter_date_to !== '') {
      $filters['date_to'] = $filter_date_to;
    }

    // --- Statistics ---
    $stats = $this->deploymentLogService->getStatistics();
    $form['statistics'] = [
      '#type' => 'details',
      '#title' => $this->t('Deployment Statistics'),
      '#open' => TRUE,
      'stats_table' => [
        '#type' => 'table',
        '#header' => [
          $this->t('Total Deployments'),
          $this->t('Successful'),
          $this->t('Failed'),
        ],
        '#rows' => [
          [$stats['total'], $stats['success'], $stats['failed']],
        ],
      ],
    ];

    // --- Filters ---
    $deploy_types = $this->deploymentLogService->getDeployTypes();
    $type_options = ['' => $this->t('- All Types -')];
    foreach ($deploy_types as $type) {
      $type_options[$type] = ucfirst(str_replace('_', ' ', $type));
    }

    $has_filters = !empty($filters);

    $form['filters'] = [
      '#type' => 'details',
      '#title' => $has_filters
        ? $this->t('Filters (active)')
        : $this->t('Filters'),
      '#open' => $has_filters,
    ];

    $form['filters']['deploy_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Deploy Type'),
      '#options' => $type_options,
      '#default_value' => $filter_deploy_type,
    ];

    $form['filters']['status'] = [
      '#type' => 'select',
      '#title' => $this->t('Status'),
      '#options' => [
        '' => $this->t('- All Statuses -'),
        'success' => $this->t('Success'),
        'failed' => $this->t('Failed'),
        'pending' => $this->t('Pending'),
      ],
      '#default_value' => $filter_status,
    ];

    $form['filters']['date_from'] = [
      '#type' => 'date',
      '#title' => $this->t('From Date'),
      '#default_value' => $filter_date_from,
    ];

    $form['filters']['date_to'] = [
      '#type' => 'date',
      '#title' => $this->t('To Date'),
      '#default_value' => $filter_date_to,
    ];

    $form['filters']['filter_actions'] = [
      '#type' => 'actions',
    ];

    $form['filters']['filter_actions']['filter_submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Filter'),
      '#submit' => ['::filterSubmit'],
    ];

    $form['filters']['filter_actions']['reset'] = [
      '#type' => 'link',
      '#title' => $this->t('Reset'),
      '#url' => Url::fromRoute('zu_rest_api.deployment_log'),
      '#attributes' => ['class' => ['button']],
    ];

    // --- Table ---
    $page = max(0, (int) $request->query->get('page', 0));
    $limit = 50;
    $offset = $page * $limit;

    $logs = $this->deploymentLogService->getLogs($limit, $offset, $filters);
    $total = $this->deploymentLogService->getLogsCount($filters);

    $header = [
      'sno' => $this->t('S.No.'),
      'type' => $this->t('Type'),
      'status' => $this->t('Status'),
      'user' => $this->t('User'),
      'datetime' => $this->t('Date/Time'),
      'message' => $this->t('Message'),
      'operations' => $this->t('Actions'),
    ];

    $options = [];
    $serial = $offset + 1;
    foreach ($logs as $log) {
      $user = $log->uid ? \Drupal::entityTypeManager()->getStorage('user')->load($log->uid) : NULL;
      $username = $user ? $user->getDisplayName() : $this->t('System');

      $options[$log->id] = [
        'sno' => $serial++,
        'type' => ucfirst(str_replace('_', ' ', $log->deploy_type)),
        'status' => ucfirst($log->status),
        'user' => $username,
        'datetime' => $this->dateFormatter->format($log->created, 'custom', 'Y-m-d H:i:s'),
        'message' => $this->truncateMessage($log->message),
        'operations' => [
          'data' => [
            '#type' => 'link',
            '#title' => $this->t('Delete'),
            '#url' => Url::fromRoute('zu_rest_api.deployment_log_delete', ['id' => $log->id]),
            '#attributes' => [
              'class' => ['button', 'button--danger', 'button--small'],
            ],
          ],
        ],
      ];
    }

    $form['table'] = [
      '#type' => 'tableselect',
      '#header' => $header,
      '#options' => $options,
      '#empty' => $this->t('No deployment logs found.'),
    ];

    // --- Bulk delete button ---
    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['delete_selected'] = [
      '#type' => 'submit',
      '#value' => $this->t('Delete Selected'),
      '#submit' => ['::deleteSelectedSubmit'],
      '#attributes' => ['class' => ['button', 'button--danger']],
    ];

    // --- Pager ---
    $total_pages = (int) ceil($total / $limit);
    if ($total_pages > 1) {
      $pager_links = [];
      $pager_query = $filters;

      if ($page > 0) {
        $pager_query['page'] = $page - 1;
        $pager_links[] = [
          '#type' => 'link',
          '#title' => $this->t('« Previous'),
          '#url' => Url::fromRoute('zu_rest_api.deployment_log', [], ['query' => $pager_query]),
          '#attributes' => ['class' => ['button']],
          '#suffix' => ' ',
        ];
      }

      $start = max(0, $page - 2);
      $end = min($total_pages - 1, $page + 2);
      for ($i = $start; $i <= $end; $i++) {
        $pager_query['page'] = $i;
        $pager_links[] = [
          '#type' => 'link',
          '#title' => $i + 1,
          '#url' => Url::fromRoute('zu_rest_api.deployment_log', [], ['query' => $pager_query]),
          '#attributes' => [
            'class' => $i === $page ? ['button', 'button--primary'] : ['button'],
          ],
          '#suffix' => ' ',
        ];
      }

      if ($page < $total_pages - 1) {
        $pager_query['page'] = $page + 1;
        $pager_links[] = [
          '#type' => 'link',
          '#title' => $this->t('Next »'),
          '#url' => Url::fromRoute('zu_rest_api.deployment_log', [], ['query' => $pager_query]),
          '#attributes' => ['class' => ['button']],
        ];
      }

      $form['pager'] = [
        '#type' => 'container',
        'info' => [
          '#markup' => '<p>' . $this->t('Showing @start - @end of @total', [
            '@start' => $offset + 1,
            '@end' => min($offset + $limit, $total),
            '@total' => $total,
          ]) . '</p>',
        ],
        'pages' => $pager_links,
      ];
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Default submit - does nothing.
  }

  /**
   * Filter submit handler - redirects with query params.
   */
  public function filterSubmit(array &$form, FormStateInterface $form_state) {
    $query = [];
    $deploy_type = $form_state->getValue('deploy_type');
    $status = $form_state->getValue('status');
    $date_from = $form_state->getValue('date_from');
    $date_to = $form_state->getValue('date_to');

    if (!empty($deploy_type)) {
      $query['deploy_type'] = $deploy_type;
    }
    if (!empty($status)) {
      $query['status'] = $status;
    }
    if (!empty($date_from)) {
      $query['date_from'] = $date_from;
    }
    if (!empty($date_to)) {
      $query['date_to'] = $date_to;
    }

    $form_state->setRedirect('zu_rest_api.deployment_log', [], ['query' => $query]);
  }

  /**
   * Bulk delete submit handler - stores IDs in tempstore, redirects to confirm.
   */
  public function deleteSelectedSubmit(array &$form, FormStateInterface $form_state) {
    $selected = array_filter($form_state->getValue('table'));
    if (empty($selected)) {
      $this->messenger()->addWarning($this->t('No items selected.'));
      return;
    }

    $tempstore = \Drupal::service('tempstore.private')->get('zu_deployment_log');
    $tempstore->set('delete_ids', array_values($selected));
    $form_state->setRedirect('zu_rest_api.deployment_log_delete_confirm');
  }

  /**
   * Truncate long message for table display.
   */
  protected function truncateMessage(?string $message, int $length = 50): string {
    if (empty($message)) {
      return '-';
    }
    if (strlen($message) <= $length) {
      return $message;
    }
    return substr($message, 0, $length) . '...';
  }

}
