<?php

namespace Drupal\zu_rest_api\Service;

use GuzzleHttp\ClientInterface;
use Psr\Log\LoggerInterface;

class DeployApiService
{

    protected ClientInterface $httpClient;
    protected LoggerInterface $logger;
    protected ConstantService $constantService;

    public function __construct(ClientInterface $http_client, LoggerInterface $logger, ConstantService $constant_service)
    {
        $this->httpClient = $http_client;
        $this->logger = $logger;
        $this->constantService = $constant_service;
    }

    /**
     * Sends deployment payload to the remote API.
     *
     * @param array $payload
     *   The data to send as JSON.
     *
     * @return array|null
     *   The decoded JSON response, or NULL on failure.
     */
    public function sendDeployRequest(array $payload): ?array
    {
        $base_url = $this->constantService->getConstant('FRONTEND_API_BASE_URL');
        $endpoint = $this->constantService->getConstant('FRONTEND_DEPLOY_API_ENDPOINT');
        $api_key = $this->constantService->getConstant('drupal_dev_authorization');
        $timeout = $this->constantService->getConstant('FRONTEND_API_TIMEOUT') ?? 30;
        if (empty($base_url) || empty($endpoint) || empty($api_key)) {
            $this->logger->error(
                'Deploy API config missing. base_url=@base endpoint=@endpoint api_key_present=@key',
                [
                    '@base' => $base_url ?? 'NULL',
                    '@endpoint' => $endpoint ?? 'NULL',
                    '@key' => empty($api_key) ? 'NO' : 'YES',
                ]
            );
            return null;
        }
        try {
            $response = $this->httpClient->request(
                'POST',
                rtrim($base_url, '/') . $endpoint,
                [
                    'headers' => [
                        'Accept' => 'application/json',
                        'x-api-key' => $api_key,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $payload,
                    'timeout' => (int) $timeout,
                ]
            );

            $body = $response->getBody()->getContents();

            return json_decode($body, true);
        } catch (\Exception $e) {
            $this->logger->error('Deploy API request failed: @message', ['@message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Sends delete payload to the remote API.
     *
     * @param array $payload
     *   The data to send as JSON (pathName, fileName).
     *
     * @return array|null
     *   The decoded JSON response, or NULL on failure.
     */
    public function sendDeleteRequest(array $payload): ?array
    {
        $base_url = $this->constantService->getConstant('FRONTEND_API_BASE_URL');
        $endpoint = $this->constantService->getConstant('FRONTEND_DEPLOY_DELETE_API_ENDPOINT');
        $api_key = $this->constantService->getConstant('drupal_dev_authorization');
        $timeout = $this->constantService->getConstant('FRONTEND_API_TIMEOUT') ?? 30;

        if (empty($base_url) || empty($endpoint) || empty($api_key)) {
            $this->logger->error(
                'Deploy delete API config missing. base_url=@base endpoint=@endpoint api_key_present=@key',
                [
                    '@base' => $base_url ?? 'NULL',
                    '@endpoint' => $endpoint ?? 'NULL',
                    '@key' => empty($api_key) ? 'NO' : 'YES',
                ]
            );
            return null;
        }

        try {
            $response = $this->httpClient->request(
                'DELETE',
                rtrim($base_url, '/') . $endpoint,
                [
                    'headers' => [
                        'Accept' => 'application/json',
                        'x-api-key' => $api_key,
                        'Content-Type' => 'application/json',
                    ],
                    'json' => $payload,
                    'timeout' => (int) $timeout,
                ]
            );

            $body = $response->getBody()->getContents();
            return json_decode($body, true);
        } catch (\Exception $e) {
            $this->logger->error('Deploy delete API request failed: @message', ['@message' => $e->getMessage()]);
            return null;
        }
    }

    public function getJSONRequest(string $url): ?array
    {
        try {
            $api_key = $this->constantService->getConstant('drupal_dev_authorization');
            $response = $this->httpClient->request('GET', $url, [
                'headers' => [
                    'Authorization' => $api_key,
                    'Content-Type' => 'application/json',
                ],
                'timeout' => 30,
                'connect_timeout' => 10,
            ]);

            $body = $response->getBody()->getContents();

            return json_decode($body, true);
        } catch (\Exception $e) {
            $this->logger->error('Deploy API request failed: @message', ['@message' => $e->getMessage()]);
            return null;
        }
    }
}
