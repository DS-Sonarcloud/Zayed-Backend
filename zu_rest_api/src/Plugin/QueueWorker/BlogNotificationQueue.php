<?php

namespace Drupal\zu_rest_api\Plugin\QueueWorker;

use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Processes blog notification queue items.
 *
 * @QueueWorker(
 *   id = "zu_rest_api_blog_notification_queue",
 *   title = @Translation("Blog Notification Queue"),
 *   cron = {"time" = 60}
 * )
 */
class BlogNotificationQueue extends QueueWorkerBase implements ContainerFactoryPluginInterface
{

    protected $mailManager;
    protected $logger;

    public function __construct(array $configuration, $plugin_id, $plugin_definition, MailManagerInterface $mail_manager, LoggerChannelFactoryInterface $logger_factory)
    {
        parent::__construct($configuration, $plugin_id, $plugin_definition);
        $this->mailManager = $mail_manager;
        $this->logger = $logger_factory->get('zu_rest_api');
    }

    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->get('plugin.manager.mail'),
            $container->get('logger.factory')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function processItem($data)
    {
        if (PHP_SESSION_ACTIVE === session_status()) {
            session_write_close();
        }
        while (ob_get_level() > 0) {
            @ob_end_clean();
        }
        // Extract safely.
        $to = $data['email'] ?? NULL;
        $blog_title = $data['blog_title'] ?? '(Untitled Blog)';
        $blog_url = $data['blog_url'] ?? '';
        $brand = 'Zayed University';

        if (empty($to)) {
            $this->logger->warning('Skipped blog notification because recipient email missing.');
            return;
        }

        // Prepare HTML email (no render arrays).
        $html_body = "
    <html>
      <body style='font-family:Arial,sans-serif;color:#333;'>
        <h2 style='color:#0ea5a4;'>$brand</h2>
        <p>Hello,</p>
        <p>A new blog has been published: <strong>$blog_title</strong>.</p>
        <p><a href='$blog_url' style='background:#0ea5a4;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;'>Read the Blog</a></p>
        <p style='font-size:13px;color:#666;'>You are receiving this email because you subscribed to $brand blogs.</p>
      </body>
    </html>";

        $params = [
            'subject' => "New Blog: $blog_title",
            'body' => [$html_body],
            'headers' => ['Content-Type' => 'text/html; charset=UTF-8'],
        ];

        // Send the mail.
        $result = $this->mailManager->mail('zu_rest_api', 'blog_new_notification', $to, 'en', $params);

        if (!empty($result['result'])) {
            $this->logger->notice('Blog notification sent to @to for "@title"', [
                '@to' => $to,
                '@title' => $blog_title,
            ]);
        } else {
            $this->logger->error('Failed to send blog notification to @to', ['@to' => $to]);
        }
    }
}
