<?php

namespace Drupal\event_calendar\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\Entity\Node;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\event_calendar\Service\FcmNotificationService;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;

/**
 * Controller for handling chunked notification processing via AJAX.
 */
class EventNotificationAjaxController extends ControllerBase
{

    protected $entityTypeManager;
    protected $fcmService;
    protected $mailManager;
    protected $languageManager;

    public function __construct(
        EntityTypeManagerInterface $entity_type_manager,
        FcmNotificationService $fcm_service,
        MailManagerInterface $mail_manager,
        LanguageManagerInterface $language_manager
    ) {
        $this->entityTypeManager = $entity_type_manager;
        $this->fcmService = $fcm_service;
        $this->mailManager = $mail_manager;
        $this->languageManager = $language_manager;
    }

    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('entity_type.manager'),
            $container->get('event_calendar.fcm_service'),
            $container->get('plugin.manager.mail'),
            $container->get('language_manager')
        );
    }

    /**
     * Processes a chunk of notifications.
     */
    public function process(Request $request)
    {
        $event_id = $request->request->get('event_id');
        $message = $request->request->get('message');
        $type = $request->request->get('type'); // 'email' or 'fcm'
        $offset = (int) $request->request->get('offset', 0);
        $limit = 50;

        if (!$event_id || !$message || !$type) {
            return new JsonResponse(['error' => 'Missing parameters'], 400);
        }

        $event = Node::load($event_id);
        if (!$event) {
            return new JsonResponse(['error' => 'Invalid event'], 404);
        }

        // Load flagged users
        $flagging_storage = $this->entityTypeManager->getStorage('flagging');
        $query = $flagging_storage->getQuery()
            ->accessCheck(FALSE)
            ->condition('flag_id', 'bookmark')
            ->condition('entity_id', $event_id)
            ->range($offset, $limit);

        $flagging_ids = $query->execute();

        if (empty($flagging_ids)) {
            return new JsonResponse([
                'processed' => 0,
                'finished' => TRUE,
            ]);
        }

        $flaggings = $flagging_storage->loadMultiple($flagging_ids);
        $public_storage = $this->entityTypeManager->getStorage('public_user');

        $targets = []; // store emails or FCM tokens

        foreach ($flaggings as $flagging) {
            $uid = $flagging->getOwnerId();
            if ($uid) {
                $publicUser = $public_storage->load($uid);
                if ($publicUser) {
                    if ($type === 'email' && !$publicUser->get('email')->isEmpty()) {
                        $targets[] = $publicUser->get('email')->value;
                    } elseif ($type === 'fcm' && $publicUser->hasField('fcm_token') && !$publicUser->get('fcm_token')->isEmpty()) {
                        $targets[] = $publicUser->get('fcm_token')->value;
                    }
                }
            }
        }

        $processed_count = count($targets);

        if ($processed_count > 0) {
            if ($type === 'email') {
                $langcode = $this->languageManager->getDefaultLanguage()->getId();
                foreach ($targets as $email) {
                    $params = [
                        'subject' => 'Event Notification: ' . $event->getTitle(),
                        'message' => $message,
                    ];
                    $this->mailManager->mail('event_calendar', 'manual_event_notification', $email, $langcode, $params);
                }
            } elseif ($type === 'fcm') {
                $this->fcmService->sendFcmNotifications($targets, $event->getTitle(), $message);
            }
        }

        return new JsonResponse([
            'processed' => $processed_count,
            'finished' => count($flagging_ids) < $limit,
            'total_in_chunk' => count($flagging_ids),
        ]);
    }
}
