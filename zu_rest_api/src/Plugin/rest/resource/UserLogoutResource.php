<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Session\SessionManagerInterface;
use Drupal\Core\Access\CsrfTokenGenerator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Psr\Log\LoggerInterface;

/**
 * Provides a REST API for user logout.
 *
 * @RestResource(
 *   id = "user_logout_rest_resource",
 *   label = @Translation("User Logout Resource"),
 *   uri_paths = {
 *     "canonical" = "/api/logout",
 *     "create" = "/api/logout"
 *   }
 * )
 */
class UserLogoutResource extends ResourceBase
{

    protected AccountProxyInterface $currentUser;
    protected SessionManagerInterface $sessionManager;
    protected CsrfTokenGenerator $csrfToken;
    protected RequestStack $requestStack;

    public function __construct(
        array $configuration,
        $plugin_id,
        $plugin_definition,
        array $serializer_formats,
        LoggerInterface $logger,
        AccountProxyInterface $current_user,
        SessionManagerInterface $session_manager,
        CsrfTokenGenerator $csrf_token,
        RequestStack $request_stack
    ) {
        // ✅ Pass 5th argument ($logger) to parent
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

        $this->currentUser = $current_user;
        $this->sessionManager = $session_manager;
        $this->csrfToken = $csrf_token;
        $this->requestStack = $request_stack;
    }

    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->getParameter('serializer.formats'),
            $container->get('logger.factory')->get('user_logout_rest_resource'),
            $container->get('current_user'),
            $container->get('session_manager'),
            $container->get('csrf_token'),
            $container->get('request_stack')
        );
    }

    /**
     * POST /api/logout
     * - With header X-CSRF-Token (normal flow), OR
     * - With ?logout_token=... (URL token alternative).
     */
    public function post(): ResourceResponse
    {
        if ($this->currentUser->isAnonymous()) {
            return (new ResourceResponse(['status' => 'ok', 'message' => 'Already logged out.'], 200))
                ->addCacheableDependency(['#cache' => ['max-age' => 0]]);
        }
        // dd($this->csrfToken->get('user.logout'));
        $logoutToken = $this->csrfToken->get('user.logout');

        if ($logoutToken) {
            if (!$this->csrfToken->validate($logoutToken, 'user.logout')) {
                return (new ResourceResponse(['status' => 'error', 'message' => 'Invalid logout token.'], 400))
                    ->addCacheableDependency(['#cache' => ['max-age' => 0]]);
            }
        } else {
            // If you enabled "CSRF request header token" on this REST resource,
            // core will already validate X-CSRF-Token. If not, you can uncomment:
            // $headerToken = $request->headers->get('X-CSRF-Token');
            // if (!$this->csrfToken->validate($headerToken, 'rest')) { ... }
        }

        if ($this->currentUser->isAnonymous()) {
            return (new ResourceResponse(['status' => 'ok', 'message' => 'Already logged out.'], 200))
                ->addCacheableDependency(['#cache' => ['max-age' => 0]]);
        }

        // Correct for Drupal 9/10/11:
        $this->sessionManager->destroy();

        // Optionally, also kill the PHP session cookie for safety:
        $response = new ResourceResponse(['status' => 'ok', 'message' => 'Logged out successfully.'], 200);
        $response->getHeaders()->set('Set-Cookie', sprintf('%s=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; HttpOnly', session_name()));
        $response->addCacheableDependency(['#cache' => ['max-age' => 0]]);
        return $response;
    }
}
