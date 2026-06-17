<?php

namespace Drupal\campaign_email_queue\Service;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueWorkerManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Psr\Log\LoggerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drupal\file\Entity\File;
use Drupal\node\NodeInterface;
use Drupal\user\UserInterface;
use Drupal\Core\Site\Settings;
use Drupal\Core\Entity\ContentEntityInterface;


class CampaignEmailQueueService
{
  use StringTranslationTrait;

  protected QueueFactory $queueFactory;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected MailManagerInterface $mailManager;
  protected LoggerInterface $logger;
  protected MessengerInterface $messenger;
  protected CampaignEmailLogService $logService;
  protected ConfigFactoryInterface $configFactory;
  protected CampaignProcessingState $processingState;
  protected QueueWorkerManagerInterface $queueWorkerManager;

  public function __construct(
    QueueFactory $queueFactory,
    EntityTypeManagerInterface $entityTypeManager,
    MailManagerInterface $mailManager,
    LoggerInterface $logger,
    MessengerInterface $messenger,
    CampaignEmailLogService $logService,
    ConfigFactoryInterface $configFactory,
    CampaignProcessingState $processingState,
    QueueWorkerManagerInterface $queueWorkerManager,
  ) {
    $this->queueFactory = $queueFactory;
    $this->entityTypeManager = $entityTypeManager;
    $this->mailManager = $mailManager;
    $this->logger = $logger;
    $this->messenger = $messenger;
    $this->logService = $logService;
    $this->configFactory = $configFactory;
    $this->processingState = $processingState;
    $this->queueWorkerManager = $queueWorkerManager;
  }

  /**
   * Module settings with defaults.
   */
  public function getSettings(): array {
    $config = $this->configFactory->get('campaign_email_queue.settings');
    return [
      'cron_batch_size' => max(50, (int) ($config->get('cron_batch_size') ?? 500)),
      'cron_max_batches_per_campaign' => max(0, (int) ($config->get('cron_max_batches_per_campaign') ?? 0)),
      'cron_background_seconds' => max(10, (int) ($config->get('cron_background_seconds') ?? 55)),
      'enqueue_chunk_size' => max(100, (int) ($config->get('enqueue_chunk_size') ?? 1000)),
      'log_insert_chunk_size' => max(100, (int) ($config->get('log_insert_chunk_size') ?? 500)),
      'claim_chunk_size' => max(10, (int) ($config->get('claim_chunk_size') ?? 50)),
      'shutdown_drain_seconds' => max(5, (int) ($config->get('shutdown_drain_seconds') ?? 30)),
      'dashboard_poll_interval_ms' => max(1000, (int) ($config->get('dashboard_poll_interval_ms') ?? 2000)),
      'auto_start_on_save' => (bool) ($config->get('auto_start_on_save') ?? FALSE),
      'keepalive_drain_seconds' => max(5, (int) ($config->get('keepalive_drain_seconds') ?? 12)),
      'keepalive_min_interval' => max(15, (int) ($config->get('keepalive_min_interval') ?? 25)),
      'poll_drain_min_interval' => max(2, (int) ($config->get('poll_drain_min_interval') ?? 3)),
      'admin_keepalive_interval_ms' => max(20000, (int) ($config->get('admin_keepalive_interval_ms') ?? 45000)),
      'live_log_flush_size' => max(1, (int) ($config->get('live_log_flush_size') ?? 5)),
    ];
  }

  /**
   * Helper to get department user IDs for the current user.
   */
  public function getDepartmentUserIds(\Drupal\Core\Session\AccountInterface $account): array
  {
    if (function_exists('_zu_content_access_get_user_departments')) {
      $user_depts = _zu_content_access_get_user_departments($account);
      if (!empty($user_depts)) {
        $users_in_dept = $this->entityTypeManager->getStorage('user')
          ->loadByProperties(['field_event_department' => $user_depts]);
        return array_keys($users_in_dept);
      }
    } else {
      $user = $this->entityTypeManager->getStorage('user')->load($account->id());
      if ($user instanceof UserInterface && $user->hasField('field_event_department')) {
        $user_depts = array_column($user->get('field_event_department')->getValue(), 'target_id');
        if (!empty($user_depts)) {
          $users_in_dept = $this->entityTypeManager->getStorage('user')
            ->loadByProperties(['field_event_department' => $user_depts]);
          return array_keys($users_in_dept);
        }
      }
    }
    return [];
  }

  /**
   * Check if a user has access to a campaign for a specific operation.
   */
  public function checkCampaignAccess(NodeInterface $campaign, \Drupal\Core\Session\AccountInterface $account, string $op = 'view'): bool
  {
    if ($account->hasPermission('bypass content owner restrictions')) {
      return TRUE;
    }

    if ($account->hasPermission('manage campaign email queues')) {
      return TRUE;
    }

    $owner_id = $campaign->getOwnerId();
    $uid = $account->id();
    $is_owner = ($owner_id == $uid);

    if ($op === 'view') {
      if ($account->hasPermission('view any campaign email queue')) {
        return TRUE;
      }
      if ($is_owner && $account->hasPermission('view own campaign email queue')) {
        return TRUE;
      }
      if ($account->hasPermission('view department campaign email queue')) {
        $dept_uids = $this->getDepartmentUserIds($account);
        if (in_array($owner_id, $dept_uids)) {
          return TRUE;
        }
      }
    } elseif ($op === 'manage') {
      if ($account->hasPermission('manage any campaign email queue')) {
        return TRUE;
      }
      if ($is_owner && $account->hasPermission('manage own campaign email queue')) {
        return TRUE;
      }
      if ($account->hasPermission('manage department campaign email queue')) {
        $dept_uids = $this->getDepartmentUserIds($account);
        if (in_array($owner_id, $dept_uids)) {
          return TRUE;
        }
      }
    }

    return FALSE;
  }

  /**
   * Apply access conditions to a campaign entity query.
   */
  public function applyCampaignAccess(\Drupal\Core\Entity\Query\QueryInterface $query, \Drupal\Core\Session\AccountInterface $account): void
  {
    if ($account->hasPermission('bypass content owner restrictions') || $account->hasPermission('manage campaign email queues')) {
      return;
    }

    if ($account->hasPermission('view any campaign email queue')) {
      return;
    }

    $or_group = $query->orConditionGroup();
    $has_condition = FALSE;

    if ($account->hasPermission('view own campaign email queue')) {
      $or_group->condition('uid', $account->id());
      $has_condition = TRUE;
    }

    if ($account->hasPermission('view department campaign email queue')) {
      $dept_uids = $this->getDepartmentUserIds($account);
      if (!empty($dept_uids)) {
        $or_group->condition('uid', $dept_uids, 'IN');
        $has_condition = TRUE;
      }
    }

    if ($has_condition) {
      $query->condition($or_group);
    } else {
      $query->condition('nid', 0);
    }
  }

  /**
   * Generate the queue name for a given campaign ID.
   */
  public function getQueueName(int $campaign_id): string
  {
    return "campaign_email_queue_{$campaign_id}";
  }

