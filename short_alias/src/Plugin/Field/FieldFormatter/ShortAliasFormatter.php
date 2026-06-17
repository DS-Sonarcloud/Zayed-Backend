<?php

namespace Drupal\short_alias\Plugin\Field\FieldFormatter;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Url;
use Drupal\short_alias\ShortAliasRepository;

/**
 * Implementation of the 'short_alias' formatter.
 *
 * @FieldFormatter(
 *   id = "short_alias",
 *   label = @Translation("Short Alias"),
 *   field_types = {
 *     "short_alias",
 *   }
 * )
 */
class ShortAliasFormatter extends FormatterBase
{

  /**
   * The short alias repository service.
   *
   * @var ShortAliasRepository
   */
  protected $shortAliasRepository;

  /**
   * Constructs a FormatterBase object.
   *
   * @param string $plugin_id
   *   The plugin_id for the formatter.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the formatter is associated.
   * @param array $settings
   *   The formatter settings.
   * @param string $label
   *   The formatter label display setting.
   * @param string $view_mode
   *   The view mode.
   * @param array $third_party_settings
   *   Any third party settings.
   * @param \Drupal\short_alias\ShortAliasRepository $short_alias_repository
   *   The short alias repository service
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, $label, $view_mode, array $third_party_settings, ShortAliasRepository $short_alias_repository)
  {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings);
    $this->shortAliasRepository = $short_alias_repository;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
  {
    $short_alias_repository = $container->get('short_alias.repository');

    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      $short_alias_repository
    );
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode)
  {

    // Get the entity ID.
    /** @var \Drupal\entity\Entity $nid */
    $entity = $items->getEntity();
    if (!$entity || $entity->isNew()) {
      // Show placeholder text in preview.
      foreach ($items as $delta => $item) {
        $elements[$delta] = [
          '#markup' => t('(Short alias will generate after saving)'),
        ];
      }
      return $elements;
    }
    
    $entity_langcode = $entity->language()->getId();
    $internal_path = $entity->toUrl('canonical', ['language' => \Drupal::languageManager()->getLanguage($entity_langcode)])->getInternalPath();

    // Find short_alias to this node and language.
    /** @var \Drupal\redirect\Entity\Redirect $short_alias */
    $short_alias = $this->shortAliasRepository
      ->findByDestinationUriAndLanguage(["internal:/$internal_path", "entity:/$internal_path"], $entity_langcode);

    $elements = [];

    if ($short_alias) {
      $base_url = \Drupal::request()->getSchemeAndHttpHost();
      $url = Url::fromUri($base_url . $short_alias->getSourceUrl());
      $alias_string = $url->toString();
      $elements[] = [
        '#type' => 'link',
        '#url' => $url,
        '#title' => $alias_string,
      ];
    }


    return $elements;
  }
}
