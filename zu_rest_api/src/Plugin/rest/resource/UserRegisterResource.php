<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Psr\Log\LoggerInterface;

/**
 * Provides a REST API for user registration.
 *
 * @RestResource(
 *   id = "user_register_rest_resource",
 *   label = @Translation("User Register"),
 *   uri_paths = {
 *     "create" = "/api/user/register"
 *   }
 * )
 */
class UserRegisterResource extends ResourceBase
{

    protected EntityTypeManagerInterface $entityTypeManager;
    protected RequestStack $requestStack;

    public function __construct(
        array $configuration,
        $plugin_id,
        $plugin_definition,
        array $serializer_formats,
        LoggerInterface $logger,
        EntityTypeManagerInterface $entity_type_manager,
        RequestStack $request_stack
    ) {
        // IMPORTANT: pass the logger to the parent.
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
        $this->entityTypeManager = $entity_type_manager;
        $this->requestStack = $request_stack;
    }

    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->getParameter('serializer.formats'),
            $container->get('logger.factory')->get('user_register_rest_resource'),
            $container->get('entity_type.manager'),
            $container->get('request_stack')
        );
    }

    /**
     * Handles POST request for user registration.
     */
    public function post(): ResourceResponse
    {
        $request = $this->requestStack->getCurrentRequest();
        $data = json_decode($request->getContent() ?? '[]', TRUE) ?: [];

        $name = trim((string) ($data['name'] ?? ''));
        $mail = trim((string) ($data['mail'] ?? ''));
        $pass = (string) ($data['pass'] ?? '');

        // Basic validation.
        if ($name === '' || $mail === '' || $pass === '') {
            return $this->respond(['error' => 'name, mail, and pass are required'], 400);
        }

        // Check existing username/email.
        $storage = $this->entityTypeManager->getStorage('user');
        if ($storage->loadByProperties(['name' => $name])) {
            return $this->respond(['error' => 'Username already exists'], 400);
        }
        if ($storage->loadByProperties(['mail' => $mail])) {
            return $this->respond(['error' => 'Email already registered'], 400);
        }

        try {
            $user = User::create();
            $user->setUsername($name);
            $user->setEmail($mail);
            $user->setPassword($pass);
            $user->enforceIsNew();
            $user->activate();
            $user->save();

            return $this->respond([
                'status' => 'success',
                'message' => 'User registered successfully',
                'uid' => $user->id(),
            ], 201);
        } catch (\Throwable $e) {
            $this->logger->error('User registration failed: @msg', ['@msg' => $e->getMessage()]);
            return $this->respond([
                'status' => 'error',
                'message' => 'Registration failed.',
            ], 500);
        }
    }

    /**
     * Helper to create an uncacheable ResourceResponse.
     */
    protected function respond(array $data, int $status = 200): ResourceResponse
    {
        $response = new ResourceResponse($data, $status);
        // Ensure no caching during API development.
        $response->addCacheableDependency(['#cache' => ['max-age' => 0]]);
        return $response;
    }
}