  /**
   * Initialize a queue for a campaign and add initial email items.
   */
  public function initializeQueueForCampaign($entity, ?int $run_id = NULL): void
  {
    $campaign_id = $entity->id();
    $run_id = $run_id ?? $this->logService->getLatestRunId($campaign_id);
    $queue = $this->queueFactory->get($this->getQueueName($campaign_id));
    $target_bundle = 'campaign';
    $node_user_groups_field = 'field_user_groups';
    $term_user_members_field = 'field_user_members';
    $term_public_user_groups_field = 'field_public_user_groups';
    $node_csv_field = 'field_upload_csv_for_emails';

    $langcode = 'en';

    if ($target_bundle !== NULL && $entity->bundle() !== $target_bundle) {
      return;
    }

    $campaign_id = $entity->id();
    if (!$entity->get('field_email_template')->isEmpty()) {
      $target_id = $entity->get('field_email_template')->target_id;

      if ($target_id) {
        $template = Node::load($target_id);
        if ($template) {

          $existing = $template->get('field_campaign')->getValue();
          $existing_ids = array_column($existing, 'target_id');

          if (!in_array($campaign_id, $existing_ids)) {
            $existing[] = ['target_id' => $campaign_id];
            $template->set('field_campaign', $existing);
            $template->save();
          }
        }
      }
    }

    $emails = [];

    $node_user_group_field = 'field_user_group_entity';
    if ($entity->hasField($node_user_group_field) && !$entity->get($node_user_group_field)->isEmpty()) {
      $groups = $entity->get($node_user_group_field)->referencedEntities();
      foreach ($groups as $group) {
        if (!($group instanceof ContentEntityInterface)) {
          continue;
        }
        if ($group->hasField('target_roles') && !$group->get('target_roles')->isEmpty()) {
          $rids = array_column($group->get('target_roles')->getValue(), 'target_id');
          if (!empty($rids)) {
            $uids = \Drupal::entityQuery('user')
              ->condition('status', 1)
              ->condition('roles', $rids, 'IN')
              ->accessCheck(FALSE)
              ->execute();

            if (!empty($uids)) {
              $user_storage = \Drupal::entityTypeManager()->getStorage('user');
              // Batch load users to prevent memory issues.
              foreach (array_chunk($uids, 500) as $chunk_uids) {
                $users = $user_storage->loadMultiple($chunk_uids);
                foreach ($users as $user) {
                  if ($user instanceof UserInterface) {
                    if ($email = $user->getEmail()) {
                      $emails[] = $email;
                    }
                  }
                }
                // Clear memory
                unset($users);
              }
            }
          }
        }

        $is_target_all = FALSE;
        if ($group->hasField('target_all_public_users') && !$group->get('target_all_public_users')->isEmpty()) {
          $target_all = $group->get('target_all_public_users')->value;
          if ($target_all) {
            $is_target_all = TRUE;
            $query = \Drupal::database()->select('public_user', 'pu');
            $query->fields('pu', ['email']);
            $query->condition('pu.status', 1);
            $all_public_emails = $query->execute()->fetchCol();
            if (!empty($all_public_emails)) {
              $emails = array_merge($emails, $all_public_emails);
            }
          }
        }

        if (!$is_target_all) {
          if ($group->hasField('target_public_segments') && !$group->get('target_public_segments')->isEmpty()) {
            $flag_ids = array_column($group->get('target_public_segments')->getValue(), 'value');
            if (!empty($flag_ids)) {
              $query = \Drupal::database()->select('flagging', 'f');
              $query->join('public_user', 'pu', 'f.entity_id = pu.id');
              $query->fields('pu', ['email']);
              $query->condition('f.flag_id', $flag_ids, 'IN');
              $query->condition('f.entity_type', 'public_user');
              $query->condition('pu.status', 1);
              $result = $query->execute()->fetchCol();
              $emails = array_merge($emails, $result);
            }
          }

          if ($group->hasField('target_event_types') && !$group->get('target_event_types')->isEmpty()) {
            $tids = array_column($group->get('target_event_types')->getValue(), 'target_id');
            if (!empty($tids)) {
              $query = \Drupal::database()->select('flagging', 'f');
              $query->condition('f.flag_id', 'subscribe_event');
              $query->condition('f.entity_type', 'taxonomy_term');
              $query->condition('f.entity_id', $tids, 'IN');
              $query->fields('f', ['uid']);
              $uids = $query->execute()->fetchCol();

              if (!empty($uids)) {
                $public_user_storage = \Drupal::entityTypeManager()->getStorage('public_user');
                // Batch load public users
                foreach (array_chunk($uids, 500) as $chunk_uid) {
                  $public_users = $public_user_storage->loadMultiple($chunk_uid);
                  if ($public_users) {
                    foreach ($public_users as $pu) {
                      if ($pu instanceof ContentEntityInterface) {
                         if (method_exists($pu, 'getEmail')) {
                            $emails[] = $pu->getEmail();
                         }
                      }
                    }
                  }
                  unset($public_users);
               }
              }
            }
          }
        }

        if ($group->hasField('target_webforms') && !$group->get('target_webforms')->isEmpty()) {
          $webform_ids = array_column($group->get('target_webforms')->getValue(), 'target_id');
          if (!empty($webform_ids)) {
            foreach ($webform_ids as $webform_id) {
              $email_field_name = $this->getEmailFieldName($webform_id);
              if ($email_field_name) {
                $query = \Drupal::database()->select('webform_submission', 'ws');
                $query->join('webform_submission_data', 'wsd_mail', "ws.sid = wsd_mail.sid AND wsd_mail.name = :email_field", [':email_field' => $email_field_name]);
                $query->fields('wsd_mail', ['value']);
                $query->condition('ws.webform_id', $webform_id);
                $webform_emails = $query->execute()->fetchCol();
                if (!empty($webform_emails)) {
                  $emails = array_merge($emails, $webform_emails);
                }
              } else {
                \Drupal::logger('campaign_queue_debug')->warning('Group @group: Webform @id has no email field', ['@group' => $group->label(), '@id' => $webform_id]);
              }
            }
          }
        }

        if ($group->hasField('target_bookmarked_nodes') && !$group->get('target_bookmarked_nodes')->isEmpty()) {
          $nids = array_column($group->get('target_bookmarked_nodes')->getValue(), 'target_id');
          if (!empty($nids)) {
            $query = \Drupal::database()->select('flagging', 'f');
            $query->condition('f.flag_id', 'bookmark');
            $query->condition('f.entity_type', 'node');
            $query->condition('f.entity_id', $nids, 'IN');
            $query->fields('f', ['uid']);
            $uids = $query->execute()->fetchCol();

            if (!empty($uids)) {
              $user_storage = \Drupal::entityTypeManager()->getStorage('user');
              // Batch load users
              foreach (array_chunk($uids, 500) as $chunk_uids) {
                $users = $user_storage->loadMultiple($chunk_uids);
                foreach ($users as $user) {
                  if ($user instanceof UserInterface && $user->isActive()) {
                    if ($email = $user->getEmail()) {
                      $emails[] = $email;
                    }
                  }
                }
                unset($users);
              }
            }
          }
        }

        if ($group->hasField('users') && !$group->get('users')->isEmpty()) {
          foreach ($group->get('users')->referencedEntities() as $user) {
            if ($user instanceof UserInterface) {
              $mail = $user->getEmail();
              if ($mail) {
                $emails[] = $mail;
              }
            }
          }
        }
        if ($group->hasField('public_users') && !$group->get('public_users')->isEmpty()) {
          foreach ($group->get('public_users')->referencedEntities() as $public_user) {
            if (method_exists($public_user, 'getEmail')) {
              $mail = $public_user->getEmail();
              if ($mail) {
                $emails[] = $mail;
              }
            }
          }
        }
      }
    }

    if ($entity->hasField($node_csv_field) && !$entity->get($node_csv_field)->isEmpty()) {
      $values = $entity->get($node_csv_field)->getValue();
      $fids = [];
      foreach ($values as $v) {
        if (isset($v['target_id'])) {
          $fids[] = $v['target_id'];
        } elseif (is_int($v)) {
          $fids[] = $v;
        } elseif (is_string($v) && is_numeric($v)) {
          $fids[] = (int) $v;
        }
      }

      foreach ($fids as $fid) {
        if (empty($fid)) {
          continue;
        }
        $file = File::load($fid);
        $module_name = 'campaign_email_queue';
        if (!$file) {
          \Drupal::logger($module_name)->warning('CSV file with fid @fid could not be loaded.', ['@fid' => $fid]);
          continue;
        }

        $uri = $file->getFileUri();
        $realpath = \Drupal::service('file_system')->realpath($uri);
        $module_name = 'campaign_email_queue';
        if (!file_exists($realpath) || !is_readable($realpath)) {
          \Drupal::logger($module_name)->warning('CSV file @path is not accessible.', ['@path' => $realpath]);
          continue;
        }

        if (($handle = fopen($realpath, 'r')) !== FALSE) {
          $header = NULL;
          while (($row = fgetcsv($handle)) !== FALSE) {
            if ($row === [NULL] || $row === []) {
              continue;
            }

            if ($header === NULL) {
              $lower = array_map(function ($c) {
                return strtolower(trim($c));
              }, $row);
              if (in_array('email', $lower, TRUE)) {
                $header = $lower;
                continue;
              } else {
                $header = FALSE;
              }
            }

            if ($header === FALSE) {
              $email_candidate = isset($row[0]) ? trim($row[0]) : '';
            } else {
              $idx = array_search('email', $header, TRUE);
              $email_candidate = ($idx !== FALSE && isset($row[$idx])) ? trim($row[$idx]) : '';
            }

            if (!empty($email_candidate)) {
              $emails[] = $email_candidate;
            }
          }
          fclose($handle);
        }
      }
    }

    $emails = array_map('trim', $emails);
    $emails = array_filter($emails);
    $emails = array_unique($emails);

    $validator = \Drupal::service('email.validator');
    $valid_emails = [];
    $module_name = 'campaign_email_queue';
    foreach ($emails as $e) {
      if ($validator->isValid($e)) {
        $valid_emails[] = $e;
      } else {
        \Drupal::logger($module_name)->warning('Invalid email skipped: @email', ['@email' => $e]);
      }
    }

    if (empty($valid_emails)) {
      \Drupal::logger($module_name)->notice('No valid recipient emails found when processing node @nid.', ['@nid' => $entity->id()]);
      return;
    }

    $database = \Drupal::database();
    if ($database->schema()->tableExists('email_campaign_unsubscription')) {
      $unsubscribed = $database->select('email_campaign_unsubscription', 'u')
        ->fields('u', ['email'])
        ->condition('campaign_id', $campaign_id)
        ->execute()
        ->fetchAllAssoc('email');

      if (!empty($unsubscribed)) {
        $valid_emails = array_filter($valid_emails, function ($email) use ($unsubscribed) {
          return !isset($unsubscribed[$email]);
        });
      }
    }

    $this->enqueueRecipientsBulk($this->getQueueName($campaign_id), $campaign_id, $run_id, $valid_emails);
    $this->logService->initializeEmailLogs($campaign_id, $valid_emails, $run_id);

    $settings = $this->getSettings();
    if ($settings['auto_start_on_save']) {
      $this->startBackgroundSending($campaign_id);
    }
  }

