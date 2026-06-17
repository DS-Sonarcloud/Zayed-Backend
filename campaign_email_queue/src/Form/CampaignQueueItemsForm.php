<?php

declare(strict_types=1);

namespace Drupal\campaign_email_queue\Form;

use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;
use Drupal\Core\Database\Connection;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Link;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueWorkerManagerInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Admin overview of campaign-related Drupal queues (database-backed counts).
 */
final class CampaignQueueItemsForm extends FormBase {

  public function __construct(
    private readonly Connection $database,
    private readonly QueueFactory $queueFactory,
    private readonly QueueWorkerManagerInterface $queueWorkerManager,
    private readonly CampaignEmailQueueService $queueService,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    return new static(
      $container->get('database'),
      $container->get('queue'),
      $container->get('plugin.manager.queue_worker'),
      $container->get('campaign_email_queue.queue'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'campaign_email_queue_items_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $form['help'] = [
      '#type' => 'markup',
      '#markup' => '<div class="messages messages--status">' .
        '<p><strong>' . $this->t('Why queues may show 0') . '</strong></p>' .
        '<ul>' .
        '<li>' . $this->t('Recipient emails live in per-campaign queues named <code>campaign_email_queue_{campaign_id}</code>, not in a single queue called <code>campaign_email_queue</code>.') . '</li>' .
        '<li>' . $this->t('After sending completes, queue rows are deleted — 0 is normal for finished campaigns.') . '</li>' .
        '<li>' . $this->t('Use the <a href=":url">Campaign Email Queues dashboard</a> for progress (sent / pending / failed).', [
          ':url' => Url::fromRoute('campaign_email_queue.dashboard')->toString(),
        ]) . '</li>' .
        '</ul></div>',
      '#weight' => -20,
    ];

    $form['campaign_queues'] = [
      '#type' => 'details',
      '#title' => $this->t('Campaign recipient queues'),
      '#open' => TRUE,
      '#weight' => 0,
    ];

    $form['campaign_queues']['table'] = $this->buildCampaignQueueTable();

    $form['system_queues'] = [
      '#type' => 'details',
      '#title' => $this->t('Background & worker queues'),
      '#open' => TRUE,
      '#weight' => 10,
    ];

    $form['system_queues']['table'] = $this->buildSystemQueueTable();

    $form['all_db_queues'] = [
      '#type' => 'details',
      '#title' => $this->t('All queues in database (campaign-related names)'),
      '#open' => FALSE,
      '#weight' => 20,
    ];

    $form['all_db_queues']['table'] = $this->buildDatabaseQueueTable();

    $form['queue_ui_link'] = [
      '#type' => 'markup',
      '#markup' => '<p>' . Link::createFromRoute(
        $this->t('Open full Queue UI (all system queues)'),
        'queue_ui.overview_form'
      )->toString() . '</p>',
      '#weight' => 30,
    ];

    return $form;
  }

  /**
   * Table of published campaigns with live queue counts.
   */
  private function buildCampaignQueueTable(): array {
    $header = [
      $this->t('Campaign'),
      $this->t('Queue name'),
      $this->t('Items waiting'),
      $this->t('Leased'),
      $this->t('Log pending'),
      $this->t('Operations'),
    ];

    $rows = [];
    $query = \Drupal::entityQuery('node')
      ->condition('type', 'campaign')
      ->condition('status', 1)
      ->accessCheck(FALSE)
      ->sort('changed', 'DESC')
      ->range(0, 100);

    $this->queueService->applyCampaignAccess($query, $this->currentUser());
    $nids = $query->execute();

    if ($nids === []) {
      $rows[] = [
        ['data' => ['#colspan' => 6, '#plain_text' => (string) $this->t('No campaigns found.')]],
      ];
      return [
        '#type' => 'table',
        '#header' => $header,
        '#rows' => $rows,
        '#empty' => $this->t('No campaigns.'),
      ];
    }

    $counts_by_name = $this->getQueueCountsByName('campaign_email_queue_%');
    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);

    foreach ($nodes as $node) {
      $nid = (int) $node->id();
      $queue_name = 'campaign_email_queue_' . $nid;
      $db = $counts_by_name[$queue_name] ?? ['available' => 0, 'leased' => 0];
      $log_counts = \Drupal::service('campaign_email_queue.log')->getLogStatusCounts($nid);

      $ops = [
        Link::createFromRoute($this->t('Dashboard'), 'campaign_email_queue.dashboard')->toString(),
        ' | ',
        Link::createFromRoute($this->t('Details'), 'campaign_email_queue.details', ['node' => $nid])->toString(),
      ];
      if (\Drupal::moduleHandler()->moduleExists('queue_ui')) {
        $ops[] = ' | ';
        $ops[] = Link::createFromRoute(
          $this->t('Inspect'),
          'queue_ui.inspect',
          ['queueName' => $queue_name]
        )->toString();
      }

      $rows[] = [
        $node->getTitle() . ' (#' . $nid . ')',
        $queue_name,
        number_format($db['available']),
        number_format($db['leased']),
        number_format($log_counts['pending']),
        ['data' => ['#markup' => implode('', $ops)]],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];
  }

  /**
   * Background send queue + registered workers (no invalid "name" key).
   */
  private function buildSystemQueueTable(): array {
    $header = [
      $this->t('Queue machine name'),
      $this->t('Title'),
      $this->t('Items waiting'),
      $this->t('Leased'),
      $this->t('Operations'),
    ];

    $rows = [];
    $counts_by_name = $this->getQueueCountsByName();
    $worker_ids = [
      'campaign_email_queue_send',
      'campaign_email_queue_worker',
    ];

    foreach ($worker_ids as $worker_id) {
      $definition = $this->queueWorkerManager->getDefinition($worker_id, FALSE);
      $title = $definition ? (string) $definition['title'] : $worker_id;
      $db = $counts_by_name[$worker_id] ?? ['available' => 0, 'leased' => 0];
      $live_count = $this->queueFactory->get($worker_id)->numberOfItems();

      $ops = [];
      if (\Drupal::moduleHandler()->moduleExists('queue_ui')) {
        $ops[] = Link::createFromRoute(
          $this->t('Inspect'),
          'queue_ui.inspect',
          ['queueName' => $worker_id]
        )->toString();
      }

      $rows[] = [
        $worker_id,
        $title,
        number_format(max($db['available'], $live_count)),
        number_format($db['leased']),
        ['data' => ['#markup' => implode(' | ', $ops)]],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];
  }

  /**
   * All DB queue rows matching campaign_email_queue prefix.
   */
  private function buildDatabaseQueueTable(): array {
    $header = [
      $this->t('Queue name'),
      $this->t('Items waiting'),
      $this->t('Leased'),
    ];

    $rows = [];
    foreach ($this->getQueueCountsByName('campaign_email_queue%') as $name => $counts) {
      $rows[] = [
        $name,
        number_format($counts['available']),
        number_format($counts['leased']),
      ];
    }

    if ($rows === []) {
      $rows[] = [
        ['data' => ['#colspan' => 3, '#plain_text' => (string) $this->t('No campaign-related rows in the queue table.')]],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
    ];
  }

  /**
   * @return array<string, array{available: int, leased: int}>
   */
  private function getQueueCountsByName(?string $name_like = NULL): array {
    if (!$this->database->schema()->tableExists('queue')) {
      return [];
    }

    $query = $this->database->select('queue', 'q');
    $query->addField('q', 'name');
    $query->addExpression('SUM(CASE WHEN q.expire = 0 THEN 1 ELSE 0 END)', 'available');
    $query->addExpression('SUM(CASE WHEN q.expire > 0 THEN 1 ELSE 0 END)', 'leased');
    $query->groupBy('name');
    if ($name_like !== NULL) {
      $query->condition('name', $name_like, 'LIKE');
    }

    $out = [];
    foreach ($query->execute() as $row) {
      $machine_name = (string) $row->name;
      $out[$machine_name] = [
        'available' => (int) $row->available,
        'leased' => (int) $row->leased,
      ];
    }
    return $out;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    // Overview only.
  }

}
