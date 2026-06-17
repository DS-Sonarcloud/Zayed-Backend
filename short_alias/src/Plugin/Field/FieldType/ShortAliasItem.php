<?php

namespace Drupal\short_alias\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\Core\Url;

/**
 * @FieldType(
 *   id = "short_alias",
 *   label = @Translation("Short alias"),
 *   description = @Translation("Stores a short alias"),
 *   default_widget = "short_alias_default",
 *   default_formatter = "short_alias",
 *   no_ui = TRUE
 * )
 */
class ShortAliasItem extends FieldItemBase
{

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition)
  {
    $properties['path'] = DataDefinition::create('string')
      ->setLabel(t('Path'));
    $properties['short_alias'] = DataDefinition::create('boolean')
      ->setLabel(t('Short alias'));
    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition)
  {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty()
  {
    return ($this->path === NULL);
  }

  /**
   * {@inheritdoc}
   */
  public function preSave()
  {
    if ($this->path !== NULL) {
      $this->path = trim($this->path);
    }
  }

  /**
   * Generates a random 5-character alias using uppercase, lowercase, and numbers.
   *
   * @return string
   *   A 5-character alias.
   */
  protected function generateRandomAlias()
  {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    $alias = '';
    for ($i = 0; $i < 5; $i++) {
      $alias .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $alias;
  }

  /**
   * {@inheritdoc}
   */
  public function postSave($update)
  {
    try {
      $entity_type_manager = \Drupal::entityTypeManager();
      $redirect_storage = $entity_type_manager->getStorage('redirect');
      $entity = $this->getEntity();

      if (!$entity || !$entity->hasLinkTemplate('canonical')) {
        return;
      }

      $langcode = (string) $this->getLangcode();
      if ($langcode === '') {
        $langcode = $entity->language()->getId();
      }

      $entity_for_lang = $entity;
      if ($entity instanceof \Drupal\Core\TypedData\TranslatableInterface && $entity->hasTranslation($langcode)) {
        $entity_for_lang = $entity->getTranslation($langcode);
      }

      $language = \Drupal::languageManager()->getLanguage($langcode);
      if (!$language && method_exists($entity_for_lang, 'language')) {
        $entity_lang = $entity_for_lang->language();
        $langcode = $entity_lang ? $entity_lang->getId() : $langcode;
        $language = \Drupal::languageManager()->getLanguage($langcode);
      }
      if (!$language) {
        throw new \Exception("Could not load language object for $langcode");
      }

      $internal_path = $entity_for_lang->toUrl('canonical', ['language' => $language])->getInternalPath();
      $repository = \Drupal::service('short_alias.repository');
      $redirect_repository = \Drupal::service('redirect.repository');

      $max_generation_attempts = 10;
      $destination_uri = 'internal:/' . $internal_path;

      // If path is provided
      if (!empty($this->path)) {
        // Check if this alias already exists for a different node/language combination
        $duplicates = $redirect_repository->findBySourcePath($this->path);
        $duplicate_ids = [];
        if (!empty($duplicates)) {
          foreach ($duplicates as $duplicate_redirect) {
            $duplicate_ids[] = (int) $duplicate_redirect->id();
          }
        }

        // Find existing alias for this specific node and language
        $node_id = $entity->id();
        $internal_path_str = "node/$node_id";
        $destinations = $this->buildDestinationCandidates($internal_path_str, $internal_path, $langcode);

        // Include path aliases in the search to prevent duplicates if someone pointed a redirect to an alias
        $alias_manager = \Drupal::service('path_alias.manager');
        foreach ([$langcode, \Drupal\Core\Language\LanguageInterface::LANGCODE_NOT_SPECIFIED] as $l) {
          $alias = $alias_manager->getAliasByPath('/' . $internal_path_str, $l);
          if ($alias && $alias !== '/' . $internal_path_str) {
            $destinations[] = "internal:$alias";
          }
        }

        $existing_alias = $repository->findByDestinationUriAndLanguage($destinations, $langcode);

        // If duplicate exists and it's not the same redirect for this node/language
        if (!empty($duplicate_ids) && (!$existing_alias || !in_array((int) $existing_alias->id(), $duplicate_ids, TRUE))) {
          // \Drupal::messenger()->addWarning(t('This short alias already exists for another node/language combination. No changes were made.'));
          return;
        }

        // Update or create redirect with language
        if ($existing_alias) {
          $changed = FALSE;
          $current_source = $existing_alias->getSource();
          if (isset($current_source['path']) && $current_source['path'] !== $this->path) {
            $existing_alias->setSource($this->path);
            $changed = TRUE;
          }
          // Ensure destination language is correct.
          $existing_alias->set('redirect_redirect', [
            'uri' => $destination_uri,
            'options' => [
              'language' => $language,
            ],
          ]);
          $existing_alias->set('language', \Drupal\Core\Language\LanguageInterface::LANGCODE_NOT_SPECIFIED);
          $changed = TRUE;

          if ($changed) {
            $existing_alias->save();
          }
        } else {
          $redirect = $redirect_storage->create([
            'type' => 'redirect',
            'redirect_redirect' => [
              'uri' => $destination_uri,
              'options' => [
                'language' => $language,
              ],
            ],
            'redirect_source' => $this->path,
            'status_code' => 302,
            'language' => \Drupal\Core\Language\LanguageInterface::LANGCODE_NOT_SPECIFIED,
          ]);
          $redirect->save();
        }

        return;
      }

      // When no path is provided, ensure one short alias exists per node/language.
      $node_id = $entity->id();
      $internal_path_str = "node/$node_id";
      $destinations = $this->buildDestinationCandidates($internal_path_str, $internal_path, $langcode);
      $alias_manager = \Drupal::service('path_alias.manager');
      $alias = $alias_manager->getAliasByPath('/' . $internal_path_str, $langcode);
      if ($alias && $alias !== '/' . $internal_path_str) {
        $destinations[] = "internal:$alias";
      }
      $existing_alias = $repository->findByDestinationUriAndLanguage($destinations, $langcode);
      if ($existing_alias) {
        return;
      }

      for ($i = 0; $i < $max_generation_attempts; $i++) {
        $alias_path = $this->generateRandomAlias();

        // Check if alias is unique
        if (empty($redirect_repository->findBySourcePath($alias_path))) {
          $redirect = $redirect_storage->create([
            'type' => 'redirect',
            'redirect_redirect' => [
              'uri' => $destination_uri,
              'options' => [
                'language' => $language,
              ],
            ],
            'redirect_source' => $alias_path,
            'status_code' => 302,
            'language' => \Drupal\Core\Language\LanguageInterface::LANGCODE_NOT_SPECIFIED,
          ]);
          $redirect->save();
          return;
        }
      }

      \Drupal::logger('short_alias')->warning('Failed to generate a unique short alias after @attempts attempts for entity @type:@id.', [
        '@attempts' => $max_generation_attempts,
        '@type' => $entity->getEntityTypeId(),
        '@id' => $entity->id(),
      ]);
      \Drupal::messenger()->addError(t('Failed to generate a unique short alias after @attempts attempts.', ['@attempts' => $max_generation_attempts]));
    } catch (\Exception $e) {
      \Drupal::logger('short_alias')->error('Error in ShortAliasItem::postSave: @message', [
        '@message' => $e->getMessage(),
      ]);
    }
  }

  /**
   * Build destination URI variants for redirect lookup.
   */
  protected function buildDestinationCandidates(string $entity_path, string $internal_path, string $langcode): array
  {
    $internal_path = ltrim($internal_path, '/');
    $paths = [
      ltrim($entity_path, '/'),
    ];

    if ($internal_path !== '') {
      $paths[] = $internal_path;
    }

    $lang_entity_path = $langcode . '/' . ltrim($entity_path, '/');
    $paths[] = $lang_entity_path;

    if ($internal_path !== '' && $internal_path !== $lang_entity_path && !str_starts_with($internal_path, $langcode . '/')) {
      $paths[] = $langcode . '/' . $internal_path;
    }

    $destinations = [];
    foreach (array_unique($paths) as $path) {
      $destinations[] = "internal:/$path";
      $destinations[] = "entity:/$path";
    }

    return array_unique($destinations);
  }
}