  /**
   * Move one item from legacy queue "campaign_email_queue" into the per-campaign queue.
   */
  public function enqueueLegacyItem(int $campaign_id, array $data): void {
    $queue = $this->queueFactory->get($this->getQueueName($campaign_id));
    $queue->createItem([
      'campaign_id' => $campaign_id,
      'run_id' => (int) ($data['run_id'] ?? $this->logService->resolveRunId($campaign_id)),
      'email' => trim((string) ($data['email'] ?? '')),
      'langcode' => $data['langcode'] ?? 'en',
      'send_attempts' => (int) ($data['send_attempts'] ?? 0),
    ]);
  }

  /**
   * Bulk-insert queue rows (fast for 10k–50k recipients).
   *
   * @param list<string> $emails
   */
  protected function enqueueRecipientsBulk(string $queue_name, int $campaign_id, int $run_id, array $emails): void {
    if ($emails === []) {
      return;
    }

    $connection = \Drupal::database();
    $created = \Drupal::time()->getRequestTime();
    $chunk_size = $this->getSettings()['enqueue_chunk_size'];

    foreach (array_chunk($emails, $chunk_size) as $chunk) {
      $insert = $connection->insert('queue')
        ->fields(['name', 'data', 'expire', 'created']);
      foreach ($chunk as $email) {
        $insert->values([
          'name' => $queue_name,
          'data' => serialize([
            'campaign_id' => $campaign_id,
            'run_id' => $run_id,
            'email' => $email,
            'langcode' => 'en',
          ]),
          'expire' => 0,
          'created' => $created,
        ]);
      }
      $insert->execute();
    }
  }

  /**
   * Delete completely the queue for a campaign.
   */
  public function deleteQueueForCampaign(int $campaign_id, bool $clear_logs = TRUE): void
  {
    $queue = $this->queueFactory->get($this->getQueueName($campaign_id));
    $queue->deleteQueue();

    if ($clear_logs) {
      $this->logService->clearCampaignLogs($campaign_id);
    }
  }

