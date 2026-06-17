<?php

namespace Drupal\short_alias;

use Drupal\Core\Language\LanguageInterface;
use Drupal\redirect\RedirectRepository;

class ShortAliasRepository extends RedirectRepository
{
  /**
   * Finds redirects based on the destination URI.
   *
   * @param string[] $destination_uri
   *   List of destination URIs, for example ['internal:/node/123'].
   *
   * @return \Drupal\redirect\Entity\Redirect|null
   *   Redirect entity or NULL if not found.
   */
  public function findByDestinationUri(array $destination_uri, $langcode = NULL)
  {
    try {
      if ($langcode) {
        return $this->findByDestinationUriAndLanguage($destination_uri, $langcode);
      }

      $storage = $this->manager->getStorage('redirect');
      $expanded_uris = $this->expandUris($destination_uri);

      $result = $storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('redirect_redirect.uri', $expanded_uris, 'IN')
        ->condition('type', 'redirect', 'IN')
        ->sort('created', 'DESC')
        ->range(0, 1)
        ->execute();
      if (empty($result)) {
        return NULL;
      }
      $entity_id = reset($result);
      return $storage->load($entity_id);
    } catch (\Exception $e) {
      \Drupal::logger('short_alias')->error('Error in findByDestinationUri: @message', [
        '@message' => $e->getMessage(),
      ]);
      return NULL;
    }
  }

  /**
   * Finds redirects based on the destination URI and language.
   *
   * @param string[] $destination_uri
   *   List of destination URIs, for example ['internal:/node/123'].
   * @param string $langcode
   *   Language code, for example 'en' or 'ar'.
   *
   * @return \Drupal\redirect\Entity\Redirect|null
   *   Redirect entity or NULL if not found.
   */
  public function findByDestinationUriAndLanguage(array $destination_uri, $langcode)
  {
    try {
      $storage = $this->manager->getStorage('redirect');
      $expanded_uris = $this->expandUris($destination_uri);
      $ids = $storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('redirect_redirect.uri', $expanded_uris, 'IN')
        ->condition('type', 'redirect', 'IN')
        ->sort('created', 'DESC')
        ->range(0, 50)
        ->execute();

      if (empty($ids)) {
        return NULL;
      }

      /** @var \Drupal\redirect\Entity\Redirect[] $redirects */
      $redirects = $storage->loadMultiple($ids);
      foreach ($redirects as $redirect) {
        // Check the target language stored in redirect_redirect options.
        $redirect_url = $redirect->getRedirectUrl();
        if ($redirect_url) {
          $target_lang = $redirect_url->getOption('language');
          $check_langcode = '';
          if ($target_lang instanceof LanguageInterface) {
            $check_langcode = $target_lang->getId();
          } elseif (is_string($target_lang)) {
            $check_langcode = $target_lang;
          }

          if ($check_langcode === $langcode) {
            return $redirect;
          }
        }
      }
    } catch (\Exception $e) {
      \Drupal::logger('short_alias')->error('Error in findByDestinationUriAndLanguage: @message', [
        '@message' => $e->getMessage(),
      ]);
    }

    return NULL;
  }

  /**
   * Batch lookup short aliases for multiple node IDs.
   *
   * @param int[] $nids
   *   Array of node IDs.
   *
   * @return array
   *   Keyed by nid, value is the source path with query or empty string.
   */
  public function findMultipleByNodeIds(array $nids): array {
    if (empty($nids)) {
      return [];
    }

    $storage = $this->manager->getStorage('redirect');
    $uris = [];
    foreach ($nids as $nid) {
      $uris = array_merge($uris, $this->expandUris(["internal:/node/$nid"]));
    }

    $ids = $storage->getQuery()
      ->accessCheck(TRUE)
      ->condition('redirect_redirect.uri', $uris, 'IN')
      ->condition('type', 'redirect', 'IN')
      ->sort('created', 'DESC')
      ->execute();

    $result = [];
    if (!empty($ids)) {
      $redirects = $storage->loadMultiple($ids);
      foreach ($redirects as $redirect) {
        $target = $redirect->getRedirectUrl();
        if ($target) {
          $uri = $redirect->get('redirect_redirect')->uri ?? '';
          if (preg_match('/node\/(\d+)/', $uri, $matches)) {
            $nid = (int) $matches[1];

            // Extract target language from redirect options.
            $langcode = 'und';
            $target_lang = $target->getOption('language');
            if ($target_lang instanceof LanguageInterface) {
              $langcode = $target_lang->getId();
            }
            elseif (is_string($target_lang)) {
              $langcode = $target_lang;
            }

            $key = $nid . '_' . $langcode;
            if (!isset($result[$key])) {
              $source = ltrim($redirect->getSourcePathWithQuery(), '/');
              $result[$key] = '/' . $langcode . '/' . $source;
            }
          }
        }
      }
    }

    return $result;
  }

  /**
   * Expands provided URIs into common Drupal URI variations.
   *
   * @param string[] $uris
   *   List of URIs.
   *
   * @return string[]
   *   Expanded list of URIs.
   */
  protected function expandUris(array $uris)
  {
    $expanded = [];
    foreach ($uris as $uri) {
      $expanded[] = $uri;

      // Extract path part (e.g., node/123)
      if (preg_match('/^(?:internal|entity):(?:\/+|)(.*)$/', $uri, $matches)) {
        $path = $matches[1];
        $expanded[] = 'internal:/' . $path;
        $expanded[] = 'internal:' . $path;
        $expanded[] = 'entity:/' . $path;
        $expanded[] = 'entity:' . $path;
      }
    }
    return array_unique($expanded);
  }
}
