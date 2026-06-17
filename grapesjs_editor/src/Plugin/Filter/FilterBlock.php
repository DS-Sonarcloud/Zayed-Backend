<?php

namespace Drupal\grapesjs_editor\Plugin\Filter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;
use Drupal\grapesjs_editor\Services\BlockManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a filter to render drupal blocks.
 *
 * @Filter(
 *   id = "grapesjs_filter_block",
 *   title = @Translation("GrapesJS - Filter Drupal Block"),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_MARKUP_LANGUAGE,
 * )
 */
class FilterBlock extends FilterBase implements ContainerFactoryPluginInterface
{

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * The block manager.
   *
   * @var \Drupal\grapesjs_editor\Services\BlockManager
   */
  protected $blockManager;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The result metadata.
   *
   * @var \Drupal\Core\Render\BubbleableMetadata
   */
  protected $metadata;

  /**
   * FilterBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   * @param \Drupal\grapesjs_editor\Services\BlockManager $block_manager
   *   The block manager.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   The current user.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, RendererInterface $renderer, BlockManager $block_manager, AccountProxyInterface $current_user)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->renderer = $renderer;
    $this->blockManager = $block_manager;
    $this->currentUser = $current_user;
    $this->metadata = new BubbleableMetadata();
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
  {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('renderer'),
      $container->get('grapesjs_editor.block_manager'),
      $container->get('current_user')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function process($text, $langcode)
  {
    $text = preg_replace_callback('#<drupal-block[^>]*>.*?</drupal-block>#s', [
      $this,
      'renderBlock',
    ], $text);
    $result = new FilterProcessResult($text);
    $result->addCacheableDependency($this->metadata);

    return $result;
  }

  /**
   * Returns the block render.
   *
   * @param array $match
   *   The custom tag match.
   *
   * @return \Drupal\Component\Render\MarkupInterface|string
   *   The block render.
   *
   * @throws \Exception
   *   Thrown if the plugin definition is invalid.
   */
  protected function renderBlock(array $match)
  {
    $html = Html::load($match[0]);
    $tag_elements = $html->getElementsByTagName('drupal-block');
    foreach ($tag_elements as $tag_element) {
      /* @var \DOMElement $tag_element */
      $plugin_id = $tag_element->getAttribute('block-plugin-id');

      // Extract all attributes for configuration
      $configuration = [];
      foreach ($tag_element->attributes as $attribute) {
        $name = $attribute->nodeName;
        $value = $attribute->nodeValue;

        // Map attribute names to configuration keys
        if ($name === 'selected-nids') {
          $configuration['selected_nids'] = array_filter(array_map('trim', explode(',', $value)));
        } else {
          $configuration[$name] = $value;
        }
      }

      if ($block = $this->blockManager->getBlock($plugin_id)) {
        $rendered = $this->blockManager->renderBlock($block, $configuration);

        // Preserve original ID and Class from the GrapesJS component to ensure CSS applies.
        $wrapper_id = $tag_element->getAttribute('id');
        $wrapper_class = $tag_element->getAttribute('class');

        if ($wrapper_id || $wrapper_class) {
          // Attempt to inject ID and class into the first tag of the rendered output.
          if (preg_match('/^<([a-z0-9-]+)([^>]*)>/i', $rendered, $matches)) {
            $tagName = $matches[1];
            $otherAttrs = $matches[2];

            if ($wrapper_id && strpos($otherAttrs, 'id=') === FALSE) {
              $otherAttrs .= ' id="' . $wrapper_id . '"';
            }
            if ($wrapper_class) {
              if (preg_match('/class=["\']([^"\']*)["\']/', $otherAttrs, $classMatch)) {
                $newClass = trim($classMatch[1] . ' ' . $wrapper_class);
                $otherAttrs = str_replace($classMatch[0], 'class="' . $newClass . '"', $otherAttrs);
              } else {
                $otherAttrs .= ' class="' . $wrapper_class . '"';
              }
            }

            $rendered = '<' . $tagName . $otherAttrs . '>' . substr($rendered, strlen($matches[0]));
          }
        }

        return $rendered;
      }
    }

    return '';
  }
}