  /**
   * Load the email template body for a campaign and ensure all image URLs are absolute.
   */
  private function loadTemplateBody(int $campaign_id): array
  {
    static $cache = [];
    $cache_key = "{$campaign_id}";
    if (isset($cache[$cache_key])) {
      return $cache[$cache_key];
    }

    $body = '';
    $subject = '';
    $node = $this->entityTypeManager->getStorage('node')->load($campaign_id);

    if ($node instanceof NodeInterface && $node->hasField('field_email_template')) {
      $email_template_id = $node->get('field_email_template')->target_id;

      if ($email_template_id) {
        $template_node = $this->entityTypeManager->getStorage('node')->load($email_template_id);

        if ($template_node instanceof NodeInterface) {

         // Prefer compiled HTML from field_json
         if ($template_node->hasField('field_json') && !$template_node->get('field_json')->isEmpty()) {
            $json_val = $template_node->get('field_json')->value;
            // Only use field_json if it contains actual HTML
            if (is_string($json_val) && preg_match('/<!doctype\s+html|<html[\s>]/i', $json_val)) {
              $body = $json_val;
            }
          }
          // Fallback to body field
          if (empty($body) && $template_node->hasField('body') && !$template_node->get('body')->isEmpty()) {
            $body = $template_node->get('body')->value;
          }

          if ($body) {

            if (function_exists('make_absolute_image_urls')) {
              $body = make_absolute_image_urls($body);
            } else {
              $base_url = \Drupal::request()->getSchemeAndHttpHost();
              $body = preg_replace_callback(
                '/<img[^>]+src=["\'](\/[^"\']+)["\'][^>]*>/i',
                function ($matches) use ($base_url) {
                  $relative_path = $matches[1];
                  if (preg_match('/^https?:\/\//i', $relative_path)) {
                    return $matches[0];
                  }
                  return str_replace($relative_path, $base_url . $relative_path, $matches[0]);
                },
                $body
              );
            }
          }
          $subject = $template_node->getTitle();
        }
      }
    }

    $webform_emails_data = [];
    if ($node instanceof NodeInterface) {
      $group_field = 'field_user_group_entity';
      if (!$node->hasField($group_field) || $node->get($group_field)->isEmpty()) {
        if ($node->hasField('field_user_group'))
          $group_field = 'field_user_group';
      }

      if ($node->hasField($group_field) && !$node->get($group_field)->isEmpty()) {
        $groups = $node->get($group_field)->referencedEntities();

        foreach ($groups as $group) {
          if ($group instanceof ContentEntityInterface) {
            $group_name = $group->label();

            if ($group->hasField('target_roles') && !$group->get('target_roles')->isEmpty()) {
              $rids = array_column($group->get('target_roles')->getValue(), 'target_id');
              if (!empty($rids)) {
                $uids = \Drupal::entityQuery('user')->condition('status', 1)->condition('roles', $rids, 'IN')->accessCheck(FALSE)->execute();
                if (!empty($uids)) {
                  $users = \Drupal::entityTypeManager()->getStorage('user')->loadMultiple($uids);
                  foreach ($users as $user) {
                    if ($user instanceof UserInterface) {
                      $email = strtolower(trim($user->getEmail()));
                      if ($email && !isset($webform_emails_data[$email])) {
                        $webform_emails_data[$email] = ['email' => $email, 'name' => $user->getDisplayName(), 'group_name' => $group_name];
                      }
                    }
                  }
                }
              }
            }

            if ($group->hasField('target_public_segments') && !$group->get('target_public_segments')->isEmpty()) {
              $flag_ids = array_column($group->get('target_public_segments')->getValue(), 'value');
              if (!empty($flag_ids)) {
                $query = \Drupal::database()->select('flagging', 'f');
                $query->join('public_user', 'pu', 'f.entity_id = pu.id');
                $query->fields('pu', ['email', 'name']);
                $query->condition('f.flag_id', $flag_ids, 'IN');
                $query->condition('f.entity_type', 'public_user');
                $query->condition('pu.status', 1);
                $res = $query->execute()->fetchAll();
                foreach ($res as $row) {
                  $email = strtolower(trim($row->email));
                  if ($email && !isset($webform_emails_data[$email])) {
                    $webform_emails_data[$email] = ['email' => $email, 'name' => $row->name ?: $email, 'group_name' => $group_name];
                  }
                }
              }
            }

            if ($group->hasField('target_event_types') && !$group->get('target_event_types')->isEmpty()) {
              $tids = array_column($group->get('target_event_types')->getValue(), 'target_id');
              if (!empty($tids)) {
                $query = \Drupal::database()->select('flagging', 'f');
                $query->condition('f.flag_id', 'subscribe_event');
                $query->condition('f.entity_type', 'taxonomy_term');
                $query->condition('f.entity_id', $tids, 'IN');
                $query->fields('f', ['uid']);
                $uids = $query->execute()->fetchCol();
                if (!empty($uids)) {
                  $public_users = \Drupal::entityTypeManager()->getStorage('public_user')->loadMultiple($uids);
                  foreach ($public_users as $pu) {
                    if ($pu instanceof ContentEntityInterface) {
                      $email = strtolower(trim(method_exists($pu, 'getEmail') ? $pu->getEmail() : ''));
                      if ($email && !isset($webform_emails_data[$email])) {
                        $webform_emails_data[$email] = ['email' => $email, 'name' => $pu->label(), 'group_name' => $group_name];
                      }
                    }
                  }
                }
              }
            }

            if ($group->hasField('target_all_public_users') && !$group->get('target_all_public_users')->isEmpty()) {
              if ($group->get('target_all_public_users')->value) {
                $query = \Drupal::database()->select('public_user', 'pu');
                $query->fields('pu', ['email', 'name']);
                $query->condition('pu.status', 1);
                $res = $query->execute()->fetchAll();
                foreach ($res as $row) {
                  $email = strtolower(trim($row->email));
                  if ($email && !isset($webform_emails_data[$email])) {
                    $webform_emails_data[$email] = ['email' => $email, 'name' => $row->name ?: $email, 'group_name' => $group_name];
                  }
                }
              }
            }

            if ($group->hasField('target_bookmarked_nodes') && !$group->get('target_bookmarked_nodes')->isEmpty()) {
              $nids = array_column($group->get('target_bookmarked_nodes')->getValue(), 'target_id');
              if (!empty($nids)) {
                $query = \Drupal::database()->select('flagging', 'f');
                $query->condition('f.flag_id', 'bookmark');
                $query->condition('f.entity_type', 'node');
                $query->condition('f.entity_id', $nids, 'IN');
                $query->fields('f', ['uid']);
                $uids = $query->execute()->fetchCol();
                if (!empty($uids)) {
                  $users = \Drupal::entityTypeManager()->getStorage('user')->loadMultiple($uids);
                  foreach ($users as $user) {
                    if ($user instanceof UserInterface && $user->isActive()) {
                      $email = strtolower(trim($user->getEmail()));
                      if ($email && !isset($webform_emails_data[$email])) {
                        $webform_emails_data[$email] = ['email' => $email, 'name' => $user->getDisplayName(), 'group_name' => $group_name];
                      }
                    }
                  }
                }
              }
            }

            $webform_field = 'target_webforms';
            if ($group->hasField($webform_field) && !$group->get($webform_field)->isEmpty()) {
              $webform_ids = array_column($group->get($webform_field)->getValue(), 'target_id');

              foreach ($webform_ids as $webform_id) {
                $email_field_name = $this->getEmailFieldName($webform_id);
                if (!$email_field_name) {
                  continue;
                }

                $query = \Drupal::database()->select('webform_submission_data', 'wsd');
                $query->fields('wsd', ['sid', 'name', 'value']);
                $query->join('webform_submission', 'ws', 'wsd.sid = ws.sid');
                $query->condition('ws.webform_id', $webform_id);
                $results = $query->execute()->fetchAll();

                $submissions = [];
                foreach ($results as $result) {
                  $submissions[$result->sid][$result->name] = $result->value;
                }

                foreach ($submissions as $sid => $data) {
                  if (!empty($data[$email_field_name])) {
                    $email_key = strtolower(trim($data[$email_field_name]));
                    $data['group_name'] = $group_name;
                    if (empty($data['name'])) {
                      $data['name'] = $group_name;
                    }
                    $webform_emails_data[$email_key] = $data;
                  }
                }
              }
            }

            if ($group->hasField('users') && !$group->get('users')->isEmpty()) {
              foreach ($group->get('users')->referencedEntities() as $user) {
                if ($user instanceof UserInterface) {
                  $email = $user->getEmail();
                  if ($email) {
                    $email_key = strtolower(trim($email));
                    $webform_emails_data[$email_key] = [
                      'email' => $email,
                      'name' => $user->getDisplayName(),
                      'group_name' => $group_name,
                    ];
                  }
                }
              }
            }

            if ($group->hasField('public_users') && !$group->get('public_users')->isEmpty()) {
              foreach ($group->get('public_users')->referencedEntities() as $public_user) {
                if (method_exists($public_user, 'getEmail')) {
                  $email = $public_user->getEmail();
                  if ($email) {
                    $email_key = strtolower(trim($email));
                    $webform_emails_data[$email_key] = [
                      'email' => $email,
                      'name' => $public_user->label(),
                      'group_name' => $group_name,
                    ];
                  }
                }
              }
            }
          }
        }
      }
    }

    $cache[$cache_key] = ['subject' => $subject, 'body' => $body, 'webform_submissions' => $webform_emails_data];
    return $cache[$cache_key];
  }

