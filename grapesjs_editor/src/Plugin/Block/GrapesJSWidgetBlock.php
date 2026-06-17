<?php

namespace Drupal\grapesjs_editor\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Render\RendererInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Widget' Block.
 *
 * @Block(
 *   id = "grapesjs_widget_block",
 *   admin_label = @Translation("Drupal Content Widget"),
 *   category = @Translation("GrapesJS Editor")
 * )
 */
class GrapesJSWidgetBlock extends BlockBase implements ContainerFactoryPluginInterface
{

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Constructs a new GrapesJSWidgetBlock.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, EntityTypeManagerInterface $entity_type_manager, RendererInterface $renderer)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->entityTypeManager = $entity_type_manager;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
  {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager'),
      $container->get('renderer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration()
  {
    return [
      'content_type' => '',
      'node_id' => '',
      'selected_fields' => [],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function build()
  {
    $config = $this->getConfiguration();
    $content_type = $config['content_type'] ?? '';
    $node_id = $config['node_id'] ?? '';
    $selected_fields = $config['selected_fields'] ?? [];

    // Validate configuration
    if (empty($content_type) || empty($node_id)) {
      return [
        '#markup' => '<div class="grapesjs-widget-placeholder" style="padding: 20px; border: 2px dashed #ccc; text-align: center; color: #999;">' . $this->t('Please configure the widget by selecting a content type and node.') . '</div>',
      ];
    }

    if (empty($selected_fields)) {
      return [
        '#markup' => '<div class="grapesjs-widget-placeholder" style="padding: 20px; border: 2px dashed #ccc; text-align: center; color: #999;">' . $this->t('Please select at least one field to display.') . '</div>',
      ];
    }

    // Load the node
    try {
      $node = $this->entityTypeManager->getStorage('node')->load($node_id);

      if (!$node instanceof \Drupal\node\NodeInterface || $node->bundle() !== $content_type) {
        return [
          '#markup' => '<div class="grapesjs-widget-error" style="padding: 20px; border: 2px solid #d9534f; text-align: center; color: #d9534f;">' . $this->t('Node not found or content type mismatch.') . '</div>',
        ];
      }

      // Build the widget output with MJML structure for responsive design
      $mjml_content = '';
      $first_field = true;

      foreach ($selected_fields as $field_name) {
        if ($node->hasField($field_name)) {
          $field_item_list = $node->get($field_name);

          // Check field access
          if ($field_item_list->access('view')) {
            $field_definition = $field_item_list->getFieldDefinition();
            $field_type = $field_definition->getType();
            $field_label = $field_definition->getLabel();

            if ($field_type === 'datetime' || $field_type === 'daterange') {
              $rendered = $field_item_list->view([
                'label' => 'hidden',
                'type' => 'datetime_custom',
                'settings' => [
                  'date_format' => 'd M Y',
                ],
              ]);
              $date_val = (string) $this->renderer->renderPlain($rendered);
              $attr = $first_field ? ' data-block-plugin-id="grapesjs_widget_block" data-content-type="' . $content_type . '" data-node-id="' . $node_id . '" data-selected-fields="' . htmlspecialchars(implode(',', $selected_fields)) . '"' : '';

              $mjml_content .= '<mj-text padding="5px 25px" font-size="14px" color="#333333"' . $attr . '>';
              $mjml_content .= '<strong>' . htmlspecialchars($field_label) . ':</strong> ' . trim(strip_tags($date_val));
              $mjml_content .= '</mj-text>';
              $first_field = false;
            } elseif ($field_type === 'image') {
              foreach ($field_item_list as $item) {
                if ($item->entity) {
                  $file = $item->entity;
                  $image_uri = $file->getFileUri();
                  $image_url = \Drupal::service('file_url_generator')->generateAbsoluteString($image_uri);
                  $alt = $item->alt ?? '';
                  $attr = $first_field ? ' data-block-plugin-id="grapesjs_widget_block" data-content-type="' . $content_type . '" data-node-id="' . $node_id . '" data-selected-fields="' . htmlspecialchars(implode(',', $selected_fields)) . '"' : '';

                  $mjml_content .= '<mj-image src="' . $image_url . '" alt="' . htmlspecialchars($alt) . '" padding="10px 25px" width="550px" align="center"' . $attr . '></mj-image>';
                  $first_field = false;
                }
              }
            } elseif ($field_type === 'entity_reference') {
              $target_type = $field_definition->getSetting('target_type');

              if ($target_type === 'media') {
                $media_count = count($field_item_list);
                \Drupal::logger('grapesjs_editor')->debug('Processing @count media items for field @field', [
                  '@count' => $media_count,
                  '@field' => $field_name,
                ]);

                foreach ($field_item_list as $media_index => $item) {
                  if ($item->entity) {
                    $media = $item->entity;
                    $media_bundle = $media->bundle();
                    \Drupal::logger('grapesjs_editor')->debug('Rendering media @id of bundle @bundle (index @index)', [
                      '@id' => $media->id(),
                      '@bundle' => $media_bundle,
                      '@index' => $media_index,
                    ]);

                    // Set data attributes on first element only for widget identification
                    $widget_attr = $first_field ? ' data-block-plugin-id="grapesjs_widget_block" data-content-type="' . $content_type . '" data-node-id="' . $node_id . '" data-selected-fields="' . htmlspecialchars(implode(',', $selected_fields)) . '"' : '';

                    // Add a media index attribute to all elements for debugging
                    $media_attr = ' data-media-index="' . $media_index . '"';
                    $attr = $widget_attr . $media_attr;

                    // Dynamic media rendering
                    $rendered_any = false;
                    $skip_fields = [
                      'mid',
                      'uuid',
                      'vid',
                      'langcode',
                      'bundle',
                      'name',
                      'uid',
                      'status',
                      'created',
                      'changed',
                      'default_langcode',
                      'revision_log_message',
                      'thumbnail',
                      'revision_timestamp',
                      'revision_uid',
                      'revision_log'
                    ];

                    foreach ($media->getFieldDefinitions() as $sub_field_name => $sub_field_def) {
                      if (in_array($sub_field_name, $skip_fields)) {
                        continue;
                      }

                      $sub_field_type = $sub_field_def->getType();
                      $sub_field = $media->get($sub_field_name);

                      if ($sub_field->isEmpty()) {
                        continue;
                      }

                      // 1. Render Image fields
                      if ($sub_field_type === 'image') {
                        $image_count = 0;
                        foreach ($sub_field as $img_item) {
                          if ($img_item->entity) {
                            $image_count++;
                            $image_url = \Drupal::service('file_url_generator')->generateAbsoluteString($img_item->entity->getFileUri());
                            $alt = $img_item->alt ?? $media->label();
                            \Drupal::logger('grapesjs_editor')->debug('Rendering image @count for media @media_id: @url', [
                              '@count' => $image_count,
                              '@media_id' => $media->id(),
                              '@url' => $image_url,
                            ]);
                            $mjml_content .= '<mj-image src="' . $image_url . '" alt="' . htmlspecialchars($alt) . '" padding="10px 25px" width="550px" align="center"' . $attr . '></mj-image>';
                            $first_field = false;
                            $rendered_any = true;
                            // Only clear widget attributes, keep media index
                            $attr = $media_attr;
                          }
                        }
                      }
                      // 2. Render File fields
                      if ($sub_field_type === 'file') {
                        foreach ($sub_field as $file_item) {
                          if ($file_item->entity) {
                            $file_url = \Drupal::service('file_url_generator')->generateAbsoluteString($file_item->entity->getFileUri());
                            //$icon = strpos($file_item->entity->getMimeType(), 'video') !== false ? '' : '';
                            $mjml_content .= '<mj-text padding="5px 25px" font-size="14px"' . $attr . '>';
                            $mjml_content .= '<strong>' . htmlspecialchars($field_label) . ':</strong> ';
                            //$mjml_content .= '<a href="' . $file_url . '" target="_blank" style="color: #007bff; text-decoration: none;">' . $icon . ' ' . htmlspecialchars($file_item->entity->getFilename()) . '</a>';
                            $mjml_content .= '<a href="' . $file_url . '" target="_blank" style="color: #007bff; text-decoration: none;">' . ' ' . htmlspecialchars($file_item->entity->getFilename()) . '</a>';
                            $mjml_content .= '</mj-text>';
                            $first_field = false;
                            $rendered_any = true;
                            $attr = $media_attr;
                          }
                        }
                      }
                      // 3. Render Link fields or oEmbed String fields (Remote Video)
                      if ($sub_field_type === 'link' || ($sub_field_type === 'string' && strpos($sub_field_name, 'oembed') !== false)) {
                        foreach ($sub_field as $link_item) {
                          $url = $sub_field_type === 'link' ? $link_item->uri : $link_item->value;
                          if (empty($url))
                            continue;

                          if (strpos($url, 'internal:') === 0) {
                            $url = \Drupal\Core\Url::fromUri($url)->toString();
                          }
                          $mjml_content .= '<mj-text padding="5px 25px" font-size="14px"' . $attr . '>';
                          $mjml_content .= '<strong>' . htmlspecialchars($field_label) . ':</strong> ';
                          $mjml_content .= '<a href="' . htmlspecialchars($url) . '" target="_blank" style="color: #007bff; text-decoration: none;">' . htmlspecialchars($media->label()) . '</a>';
                          $mjml_content .= '</mj-text>';
                          $first_field = false;
                          $rendered_any = true;
                          $attr = $media_attr;
                        }
                      }
                    }
                    if ($rendered_any) {
                      $rendered_item = true;
                    }
                  }
                }
              } else {
                $rendered = $field_item_list->view(['label' => 'above']);
                $attr = $first_field ? ' data-block-plugin-id="grapesjs_widget_block" data-content-type="' . $content_type . '" data-node-id="' . $node_id . '" data-selected-fields="' . implode(',', $selected_fields) . '"' : '';
                $mjml_content .= '<mj-text padding="5px 25px" font-size="14px"' . $attr . '>';
                $mjml_content .= $this->renderer->renderPlain($rendered);
                $mjml_content .= '</mj-text>';
                $first_field = false;
              }
            } else {
              $rendered = $field_item_list->view(['label' => 'above']);
              $attr = $first_field ? ' data-block-plugin-id="grapesjs_widget_block" data-content-type="' . $content_type . '" data-node-id="' . $node_id . '" data-selected-fields="' . htmlspecialchars(implode(',', $selected_fields)) . '"' : '';
              $mjml_content .= '<mj-text padding="5px 25px" font-size="14px"' . $attr . '>';
              $mjml_content .= $this->renderer->renderPlain($rendered);
              $mjml_content .= '</mj-text>';
              $first_field = false;
            }

            if ($first_field) {
              $attr = ' data-block-plugin-id="grapesjs_widget_block" data-content-type="' . $content_type . '" data-node-id="' . $node_id . '" data-selected-fields="' . htmlspecialchars(implode(',', $selected_fields)) . '"';
              $mjml_content .= '<mj-text padding="0" line-height="0" font-size="0"' . $attr . '></mj-text>';
              $first_field = false;
            }
          }
        }
      }

      if ($mjml_content === '') {
        $mjml_content = '<mj-text data-block-plugin-id="grapesjs_widget_block" data-content-type="' . $content_type . '" data-node-id="' . $node_id . '" data-selected-fields="' . implode(',', $selected_fields) . '">' . $this->t('No fields selected or accessible.') . '</mj-text>';
      }

      $mj_image_count = substr_count($mjml_content, '<mj-image');
      $mj_text_count = substr_count($mjml_content, '<mj-text');
      // \Drupal::logger('grapesjs_editor')->debug('Generated MJML content - Length: @length chars, Images: @images, Texts: @texts', [
      //   '@length' => strlen($mjml_content),
      //   '@images' => $mj_image_count,
      //   '@texts' => $mj_text_count,
      // ]);
      // \Drupal::logger('grapesjs_editor')->debug('MJML content FULL OUTPUT: @content', [
      //   '@content' => $mjml_content,
      // ]);

      return [
        '#markup' => \Drupal\Core\Render\Markup::create($mjml_content),
      ];

    } catch (\Exception $e) {
      \Drupal::logger('grapesjs_editor')->error('Error rendering widget block: @message', ['@message' => $e->getMessage()]);
      return [
        '#markup' => '<div class="grapesjs-widget-error" style="padding: 20px; border: 2px solid #d9534f; text-align: center; color: #d9534f;">' . $this->t('Error loading widget content.') . '</div>',
      ];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge()
  {
    return 0; 
  }
}
