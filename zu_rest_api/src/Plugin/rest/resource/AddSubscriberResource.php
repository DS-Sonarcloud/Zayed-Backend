<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\taxonomy\Entity\Term;
use Drupal\user\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Provides a REST resource to add a subscriber.
 *
 * @RestResource(
 *   id = "add_subscriber_resource",
 *   label = @Translation("Add Subscriber Resource"),
 *   uri_paths = {
 *     "create" = "/api/add-subscriber"
 *   }
 * )
 */
class AddSubscriberResource extends ResourceBase
{
    /**
     * Responds to POST requests to add a subscriber.
     */
    public function post(Request $request)
    {
        $data = json_decode($request->getContent(), TRUE);

        // Validate required fields
        if (empty($data['email']) || empty($data['terms'])) {
            return new ResourceResponse([
                'status' => 'error',
                'message' => 'Email and terms are required.'
            ], 400);
        }

        $email = trim($data['email']);
        $terms = $data['terms'];
        $fcm_token = $data['fcm_token'] ?? NULL;

        $user_storage = \Drupal::entityTypeManager()->getStorage('user');
        $users_by_email = $user_storage->loadByProperties(['mail' => $email]);
        $user = reset($users_by_email);

        $is_new_user = FALSE;

        if ($user) {
            // Existing user — add subscriber role if missing
            if (!$user->hasRole('subscriber')) {
                $user->addRole('subscriber');
            }

            // Update FCM token if available
            if ($fcm_token && $user->hasField('field_fcm_token')) {
                $user->set('field_fcm_token', $fcm_token);
            }

            $user->save();
        } else {
            // Create new user with email as username
            $user = $user_storage->create([
                'name' => $email,
                'mail' => $email,
                'status' => 1,
                'roles' => ['subscriber'],
            ]);

            if ($fcm_token && $user->hasField('field_fcm_token')) {
                $user->set('field_fcm_token', $fcm_token);
            }

            $user->save();
            $is_new_user = TRUE;
        }

        // Handle taxonomy flagging for subscribed terms
        $flagService = \Drupal::service('flag');
        $flag = $flagService->getFlagById('subscribe_event');
        $flagged_terms = [];

        foreach ($terms as $term_id) {
            $term = Term::load($term_id);
            if ($term) {
                $flagging = $flagService->getFlagging($flag, $term, $user);
                if (!$flagging) {
                    $flagService->flag($flag, $term, $user);
                    $flagged_terms[] = $term_id;
                }
            }
        }

        // Response message depends on user state
        $message = $is_new_user
            ? 'New subscriber created successfully.'
            : 'Existing user updated with subscriber role.';

        return new ResourceResponse([
            'status' => 'success',
            'message' => $message,
            'subscriber' => [
                'uid' => $user->id(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'flagged_terms' => $flagged_terms,
                'fcm_token' => $user->get('field_fcm_token')->value ?? NULL,
            ]
        ], 201);
    }
}
