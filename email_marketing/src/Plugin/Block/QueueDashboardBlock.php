<?php

namespace Drupal\email_marketing\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueFactory;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Url;
use Drupal\Core\Link;

/**
 * Provides a "Queue Dashboard" block.
 *
 * @Block(
 *   id = "queue_dashboard_block",
 *   admin_label = @Translation("Queue Dashboard"),
 * )
 */
class QueueDashboardBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The queue factory.
   *
   * @var \Drupal\Core\Queue\QueueFactory
   */
  protected $queueFactory;

  /**
   * Constructs a new QueueDashboardBlock.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, QueueFactory $queue_factory) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->queueFactory = $queue_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('queue')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#type' => 'table',
      '#header' => [
        $this->t('Date'),
        $this->t('Campaign Title'),
        $this->t('Subject'),
        $this->t('Items Count'),
        $this->t('Status'),
        $this->t('Operations'),
      ],
      '#rows' => [],
    ];
    $header = [
      'created' => [
        'data' => $this->t('Date'),
        'field' => 'q.created',   // the DB column to sort on
        'specifier' => 'created', // identifier
        'sort' => 'desc',         // default sort (newest first)
      ],
      'title' => $this->t('Campaign Title'),
      'subject' => $this->t('Subject'),
      'count' => $this->t('Items Count'),
      'status' => $this->t('Status'),
      'operations' => $this->t('Operations'),
    ];

    $build['#header'] = $header;

    $connection = \Drupal::database();
    $queue_names = ['email_send_queue'];

    foreach ($queue_names as $queue_name) {
      $queue = $this->queueFactory->get($queue_name);

      $status = \Drupal::state()->get("email_marketing.queue_status.$queue_name", 'Idle');

      // Fetch all items in this queue.
      $query = $connection->select('queue', 'q')
        ->fields('q', ['item_id', 'data', 'created'])
        ->condition('name', $queue_name)
        ->orderBy('created', 'DESC');
      $query = $query->extend('Drupal\Core\Database\Query\TableSortExtender')
      ->orderByHeader($header);
      $results = $query->execute()->fetchAll();

      // Group by campaign title.
      $campaigns = [];
      foreach ($results as $record) {
        $data = unserialize($record->data);
        $title = $data['title'] ?? 'Unknown';
        $subject = $data['subject'] ?? '';

        if (!isset($campaigns[$title])) {
          $campaigns[$title] = [
            'subject' => $subject,
            'count'   => 0,
            'created' => $record->created,
          ];
        }

        $campaigns[$title]['count']++;
        // Track latest created date.
        if ($record->created > $campaigns[$title]['created']) {
          $campaigns[$title]['created'] = $record->created;
        }
      }

      // Add one row per campaign.
      foreach ($campaigns as $title => $info) {
        $operations = [
          'run' => [
            'title' => $this->t('Run now'),
            'url' => Url::fromRoute('email_marketing.queue_run', ['queue' => $queue_name]),
          ],
          'pause' => [
            'title' => $this->t('Pause'),
            'url' => Url::fromRoute('email_marketing.queue_pause', ['queue' => $queue_name]),
          ],
          'clear' => [
            'title' => $this->t('Clear'),
            'url' => Url::fromRoute('email_marketing.queue_clear', ['queue' => $queue_name]),
          ],
        ];

        $build['#rows'][] = [
          \Drupal::service('date.formatter')->format($info['created'], 'short'),
          $title,
          $info['subject'],
          $info['count'],
          $status,
          [
            'data' => [
              '#type' => 'operations',
              '#links' => $operations,
            ],
          ],
        ];
      }

      // If no items exist at all, still show one empty row.
      if (empty($campaigns)) {
        $operations = [
          'run' => [
            'title' => $this->t('Run now'),
            'url' => Url::fromRoute('email_marketing.queue_run', ['queue' => $queue_name]),
          ],
        ];
        $build['#rows'][] = [
          $queue_name,
          $this->t('—'),
          $this->t('—'),
          0,
          $status,
          $this->t('—'),
          [
            'data' => [
              '#type' => 'operations',
              '#links' => $operations,
            ],
          ],
        ];
      }
    }
    
    return $build;
  }

}
