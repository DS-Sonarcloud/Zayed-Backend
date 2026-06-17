<?php

/**
 * @file
 * Contains \Drupal\drupal_layoutbuilder\DrupalLayoutbuilderPageExporter.
 */

namespace Drupal\drupal_layoutbuilder;

use Drupal\node\Entity\Node;
use Drupal\image\Entity\ImageStyle;
use \Drupal\file\Entity\File;
use GuzzleHttp\Exception\RequestException;

class DrupalLayoutbuilderPageExporter
{
  /**
   * Deploy-related values with the same fallbacks as zu_rest_api ConstantService.
   *
   * Raw $_ENV access produced empty URLs and cURL error 3 when Dotenv/server
   * env was not populated (see dblog: FRONTEND_API_BASE_URL undefined).
   */
  protected static function deployConstant(string $name): string {
    
    if (\Drupal::hasService('zu_rest_api.constant')) {
      $value = \Drupal::service('zu_rest_api.constant')->getConstant($name);
      if ($value !== NULL && $value !== '') {
        return (string) $value;
      }
    }
    $from_env = $_ENV[$name] ?? getenv($name);
    return ($from_env !== FALSE && $from_env !== NULL && $from_env !== '') ? (string) $from_env : '';
  }

  /**
   * Builds the frontend origin for deploy/delete for a given content language.
   *
   * Strips the site default language segment from FRONTEND_API_BASE_URL (e.g.
   * /en) so English hits https://host/api/...; other languages use https://host/ar/...
   */
  protected static function deployFrontendBaseForLangcode(string $langcode): string {
    $langcode = strtolower(trim($langcode));
    $base = rtrim(self::deployConstant('FRONTEND_API_BASE_URL'), '/');
    $default_id = strtolower(trim(\Drupal::languageManager()->getDefaultLanguage()->getId()));
    $default_suffix = '/' . $default_id;

    if ($langcode === $default_id) {
      if (str_ends_with($base, $default_suffix)) {
        $base = substr($base, 0, -strlen($default_suffix));
      }
      return rtrim($base, '/') ?: $base;
    }

    if (str_ends_with($base, $default_suffix)) {
      $base = substr($base, 0, -strlen($default_suffix));
    }
    $base = rtrim($base, '/');
    $lang_suffix = '/' . $langcode;
    if (!str_ends_with($base, $lang_suffix)) {
      $base .= $lang_suffix;
    }
    return $base;
  }

