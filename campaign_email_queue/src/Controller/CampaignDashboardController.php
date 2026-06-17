<?php

namespace Drupal\campaign_email_queue\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Drupal\Core\Link;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Drupal\campaign_email_queue\Service\CampaignEmailLogService;
use Drupal\campaign_email_queue\Service\CampaignProcessingState;
use Drupal\campaign_email_queue\Service\CampaignSendKeepAlive;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Queue\QueueFactory;

class CampaignDashboardController extends ControllerBase
{
  protected CampaignEmailQueueService $queueService;
  protected CampaignEmailLogService $logService;
  protected DateFormatterInterface $dateFormatter;
  protected QueueFactory $queueFactory;

  public function __construct(
    CampaignEmailQueueService $queueService,
    CampaignEmailLogService $logService,
    DateFormatterInterface $dateFormatter,
    QueueFactory $queueFactory,
    protected CampaignSendKeepAlive $keepAlive,
    protected CampaignProcessingState $processingState,
  ) {
    $this->queueService = $queueService;
    $this->logService = $logService;
    $this->dateFormatter = $dateFormatter;
    $this->queueFactory = $queueFactory;
  }

  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('campaign_email_queue.queue'),
      $container->get('campaign_email_queue.log'),
      $container->get('date.formatter'),
      $container->get('queue'),
      $container->get('campaign_email_queue.keepalive'),
      $container->get('campaign_email_queue.processing_state'),
    );
  }

  public function overview()
  {
    if (!$this->currentUser()->hasPermission('access campaign email queue dashboard')) {
      return [
        '#markup' => $this->t('You do not have permission to access this dashboard.'),
      ];
    }

    $build['add_campaign'] = [
      '#markup' => '<div class="campaign-dashboard-actions" style="margin-bottom: 20px; text-align: right;">' .
        '<a class="header-link button button--primary" href="/node/add/campaign" target="_blank">' . $this->t('Add New Campaign') . '</a>' .
        '</div>',
      '#weight' => -50,
    ];

    $build['#attached']['library'][] = 'campaign_email_queue/dashboard';
    $build['#attached']['library'][] = 'campaign_email_queue/admin_keepalive';
    $build['#attached']['drupalSettings']['campaignEmailQueueKeepalive'] = [
      'url' => Url::fromRoute('campaign_email_queue.keepalive')->toString(),
      'intervalMs' => min(8000, $this->queueService->getSettings()['admin_keepalive_interval_ms']),
    ];
    $build['#cache']['max-age'] = 0;

    // Count Campaigns
    $campaign_query = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->getQuery()
      ->condition('type', 'campaign')
      ->accessCheck(FALSE);

    $this->queueService->applyCampaignAccess($campaign_query, $this->currentUser());
    $campaign_count = $campaign_query->count()->execute();

    // Count Templates
    $template_query = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->getQuery()
      ->condition('type', 'email_template')
      ->accessCheck(FALSE);

    $this->queueService->applyCampaignAccess($template_query, $this->currentUser());
    $template_count = $template_query->count()->execute();

    // Calculate Stats for Accessible Campaigns Only
    $stats_campaign_query = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->getQuery()
      ->condition('type', 'campaign')
      ->accessCheck(FALSE);
    $this->queueService->applyCampaignAccess($stats_campaign_query, $this->currentUser());
    $accessible_nids = $stats_campaign_query->execute();

    $summary_counts = $this->logService->getAccessibleCampaignSummary(array_values($accessible_nids));
    $total_sent = $summary_counts['sent'];
    $total_failed = $summary_counts['failed'];
    $total_pending = $summary_counts['pending'];

    $summary_data = [
      ['title' => $this->t('Total Campaigns'), 'value' => $campaign_count, 'class' => 'campaigns'],
      ['title' => $this->t('Email Templates'), 'value' => $template_count, 'class' => 'templates'],
      ['title' => $this->t('Emails Sent'), 'value' => number_format($total_sent), 'class' => 'sent'],
      ['title' => $this->t('Pending'), 'value' => number_format($total_pending), 'class' => 'pending'],
      ['title' => $this->t('Failed'), 'value' => number_format($total_failed), 'class' => 'failed'],
    ];

    $build['summary'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['summary-cards-wrapper', 'mb-4']],
    ];

    foreach ($summary_data as $item) {
      $build['summary'][] = [
        '#type' => 'container',
        '#attributes' => ['class' => ['summary-card', $item['class']]],
        'title' => [
          '#markup' => '<div class="summary-card-title">' . $item['title'] . '</div>',
        ],
        'value' => [
          '#markup' => '<div class="summary-card-value">' . $item['value'] . '</div>',
        ],
      ];
    }

    $query = \Drupal::entityQuery('node')
      ->condition('type', 'campaign')
      ->accessCheck(FALSE)
      ->sort('created', 'DESC')
      ->pager(50);

    $this->queueService->applyCampaignAccess($query, $this->currentUser());

    $nids = $query->execute();
    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);

    $settings = $this->queueService->getSettings();
    $build['#attached']['drupalSettings']['campaignEmailQueue'] = [
      'liveStatusUrl' => Url::fromRoute('campaign_email_queue.ajax_live_status')->toString(),
      'keepAliveUrl' => Url::fromRoute('campaign_email_queue.keepalive')->toString(),
      'pageCampaignIds' => array_map('intval', array_values($nids)),
      'pollIntervalMs' => $settings['dashboard_poll_interval_ms'],
      'keepAliveIntervalMs' => $settings['admin_keepalive_interval_ms'],
    ];

    $active_ids = $this->processingState->getActiveCampaignIds();
    $build['automation_notice'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['campaign-automation-notice', 'messages', 'messages--status']],
      '#weight' => -40,
      'text' => [
        '#markup' => $this->buildAutomationNoticeMarkup($active_ids),
      ],
    ];

    $now = \Drupal::time()->getRequestTime();
    $build['current_time'] = [
      '#markup' => '<div class="campaign-dashboard-messages messages messages--status">' .
        $this->t('<strong>Current Server Time (UTC):</strong> @utc', ['@utc' => gmdate('Y-m-d H:i:s')]) . ' <br> ' .
        $this->t('<strong>Your Dashboard Time:</strong> @local', ['@local' => $this->dateFormatter->format($now, 'short')]) .
        '</div>',
    ];

    $build['campaigns'] = [
      '#type' => 'table',
      '#header' => [
        $this->t('Campaign'),
        $this->t('Queue Run Status'),
        $this->t('Progress'),
        $this->t('Total'),
        $this->t('Sent'),
        $this->t('Failed'),
        $this->t('Pending'),
        $this->t('Queue'),
        $this->t('Paused'),
        $this->t('Scheduled'),
        $this->t('Run ID'),
        $this->t('Last Updated'),
        $this->t('Operations'),
      ],
      '#rows' => [],
      '#attributes' => ['class' => ['campaign-matrix-table']],
    ];

    /** @var \Drupal\node\NodeInterface $node */
    foreach ($nodes as $nid => $node) {
      $paused = (bool) $node->get('field_queue_paused')->value;
      $real_time_status = $this->queueService->getDashboardStatus($nid);
      $queue_count = $real_time_status['queue_count'];
      $latest_run_id = $real_time_status['run_id'] ?? $this->logService->getLatestRunId($nid);

      $status_label = ucfirst(str_replace('_', ' ', $real_time_status['status']));
      if (!empty($real_time_status['background_active'])) {
        $status_label .= ' <span class="campaign-live-indicator" title="' . $this->t('Sending in background') . '">●</span>';
      }
      $progress = round($real_time_status['progress'], 1) . '%'
        . ' <small class="campaign-sent-progress">('
        . $this->t('@sent sent', ['@sent' => number_format((int) $real_time_status['sent'])])
        . ')</small>';
      $last_updated = !empty($real_time_status['last_updated'])
        ? $this->dateFormatter->format((int) $real_time_status['last_updated'], 'short')
        : '-';
      $is_active = !empty($real_time_status['background_active'])
        || ($real_time_status['status'] === 'in_progress' && $real_time_status['pending'] > 0);
      $button_text = $is_active ? $this->t('Resume') : $this->t('Process');

      $process_url = Url::fromRoute('campaign_email_queue.ajax_process', ['node' => $nid]);
      $link_process = Link::fromTextAndUrl($button_text, $process_url);
      $process_renderable = $link_process->toRenderable();
      $process_renderable['#attributes'] = [
        'class' => ['ajax-process-link', 'button', 'button--small'],
        'data-nid' => $nid,
      ];

      if ($is_active) {
        $process_renderable['#attributes']['class'][] = 'button--action';
        $process_renderable['#attributes']['title'] = $this->t('Click to Resume processing.');
        
        // Detect Stuck State
        if ($queue_count == 0) {
           $status_label .= ' <span class="marker" style="color:red; font-weight:bold;">⚠️ Sync Error</span>';
           $process_renderable['#attributes']['title'] = $this->t('Sync Error: Queue Empty. Click Resume to fix.');
        }
      }

      if ($paused) {
        $process_renderable['#attributes']['title'] = $this->t('Queue is paused.');
      }

      $link_clear = Link::fromTextAndUrl($this->t('Clear'), Url::fromRoute('campaign_email_queue.ajax_clear', ['node' => $nid]));
      $clear_renderable = $link_clear->toRenderable();
      $clear_renderable['#attributes'] = [
        'class' => ['ajax-clear-link', 'button', 'button--small'],
        'data-nid' => $nid,
      ];

      $link_rerun = Link::fromTextAndUrl($this->t('Re-run'), Url::fromRoute('campaign_email_queue.ajax_rerun', ['node' => $nid]));
      $rerun_renderable = $link_rerun->toRenderable();
      $rerun_renderable['#attributes'] = [
        'class' => ['ajax-rerun-link', 'button', 'button--small'],
        'data-nid' => $nid,
      ];

      if ($is_active) {
        $rerun_renderable['#attributes']['class'][] = 'is-disabled';
        $rerun_renderable['#attributes']['title'] = $this->t('Campaign is currently in progress.');
      }

      $link_details = Link::fromTextAndUrl($this->t('Edit Campaign'), Url::fromRoute('entity.node.edit_form', ['node' => $nid]));

      $build['campaigns']['#rows'][] = [
        'data' => [
          ['data' => ['#markup' => '<a href="' . Url::fromRoute('campaign_email_queue.details', ['node' => $nid])->toString() . '">' . $node->getTitle() . '</a><br><small>ID: ' . $nid . '</small>']],
          ['data' => ['#markup' => '<span class="campaign-field-status">' . $status_label . '</span>']],
          ['data' => ['#markup' => '<span class="campaign-field-progress">' . $progress . '</span>']],
          ['data' => ['#markup' => '<strong class="campaign-field-total">' . number_format($real_time_status['total']) . '</strong>']],
          ['data' => ['#markup' => '<span class="campaign-field-sent">' . number_format($real_time_status['sent']) . '</span>']],
          ['data' => ['#markup' => '<span class="campaign-field-failed">' . number_format($real_time_status['failed'] + $real_time_status['error']) . '</span>']],
          ['data' => ['#markup' => '<span class="campaign-field-pending">' . number_format($real_time_status['pending']) . '</span>']],
          ['data' => ['#markup' => '<span class="campaign-field-queue">' . number_format($queue_count) . '</span>']],
          $paused ? $this->t('Yes') : $this->t('No'),
          $node->get('field_scheduled_time')->value ? $this->dateFormatter->format(strtotime($node->get('field_scheduled_time')->value . ' UTC'), 'short') : $this->t('Immediate/Man'),
          $latest_run_id,
          $last_updated,
          [
            'data' => [
              $link_details->toRenderable(),
              ['#markup' => ' | '],
              $process_renderable,
              // ['#markup' => ' | '],
              // $clear_renderable,
              ['#markup' => ' | '],
              $rerun_renderable,
            ],
          ],
        ],
        'class' => ['campaign-row-' . $nid],
        'data-nid' => $nid,
      ];
    }

    $build['pager'] = [
      '#type' => 'pager',
    ];

    if (\Drupal::request()->isXmlHttpRequest()) {
      $response = new AjaxResponse();
      $response->addCommand(new ReplaceCommand('.summary-cards-wrapper', $build['summary']));
      $response->addCommand(new ReplaceCommand('.campaign-matrix-table', $build['campaigns']));
      $response->addCommand(new ReplaceCommand('.campaign-dashboard-messages', $build['current_time']));

      return $response;
    }

    return $build;
  }

  /**
   * Bulk live status JSON for dashboard polling.
   */
  public function ajaxLiveStatus(Request $request): JsonResponse {
    $ids = $request->query->get('ids', '');
    if (is_string($ids) && $ids !== '') {
      $ids = array_map('intval', explode(',', $ids));
    }
    elseif (!is_array($ids)) {
      $ids = [];
    }

    $campaigns = [];
    foreach ($ids as $campaign_id) {
      $campaign_id = (int) $campaign_id;
      if ($campaign_id <= 0) {
        continue;
      }
      $node = \Drupal::entityTypeManager()->getStorage('node')->load($campaign_id);
      if (!$node instanceof NodeInterface || $node->bundle() !== 'campaign') {
        continue;
      }
      if (!$this->queueService->checkCampaignAccess($node, $this->currentUser(), 'view')) {
        continue;
      }
      $campaigns[$campaign_id] = $this->queueService->getDashboardStatus($campaign_id);
    }

    $summary_query = \Drupal::entityTypeManager()
      ->getStorage('node')
      ->getQuery()
      ->condition('type', 'campaign')
      ->accessCheck(FALSE);
    $this->queueService->applyCampaignAccess($summary_query, $this->currentUser());
    $summary_nids = $summary_query->execute();

    return new JsonResponse([
      'campaigns' => $campaigns,
      'summary' => $this->logService->getAccessibleCampaignSummary(array_values($summary_nids)),
      'time' => \Drupal::time()->getRequestTime(),
    ]);
  }

  /**
   * Client-facing notice: no terminal/Drush required.
   *
   * @param list<int> $active_ids
   */
  protected function buildAutomationNoticeMarkup(array $active_ids): string {
    $lines = [];
    $lines[] = '<strong>' . $this->t('Automatic sending — no terminal required') . '</strong>';
    $lines[] = $this->t('Click <em>Process</em> once. Emails continue in the background via the site scheduler (every ~5 minutes) and while you use the admin area. You can close this tab; sending does not depend on keeping it open if hosting cron is configured.');

    if ($active_ids !== []) {
      $lines[] = '<em>' . $this->t('Sending in progress for campaign ID(s): @ids', [
        '@ids' => implode(', ', $active_ids),
      ]) . '</em>';
    }

    if ($this->currentUser()->hasPermission('administer site configuration')) {
      $cron_key = \Drupal::state()->get('system.cron_key');
      if ($cron_key) {
        $cron_url = Url::fromRoute('system.cron', ['key' => $cron_key], ['absolute' => TRUE])->toString();
        $lines[] = $this->t('One-time hosting setup (for IT, not a terminal): add a scheduled task in your hosting control panel to request this URL every 5 minutes: <code>@url</code>', [
          '@url' => $cron_url,
        ]);
        $lines[] = $this->t('Or open @link — no command line needed.', [
          '@link' => Url::fromRoute('system.cron_settings')->toString(),
        ]);
      }
    }

    return '<p>' . implode('</p><p>', $lines) . '</p>';
  }

  /**
   * Campaign details page with email-level matrix.
   */
  public function details(NodeInterface $node)
  {
    if (!$this->queueService->checkCampaignAccess($node, $this->currentUser(), 'view')) {
      return [
        '#markup' => $this->t('You do not have permission to view details for this campaign.'),
      ];
    }

    $campaign_id = $node->id();
    $stats = $this->logService->getCampaignStatistics($campaign_id);
    $real_time_status = $this->logService->getRealTimeStatus($campaign_id);

    $build['#attached']['library'][] = 'campaign_email_queue/dashboard';

    $build['header'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['campaign-details-header', 'mb-4']],
      'title' => [
        '#markup' => '<h1>' . $this->t('Campaign Details: @title', ['@title' => $node->getTitle()]) . '</h1>',
      ],
      'templates' => [
        '#type' => 'container',
        '#attributes' => ['class' => ['campaign-templates-list', 'mb-2']],
        'label' => [
          '#markup' => '<strong>' . $this->t('Email Templates Used:') . '</strong> ',
        ],
        'items' => [
          '#markup' => (function () use ($node) {
            $templates = $node->get('field_email_template')->referencedEntities();
            $labels = array_map(fn($t) => $t->label(), $templates);
            return !empty($labels) ? implode(', ', $labels) : $this->t('None');
          })(),
        ],
      ],
      'back' => [
        '#markup' => Link::fromTextAndUrl('← Back to Dashboard', Url::fromRoute('campaign_email_queue.dashboard'))->toString(),
      ],
    ];

    $details_summary_data = [
      ['title' => $this->t('Total Emails'), 'value' => number_format($real_time_status['total']), 'class' => 'total'],
      ['title' => $this->t('Sent'), 'value' => number_format($real_time_status['sent']), 'class' => 'sent'],
      ['title' => $this->t('Pending'), 'value' => number_format($real_time_status['pending']), 'class' => 'pending'],
      ['title' => $this->t('Failed'), 'value' => number_format($real_time_status['failed'] + $real_time_status['error']), 'class' => 'failed'],
      ['title' => $this->t('Success Rate'), 'value' => ($real_time_status['total'] > 0 ? round(($real_time_status['sent'] / $real_time_status['total']) * 100, 2) . '%' : '0%'), 'class' => 'success-rate'],
    ];

    $build['summary'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['summary-cards-wrapper', 'mb-4']],
    ];

    foreach ($details_summary_data as $item) {
      $build['summary'][] = [
        '#type' => 'container',
        '#attributes' => ['class' => ['summary-card', $item['class']]],
        'title' => [
          '#markup' => '<div class="summary-card-title">' . $item['title'] . '</div>',
        ],
        'value' => [
          '#markup' => '<div class="summary-card-value">' . $item['value'] . '</div>',
        ],
      ];
    }

    $all_runs = $this->logService->getRerunsWithStats($campaign_id);

    $build['rerun_section'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['rerun-section', 'mb-4']],
      'title' => [
        '#markup' => '<h2>' . $this->t('Campaign Run History') . '</h2>',
      ],
    ];

    if (!empty($all_runs)) {
      $build['rerun_section']['runs_table'] = [
        '#type' => 'table',
        '#header' => [
          $this->t('Run ID'),
          $this->t('Triggered By'),
          $this->t('Status'),
          $this->t('Sent'),
          $this->t('Failed'),
          $this->t('Total'),
          $this->t('Time'),
        ],
        '#rows' => [],
        '#attributes' => ['class' => ['rerun-history-table']],
      ];

      foreach ($all_runs as $run) {
        $status = 'Completed';
        if ($run->pending_count > 0) {
          $status = 'Pending';
        }

        $user = $run->user_id ? \Drupal::entityTypeManager()->getStorage('user')->load($run->user_id) : NULL;
        $username = $user ? $user->getDisplayName() : ($run->run_id == 1 ? 'System' : 'Unknown');

        $build['rerun_section']['runs_table']['#rows'][] = [
          [
            'data' => Link::fromTextAndUrl(
              'Run #' . $run->run_id . ($run->run_id == $this->logService->getLatestRunId($campaign_id) ? ' (Current)' : ''),
              Url::fromRoute('campaign_email_queue.run_logs', ['node' => $campaign_id, 'run_id' => $run->run_id])
            )->toRenderable(),
          ],
          $username,
          $status,
          $run->sent_count,
          $run->failed_count + $run->error_count,
          $run->total_emails,
          $this->dateFormatter->format($run->rerun_time ?: ($run->started_time ?: $run->last_updated), 'short'),
        ];
      }
      $build['rerun_section']['pager'] = [
        '#type' => 'pager',
      ];
    } else {
      $build['rerun_section']['no_reruns'] = [
        '#markup' => '<p class="text-muted">No runs recorded yet.</p>',
      ];
    }

    if (\Drupal::request()->isXmlHttpRequest()) {
      $response = new AjaxResponse();
      $response->addCommand(new ReplaceCommand('.summary-cards-wrapper', $build['summary']));
      if (isset($build['rerun_section']['runs_table'])) {
        $response->addCommand(new ReplaceCommand('.rerun-history-table', $build['rerun_section']['runs_table']));
      }
      return $response;
    }

    return $build;
  }

  /**
   * Page to show logs for a specific run.
   */
  public function runLogs(NodeInterface $node, int $run_id)
  {
    if (!$this->queueService->checkCampaignAccess($node, $this->currentUser(), 'view')) {
      return [
        '#markup' => $this->t('You do not have permission to view logs for this campaign.'),
      ];
    }

    $campaign_id = $node->id();
    $build['#attached']['library'][] = 'campaign_email_queue/dashboard';

    $build['header'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['run-logs-header', 'mb-4']],
      'title' => [
        '#markup' => '<h1>' . $this->t('Run #@run Logs: @title', ['@run' => $run_id, '@title' => $node->getTitle()]) . '</h1>',
      ],
      'actions' => [
        '#type' => 'container',
        '#attributes' => ['class' => ['campaign-details-actions', 'mb-3']],
        'process' => [
          '#type' => 'link',
          '#title' => $this->t('Process Now'),
          '#url' => Url::fromRoute('campaign_email_queue.ajax_process', ['node' => $campaign_id]),
          '#attributes' => [
            'class' => ['ajax-process-link', 'button', 'button--primary'],
            'data-nid' => $campaign_id,
          ],
        ],
        'rerun' => [
          '#type' => 'link',
          '#title' => $this->t('Re-run Campaign'),
          '#url' => Url::fromRoute('campaign_email_queue.ajax_rerun', ['node' => $campaign_id]),
          '#attributes' => [
            'class' => ['ajax-rerun-link', 'button', 'button--danger'],
            'data-nid' => $campaign_id,
          ],
        ],
      ],
      'back' => [
        '#markup' => Link::fromTextAndUrl('← Back to Campaign Details', Url::fromRoute('campaign_email_queue.details', ['node' => $campaign_id]))->toString(),
      ],
    ];

    $real_time_status = $this->logService->getRealTimeStatus($campaign_id);
    $is_active = $real_time_status['status'] === 'in_progress';

    if ($is_active) {
      $build['header']['actions']['process']['#attributes']['title'] = $this->t('Click to Resume processing.');
      $build['header']['actions']['rerun']['#attributes']['class'][] = 'is-disabled';
      $build['header']['actions']['rerun']['#attributes']['title'] = $this->t('Campaign is currently active.');
    }

    $logs = $this->logService->getCampaignEmailLogs($campaign_id, 100, 0, $run_id);
    $run_status = $this->logService->getRealTimeStatus($campaign_id, $run_id);
    $run_summary_data = [
      ['title' => $this->t('Total Emails'), 'value' => number_format($run_status['total']), 'class' => 'total'],
      ['title' => $this->t('Sent'), 'value' => number_format($run_status['sent']), 'class' => 'sent'],
      ['title' => $this->t('Pending'), 'value' => number_format($run_status['pending']), 'class' => 'pending'],
      ['title' => $this->t('Failed'), 'value' => number_format($run_status['failed'] + $run_status['error']), 'class' => 'failed'],
      ['title' => $this->t('Success Rate'), 'value' => ($run_status['total'] > 0 ? round(($run_status['sent'] / $run_status['total']) * 100, 2) . '%' : '0%'), 'class' => 'success-rate'],
    ];

    $build['summary'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['summary-cards-wrapper', 'mb-4']],
    ];

    foreach ($run_summary_data as $item) {
      $build['summary'][] = [
        '#type' => 'container',
        '#attributes' => ['class' => ['summary-card', $item['class']]],
        'title' => [
          '#markup' => '<div class="summary-card-title">' . $item['title'] . '</div>',
        ],
        'value' => [
          '#markup' => '<div class="summary-card-value">' . $item['value'] . '</div>',
        ],
      ];
    }

    $build['logs'] = [
      '#type' => 'table',
      '#header' => [
        $this->t('Email'),
        $this->t('Status'),
        $this->t('Attempts'),
        $this->t('Start Time'),
        $this->t('End Time'),
        $this->t('Error Message'),
      ],
      '#rows' => [],
      '#attributes' => ['class' => ['email-logs-table']],
      '#caption' => $this->t('Email Logs for Run #@run', ['@run' => $run_id]),
    ];

    foreach ($logs as $log) {
      $build['logs']['#rows'][] = [
        $log->email,
        [
          'data' => [
            '#type' => 'html_tag',
            '#tag' => 'span',
            '#value' => ucfirst($log->status),
            '#attributes' => ['class' => ['status-badge', 'status-' . $log->status]],
          ],
        ],
        $log->attempts,
        $log->queued_time ? $this->dateFormatter->format($log->queued_time, 'short') : '-',
        $log->sent_time ? $this->dateFormatter->format($log->sent_time, 'short') : '-',
        $log->error_message ? ['data' => ['#markup' => '<small>' . $log->error_message . '</small>']] : '-',
      ];
    }

    if (empty($logs)) {
      $build['logs']['#empty'] = $this->t('No logs found for this run.');
    }

    $build['pager'] = [
      '#type' => 'pager',
    ];

    if (\Drupal::request()->isXmlHttpRequest()) {
      $response = new AjaxResponse();
      $response->addCommand(new ReplaceCommand('.summary-cards-wrapper', $build['summary']));
      $response->addCommand(new ReplaceCommand('.email-logs-table', $build['logs']));
      return $response;
    }

    return $build;
  }

  /**
   * Diagnostic method to trigger cron via route and show detailed status.
   */
  public function testCron()
  {
    drupal_flush_all_caches();

    $now_ts = \Drupal::time()->getRequestTime();
    $now_str = gmdate('Y-m-d H:i:s', $now_ts);

    $output = "<h1>Detailed Cron Diagnostic</h1>";
    $output .= "<p><strong>Current Server Time (UTC):</strong> $now_str (TS: $now_ts)</p>";

    $nids_to_check = [1182, 1181, 1180];

    foreach ($nids_to_check as $nid) {
      $node = \Drupal::entityTypeManager()->getStorage('node')->load($nid);

      if ($node) {
        $output .= "<h2>Inspecting Node $nid (" . $node->getTitle() . ")</h2>";
        $scheduled_val = $node->get('field_scheduled_time')->value;
        $scheduled_ts = $scheduled_val ? strtotime($scheduled_val . ' UTC') : 0;
        $paused_val = $node->get('field_queue_paused')->value;
        $status = $node->isPublished();
        $queue_count = $this->queueService->getQueueCount($nid);

        $output .= "<ul>";
        $output .= "<li><strong>Status (Published):</strong> " . ($status ? 'YES' : 'NO') . "</li>";
        $output .= "<li><strong>Paused (Raw Value):</strong> '" . (is_null($paused_val) ? 'NULL' : $paused_val) . "'</li>";
        $output .= "<li><strong>Scheduled (Raw Value):</strong> '$scheduled_val'</li>";
        $output .= "<li><strong>Scheduled (TS):</strong> $scheduled_ts</li>";
        $output .= "<li><strong>Now (TS):</strong> $now_ts</li>";
        $output .= "<li><strong>Queue Count:</strong> $queue_count</li>";

        if ($scheduled_ts > 0) {
          $diff = $scheduled_ts - $now_ts;
          if ($diff > 0) {
            $output .= "<li><strong>Result:</strong> <span style='color:red'>SKIP (Future by $diff seconds)</span></li>";
          } else {
            $output .= "<li><strong>Result:</strong> <span style='color:green'>ELIGIBLE (Passed by " . abs($diff) . " seconds)</span></li>";
          }
        } else {
          $output .= "<li><strong>Result:</strong> <span style='color:orange'>SKIP (No Schedule)</span></li>";
        }
        $output .= "</ul>";
      }
    }

    $output .= "<h2>Running campaign_email_queue_cron()...</h2>";
    campaign_email_queue_cron();

    $output .= "<p>Cron execution attempted. Check <strong>Watchdog (Recent Log Messages)</strong> for 'campaign_email_queue' debug output.</p>";
    $output .= "<h3>Next Steps:</h3>";
    $output .= "<ul>";
    $output .= "<li><a href='/admin/reports/dblog' target='_blank'>Check Recent Log Messages (Watchdog)</a></li>";
    $output .= "<li><a href='/admin/content/campaign-email-queues' target='_blank'>Go to Dashboard</a></li>";
    $output .= "</ul>";

    return [
      '#markup' => $output,
      '#cache' => ['max-age' => 0],
    ];
  }
}
