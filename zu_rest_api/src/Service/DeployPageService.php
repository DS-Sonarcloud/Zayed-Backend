<?php

namespace Drupal\zu_rest_api\Service;

use Drupal\node\Entity\Node;
use GuzzleHttp\ClientInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;

class DeployPageService
{

    protected $httpClient;
    protected $logger;
    protected string $apiKey;

    public function __construct(
        ClientInterface $http_client,
        LoggerChannelFactoryInterface $logger_factory
    ) {
        $this->httpClient = $http_client;
        $this->logger = $logger_factory->get('zu_rest_api');
        $this->apiKey = $_ENV['drupal_dev_authorization'] ?? '';
    }

    public function getFileNameFromNode(Node $node, string $langcode): string
    {
        $alias_info = $this->getAliasInfo($node, $langcode);
        if (!empty($alias_info['basename'])) {
            return $alias_info['basename'];
        }

        $title = strtolower(strip_tags($node->label()));
        $title = preg_replace('/[^a-z0-9]+/', '-', $title);
        $title = preg_replace('/-+/', '-', $title);
        $title = trim($title, '-');

        return $title ?: 'node-' . $node->id();
    }

    protected function normalizeAliasString(string $alias, string $langcode): string
    {
        $alias = trim($alias);
        if ($alias === '') {
            return '';
        }

        if (!str_starts_with($alias, '/')) {
            $alias = '/' . $alias;
        }

        $alias = trim($alias, '/');
        if ($alias === $langcode) {
            return '';
        }

        if (str_starts_with($alias, $langcode . '/')) {
            $alias = substr($alias, strlen($langcode) + 1);
        }

        return trim($alias, '/');
    }

    protected function getAliasInfoFromAliasString(string $alias, string $langcode): array
    {
        $alias = $this->normalizeAliasString($alias, $langcode);
        if ($alias === '') {
            return ['dir' => '', 'basename' => ''];
        }

        $parts = explode('/', $alias);
        $basename = array_pop($parts);
        $dir = implode('/', $parts);

        return ['dir' => $dir, 'basename' => $basename];
    }

    protected function normalizeFileName(string $name): string
    {
        return preg_replace('/\.json$/i', '', $name);
    }

    protected function expandNodeDestinationUris(Node $node): array
    {
        $internal_path = 'node/' . $node->id();
        return array_unique([
            "internal:/$internal_path",
            "internal:$internal_path",
            "entity:/$internal_path",
            "entity:$internal_path",
        ]);
    }

    protected function findPreviousAliasFromRedirect(Node $node, string $langcode, string $current_alias_norm): string
    {
        try {
            $storage = \Drupal::entityTypeManager()->getStorage('redirect');
            $uris = $this->expandNodeDestinationUris($node);

            $ids = $storage->getQuery()
                ->accessCheck(TRUE)
                ->condition('redirect_redirect.uri', $uris, 'IN')
                ->condition('type', 'redirect', 'IN')
                ->sort('created', 'DESC')
                ->range(0, 20)
                ->execute();

            if (empty($ids)) {
                return '';
            }

            $redirects = $storage->loadMultiple($ids);
            $best_301 = '';
            $best_any = '';

            foreach ($redirects as $redirect) {
                $redirect_url = $redirect->getRedirectUrl();
                $check_langcode = '';
                if ($redirect_url) {
                    $target_lang = $redirect_url->getOption('language');
                    if ($target_lang instanceof \Drupal\Core\Language\LanguageInterface) {
                        $check_langcode = $target_lang->getId();
                    } elseif (is_string($target_lang)) {
                        $check_langcode = $target_lang;
                    }
                }

                if ($check_langcode && $check_langcode !== $langcode) {
                    continue;
                }

                $source_path = $redirect->getSourcePathWithQuery();
                if (empty($source_path)) {
                    continue;
                }

                $source_path = strtok($source_path, '?') ?: $source_path;
                $source_norm = $this->normalizeAliasString($source_path, $langcode);
                if ($source_norm === '' || $source_norm === $current_alias_norm) {
                    continue;
                }

                $status_code = (int) ($redirect->get('status_code')->value ?? 0);
                if ($status_code === 301 && $best_301 === '') {
                    $best_301 = $source_norm;
                }

                if ($best_any === '') {
                    $best_any = $source_norm;
                }
            }

            return $best_301 ?: $best_any;
        } catch (\Exception $e) {
            $this->logger->error('Redirect lookup failed: ' . $e->getMessage());
            return '';
        }
    }

