<?php

namespace Drupal\grapesjs_editor\Plugin\GrapesJSPlugin;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\editor\Entity\Editor;
use Drupal\grapesjs_editor\GrapesJSPluginBase;
use Drupal\grapesjs_editor\GrapesJSPluginConfigurableInterface;
use Drupal\grapesjs_editor\Services\BlockManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Defines the "drupal_blocks" plugin.
 *
 * @GrapesJSPlugin(
 *   id = "drupal_blocks",
 *   label = @Translation("Drupal Blocks"),
 *   weight = 20,
 *   module = "grapesjs_editor"
 * )
 */
class DrupalBlocks extends GrapesJSPluginBase implements ContainerFactoryPluginInterface, GrapesJSPluginConfigurableInterface
{

  /**
   * The block manager.
   *
   * @var \Drupal\grapesjs_editor\Services\BlockManager
   */
  protected $blockManager;

  /**
   * DrupalBlocks constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\grapesjs_editor\Services\BlockManager $block_manager
   *   The block manager.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, BlockManager $block_manager)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->blockManager = $block_manager;
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
      $container->get('grapesjs_editor.block_manager')
    );
  }

  /**
   * {@inheritDoc}
   */
  public function getLibraries(Editor $editor)
  {
    return [
      'grapesjs_editor/drupal-blocks',
      'grapesjs_editor/drupal-widget',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor)
  {
    $blocks = [];
    $settings = $editor->getSettings();
    $allowed_blocks = $settings['plugins']['drupal_blocks'] ?? [];
    $plugin_blocks = $this->blockManager->getBlocks();

    // Fetch content options for selection modals
    $content_options = [
      'event' => [],
      'news' => [],
      'faculty_staff' => [],
    ];

    // Get all available content types for widget
    $content_types = [];
    $node_types = \Drupal::entityTypeManager()->getStorage('node_type')->loadMultiple();
    foreach ($node_types as $node_type) {
      $content_types[] = [
        'id' => $node_type->id(),
        'label' => $node_type->label(),
      ];
    }

    foreach (array_keys($content_options) as $type) {
      $nids = \Drupal::entityQuery('node')
        ->condition('type', $type)
        ->condition('status', 1)
        ->sort('title', 'ASC')
        ->accessCheck(TRUE)
        ->execute();

      if (!empty($nids)) {
        $nodes = \Drupal\node\Entity\Node::loadMultiple($nids);
        foreach ($nodes as $node) {
          $content_options[$type][] = [
            'id' => $node->id(),
            'name' => $node->label(),
          ];
        }
      }
    }

    foreach ($plugin_blocks as $plugin_id => $definition) {
      $is_allowed = empty($allowed_blocks) ? true : (!empty($allowed_blocks[$plugin_id]));

      if ($is_allowed) {
        $block_data = [
          'label' => $definition['admin_label'],
          'plugin_id' => $plugin_id,
        ];

        // Add selection traits for special blocks
        $special_blocks = [
          'grapesjs_event_list_block' => 'event',
          'grapesjs_news_list_block' => 'news',
          'grapesjs_faculty_staff_list_block' => 'faculty_staff',
        ];

        if (isset($special_blocks[$plugin_id])) {
          $type = $special_blocks[$plugin_id];
          $options = [['value' => '', 'name' => '- None -']];
          foreach ($content_options[$type] as $option) {
            $options[] = ['value' => $option['id'], 'name' => $option['name']];
          }

          $block_data['traits'] = [
            [
              'type' => 'select',
              'label' => 'Pick ' . ($type === 'faculty_staff' ? 'Faculty/Staff' : ucfirst($type)),
              'name' => 'selected-nids',
              'options' => $options,
            ],
            [
              'type' => 'text',
              'label' => 'Or enter Multiple IDs (comma separated)',
              'name' => 'selected-nids-text',
              'placeholder' => 'e.g. 123, 456',
            ]
          ];
        }

        $blocks[] = $block_data;
      }
    }

    return [
      'grapesSettings' => [
        'plugins' => [
          'drupal-blocks',
          'drupal-widget',
        ],
        'pluginsOpts' => [
          'drupal-blocks' => [
            'block_route' => Url::fromRoute('grapesjs_editor.get_block')
              ->toString(),
            'blocks' => $blocks,
            'content_options' => $content_options,
            'content_types' => $content_types,
            'widget_api' => [
              'fields_route' => Url::fromRoute('grapesjs_editor.get_content_type_fields')->toString(),
              'nodes_route' => Url::fromRoute('grapesjs_editor.get_nodes_by_type')->toString(),
            ],
          ],
          'drupal-widget' => [
            'block_route' => Url::fromRoute('grapesjs_editor.get_block')
              ->toString(),
            'content_types' => $content_types,
            'widget_api' => [
              'fields_route' => Url::fromRoute('grapesjs_editor.get_content_type_fields')->toString(),
              'nodes_route' => Url::fromRoute('grapesjs_editor.get_nodes_by_type')->toString(),
            ],
          ],
        ],
      ],
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state, Editor $editor)
  {
    $settings = $editor->getSettings();
    $config = $settings['plugins']['drupal_blocks'] ?? [];
    $groups = $this->blockManager->getGroupedBlocks();

    foreach ($groups as $key => $blocks) {
      $form['allowed_blocks'][$key] = [
        '#type' => 'fieldset',
        '#title' => $key,
      ];

      foreach ($blocks as $plugin_id => $definition) {
        $form['allowed_blocks'][$key][$plugin_id] = [
          '#title' => $definition['admin_label'],
          '#type' => 'checkbox',
          '#default_value' => !empty($config[$plugin_id]),
        ];
      }
    }

    $form['allowed_blocks']['#element_validate'][] = [
      $this,
      'validateAllowedBlocksSettings',
    ];

    return $form;
  }

  /**
   * Validation handler for the "allowed_blocks" element in settingsForm().
   *
   * @param array $element
   *   The render element.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public function validateAllowedBlocksSettings(array $element, FormStateInterface $form_state)
  {
    $settings = [];
    $groups = $this->blockManager->getGroupedBlocks();

    foreach ($groups as $key => $blocks) {
      $settings += $form_state->getValue([
        'editor',
        'settings',
        'plugins',
        'drupal_blocks',
        'allowed_blocks',
        $key,
      ]);
    }

    $form_state->unsetValue([
      'editor',
      'settings',
      'plugins',
      'drupal_blocks',
    ]);
    $form_state->setValue([
      'editor',
      'settings',
      'plugins',
      'drupal_blocks',
    ], $settings);
  }
}
