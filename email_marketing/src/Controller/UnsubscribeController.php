<?php

namespace Drupal\email_marketing\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Database\Database;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Site\Settings;
use Drupal\Core\Logger\LoggerChannelTrait;

/**
 * Controller for unsubscription.
 */
class UnsubscribeController extends ControllerBase
{
    /**
     * Records the unsubscription and returns a confirmation page.
     */
    public function unsubscribe($campaign_id, $email, $token)
    {
        $email = trim(base64_decode($email));

        if (!$campaign_id || !$email || !$token) {
            return [
                '#markup' => $this->t('Invalid unsubscribe request.'),
            ];
        }
        // Verify signature
        $salt = Settings::get('hash_salt');
        $data = "{$campaign_id}:{$email}";
        $expected_signature = hash_hmac('sha256', $data, $salt);

        if ($token !== $expected_signature) {
            return [
                '#markup' => $this->t('Invalid or expired unsubscribe link.'),
            ];
        }

        $is_new = $this->doUnsubscribe($campaign_id, $email);

        $title = $is_new ? $this->t('Unsubscribed Successfully') : $this->t('Already Unsubscribed');
        $text = $is_new ? $this->t('You have been unsubscribed from this campaign.') : $this->t('You were already unsubscribed from this campaign.');

        return [
            '#type' => 'container',
            '#attributes' => [
                'style' => 'text-align: center; margin-top: 50px; font-family: sans-serif;',
            ],
            'message' => [
                '#markup' => '<h1>' . $title . '</h1><p>' . $text . '</p>',
            ],
        ];
    }

    /**
     * API endpoint for decoupled frontends.
     */
    public function unsubscribeApi()
    {
        $request = \Drupal::request();
        $campaign_id = $request->query->get('c') ?: $request->request->get('c');
        $masked_email = $request->query->get('e') ?: $request->request->get('e');
        $signature = $request->query->get('s') ?: $request->request->get('s');

        if (!$campaign_id || !$masked_email || !$signature) {
            $content = $request->getContent();
            if (!empty($content)) {
                $data = json_decode($content, TRUE);
                if (json_last_error() === JSON_ERROR_NONE && !empty($data)) {
                    $campaign_id = $data['c'] ?? $campaign_id;
                    $masked_email = $data['e'] ?? $masked_email;
                    $signature = $data['s'] ?? $signature;
                }
            }
        }

        if (!$campaign_id || !$masked_email || !$signature) {
            return new \Symfony\Component\HttpFoundation\JsonResponse(['error' => 'Missing parameters'], 400);
        }

        $email = trim(base64_decode(urldecode($masked_email)));
        if (!$email) {
            return new \Symfony\Component\HttpFoundation\JsonResponse(['error' => 'Invalid email encoding'], 400);
        }

        $salt = Settings::get('hash_salt');
        $data = "{$campaign_id}:{$email}";
        $expected_signature = hash_hmac('sha256', $data, $salt);

        if ($signature !== $expected_signature) {
            return new \Symfony\Component\HttpFoundation\JsonResponse(['error' => 'Invalid signature'], 403);
        }

        $is_new = $this->doUnsubscribe($campaign_id, $email);

        if (!$is_new) {
            return new \Symfony\Component\HttpFoundation\JsonResponse(['message' => 'Already unsubscribed']);
        }

        return new \Symfony\Component\HttpFoundation\JsonResponse(['message' => 'Unsubscribed successfully']);
    }

    /**
     * Helper to perform the database operation.
     */
    protected function doUnsubscribe($campaign_id, $email)
    {
        $database = \Drupal::database();
        if (!$database->schema()->tableExists('email_campaign_unsubscription')) {
            return FALSE;
        }
        // Check if already unsubscribed
        $query = $database->select('email_campaign_unsubscription', 'u')
            ->fields('u', ['id'])
            ->condition('campaign_id', $campaign_id)
            ->condition('email', $email)
            ->execute()
            ->fetchField();

        if (!$query) {
            $database->insert('email_campaign_unsubscription')
                ->fields([
                    'campaign_id' => $campaign_id,
                    'email' => $email,
                    'created' => time(),
                ])
                ->execute();
            return TRUE;
        }

        return FALSE;
    }
}
