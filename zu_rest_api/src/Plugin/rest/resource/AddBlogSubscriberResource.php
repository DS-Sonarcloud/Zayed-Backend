<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Render\Markup;

/**
 * Provides a REST resource to add a blog subscriber.
 *
 * @RestResource(
 *   id = "add_blog_subscriber_resource",
 *   label = @Translation("Add Blog Subscriber Resource"),
 *   uri_paths = {
 *     "create" = "/api/add-blog-subscriber"
 *   }
 * )
 */
class AddBlogSubscriberResource extends ResourceBase
{
    /**
     * Responds to POST requests to add or update a blog subscriber.
     */
    public function post(Request $request)
    {
        $data = json_decode($request->getContent(), TRUE);

        // Validate required fields
        if (empty($data['email'])) {
            return new ResourceResponse([
                'status' => 'error',
                'message' => 'Email is required.'
            ], 400);
        }

        $email = trim($data['email']);
        $fcm_token = $data['fcm_token'] ?? NULL;

        // Validate email format
        if (!\Drupal::service('email.validator')->isValid($email)) {
            return new ResourceResponse([
                'status' => 'error',
                'message' => 'Invalid email format.'
            ], 400);
        }

        $user_storage = \Drupal::entityTypeManager()->getStorage('user');
        $users_by_email = $user_storage->loadByProperties(['mail' => $email]);
        $user = reset($users_by_email);

        $is_new_user = FALSE;

        if ($user) {
            if ($user->hasRole('blogs_subscriber')) {
                $message = 'You are already subscribed to blog updates.';
            } else {
                // Add subscription role
                $user->addRole('blogs_subscriber');

                // Update FCM token if available
                if ($fcm_token && $user->hasField('field_fcm_token')) {
                    $user->set('field_fcm_token', $fcm_token);
                }

                $user->save();
                $message = 'Subscription added successfully.';
                // Send confirmation email
                $this->sendSubscriptionEmail($user);
            }
        } else {
            $user = $user_storage->create([
                'name' => $email,
                'mail' => $email,
                'status' => 1,
                'roles' => ['blogs_subscriber'],
            ]);

            if ($fcm_token && $user->hasField('field_fcm_token')) {
                $user->set('field_fcm_token', $fcm_token);
            }

            $user->save();
            $is_new_user = TRUE;
            $message = 'New blog subscriber created successfully.';
            // Send confirmation email
            $this->sendSubscriptionEmail($user);
        }

        return new ResourceResponse([
            'status' => 'success',
            'message' => $message,
            'subscriber' => [
                'uid' => $user->id(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'fcm_token' => $user->get('field_fcm_token')->value ?? NULL,
            ],
        ], 201);
    }
    /**
     * Sends a subscription confirmation email using a Twig template.
     */
    protected function sendSubscriptionEmail(User $user) {
    $mailManager = \Drupal::service('plugin.manager.mail');
    $module = 'zu_rest_api';
    $key = 'blog_subscribe_confirmation';
    $to = $user->getEmail();
    $langcode = $user->getPreferredLangcode();

    $params = [
      'subject' => 'Thank you for subscribing to our Blogs & Events!',
      'brand_name' => 'Zayed University',
      'brand_logo' => base_path() . \Drupal::service("extension.list.theme")->getPath("zu") . "/images/logo.png",
      'user_name' => $user->getDisplayName(),
      'manage_url' => \Drupal::request()->getSchemeAndHttpHost() . '/user/' . $user->id() . '/edit',
      'support_email' => 'support@zu.ac.ae',
    ];

    $mailManager->mail($module, $key, $to, $langcode, $params);
  }
}