  /**
   * Exports the node and page JSON as a single structured array or JSON.
   */
  public static function export($nid, $layoutbuilder_page_data)
  {
    // Defensive: callers may still pass stdClass (json_decode without true). Same as legacy
    // ElementorPageExporter::export() which had no array type hint.
    if (is_object($layoutbuilder_page_data)) {
      $layoutbuilder_page_data = json_decode(json_encode($layoutbuilder_page_data), true);
    }
    if (!is_array($layoutbuilder_page_data)) {
      $layoutbuilder_page_data = [];
    }

    $node = Node::load($nid);
    if ($node) {
      if (!$node->isPublished()) {
        \Drupal::logger('zu_rest_api')->warning('Deploy blocked: node @nid is unpublished.', ['@nid' => $nid]);
        return [
          'success' => false,
          'message' => 'Unable to deploy: page is not published.',
        ];
      }
      $data = [];
      $page_arr = [];
      // Basic node info
      $data['nid'] = $node->id();
      $data['uuid'] = $node->uuid();
      $data['type'] = $node->getType();
      $data['title'] = $node->label();
      $data['status'] = $node->isPublished();
      $data['created'] = $node->getCreatedTime();
      $data['changed'] = $node->getChangedTime();

      foreach ($node->getFields() as $field_name => $field) {
        $field_values = [];

        foreach ($field as $item) {
          $value = $item->getValue();

          // Handle 'metatag' field's JSON in content
          if ($field_name === 'metatag' && isset($value['attributes']['content']) && is_string($value['attributes']['content'])) {
            $decoded = json_decode($value['attributes']['content'], true);
            if (json_last_error() === JSON_ERROR_NONE && (is_array($decoded) || is_object($decoded))) {
              $value['attributes']['content'] = $decoded;
            }
          }

          // Handle 'body' field's JSON in value
          if ($field_name === 'body' && isset($value['value']) && is_string($value['value'])) {
            $decoded = json_decode($value['value'], true);
            if (json_last_error() === JSON_ERROR_NONE && (is_array($decoded) || is_object($decoded))) {
              $value['value'] = $decoded;
            }
          }

          // If only 'value' key exists, flatten it
          if (is_array($value) && count($value) === 1 && array_key_exists('value', $value)) {
            $field_values[] = $value['value'];
          } else {
            $field_values[] = $value;
          }
        }

        // If only one item, flatten the whole field
        $data[$field_name] = count($field_values) === 1 ? $field_values[0] : $field_values;
      }

      // Use page_drupal_layoutbuilder_data so deploy/frontends match the legacy Elementor JSON contract.
      $page_arr = [
        'page_drupal_layoutbuilder_data' => $layoutbuilder_page_data,
        'page_nid' => $nid,
        'node_data' => $data, // make sure $data is also an array, not a JSON string
      ];

      // Now encode once
      $page_json = json_encode($page_arr, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

      return self::generate_page_json($node, $page_json);
    }
  }

  public static function updateImageUrlsRecursively(array &$elements)
  {
    if ($elements === []) {
      return;
    }
    foreach ($elements as &$element) {
      if (!is_array($element)) {
        continue;
      }
      // If widget has settings with image + image_size
      if (isset($element['settings']['image']['url']) || isset($element['settings']['wp_gallery']) || isset($element['settings']['testimonial_image']['url'])) {
        $url = $element['settings']['image']['url'];
        $id = $element['settings']['image']['id'];

        $size = $element['settings']['image_size'] ?? $element['settings']['thumbnail_size'] ?? 'large';
        $wp_gallery_url = $element['settings']['wp_gallery'];
        if ($element['widgetType'] == "image-box") {
          $id = $element['settings']['image']['id'];
          $size = $element['settings']['thumbnail_size'];
          $element['settings']['image']['url'] = DrupalLayoutbuilderPageExporter::addSizeToUrl($id, $size);
        } else if (is_array($wp_gallery_url) && $element['widgetType'] == "image-gallery") {
          foreach ($wp_gallery_url as $key => $value) {
            $element['settings']['wp_gallery'][$key]["url"] = DrupalLayoutbuilderPageExporter::addSizeToUrl($value['id'], $size);
          }
        } else if ($element['widgetType'] == "testimonial") {
          $element['settings']['testimonial_image']['url'] = DrupalLayoutbuilderPageExporter::addSizeToUrl($element['settings']['testimonial_image']['id'], $element['settings']['testimonial_image_size']);
        } else {
          $element['settings']['image']['url'] = DrupalLayoutbuilderPageExporter::addSizeToUrl($id, $size);
        }
      }

      // If this element has child elements -> recurse
      if (isset($element['elements']) && is_array($element['elements'])) {
        DrupalLayoutbuilderPageExporter::updateImageUrlsRecursively($element['elements']);
      }
    }
  }

  public static function addSizeToUrl($image_id, $image_size)
  {
    static $styles_by_id = null;
    if ($styles_by_id === null) {
      $styles_by_id = ImageStyle::loadMultiple();
    }

    $style = $styles_by_id[$image_size] ?? null;
    if (!$style) {
      return null;
    }

    // Load the file entity using image_id
    $file = File::load($image_id);
    if ($file) {
      $file_uri = $file->getFileUri();

      // Styled file path
      $styled_path = $style->buildUri($file_uri);

      // Generate derivative if it doesn't exist
      if (!file_exists($styled_path)) {
        $style->createDerivative($file_uri, $styled_path);
      }

      // Styled image URL
      $styled_url = $style->buildUrl($file_uri);

      // Optionally width/height check
      if (file_exists($styled_path)) {
        $info = getimagesize($styled_path);
        $width = $info[0];
        $height = $info[1];
      }
      return $styled_url;
    }
  }

  protected static function normalizeAliasString(string $alias, string $langcode): string
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

  protected static function getAliasInfoFromAliasString(string $alias, string $langcode): array
  {
    $alias = self::normalizeAliasString($alias, $langcode);
    if ($alias === '') {
      return ['dir' => '', 'basename' => ''];
    }

    $parts = explode('/', $alias);
    $basename = array_pop($parts);
    $dir = implode('/', $parts);

    return ['dir' => $dir, 'basename' => $basename];
  }

  protected static function normalizeFileName(string $name): string
  {
    return preg_replace('/\.json$/i', '', $name);
  }

  protected static function expandNodeDestinationUris(Node $node): array
  {
    $internal_path = 'node/' . $node->id();
    return array_unique([
      "internal:/$internal_path",
      "internal:$internal_path",
      "entity:/$internal_path",
      "entity:$internal_path",
    ]);
  }

  protected static function findPreviousAliasFromRedirect(Node $node, string $langcode, string $current_alias_norm): string
  {
    try {
      $storage = \Drupal::entityTypeManager()->getStorage('redirect');
      $uris = self::expandNodeDestinationUris($node);

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
        $source_norm = self::normalizeAliasString($source_path, $langcode);
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
      \Drupal::logger('drupal_layoutbuilder')->error('Redirect lookup failed: @msg', ['@msg' => $e->getMessage()]);
      return '';
    }
  }

  protected static function buildDeployPath(string $pathPrefix, string $langcode, string $subsite_folder, string $alias_dir): string
  {
    $path = rtrim($pathPrefix, '/') . '/' . trim($langcode, '/');
    if (!empty($subsite_folder)) {
      $path .= '/' . trim($subsite_folder, '/');
    }
    if (!empty($alias_dir)) {
      $path .= '/' . trim($alias_dir, '/');
    }
    return $path;
  }

  protected static function getMultidomainRecords(): array
  {
    static $records = null;
    if ($records !== null) {
      return $records;
    }

    try {
      $records = \Drupal::database()->select('zu_multidomain', 'z')
        ->fields('z', ['folder_name', 'roles'])
        ->execute()
        ->fetchAll();
    } catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error('zu_multidomain lookup failed: @msg', ['@msg' => $e->getMessage()]);
      $records = [];
    }

    return $records;
  }

