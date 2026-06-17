<?php

namespace Drupal\email_marketing\Service;

use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Url;
use Psr\Log\LoggerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResultInterface;
use Drupal\Core\Database\Connection;

class EmailMarketingSender
{

  public function __construct(
    protected RendererInterface $renderer,
    protected MailManagerInterface $mailManager,
    protected LoggerInterface $logger,
  ) {}

  /**
   * Build the email render array for preview and sending.
   */
  public function buildEmailRenderArray(string $block_plugin_id, string $subject): array
  {
    $block = \Drupal::service('plugin.manager.block')->createInstance($block_plugin_id, []);
    $access_result = $block->access(\Drupal::currentUser());

    // Normalize: ensure we have a boolean decision.
    if ($access_result instanceof AccessResultInterface) {
      $allowed = $access_result->isAllowed();
    } else {
      // Some blocks return TRUE/FALSE directly.
      $allowed = (bool) $access_result;
    }

    $block_render = $allowed ? $block->build() : ['#markup' => t('Block not accessible.')];

    return [
      '#theme' => 'email_marketing_wrapper',
      '#subject' => $subject,
      '#block' => $block_render,
      '#attached' => [
        'library' => [],
      ],
    ];
  }

  /**
   * Send the campaign.
   *
   * @return array [sent_count, failed_count]
   */
  public function sendCampaignFromNode(int $nid, string $subject, array $recipients): array
  {
    $node = \Drupal\node\Entity\Node::load($nid);
    if (!$node) {
      return [0, count($recipients)];
    }

    // Render the node fully, including all fields, layouts, and attached libraries.
    $build = \Drupal::entityTypeManager()->getViewBuilder('node')->view($node, 'full');

    // Render with renderRoot() to get full HTML (like preview)
    $body = \Drupal::service('renderer')->renderRoot($build);

    $sent = 0;
    $failed = 0;

    foreach (array_unique(array_filter($recipients)) as $to) {
      $params = [
        'subject' => $subject,
        'body' => $body,
      ];
      $result = $this->mailManager->mail(
        'email_marketing',
        'campaign',
        $to,
        \Drupal::languageManager()->getDefaultLanguage()->getId(),
        $params,
        NULL,
        TRUE
      );
      // ✅ Log into DB
      \Drupal::database()->insert('email_marketing_sent')
        ->fields([
          'nid' => $nid,
          'subject' => $subject,
          'recipients' => serialize((array) $to),
          'tags' => '', // Optional: add tags if you collect them
          'single_email' => is_string($to) ? $to : '',
          'status' => $result['result'] ? 'sent' : 'failed',
          'created' => \Drupal::time()->getRequestTime(),
        ])
        ->execute();
      if (!empty($result['result'])) {
        $sent++;
      } else {
        $failed++;
      }
    }

    $this->logCampaign('node:' . $nid, $subject, $recipients, $failed ? 'Partial/Failed' : 'Sent');

    return [$sent, $failed];
  }


  protected function logCampaign(string $plugin_id, string $subject, array $recipients, string $status): void
  {
    $conn = \Drupal::database();
    $conn->insert('email_marketing_campaigns')
      ->fields([
        'subject' => $subject,
        'block_plugin_id' => $plugin_id,
        'block_configuration' => NULL,
        'recipients' => serialize($recipients),
        'created' => \Drupal::time()->getRequestTime(),
        'status_text' => $status,
      ])
      ->execute();
  }
}