  /**
   * Process the queue of a campaign (if not paused).
   * 
   * @param int $campaign_id
   *   The campaign node ID.
   * @param int $batch_size
   *   Number of emails to process in this batch. Default is 100.
   */
  /**
   * Release session before background mail sends (avoids header/session errors).
   */
  public function prepareBackgroundSendingContext(): void {
    if (function_exists('session_write_close') && session_status() === PHP_SESSION_ACTIVE) {
      session_write_close();
    }
  }

  public function processCampaignQueue(int $campaign_id, int $batch_size = 100, bool $silent = FALSE): void {
    if ($silent) {
      $this->prepareBackgroundSendingContext();
    }

    $node = $this->entityTypeManager->getStorage('node')->load($campaign_id);
    if (!$node) {
      $this->logger->warning("Campaign node {$campaign_id} not found; skipping queue processing.");
      if (!$silent) {
        $this->messenger->addMessage($this->t('Campaign node @id not found; skipping queue processing.', ['@id' => $campaign_id]));
      }
      return;
    }

    $paused = FALSE;
    if ($node instanceof NodeInterface && $node->hasField('field_queue_paused')) {
      $paused = $node->get('field_queue_paused')->value;
    }

    if ($paused) {
      $this->logger->notice("Campaign {$campaign_id} is paused; not processing its queue.");
      if (!$silent) {
        $this->messenger->addMessage($this->t('Campaign @id is paused; not processing its queue.', ['@id' => $campaign_id]));
      }
      return;
    }

    $queue = $this->queueFactory->get($this->getQueueName($campaign_id));


    $processed = 0;
    $sent_count = 0;
    $failed_count = 0;
    $batch_results = [];
    $current_run_id = NULL;

    $database = \Drupal::database();
    $table_exists = $database->schema()->tableExists('email_campaign_unsubscription');

    while ($processed < $batch_size) {
      $items = [];
      $sub_batch_limit = min($this->getSettings()['claim_chunk_size'], $batch_size - $processed);
      for ($i = 0; $i < $sub_batch_limit; $i++) {
        if ($item = $queue->claimItem()) {
          $items[] = $item;
        } else {
          break;
        }
      }

      if (empty($items)) {
        break;
      }

      $item_emails = [];
      foreach ($items as $item) {
        $item_emails[$item->data['email']] = $item;
      }

      $unsubscribed_emails = [];
      if ($table_exists && !empty($item_emails)) {
        $unsubscribed_emails = $database->select('email_campaign_unsubscription', 'u')
          ->fields('u', ['email'])
          ->condition('campaign_id', $campaign_id)
          ->condition('email', array_keys($item_emails), 'IN')
          ->execute()
          ->fetchCol();
        $unsubscribed_emails = array_flip($unsubscribed_emails);
      }

      $batch_results = [];
      $current_run_id = NULL;

      $flush_every = $this->getSettings()['live_log_flush_size'];

      foreach ($items as $item) {
        $start_time = microtime(true);
        $payload = $this->normalizeQueuePayload($item->data);
        $email = isset($payload['email']) ? trim((string) $payload['email']) : '';
        if ($email === '') {
          $queue->deleteItem($item);
          $processed++;
          continue;
        }
        $item_run_id = (int) ($payload['run_id'] ?? 0);
        if ($item_run_id > 0) {
          $current_run_id = $item_run_id;
        }

        try {
          if (isset($unsubscribed_emails[$email])) {
            $queue->deleteItem($item);
            $this->appendEmailLogResult($campaign_id, $batch_results, $current_run_id, $email, 'failed', 'Unsubscribed', 0, $flush_every);
            $failed_count++;
            $processed++;
            continue;
          }

          $template_data = $this->loadTemplateBody($campaign_id);
          if (empty($template_data['body'])) {
            $queue->deleteItem($item);
            $this->appendEmailLogResult($campaign_id, $batch_results, $current_run_id, $email, 'failed', 'Missing email template body', 0, $flush_every);
            $failed_count++;
            $processed++;
            continue;
          }

          $body = self::replaceTokens($template_data['body'], $campaign_id, $email);
          $body = self::replaceWebformTokens($body, $email, $template_data['webform_submissions'] ?? []);

          $params = [
            'subject' => $template_data['subject'] ?: "Campaign #{$campaign_id}: Message",
            'body' => $body,
          ];
          $result = $this->mailManager->mail('campaign_email_queue', 'campaign_message', $email, $node->language()->getId(), $params);

          $processing_time = (int) ((microtime(true) - $start_time) * 1000);

          if ($result['result'] === TRUE) {
            $queue->deleteItem($item);
            $sent_count++;
            $this->appendEmailLogResult($campaign_id, $batch_results, $current_run_id, $email, 'sent', NULL, $processing_time, $flush_every);
          }
          else {
            $failed_count++;
            $this->logger->error('Failed sending to @email: mail returned false', ['@email' => $email]);
            $queue->deleteItem($item);
            $this->appendEmailLogResult($campaign_id, $batch_results, $current_run_id, $email, 'failed', 'Mail send returned false', $processing_time, $flush_every);
          }
        }
        catch (\Exception $e) {
          $processing_time = (int) ((microtime(true) - $start_time) * 1000);
          $failed_count++;
          $this->logger->error('Failed sending to @email: @message', [
            '@email' => $email,
            '@message' => $e->getMessage(),
          ]);
          $queue->deleteItem($item);
          $this->appendEmailLogResult($campaign_id, $batch_results, $current_run_id, $email, 'error', $e->getMessage(), $processing_time, $flush_every);
        }
        $processed++;
      }

      $this->flushEmailLogBatch($campaign_id, $batch_results, $current_run_id);
      $batch_results = [];
    }
    if ($sent_count > 0 && $node instanceof NodeInterface && $node->hasField('field_last_run')) {
      $node->set('field_last_run', time());
      $node->save();
    }

    $remaining = $queue->numberOfItems();
    if (!$silent) {
      $this->messenger->addMessage($this->t(
        'Processed @processed emails for campaign @id. Sent: @sent, Failed: @failed, Remaining: @remaining',
        [
          '@processed' => $processed,
          '@id' => $campaign_id,
          '@sent' => $sent_count,
          '@failed' => $failed_count,
          '@remaining' => $remaining,
        ]
      ));
    }
  }