    protected function getAliasInfo(Node $node, string $langcode): array
    {
        $path_alias_manager = \Drupal::service('path_alias.manager');
        $alias = $path_alias_manager->getAliasByPath('/node/' . $node->id(), $langcode);

        if (empty($alias) || $alias === '/node/' . $node->id()) {
            return ['dir' => '', 'basename' => ''];
        }

        return $this->getAliasInfoFromAliasString($alias, $langcode);
    }

    protected function getAliasFromNode(?Node $node, string $langcode): string
    {
        if (!$node) {
            return '';
        }
        if ($node->hasTranslation($langcode)) {
            $node = $node->getTranslation($langcode);
        }
        if ($node->hasField('path') && !$node->get('path')->isEmpty()) {
            $alias = $node->get('path')->alias ?? '';
            return is_string($alias) ? $alias : '';
        }
        return '';
    }

    protected function resolvePathContext(Node $node): array
    {
        $host_name = strtolower(\Drupal::request()->getHost());
        if ($node->hasField('field_domain_access') && !$node->get('field_domain_access')->isEmpty()) {
            $domainEntity = $node->get('field_domain_access')->entity;
            if ($domainEntity && !empty($domainEntity->hostname)) {
                $host_name = strtolower(trim($domainEntity->hostname));
            }
        }

        $subsite_folder = '';
        if ($node->hasField('field_site') && !$node->get('field_site')->isEmpty()) {
            $subsite_folder = strtolower($node->field_site->entity->name->value);
        }

        $author = \Drupal\user\Entity\User::load($node->getOwnerId());
        $author_roles = $author ? $author->getRoles() : [];

        $database = \Drupal::database();
        $mapped_folder = null;

        try {
            $records = $database->select('zu_multidomain', 'z')
                ->fields('z', ['folder_name', 'roles'])
                ->execute()
                ->fetchAll();

            foreach ($records as $record) {
                $record_roles = array_filter(array_map('trim', explode(',', $record->roles)));
                if (array_intersect($record_roles, $author_roles)) {
                    $mapped_folder = trim($record->folder_name);
                    break;
                }
            }
        } catch (\Exception $e) {
            $this->logger->error('Folder lookup failed: ' . $e->getMessage());
        }

        $pathPrefix = !empty($mapped_folder)
            ? '/' . $mapped_folder
            : '/' . $host_name;

        $langcode = $node->language()->getId();

        return [
            'pathPrefix' => $pathPrefix,
            'langcode' => $langcode,
            'subsite_folder' => $subsite_folder,
        ];
    }

    protected function buildPathName(string $pathPrefix, string $langcode, string $subsite_folder, string $alias_dir): string
    {
        $pathName = rtrim($pathPrefix, '/') . '/' . trim($langcode, '/');
        if (!empty($subsite_folder)) {
            $pathName .= '/' . trim($subsite_folder, '/');
        }
        if (!empty($alias_dir)) {
            $pathName .= '/' . trim($alias_dir, '/');
        }
        return $pathName;
    }

    protected function buildDeletePayloadIfAliasChanged(Node $node): ?array
    {
        if (!isset($node->original) || !$node->original instanceof Node) {
            return null;
        }

        $langcode = $node->language()->getId();
        $old_alias_raw = $this->getAliasFromNode($node->original, $langcode);
        $new_alias_raw = $this->getAliasFromNode($node, $langcode);

        $old_norm = $this->normalizeAliasString($old_alias_raw, $langcode);
        $new_norm = $this->normalizeAliasString($new_alias_raw, $langcode);

        if ($old_norm === '' || $old_norm === $new_norm) {
            $redirect_old = $this->findPreviousAliasFromRedirect($node, $langcode, $new_norm);
            if (!empty($redirect_old)) {
                $old_norm = $redirect_old;
            }
        }

        if ($old_norm === '' || $old_norm === $new_norm) {
            return null;
        }

        $old_alias_info = $this->getAliasInfoFromAliasString($old_norm, $langcode);
        if (empty($old_alias_info['basename'])) {
            return null;
        }

        $context = $this->resolvePathContext($node);
        $pathName = $this->buildPathName(
            $context['pathPrefix'],
            $context['langcode'],
            $context['subsite_folder'],
            $old_alias_info['dir'] ?? ''
        );

        return [
            'pathName' => $pathName,
            'fileName' => $this->normalizeFileName($old_alias_info['basename']),
        ];
    }

