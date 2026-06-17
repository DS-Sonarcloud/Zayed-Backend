<?php

namespace Drupal\email_marketing\Plugin\QueueWorker;

use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Processes items in the email send queue.
 *
 * @QueueWorker(
 *   id = "email_send_queue",
 *   title = @Translation("Email Send Queue"),
 *   cron = {"time" = 60}
 * )
 */
class EmailSendQueue extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  use StringTranslationTrait;

  /**
   * The mail manager.
   *
   * @var \Drupal\Core\Mail\MailManagerInterface
   */
  protected $mailManager;

  /**
   * Constructs a new EmailSendQueue object.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, MailManagerInterface $mail_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->mailManager = $mail_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('plugin.manager.mail')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data) {
    if (\Drupal::state()->get('queue.email_send_queue.paused')) {
        // Skip processing.
        return;
    }
    $module = 'email_marketing';
    $key = $data['key'];

    $params['subject'] = $data['subject'];
    $params['message'] = $data['message'];
    $params['headers'] = [
      'Content-Type' => 'text/html; charset=UTF-8',
    ];
    $result = $this->mailManager->mail($module, $key, $data['email'], $data['langcode'], $params);

    if ($result['result'] !== TRUE) {
      \Drupal::logger('email_marketing')->error('Failed to send email to %email.', ['%email' => $data['email']]);
    }
    else {
      \Drupal::logger('email_marketing')->notice('Email sent to %email.', ['%email' => $data['email']]);
    }
  }

}