  /**
   * Process campaign queue using Batch API
   * 
   * @param int $campaign_id
   *   The campaign node ID.
   * @param int $batch_size
   *   Number of emails to process per batch operation. Default is 100.
   */
  public function processCampaignQueueBatch(int $campaign_id, int $batch_size = 100): void
  {
    $queue = $this->queueFactory->get($this->getQueueName($campaign_id));
    $total_items = $queue->numberOfItems();

    if ($total_items === 0) {
      $this->messenger->addMessage($this->t('No emails in queue for campaign @id', ['@id' => $campaign_id]), 'warning');
      return;
    }

    $node = $this->entityTypeManager->getStorage('node')->load($campaign_id);
    $campaign_name = ($node instanceof NodeInterface) ? $node->getTitle() : "Campaign #{$campaign_id}";

    $operations = [];
    $num_operations = ceil($total_items / $batch_size);

    for ($i = 0; $i < $num_operations; $i++) {
      $operations[] = [
        '\Drupal\campaign_email_queue\Service\CampaignEmailQueueService::processBatchOperation',
        [$campaign_id, $campaign_name, $batch_size],
      ];
    }

    $batch = [
      'title' => $this->t('Processing "@campaign" Email Queue', ['@campaign' => $campaign_name]),
      'operations' => $operations,
      'finished' => '\Drupal\campaign_email_queue\Service\CampaignEmailQueueService::processBatchFinished',
      'init_message' => $this->t('Starting to process @count emails for "@campaign"...', ['@count' => $total_items, '@campaign' => $campaign_name]),
      'progress_message' => $this->t('Processing batch @current of @total'),
      'error_message' => $this->t('Email batch processing has encountered an error.'),
      'progressive' => TRUE,
      'redirect' => \Drupal\Core\Url::fromRoute('campaign_email_queue.dashboard')->toString(),
    ];

    batch_set($batch);
  }

  /**
   * Batch operation callback: Process a batch of emails.
   */
  public static function processBatchOperation(int $campaign_id, string $campaign_name, int $batch_size, &$context): void
  {
    $queue_factory = \Drupal::service('queue');
    $queue = $queue_factory->get('campaign_email_queue_' . $campaign_id);
    $mail_manager = \Drupal::service('plugin.manager.mail');
    $logger = \Drupal::logger('campaign_email_queue');
    $entity_type_manager = \Drupal::entityTypeManager();
    $log_service = \Drupal::service('campaign_email_queue.log');

    if (!isset($context['results']['processed'])) {
      $context['results']['processed'] = 0;
      $context['results']['sent'] = 0;
      $context['results']['failed'] = 0;
      $context['results']['campaign_id'] = $campaign_id;
      $context['results']['campaign_name'] = $campaign_name;
      $context['results']['total'] = $queue->numberOfItems();
    }

    $processed = 0;
    $node = $entity_type_manager->getStorage('node')->load($campaign_id);
    $database = \Drupal::database();
    $table_exists = $database->schema()->tableExists('email_campaign_unsubscription');

    $queue_service = \Drupal::service('campaign_email_queue.queue');
    $settings = $queue_service->getSettings();

    while ($processed < $batch_size) {
      $items = [];
      $sub_batch_limit = min($settings['claim_chunk_size'], $batch_size - $processed);
      for ($i = 0; $i < $sub_batch_limit; $i++) {
        if ($item = $queue->claimItem()) {
          $items[] = $item;
        } else {
          break;
        }
      }

      if (empty($items)) {
        break;
      }

      $item_emails = [];
      foreach ($items as $item) {
        $payload = $queue_service->normalizeQueuePayload($item->data);
        if (!empty($payload['email'])) {
          $item_emails[$payload['email']] = $item;
        }
      }

      $unsubscribed_emails = [];
      if ($table_exists && !empty($item_emails)) {
        $unsubscribed_emails = $database->select('email_campaign_unsubscription', 'u')
          ->fields('u', ['email'])
          ->condition('campaign_id', $campaign_id)
          ->condition('email', array_keys($item_emails), 'IN')
          ->execute()
          ->fetchCol();
        $unsubscribed_emails = array_flip($unsubscribed_emails);
      }

      $batch_results = [];
      $current_run_id = NULL;

      foreach ($items as $item) {
        $start_time = microtime(true);
        try {
          $payload = $queue_service->normalizeQueuePayload($item->data);
          $email = trim((string) ($payload['email'] ?? ''));
          $item_run_id = (int) ($payload['run_id'] ?? 0);
          if ($item_run_id > 0) {
            $current_run_id = $item_run_id;
          }

          if (isset($unsubscribed_emails[$email])) {
            $queue->deleteItem($item);
            $processed++;
            $context['results']['processed']++;
            continue;
          }

          $queue_service = \Drupal::service('campaign_email_queue.queue');
          $template_data = $queue_service->loadTemplateBody($campaign_id);

          if (empty($template_data['body'])) {
            $queue->deleteItem($item);
            $processed++;
            $context['results']['processed']++;
            continue;
          }

          $body = self::replaceTokens($template_data['body'], $campaign_id, $email);
          $body = self::replaceWebformTokens($body, $email, $template_data['webform_submissions'] ?? []);

          $params = [
            'subject' => $template_data['subject'] ?: "Campaign : {$campaign_name}",
            'body' => $body,
          ];
          $result = $mail_manager->mail('campaign_email_queue', 'campaign_message', $email, $node->language()->getId(), $params);

          $processing_time = (int) ((microtime(true) - $start_time) * 1000);

          if ($result['result'] === TRUE) {
            $queue->deleteItem($item);
            $context['results']['sent']++;
            $logger->info("Sent email to {$email} for campaign {$campaign_id}");
            $batch_results[] = [
              'email' => $email,
              'status' => 'sent',
              'processing_time' => $processing_time,
            ];
          } else {
            $context['results']['failed']++;
            $logger->error("Failed sending to {$email}: Mail send returned false");
            $queue->deleteItem($item);
            $batch_results[] = [
              'email' => $email,
              'status' => 'failed',
              'error' => 'Mail send returned false',
              'processing_time' => $processing_time,
            ];
          }
        } catch (\Exception $e) {
          $processing_time = (int) ((microtime(true) - $start_time) * 1000);
          $context['results']['failed']++;
          $logger->error("Failed sending to {$email}: " . $e->getMessage());
          $queue->deleteItem($item);
          $batch_results[] = [
            'email' => $email,
            'status' => 'error',
            'error' => $e->getMessage(),
            'processing_time' => $processing_time,
          ];
        }

        $processed++;
        $context['results']['processed']++;
      }

      if (!empty($batch_results)) {
        $log_service->logEmailAttemptsBatch($campaign_id, $batch_results, $current_run_id);
      }
    }

    $remaining = $queue->numberOfItems();
    $total = $context['results']['total'] ?? ($context['results']['processed'] + $remaining);

    $context['message'] = t('Processed @count/@total emails (@percent%). Sent: @sent | Failed: @failed | Remaining: @remaining', [
      '@count' => $context['results']['processed'],
      '@total' => $total,
      '@percent' => $total > 0 ? round(($context['results']['processed'] / $total) * 100) : 0,
      '@sent' => $context['results']['sent'],
      '@failed' => $context['results']['failed'],
      '@remaining' => $remaining,
    ]);
  }

