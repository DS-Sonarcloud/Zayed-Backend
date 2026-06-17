<?php

namespace Drupal\zu_rest_api\Service;

use GuzzleHttp\ClientInterface;
use Psr\Log\LoggerInterface;

class ConstantService
{

    protected ClientInterface $httpClient;
    protected LoggerInterface $logger;

    public function __construct(ClientInterface $http_client, LoggerInterface $logger)
    {
        $this->httpClient = $http_client;
        $this->logger = $logger;
    }

    public function getConstant($constantName)
    {
        $constants = [
            'FRONTEND_API_BASE_URL' => $_ENV["FRONTEND_API_BASE_URL"] ?? 'https://example.com',
            'BACKEND_API_BASE_URL' => $_ENV["BACKEND_API_BASE_URL"] ?? 'https://example.com',
            'FRONTEND_DEPLOY_API_ENDPOINT' => $_ENV["FRONTEND_DEPLOY_API_ENDPOINT"] ?? '/api/deploy',
            'FRONTEND_DEPLOY_DELETE_API_ENDPOINT' => $_ENV["FRONTEND_DEPLOY_DELETE_API_ENDPOINT"] ?? '/api/deploy/delete',
            'FRONTEND_DEPLOY_API_ASSETS_ENDPOINT' => $_ENV["FRONTEND_DEPLOY_API_ASSETS_ENDPOINT"] ?? '/api/assets',
            'FRONTEND_DEPLOY_API_SETTING_ENDPOINT' => $_ENV["FRONTEND_DEPLOY_API_SETTING_ENDPOINT"] ?? '/api/site-settings',
            'drupal_dev_authorization' => $_ENV["drupal_dev_authorization"] ?? 'ZGV2OlMwcnQxbjAxMTEk',
            'FRONTEND_API_TIMEOUT' => $_ENV["FRONTEND_API_TIMEOUT"] ?? 30,
        ];

        if (isset($constants[$constantName])) {
            return $constants[$constantName];
        } else {
            $this->logger->error("Constant {$constantName} not found.");
            return null;
        }


    }
}
