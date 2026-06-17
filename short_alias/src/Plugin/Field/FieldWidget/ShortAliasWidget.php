<?php

namespace Drupal\short_alias\Plugin\Field\FieldWidget;

use Drupal\Core\Entity\EntityFormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;

/**
 * Plugin implementation of the 'short_alias_default' widget.
 *
 * @FieldWidget(
 *   id = "short_alias_default",
 *   label = @Translation("Short Alias Source Widget"),
 *   field_types = {
 *     "short_alias"
 *   }
 * )
 */
class ShortAliasWidget extends WidgetBase
{

  /**
   * Resolve target language for current form context.
   */
  protected static function resolveFormLangcode($entity = NULL): string
  {
    $langcode = '';
    $language_manager = \Drupal::languageManager();

    $target = \Drupal::routeMatch()->getParameter('target');
    if ($target instanceof \Drupal\Core\Language\LanguageInterface) {
      $langcode = $target->getId();
    } elseif (is_string($target) && $target !== '') {
      $langcode = $target;
    }

    if ($langcode === '') {
      $path = trim((string) \Drupal::request()->getPathInfo(), '/');
      if ($path !== '') {
        $first_segment = explode('/', $path)[0] ?? '';
        if ($first_segment !== '' && $language_manager->getLanguage($first_segment)) {
          $langcode = $first_segment;
        }
      }
    }

    if ($langcode === '') {
      $content_language = $language_manager->getCurrentLanguage(\Drupal\Core\Language\LanguageInterface::TYPE_CONTENT);
      if ($content_language) {
        $langcode = $content_language->getId();
      }
    }

    if ($langcode === '' && $entity && method_exists($entity, 'language')) {
      $language = $entity->language();
      if ($language) {
        $langcode = $language->getId();
      }
    }

    if ($langcode === '') {
      $langcode = $language_manager->getDefaultLanguage()->getId();
    }

    return $langcode;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state)
  {
    $default_url_value = '';

    try {
      // Skip for media library upload.
      if ($form_state->getFormObject() instanceof \Drupal\media_library\Form\FileUploadForm) {
        return $element;
      }

      /** @var \Drupal\Core\Entity\ContentEntityInterface $entity */
      $entity = $items->getEntity();
      if ($entity && !$entity->isNew()) {
        $langcode = static::resolveFormLangcode($entity);

        // Load entity translation if available
        /** @var \Drupal\Core\TypedData\TranslatableInterface $entity */
        if ($entity instanceof \Drupal\Core\TypedData\TranslatableInterface && $entity->hasTranslation($langcode)) {
          $entity = $entity->getTranslation($langcode);
        }

        /** @var \Drupal\Core\Entity\EntityInterface $entity */
        if (method_exists($entity, 'getEntityTypeId') && method_exists($entity, 'id')) {
          $clean_uri = 'internal:/' . $entity->getEntityTypeId() . '/' . $entity->id();
          $destination_uris = [
            $clean_uri,
            $clean_uri . '?language=' . $langcode,
            'internal:/' . $langcode . '/' . $entity->getEntityTypeId() . '/' . $entity->id(),
            'entity:' . $entity->getEntityTypeId() . '/' . $entity->id(),
          ];

          // Deep matching lookup using langcode.
          $existing_alias = \Drupal::service('short_alias.repository')
            ->findByDestinationUri($destination_uris, $langcode);

          $default_url_value = $existing_alias
            ? substr($existing_alias->getSourcePathWithQuery(), 1)
            : "";
        }
      }
    } catch (\Exception $e) {
      \Drupal::logger('short_alias')->error('Error in ShortAliasWidget::formElement: @message', [
        '@message' => $e->getMessage(),
      ]);
    }

    $has_short_alias = !empty($default_url_value);

    $element = [
      '#type' => 'fieldset',
      '#title' => $this->t('Short alias'),
      '#tree' => TRUE,
    ];

    // Hidden flag to auto generate only if field is empty on save.
    // Set to TRUE if no alias exists (will trigger auto generation).
    $element['short_alias'] = [
      '#type' => 'hidden',
      '#value' => !$has_short_alias,
    ];

    // Admin allowed to edit alias.
    $is_admin = \Drupal::currentUser()->hasPermission('administer redirects');

    $element['path'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Path'),
      '#default_value' => $default_url_value,
      '#maxlength' => 255,
      '#field_prefix' => \Drupal::request()->getSchemeAndHttpHost() . '/',
      '#disabled' => !$is_admin,
      '#description' => $is_admin
        ? $this->t('Enter an alias (uppercase, lowercase, numbers). Leave empty to auto-generate.')
        : $this->t('Alias will be auto-generated on save.'),
      '#element_validate' => [
        [static::class, 'validateShortAlias'],
      ],
    ];

    return $element;
  }

  /**
   * VALIDATION: Prevent duplicate short alias before save.
   */
  public static function validateShortAlias(&$element, FormStateInterface $form_state, &$form)
  {
    try {
      $value = trim($element['#value']);

      if ($value === '') {
        return;
      }

      if (!preg_match('/^[A-Za-z0-9]+$/', $value)) {
        $form_state->setError(
          $element,
          t("The short alias must contain only uppercase letters, lowercase letters, and numbers.")
        );
        return;
      }

      $redirect_repo = \Drupal::service('redirect.repository');
      $duplicate = $redirect_repo->findBySourcePath($value);

      if (empty($duplicate)) {
        return;
      }

      $duplicate_redirect = reset($duplicate);
      $duplicate_rid = $duplicate_redirect->id();

      // Current entity being edited.
      $form_obj = $form_state->getFormObject();
      $entity = method_exists($form_obj, 'getEntity') ? $form_obj->getEntity() : NULL;
      $langcode = static::resolveFormLangcode($entity);

      /** @var \Drupal\Core\Entity\EntityInterface $entity */
      if ($entity && method_exists($entity, 'id') && method_exists($entity, 'isNew') && !$entity->isNew()) {
        $clean_uri = 'internal:/' . $entity->getEntityTypeId() . '/' . $entity->id();
        $destination_uris = [
          $clean_uri,
          $clean_uri . '?language=' . $langcode,
          'internal:/' . $langcode . '/' . $entity->getEntityTypeId() . '/' . $entity->id(),
          'entity:' . $entity->getEntityTypeId() . '/' . $entity->id(),
        ];

        // matching lookup for this specific translation.
        $existing_alias = \Drupal::service('short_alias.repository')
          ->findByDestinationUri($destination_uris, $langcode);

        if ($existing_alias) {
          $existing_source = $existing_alias->getSource();
          if (isset($existing_source['path']) && $existing_source['path'] === $value) {
            return;
          }
          // SAME redirect ID for this node and language → allow editing.
          if ($existing_alias->id() === $duplicate_rid) {
            return;
          }
        }
      }
      $form_state->setError(
        $element,
        t("The short alias '@alias' already exists. Each alias must be unique and can only point to one node/language combination. Please choose another.", [
          '@alias' => $value,
        ])
      );
    } catch (\Exception $e) {
      \Drupal::logger('short_alias')->error('Error during short alias validation: @message', [
        '@message' => $e->getMessage(),
      ]);
    }
  }
}