  /**
   * Batch finished callback: Update campaign and show results.
   */
  public static function processBatchFinished(bool $success, array $results, array $operations): void
  {
    $messenger = \Drupal::messenger();
    $entity_type_manager = \Drupal::entityTypeManager();

    if ($success) {
      $campaign_id = $results['campaign_id'];
      $node = $entity_type_manager->getStorage('node')->load($campaign_id);

      if ($node instanceof NodeInterface && $node->hasField('field_last_run')) {
        $node->set('field_last_run', time());
        $node->save();
      }

      $campaign_name = $results['campaign_name'] ?? "Campaign #{$campaign_id}";

      $messenger->addMessage(t(
        '@campaign processing complete! Total: @total, Sent: @sent, Failed: @failed',
        [
          '@campaign' => $campaign_name,
          '@total' => $results['processed'],
          '@sent' => $results['sent'],
          '@failed' => $results['failed'],
        ]
      ));
    } else {
      $messenger->addMessage(t('Email processing finished with errors.'), 'error');
    }
  }

  /**
   * Process a batch of emails for a campaign (non-Batch API).
   * 
   * @param int $campaign_id
   *   The campaign ID.
   * @param int $batch_size
   *   Number of items to process.
   * @param int|null $time_limit
   *   Time limit in seconds (optional).
   */
  public function processBatch(int $campaign_id, int $batch_size = 20, bool $ignore_scheduler = FALSE, ?int $time_limit = NULL): void
  {
    $queue = $this->queueFactory->get($this->getQueueName($campaign_id));

    // Fix for stuck campaigns: Check if queue is empty but logs say pending.
    // Moved to top to ensure it runs even if validation would otherwise block it.
    if ($queue->numberOfItems() == 0) {
      $stats = $this->logService->getRealTimeStatus($campaign_id);
      \Drupal::logger('campaign_debug')->info('Checking stuck: Queue=0, Pending=@pending', ['@pending' => $stats['pending']]);
      
      if ($stats['pending'] > 0) {
        // Desync detected. Queue is empty but stats say pending.
        \Drupal::logger('campaign_email_queue')->warning('Campaign @id desync detected: Queue empty but @count emails pending. Marking them as failed.', [
          '@id' => $campaign_id,
          '@count' => $stats['pending'],
        ]);
        $this->logService->markPendingAsFailed($campaign_id, 'Queue empty - items missing or cleared manually');
        return;
      }
    }

    $node = $this->entityTypeManager->getStorage('node')->load($campaign_id);

    if (!$node) {
      return;
    }

    if ($node instanceof NodeInterface && !empty($node->get('field_queue_paused')->value)) {
      return;
    }

    if (!$ignore_scheduler && $node instanceof NodeInterface && !empty($node->get('field_scheduled_time')->value)) {
      $scheduled_time = (int) $node->get('field_scheduled_time')->value;
      if ($scheduled_time > \Drupal::time()->getRequestTime()) {
        return;
      }
    }

    $campaign_name = ($node instanceof NodeInterface) ? $node->getTitle() : "Campaign #{$campaign_id}";
    $processed = 0;
    $batch_start_time = microtime(true);

    while ($processed < $batch_size && ($item = $queue->claimItem())) {
      $start_time = microtime(true);

      if ($time_limit !== NULL && (microtime(true) - $batch_start_time) >= $time_limit) {
        $queue->releaseItem($item);
        break;
      }

      try {
        $data = $item->data;
        $email = $data['email'];
        $item_langcode = $data['langcode'] ?? 'en';

        $template_data = $this->loadTemplateBody($campaign_id);
        if (empty($template_data['body'])) {
          $queue->deleteItem($item);
          $processed++;
          continue;
        }

        $body = self::replaceTokens($template_data['body'], $campaign_id, $email);
        $body = self::replaceWebformTokens($body, $email, $template_data['webform_submissions'] ?? []);

        $params = [
          'subject' => $template_data['subject'] ?: "Campaign : {$campaign_name}",
          'body' => $body,
        ];
        $result = $this->mailManager->mail('campaign_email_queue', 'campaign_message', $email, $node->language()->getId(), $params);
        $processing_time = (int) ((microtime(true) - $start_time) * 1000);

        if ($result['result'] === TRUE) {
          $queue->deleteItem($item);
          $this->logService->logEmailAttempt($campaign_id, $email, 'sent', NULL, $processing_time, $data['run_id'] ?? NULL);
        } else {
          $queue->deleteItem($item);
          $this->logService->logEmailAttempt($campaign_id, $email, 'failed', 'Mail send returned false', $processing_time, $data['run_id'] ?? NULL);
        }
      } catch (\Exception $e) {
        $processing_time = (int) ((microtime(true) - $start_time) * 1000);
        $queue->deleteItem($item);
        $this->logService->logEmailAttempt($campaign_id, $email ?? 'unknown', 'error', $e->getMessage(), $processing_time, $data['run_id'] ?? NULL);
      }

      $processed++;
    }
  }

  /**
   * Get status for a campaign queue.
   */
  public function getQueueCount(int $campaign_id): int
  {
    $queue = $this->queueFactory->get($this->getQueueName($campaign_id));
    return $queue->numberOfItems();
  }

  /**
   * Replace tokens in email body.
   */
  public static function replaceTokens($body, $campaign_id, $email)
  {
    $config = \Drupal::config('email_marketing.settings');
    $frontend_url = $config->get('frontend_base_url');
    $base_url = $frontend_url ?: \Drupal::request()->getSchemeAndHttpHost();
    $salt = Settings::get('hash_salt');
    $data = "{$campaign_id}:{$email}";
    $signature = hash_hmac('sha256', $data, $salt);

    $masked_email = base64_encode($email);
    $base_url = rtrim($base_url, '/');

    if (str_ends_with($base_url, '/unsubscribe')) {
      $unsubscribe_url = $base_url . "/{$campaign_id}/" . urlencode($masked_email) . "/{$signature}";
    } else {
      $unsubscribe_url = $base_url . "/unsubscribe/{$campaign_id}/" . urlencode($masked_email) . "/{$signature}";
    }

    $tokens = [
      '{{unsubscribe_url}}' => $unsubscribe_url,
      '{{campaign_id}}' => $campaign_id,
      '{{email}}' => $email,
      '{&amp;#123;unsubscribe_url&amp;#125;}' => $unsubscribe_url,
      '{{ unsubscribe_url }}' => $unsubscribe_url,
    ];

    return str_replace(array_keys($tokens), array_values($tokens), $body);
  }