  protected static function deleteOldAliasJson(Node $node, string $langcode, string $current_alias_norm, string $pathPrefix, string $subsite_folder): void
  {
    if ($current_alias_norm === '') {
      return;
    }

    $old_alias_norm = self::findPreviousAliasFromRedirect($node, $langcode, $current_alias_norm);
    if ($old_alias_norm === '') {
      return;
    }

    self::deleteAliasJsonByPath($node, $langcode, $old_alias_norm, $pathPrefix, $subsite_folder);
  }

  public static function deleteAliasJsonByPath(Node $node, string $langcode, string $alias_raw, string $pathPrefix, string $subsite_folder): void
  {
    if (empty($alias_raw)) {
      return;
    }

    $old_info = self::getAliasInfoFromAliasString($alias_raw, $langcode);
    if (empty($old_info['basename'])) {
      return;
    }

    $delete_endpoint = self::deployFrontendBaseForLangcode($langcode) . self::deployConstant('FRONTEND_DEPLOY_DELETE_API_ENDPOINT');
    $payload = [
      'pathName' => self::buildDeployPath($pathPrefix, $langcode, $subsite_folder, $old_info['dir'] ?? ''),
      'fileName' => self::normalizeFileName($old_info['basename']),
    ];

    try {
      $client = \Drupal::httpClient();
      $client->delete($delete_endpoint, [
        'headers' => [
          'Accept'        => 'application/json',
          'x-api-key' => self::deployConstant('drupal_dev_authorization'),
          'Content-Type'  => 'application/json',
        ],
        'body' => json_encode($payload),
      ]);
      \Drupal::logger('zu_rest_api')->info("Deleted {$payload['fileName']} from {$payload['pathName']} (Elementor alias change)");
    } catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error('Elementor delete API failed: @message', ['@message' => $e->getMessage()]);
    }
  }

  // Generates the page JSON file in the specified directory structure.
  // The directory structure is based on the domain, language, content type, and year.
  // The file is named based on the node slug or node ID if slug is not available.
  // The function handles directory creation and error logging.
  // It returns nothing, but writes the JSON content to a file.
  public static function generate_page_json($node, $page_json)
  {
    $page_json = str_replace(
      ['"_background_hover_transition":{"unit":"px"', '"background_hover_transition":{"unit":"px"'],
      ['"_background_hover_transition":{"unit":"s"', '"background_hover_transition":{"unit":"s"'],
      $page_json
    );

    $file_system = new \Symfony\Component\Filesystem\Filesystem();

    $host_name = strtolower(\Drupal::request()->getHost()); // fallback

    if ($node->hasField('field_domain_access') && !$node->get('field_domain_access')->isEmpty()) {
      $domain = $node->get('field_domain_access')->entity;
      if ($domain && !empty($domain->hostname)) {
        $host_name = strtolower(trim($domain->hostname));
      }
    }

    $langcode = strtolower(trim($node->language()->getId()));
    $created_year = date('Y', $node->getCreatedTime());

    // Slug
    $alias = \Drupal::service('path_alias.manager')->getAliasByPath('/node/' . $node->id(), $langcode);
    $slug = trim($alias, '/') ?: 'node-' . $node->id();

    // Directory path
    $base_dir = DRUPAL_ROOT . '/../zu_front_pages/' . $host_name;
    $lang_dir = $base_dir . '/' . $langcode;
    $year_dir = $lang_dir . '/' . $created_year;
    foreach ([$base_dir, $lang_dir, $year_dir] as $dir) {
      if (!$file_system->exists($dir)) {
        $file_system->mkdir($dir);
      }
    }

    $filename = basename($slug) ?: 'node-' . $node->id();
    $alias_is_default = ($alias === '/node/' . $node->id());
    $alias_info = $alias_is_default ? ['dir' => '', 'basename' => ''] : self::getAliasInfoFromAliasString($alias, $langcode);
    $alias_dir = $alias_info['dir'] ?? '';
    $current_alias_norm = $alias_is_default ? '' : self::normalizeAliasString($alias, $langcode);
    $subsite_folder = '';
    if ($node->hasField('field_site') && !$node->get('field_site')->isEmpty()) {
      $subsite_folder = strtolower($node->field_site[0]->entity->name->value);
    }

    $json_path = $filename;

    $author_id = $node->getOwnerId();
    $author = \Drupal\user\Entity\User::load($author_id);
    $author_roles = $author ? $author->getRoles() : [];

    $mapped_folder = NULL;
    $records = self::getMultidomainRecords();
    foreach ($records as $record) {
      $record_roles = array_filter(array_map('trim', explode(',', $record->roles)));
      if ($match = array_intersect($author_roles, $record_roles)) {
        $mapped_folder = trim($record->folder_name);
        break;
      }
    }

    // Determine correct deploy path
    if (!empty($mapped_folder)) {
      $pathPrefix = '/' . $mapped_folder;
    } else {
      $pathPrefix = '/' . $host_name;
    }
    $path_to_front_api = self::buildDeployPath($pathPrefix, $langcode, $subsite_folder, $alias_dir);

    try {
      file_put_contents($year_dir . '/' . $json_path . '.json', $page_json);

      $deploy_endpoint = self::deployFrontendBaseForLangcode($langcode) . self::deployConstant('FRONTEND_DEPLOY_API_ENDPOINT');

      // Delete old file if alias changed
      self::deleteOldAliasJson($node, $langcode, $current_alias_norm, $pathPrefix, $subsite_folder);

      // Decode + update image URLs on layout elements only (same shape as
      // DrupalLayoutbuilderSdk::set_data). Passing the full export wrapper
      // mixed node metadata with widgets and could trigger fatals / bad data.
      $page_json = json_decode($page_json, true);
      if (!is_array($page_json)) {
        \Drupal::logger('zu_rest_api')->error('Deploy: JSON decode failed after local write for node @nid.', ['@nid' => $node->id()]);
        return [
          'payload' => NULL,
          'response' => 'Deploy failed: could not decode page JSON for API payload.',
        ];
      }
      $layoutKey = NULL;
      if (!empty($page_json['page_drupal_layoutbuilder_data']['elements']) && is_array($page_json['page_drupal_layoutbuilder_data']['elements'])) {
        $layoutKey = 'page_drupal_layoutbuilder_data';
      }
      elseif (!empty($page_json['page_drupal_layoutbuilder_data']['elements']) && is_array($page_json['page_drupal_layoutbuilder_data']['elements'])) {
        $layoutKey = 'page_drupal_layoutbuilder_data';
      }
      if ($layoutKey !== NULL) {
        $layoutElements = &$page_json[$layoutKey]['elements'];
        DrupalLayoutbuilderPageExporter::updateImageUrlsRecursively($layoutElements);
      }
      $page_json['deploy_endpoint'] = $deploy_endpoint;

      $payload = [
        'pathName' => $path_to_front_api,
        'fileName' => $json_path,
        'content' => $page_json,
      ];

      $client = \Drupal::httpClient();
      $response_arr = [
        'payload' => $payload,
        'response' => NULL,
      ];

      $request_body = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
      if ($request_body === FALSE) {
        \Drupal::logger('zu_rest_api')->error('Deploy: json_encode(payload) failed for node @nid: @err', [
          '@nid' => $node->id(),
          '@err' => json_last_error_msg(),
        ]);
        $response_arr['response'] = 'Deploy failed: could not JSON-encode payload for the deploy API.';
        return $response_arr;
      }
      try {
        $response = $client->post($deploy_endpoint, [
          'headers' => [
            'Accept' => 'application/json',
            'x-api-key' => self::deployConstant('drupal_dev_authorization'),
            'Content-Type' => 'application/json',
          ],
          'body' => $request_body,
        ]);

        $response_arr['response'] = (string) $response->getBody();

        if (!empty($mapped_folder)) {
          \Drupal::logger('zu_rest_api')->info("Elementor page '{$slug}' deployed to role based folder: {$mapped_folder}");
        } else {
          \Drupal::logger('zu_rest_api')->info("Elementor page '{$slug}' deployed to default host folder: {$host_name}");
        }
      } catch (RequestException $e) {
        \Drupal::logger('zu_rest_api')->error('Deploy API failed: @message', ['@message' => $e->getMessage()]);
        $response_arr['response'] = $e->getMessage();
      }

      return $response_arr;
    } catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error('Failed to write JSON: ' . $json_path . '. Error: ' . $e->getMessage());
    }
  }
  public static function delete_page_json($node)
  {
    \Drupal::service('pathauto.generator')->updateEntityAlias($node, 'update');
    $host_name = strtolower(\Drupal::request()->getHost());

    if ($node->hasField('field_domain_access') && !$node->get('field_domain_access')->isEmpty()) {
      $domain = $node->get('field_domain_access')->entity;
      if ($domain && !empty($domain->hostname)) {
        $host_name = strtolower(trim($domain->hostname));
      }
    }

    $subsite_folder = '';
    if ($node->hasField('field_site') && !$node->get('field_site')->isEmpty()) {
      $subsite_folder = strtolower($node->field_site[0]->entity->name->value);
    }
    $path_alias_manager = \Drupal::service('path_alias.manager');

    $langcodes = array_keys($node->getTranslationLanguages());
    if (empty($langcodes)) {
      $langcodes = [$node->language()->getId()];
    }

    $author = \Drupal\user\Entity\User::load($node->getOwnerId());
    $author_roles = $author ? $author->getRoles() : [];

    $mapped_folder = NULL;
    $records = self::getMultidomainRecords();
    foreach ($records as $record) {
      $record_roles = array_filter(array_map('trim', explode(',', $record->roles)));
      if (array_intersect($record_roles, $author_roles)) {
        $mapped_folder = trim($record->folder_name);
        break;
      }
    }

    $pathPrefix = !empty($mapped_folder)
      ? '/' . $mapped_folder
      : '/' . $host_name;

    $payloads = [];
    $payload_langcodes = [];
    $predelete_aliases = \Drupal::request()->attributes->get('drupal_layoutbuilder_deleted_aliases_' . $node->id(), []);

    foreach ($langcodes as $langcode) {
      $node_lang = $node->hasTranslation($langcode) ? $node->getTranslation($langcode) : $node;
      $alias = '';
      if (is_array($predelete_aliases) && isset($predelete_aliases[$langcode])) {
        $alias = $predelete_aliases[$langcode];
      }
      if ($node_lang->hasField('path') && !$node_lang->get('path')->isEmpty()) {
        $alias = (string) ($node_lang->get('path')->alias ?? '');
      }
      if (empty($alias)) {
        $alias = $path_alias_manager->getAliasByPath('/node/' . $node->id(), $langcode);
      }
      $alias_is_default = ($alias === '/node/' . $node->id());
      $alias_info = $alias_is_default ? ['dir' => '', 'basename' => ''] : self::getAliasInfoFromAliasString($alias, $langcode);
      $alias_dir = $alias_info['dir'] ?? '';

      $filenames = [];
      if (!$alias_is_default && !empty($alias_info['basename'])) {
        $filenames[] = self::normalizeFileName($alias_info['basename']);
      } else {
        // Match Elementor deploy behavior when alias is /node/{nid}.
        if (!empty($alias) && str_starts_with($alias, '/node/')) {
          $node_basename = basename($alias);
          if (!empty($node_basename)) {
            $filenames[] = self::normalizeFileName($node_basename);
          }
        }

        $node_lang = $node->hasTranslation($langcode) ? $node->getTranslation($langcode) : $node;
        $slug = strtolower($node_lang->label());
        $slug = preg_replace('/[^a-z0-9\-]+/', '-', $slug);
        $filenames[] = self::normalizeFileName(trim($slug, '-') ?: 'node-' . $node->id());
      }

      $filenames = array_values(array_unique(array_filter($filenames)));
      foreach ($filenames as $filename) {
        $payloads[] = [
          "pathName" => self::buildDeployPath($pathPrefix, $langcode, $subsite_folder, $alias_dir),
          "fileName" => $filename
        ];
        $payload_langcodes[] = $langcode;
      }
    }

    $client = \Drupal::httpClient();
    $responses = [];
    foreach ($payloads as $i => $payload) {
      $delete_endpoint = self::deployFrontendBaseForLangcode($payload_langcodes[$i] ?? \Drupal::languageManager()->getDefaultLanguage()->getId()) . self::deployConstant('FRONTEND_DEPLOY_DELETE_API_ENDPOINT');
      try {
        $response = $client->delete($delete_endpoint, [
          'headers' => [
            'Accept'        => 'application/json',
            'x-api-key' => self::deployConstant('drupal_dev_authorization'),
            'Content-Type'  => 'application/json',
          ],
          'body' => json_encode($payload),
        ]);

        $responses[] = [
          'payload'  => $payload,
          'response' => (string) $response->getBody()
        ];
        \Drupal::logger('zu_rest_api')->info("Deleted {$payload['fileName']} from {$payload['pathName']}");
      } catch (\Exception $e) {

        \Drupal::logger('zu_rest_api')->error('Delete API failed: ' . $e->getMessage());

        $responses[] = [
          'payload' => $payload,
          'error'   => $e->getMessage(),
        ];
      }
    }

    return $responses;
  }
}
