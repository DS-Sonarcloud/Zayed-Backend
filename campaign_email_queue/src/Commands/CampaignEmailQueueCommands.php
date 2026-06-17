<?php

namespace Drupal\campaign_email_queue\Commands;

use Drush\Commands\DrushCommands;
use Drupal\campaign_email_queue\Service\CampaignEmailQueueService;

/**
 * Drush commands for Campaign Email Queue.
 */
class CampaignEmailQueueCommands extends DrushCommands
{

  /**
   * The campaign email queue service.
   *
   * @var \Drupal\campaign_email_queue\Service\CampaignEmailQueueService
   */
  protected $queueService;

  /**
   * CampaignEmailQueueCommands constructor.
   *
   * @param \Drupal\campaign_email_queue\Service\CampaignEmailQueueService $queue_service
   *   The queue service.
   */
  public function __construct(CampaignEmailQueueService $queue_service)
  {
    parent::__construct();
    $this->queueService = $queue_service;
  }

  /**
   * Process campaign email queues in bulk.
   *
   * @param array $options
   *   An associative array of options whose values come from cli, aliases, config, etc.
   *
   * @option campaign_id The specific campaign ID to process. If omitted, all eligible campaigns will be checked.
   * @option batch_size The number of emails to process per campaign in this run. Default is 500.
   * @usage drush campaign-queue:process
   *   Process all eligible campaign queues with default batch size.
   * @usage drush campaign-queue:process --campaign_id=1182 --batch_size=5000
   *   Process 5000 emails for campaign 1182.
   *
   * @command campaign-queue:process
   * @aliases cqp
   */
  public function process($options = ['campaign_id' => NULL, 'batch_size' => 500])
  {
    $campaign_id = $options['campaign_id'];
    $batch_size = (int) $options['batch_size'];

    if ($campaign_id) {
      $campaign_id = (int) $campaign_id;
      $this->output()->writeln("Starting background send for campaign $campaign_id...");
      $this->queueService->startBackgroundSending($campaign_id);
      $seconds = max(30, $batch_size > 100 ? 300 : 120);
      $this->output()->writeln("Draining send queue for {$seconds}s...");
      $this->queueService->drainBackgroundSendQueue($seconds);
      $status = $this->queueService->getDashboardStatus($campaign_id);
      $this->output()->writeln(sprintf(
        'Done. Sent: %d, Pending: %d, Queue: %d',
        $status['sent'],
        $status['pending'],
        $status['queue_count']
      ));
    }
    else {
      $this->output()->writeln('Running campaign_email_queue cron (background drain)...');
      campaign_email_queue_cron();
      $this->output()->writeln('Cron logic executed.');
    }
  }

  /**
   * Cleanup email templates that are locked by deleted campaigns.
   *
   * @command campaign-queue:cleanup-templates
   * @aliases cqct
   * @usage drush campaign-queue:cleanup-templates
   *   Unlock email templates that are referenced by non-existent campaigns.
   */
  public function cleanupTemplates()
  {
    $this->output()->writeln("Starting cleanup of email templates...");

    $query = \Drupal::entityQuery('node')
      ->condition('type', 'email_template')
      ->exists('field_campaign')
      ->accessCheck(FALSE);

    $nids = $query->execute();

    if (empty($nids)) {
      $this->output()->writeln("No email templates with campaign references found.");
      return;
    }

    $nodes = \Drupal::entityTypeManager()->getStorage('node')->loadMultiple($nids);
    $updated_count = 0;

    foreach ($nodes as $node) {
      if (!$node instanceof \Drupal\node\NodeInterface) {
        continue;
      }

      $changed = FALSE;
      $campaign_refs = $node->get('field_campaign')->getValue();
      $new_refs = [];

      foreach ($campaign_refs as $ref) {
        if (!empty($ref['target_id'])) {
          $campaign = \Drupal::entityTypeManager()->getStorage('node')->load($ref['target_id']);
          // Check if campaign exists.
          if ($campaign) {
            $new_refs[] = $ref;
          } else {
            $changed = TRUE;
            $this->output()->writeln("Removing ghost reference to missing campaign ID: " . $ref['target_id'] . " from template: " . $node->getTitle() . " (" . $node->id() . ")");
          }
        }
      }

      if ($changed) {
        $node->set('field_campaign', $new_refs);
        $node->save();
        $updated_count++;
      }
    }

    $this->output()->writeln("Cleanup complete. Updated $updated_count templates.");
  }

}