  /**
   * Replace webform tokens in email body.
   */
  public static function replaceWebformTokens($body, $email, array $webform_submissions = [])
  {
    $patterns = [];
    $replacements = [];

    $open_braces = '(?:\{\{|&#123;\{|\{&#123;|&#123;&#123;)';
    $close_braces = '(?:\}\}|&#125;\}|\}&#125;|&#125;&#125;)';
    $ws = '(?:\s|&nbsp;|&#160;)*';
    $patterns[] = '/' . $open_braces . $ws . 'email' . $ws . $close_braces . '/ui';
    $replacements[] = $email;

    if (!empty($webform_submissions)) {
      $lookup_email = strtolower(trim($email));

      if (isset($webform_submissions[$lookup_email])) {
        foreach ($webform_submissions[$lookup_email] as $key => $value) {
          $patterns[] = '/' . $open_braces . $ws . preg_quote($key, '/') . $ws . $close_braces . '/ui';
          $replacements[] = $value;
        }
      }
    }

    if (empty($patterns)) {
      return $body;
    }

    return preg_replace($patterns, $replacements, $body);
  }
  /**
   * Helper: Gets the actual email field name from a webform.
   */
  protected function getEmailFieldName($webform_id)
  {
    $webform = $this->entityTypeManager->getStorage('webform')->load($webform_id);
    if (!$webform) {
      return NULL;
    }

    if (!method_exists($webform, 'getElementsDecodedAndFlattened')) {
      return NULL;
    }

    $elements = $webform->getElementsDecodedAndFlattened();

    foreach ($elements as $key => $element) {
      if (stripos($key, 'email') !== FALSE || stripos($key, 'mail') !== FALSE) {
        return $key;
      }
      if (isset($element['#type']) && $element['#type'] === 'email') {
        return $key;
      }
    }

    return NULL;
  }

  /**
   * Mark campaign as sending and queue a background worker item.
   */
  public function startBackgroundSending(int $campaign_id): void {
    $run_id = $this->logService->resolveRunId($campaign_id);
    $this->processingState->mark($campaign_id, $run_id);
    $state = \Drupal::state();
    $pending_key = 'campaign_email_queue.worker_pending';
    $pending = $state->get($pending_key, []);
    $now = \Drupal::time()->getRequestTime();
    if (isset($pending[$campaign_id]) && ($now - (int) $pending[$campaign_id]) < 90) {
      return;
    }
    $pending[$campaign_id] = $now;
    $state->set($pending_key, $pending);
    $this->queueFactory->get('campaign_email_queue_send')->createItem([
      'campaign_id' => $campaign_id,
    ]);
  }

  public function stopBackgroundSending(int $campaign_id): void {
    $this->processingState->clear($campaign_id);
    $pending = \Drupal::state()->get('campaign_email_queue.worker_pending', []);
    unset($pending[$campaign_id]);
    \Drupal::state()->set('campaign_email_queue.worker_pending', $pending);
  }

  /**
   * Dashboard status: live logs + queue depth + background flag.
   */
  public function getDashboardStatus(int $campaign_id): array {
    $run_id = $this->processingState->getRunId($campaign_id)
      ?? $this->logService->resolveRunId($campaign_id);
    $queue_count = $this->getQueueCount($campaign_id);

    if ($queue_count > 0) {
      $counts = $this->logService->getLogStatusCounts($campaign_id, $run_id);
      if ($counts['total'] === 0) {
        $emails = $this->getQueuedRecipientEmails($campaign_id);
        if ($emails !== []) {
          $this->logService->initializeEmailLogsBulk($campaign_id, $emails, $run_id, 500, FALSE);
        }
      }
    }

    $status = $this->logService->getRealTimeStatus($campaign_id, $run_id);
    $status['queue_count'] = $queue_count;
    $status['failed_display'] = (int) $status['failed'] + (int) $status['error'];
    $status['sent_progress'] = $status['total'] > 0
      ? round(((int) $status['sent'] / (int) $status['total']) * 100, 2)
      : 0;
    return $status;
  }

  /**
   * Collect recipient emails still waiting in the per-campaign queue table.
   *
   * @return list<string>
   */
  /**
   * @return array<string, mixed>
   */
  public function normalizeQueuePayload(mixed $data): array {
    if (is_object($data)) {
      $data = (array) $data;
    }
    return is_array($data) ? $data : [];
  }

  /**
   * @param list<array<string, mixed>> $batch_results
   */
  protected function appendEmailLogResult(
    int $campaign_id,
    array &$batch_results,
    ?int $current_run_id,
    string $email,
    string $status,
    ?string $error = NULL,
    ?int $processing_time = NULL,
    int $flush_every = 5,
  ): void {
    $entry = [
      'email' => $email,
      'status' => $status,
    ];
    if ($error !== NULL) {
      $entry['error'] = $error;
    }
    if ($processing_time !== NULL) {
      $entry['processing_time'] = $processing_time;
    }
    $batch_results[] = $entry;

    if (count($batch_results) >= $flush_every) {
      $this->flushEmailLogBatch($campaign_id, $batch_results, $current_run_id);
      $batch_results = [];
    }
  }

  /**
   * @param list<array<string, mixed>> $batch_results
   */
  protected function flushEmailLogBatch(int $campaign_id, array &$batch_results, ?int $run_id): void {
    if ($batch_results === []) {
      return;
    }
    $this->logService->logEmailAttemptsBatch($campaign_id, $batch_results, $run_id);
    $batch_results = [];
  }

  public function getQueuedRecipientEmails(int $campaign_id, int $limit = 10000): array {
    $name = $this->getQueueName($campaign_id);
    $rows = \Drupal::database()->select('queue', 'q')
      ->fields('q', ['data'])
      ->condition('name', $name)
      ->range(0, $limit)
      ->execute();

    $emails = [];
    foreach ($rows as $row) {
      $data = @unserialize($row->data, ['allowed_classes' => FALSE]);
      if (!is_array($data)) {
        continue;
      }
      $email = isset($data['email']) ? trim((string) $data['email']) : '';
      if ($email !== '') {
        $emails[] = $email;
      }
    }

    return array_values(array_unique($emails));
  }

  /**
   * Process campaign_email_queue_send items (cron + HTTP terminate).
   */
  public function drainBackgroundSendQueue(int $max_seconds = 55): void {
    $this->prepareBackgroundSendingContext();
    $queue = $this->queueFactory->get('campaign_email_queue_send');
    $worker = $this->queueWorkerManager->createInstance('campaign_email_queue_send');
    $end = microtime(TRUE) + $max_seconds;

    while (microtime(TRUE) < $end) {
      $item = $queue->claimItem(30);
      if (!$item) {
        break;
      }
      try {
        $worker->processItem($item->data);
        $queue->deleteItem($item);
      }
      catch (\Exception $e) {
        $queue->releaseItem($item);
        $this->logger->error('Background send error: @message', ['@message' => $e->getMessage()]);
        break;
      }
    }
  }

  /**
   * Re-queue worker if campaign is still active with pending work.
   */
  public function ensureBackgroundSending(int $campaign_id): void {
    if (!$this->processingState->isActive($campaign_id)) {
      return;
    }
    $counts = $this->logService->getLogStatusCounts($campaign_id);
    if ($this->getQueueCount($campaign_id) > 0 || $counts['pending'] > 0) {
      $this->startBackgroundSending($campaign_id);
    }
    else {
      $this->processingState->clear($campaign_id);
    }
  }

}