    /**
     * Build delete payloads for all translations of a node.
     *
     * @return array[]
     *   Array of payloads with pathName + fileName.
     */
    public function buildDeletePayloads(Node $node, array $alias_map = []): array
    {
        $context = $this->resolvePathContext($node);
        $pathPrefix = $context['pathPrefix'];
        $subsite_folder = $context['subsite_folder'];

        $payloads = [];
        $langs = array_keys($node->getTranslationLanguages());
        if (empty($langs)) {
            $langs = [$node->language()->getId()];
        }

        foreach ($langs as $langcode) {
            $node_lang = $node->hasTranslation($langcode) ? $node->getTranslation($langcode) : $node;
            $alias_raw = $this->getAliasFromNode($node_lang, $langcode);
            if (empty($alias_raw)) {
                $alias_raw = $alias_map[$langcode] ?? '';
            }
            if (empty($alias_raw)) {
                $alias_raw = \Drupal::service('path_alias.manager')->getAliasByPath('/node/' . $node->id(), $langcode);
            }
            $alias_info = !empty($alias_raw)
                ? $this->getAliasInfoFromAliasString($alias_raw, $langcode)
                : $this->getAliasInfo($node_lang, $langcode);
            $alias_dir = $alias_info['dir'] ?? '';
            $filename = $alias_info['basename'] ?? '';
            if (empty($filename)) {
                $filename = $this->getFileNameFromNode($node_lang, $langcode);
            }
            $filename = $this->normalizeFileName($filename);
            if (empty($filename)) {
                continue;
            }
            $payloads[] = [
                'pathName' => $this->buildPathName($pathPrefix, $langcode, $subsite_folder, $alias_dir),
                'fileName' => $filename,
            ];
        }
        return $payloads;
    }

    /**
     * Delete deployed JSON for a node.
     */
    public function deletePage(Node $node, array $alias_map = []): void
    {
        $deploy_api_service = \Drupal::service('zu_rest_api.deploy_api_service');
        $payloads = $this->buildDeletePayloads($node, $alias_map);
        foreach ($payloads as $payload) {
            try {
                $deploy_api_service->sendDeleteRequest($payload);
            } catch (\Exception $e) {
                $this->logger->error('Failed to delete page JSON: @message', [
                    '@message' => $e->getMessage(),
                ]);
            }
        }
    }

    public function buildPagePayload(Node $node): array
    {
        \Drupal::service('pathauto.generator')->updateEntityAlias($node, 'update');
        $context = $this->resolvePathContext($node);
        $pathPrefix = $context['pathPrefix'];
        $langcode = $context['langcode'];
        $subsite_folder = $context['subsite_folder'];
        $uuid     = $node->id();
        $title    = $node->label();
        $body     = $node->get('body')->value ?? '';
        $status   = $node->isPublished() ? 'publish' : 'unpublished';

        $alias_info = $this->getAliasInfo($node, $langcode);
        $alias_dir = $alias_info['dir'] ?? '';
        $filename = $this->getFileNameFromNode($node, $langcode);

        $pathName = $this->buildPathName($pathPrefix, $langcode, $subsite_folder, $alias_dir);

        $content = [
            "page_drupal_layoutbuilder_data" => [
                "status" => $status,
                "elements" => [
                    [
                        "page_nid" => $uuid,
                        "elType"   => "basic_block",
                        "title"    => $title,
                        "body"     => $body,
                    ]
                ]
            ],
            "deploy_endpoint" => $_ENV["FRONTEND_API_BASE_URL"] . $_ENV["FRONTEND_DEPLOY_API_ENDPOINT"]
        ];
        return [
            "pathName" => $pathName,
            "fileName" => $filename,
            "content"  => $content,
        ];
    }


    public function deployPage(Node $node)
    {
        if (empty($this->apiKey)) {
            $this->logger->error('Cannot deploy page @nid: Missing API Key (drupal_dev_authorization)', [
                '@nid' => $node->id(),
            ]);
            \Drupal::messenger()->addError('Failed to deploy page: API key not configured.');
            return;
        }

        $delete_payload = $this->buildDeletePayloadIfAliasChanged($node);
        $payload = $this->buildPagePayload($node);
        $deploy_api_service = \Drupal::service('zu_rest_api.deploy_api_service');
        if (!empty($delete_payload)) {
            $delete_response = $deploy_api_service->sendDeleteRequest($delete_payload);
            if ($delete_response === null) {
                $this->logger->warning('Delete old page JSON failed for node @nid.', [
                    '@nid' => $node->id(),
                ]);
            }
        }
        $response = $deploy_api_service->sendDeployRequest($payload);
        if ($response) {
            \Drupal::messenger()->addStatus('Basic Page deployment successfully.');
        } else {
            \Drupal::messenger()->addError('Failed to trigger Basic Page deployment.');
        }
    }
}
