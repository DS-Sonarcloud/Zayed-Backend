<?php

namespace Drupal\email_marketing\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * High-level coordinator for sending and re-sending campaigns.
 */
class EmailMarketingService
{

  public function __construct(
    protected RendererInterface $renderer,
    protected MailManagerInterface $mailManager,
    protected LoggerInterface $logger,
    protected Connection $db,
  ) {}


  private function normalizeRecipients(array $recipients): array
  {
    $emails = [];

    foreach ($recipients as $r) {
      if (is_array($r)) {
        // Common case: ['email' => 'foo@bar.com']
        if (isset($r['email']) && is_string($r['email'])) {
          $emails[] = trim($r['email']);
        }
        // Or nested arrays, try to flatten them
        else {
          foreach ($r as $val) {
            if (is_string($val)) {
              $emails[] = trim($val);
            }
          }
        }
      } elseif (is_string($r)) {
        $emails[] = trim($r);
      }
    }

    // remove empties + duplicates
    return array_values(array_unique(array_filter($emails)));
  }
  /**
   * Send a campaign based on a node template and persist campaign + sent logs.
   *
   * @param int $nid
   * @param string $subject
   * @param array $recipients
   *   List of email strings.
   * @param array $meta
   *   Extra metadata: ['mode' => ..., 'tags' => ..., 'single_email' => ...].
   *
   * @return array [$campaign_id, $sent, $failed]
   */
  public function sendFromNode(int $nid, string $subject, array $recipients, array $meta = []): array
  {
    $node = \Drupal\node\Entity\Node::load($nid);
    if (!$node) {
      return [0, 0, count($recipients)];
    }

    // Render node to full HTML once; reuse for all recipients.
    $build = \Drupal::entityTypeManager()->getViewBuilder('node')->view($node, 'full');
    $html = (string) $this->renderer->renderRoot($build);

    // Normalize metadata.
    $tags = '';
    if (isset($meta['tags'])) {
      if (is_array($meta['tags'])) {
        $tags = implode(',', array_map('strval', $meta['tags']));
      } else {
        $tags = (string) $meta['tags'];
      }
    }
    $single_email = isset($meta['single_email']) ? (string) $meta['single_email'] : NULL;

    // Normalize recipient list.
    $recipients = $this->normalizeRecipients($recipients);

    // Create campaign row first so we have an ID.
    $campaign_id = $this->db->insert('email_marketing_campaigns')
      ->fields([
        'subject'            => $subject,
        'block_plugin_id'    => 'node:' . $nid,
        // Store the HTML snapshot in block_configuration so we can "resend" it as-is.
        'block_configuration' => $html,
        'recipients'         => serialize(array_values(array_unique(array_filter($recipients)))),
        'created'            => \Drupal::time()->getRequestTime(),
        'status_text'        => 'Pending',
      ])
      ->execute();

    $sent = 0;
    $failed = 0;

    foreach (array_unique(array_filter($recipients)) as $to) {
      $params = [
        'subject' => $subject,
        'body'    => $html,
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

      $status = !empty($result['result']) ? 'sent' : 'failed';

      $this->db->insert('email_marketing_sent')->fields([
        'campaign_id' => $campaign_id,
        'nid'         => $nid,
        'subject'     => $subject,
        'recipients'  => serialize([$to]),
        'tags'         => $tags,
        'single_email' => $single_email,
        'status'      => $status,
        'created'     => \Drupal::time()->getRequestTime(),
      ])->execute();

      if ($status === 'sent') {
        $sent++;
      } else {
        $failed++;
      }
    }

    // Update campaign status
    $this->db->update('email_marketing_campaigns')
      ->fields(['status_text' => $failed ? 'Partial/Failed' : 'Sent'])
      ->condition('id', $campaign_id)
      ->execute();

    return [$campaign_id, $sent, $failed];
  }

  /**
   * Resend an existing campaign by cloning it and sending its stored HTML.
   *
   * @return array [$new_campaign_id, $sent, $failed]
   */
  public function resendCampaign(int $campaign_id): array
  {
    $row = $this->db->select('email_marketing_campaigns', 'c')
      ->fields('c')
      ->condition('id', $campaign_id)
      ->execute()
      ->fetchObject();

    if (!$row) {
      return [0, 0, 0];
    }

    $recipients = [];
    if (!empty($row->recipients)) {
      $un = @unserialize($row->recipients);
      if ($un !== false && is_array($un)) {
        $recipients = $un;
      } elseif (is_string($row->recipients)) {
        $recipients = [$row->recipients];
      }
    }

    // If HTML snapshot isn't present, attempt to rebuild from node reference.
    $html = (string) ($row->block_configuration ?? '');
    if ($html === '' && str_starts_with((string) $row->block_plugin_id, 'node:')) {
      $nid = (int) substr((string) $row->block_plugin_id, 5);
      if ($nid > 0) {
        $node = \Drupal\node\Entity\Node::load($nid);
        if ($node) {
          $build = \Drupal::entityTypeManager()->getViewBuilder('node')->view($node, 'full');
          $html = (string) $this->renderer->renderRoot($build);
        }
      }
    }

    // Clone campaign.
    $new_campaign_id = $this->db->insert('email_marketing_campaigns')
      ->fields([
        'subject'             => $row->subject,
        'block_plugin_id'     => $row->block_plugin_id,
        'block_configuration' => $html,
        'recipients'          => serialize(array_values(array_unique(array_filter($recipients)))),
        'created'             => \Drupal::time()->getRequestTime(),
        'status_text'         => 'Pending',
      ])
      ->execute();

    $sent = 0;
    $failed = 0;

    foreach (array_unique(array_filter($recipients)) as $to) {
      $params = [
        'subject' => $row->subject,
        'body'    => $html,
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
      $status = !empty($result['result']) ? 'sent' : 'failed';
      $this->db->insert('email_marketing_sent')->fields([
        'campaign_id' => $new_campaign_id,
        'nid'         => (str_starts_with((string)$row->block_plugin_id, 'node:')) ? (int) substr((string)$row->block_plugin_id, 5) : NULL,
        'subject'     => $row->subject,
        'recipients'  => serialize([$to]),
        'status'      => $status,
        'created'     => \Drupal::time()->getRequestTime(),
      ])->execute();

      if ($status === 'sent') {
        $sent++;
      } else {
        $failed++;
      }
    }

    $this->db->update('email_marketing_campaigns')
      ->fields(['status_text' => $failed ? 'Partial/Failed' : 'Sent'])
      ->condition('id', $new_campaign_id)
      ->execute();

    return [$new_campaign_id, $sent, $failed];
  }
}
