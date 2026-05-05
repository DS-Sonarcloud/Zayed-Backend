<?php

namespace Drupal\elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use Elementor\Repeater;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Background;
use Drupal\views\Views;
use Drupal\views\Plugin\views\style\StylePluginBase;
use Symfony\Component\HttpFoundation\JsonResponse;

if (!defined('ABSPATH')) {
    exit;
}

class Widget_Drupal_Block extends Widget_Base
{
    public function get_name()
    {
        return 'drupal-block';
    }

    public function get_title()
    {
        return ___elementor_adapter('Drupal block', 'elementor');
    }

    public function get_categories()
    {
        return ['theme-elements'];
    }

    public function get_icon()
    {
        return 'eicon-accordion';
    }

    public function get_keywords()
    {
        return ['drupal', 'block', 'code'];
    }

    public function is_reload_preview_required()
    {
        return false;
    }

    protected function _register_controls()
    {
        // --- Content Tab ---
        $this->start_controls_section(
            'section_block',
            [
                'label' => ___elementor_adapter('Blocks', 'elementor'),
            ]
        );

        // Get all block options
        $blockManager = \Drupal::service('plugin.manager.block');
        $block_definitions = $blockManager->getDefinitions();
        $block_options = [];
        foreach ($block_definitions as $block_id => $definition) {
            $label = $definition['admin_label'] ?? $block_id;
            $block_options[$block_id] = $label . ' (' . $block_id . ')';
        }

        // Repeater to allow multiple blocks
        $repeater = new Repeater();

        $repeater->add_control(
            'block_id',
            [
                'label' => ___elementor_adapter('Select Block', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => $block_options,
                'default' => '',
            ]
        );

        $style_manager = \Drupal::service('plugin.manager.views.style');
        $definitions = $style_manager->getDefinitions();

        $styles_list = [];

        foreach ($definitions as $plugin_id => $plugin_definition) {
          // Filter: only styles that use a row plugin
          if (!empty($plugin_definition['display_types']) && $plugin_definition['display_types'][0] == 'normal') {
            $styles_list[$plugin_id] = $plugin_definition['title'];
          }
        }

        // Optional: sort alphabetically
        asort($styles_list);
        // Layout control
        $repeater->add_control(
          'layout_type',
          [
              'label' => ___elementor_adapter('Layout Type', 'elementor'),
              'type' => Controls_Manager::SELECT,
              'default' => 'list',
              'options' => $styles_list,
              'label_block' => true,
              'description' => ___elementor_adapter('Select the layout type for displaying blocks.', 'elementor'),
              'render_type' => 'template',
      
              // Condition: sirf tab dikhana jab block_id 'views_block:' se start hota ho
              'condition' => [
                  'block_id' => array_keys(array_filter($block_options, function($label, $id) {
                      return strpos($id, 'views_block:') === 0;
                  }, ARRAY_FILTER_USE_BOTH))
              ]
          ]
        );

        // Grid Style Controls
        $repeater->add_control(
            'grid_columns',
            [
                'label' => ___elementor_adapter('Columns', 'elementor'),
                'type' => Controls_Manager::NUMBER,
                'default' => 3,
                'min' => 1,
                'max' => 12,
                'condition' => [
                    'layout_type' => ['grid', 'grid_responsive'],
                ],
            ]
        );

        $repeater->add_control(
            'grid_alignment',
            [
                'label' => ___elementor_adapter('Grid Alignment', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    'horizontal' => 'Horizontal',
                    'vertical' => 'Vertical',
                ],
                'default' => 'horizontal',
                'condition' => [
                    'layout_type' => ['grid', 'grid_responsive'],
                ],
            ]
        );

        // Table Style Controls
        $repeater->add_control(
            'table_info_heading',
            [
                'label' => ___elementor_adapter('Table Settings', 'elementor'),
                'type' => Controls_Manager::HEADING,
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_sticky',
            [
                'label' => ___elementor_adapter('Sticky Header', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'default' => '',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        // List Style Controls
        $repeater->add_control(
            'list_type',
            [
                'label' => ___elementor_adapter('List Type', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    'ul' => 'Unordered List',
                    'ol' => 'Ordered List',
                    'div' => 'Plain List',
                ],
                'default' => 'ul',
                'condition' => [
                    'layout_type' => ['unformatted', 'html_list'],
                ],
            ]
        );

        // Advanced Grid Controls
        $repeater->add_control(
            'grid_gap',
            [
                'label' => ___elementor_adapter('Grid Gap (px)', 'elementor'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => ['min' => 0, 'max' => 100, 'step' => 5],
                ],
                'default' => ['size' => 20, 'unit' => 'px'],
                'condition' => [
                    'layout_type' => ['grid', 'grid_responsive'],
                ],
            ]
        );

        $repeater->add_control(
            'grid_row_class',
            [
                'label' => ___elementor_adapter('Row CSS Class', 'elementor'),
                'type' => Controls_Manager::TEXT,
                'placeholder' => 'custom-row-class',
                'condition' => [
                    'layout_type' => ['grid', 'grid_responsive'],
                ],
            ]
        );

        // Table Advanced Controls
        $repeater->add_control(
            'table_info_heading',
            [
                'label' => ___elementor_adapter('Table Information', 'elementor'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_override',
            [
                'label' => ___elementor_adapter('Override Normal Sorting', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_sticky',
            [
                'label' => ___elementor_adapter('Sticky Table Header', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_responsive',
            [
                'label' => ___elementor_adapter('Responsive Table', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_caption',
            [
                'label' => ___elementor_adapter('Table Caption', 'elementor'),
                'type' => Controls_Manager::TEXT,
                'placeholder' => 'Enter table caption',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_summary',
            [
                'label' => ___elementor_adapter('Table Summary', 'elementor'),
                'type' => Controls_Manager::TEXTAREA,
                'placeholder' => 'Brief description of table content',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        // Grouping Settings
        $repeater->add_control(
            'grouping_heading',
            [
                'label' => ___elementor_adapter('Grouping Settings', 'elementor'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_grouping_field',
            [
                'label' => ___elementor_adapter('Group By Field', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    '' => 'No Grouping',
                    'title' => 'Title',
                    'created' => 'Created Date',
                    'type' => 'Content Type',
                    'author' => 'Author',
                ],
                'default' => '',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_group_rendered',
            [
                'label' => ___elementor_adapter('Use Rendered Output for Grouping', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'condition' => [
                    'layout_type' => 'table',
                    'table_grouping_field!' => '',
                ],
            ]
        );

        // Column Settings
        $repeater->add_control(
            'columns_heading',
            [
                'label' => ___elementor_adapter('Column Settings', 'elementor'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_columns_sortable',
            [
                'label' => ___elementor_adapter('Make Columns Sortable', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        $repeater->add_control(
            'table_default_sort',
            [
                'label' => ___elementor_adapter('Default Sort Column', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    '' => 'No Default Sort',
                    'title' => 'Title',
                    'created' => 'Created Date',
                    'changed' => 'Updated Date',
                ],
                'condition' => [
                    'layout_type' => 'table',
                    'table_columns_sortable' => 'yes',
                ],
            ]
        );

        $repeater->add_control(
            'table_sort_order',
            [
                'label' => ___elementor_adapter('Default Sort Order', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    'asc' => 'Ascending',
                    'desc' => 'Descending',
                ],
                'default' => 'asc',
                'condition' => [
                    'layout_type' => 'table',
                    'table_default_sort!' => '',
                ],
            ]
        );

        $repeater->add_control(
            'table_empty_column',
            [
                'label' => ___elementor_adapter('Hide Empty Columns', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'condition' => [
                    'layout_type' => 'table',
                ],
            ]
        );

        // List Advanced Controls
        $repeater->add_control(
            'list_wrapper_class',
            [
                'label' => ___elementor_adapter('Wrapper CSS Class', 'elementor'),
                'type' => Controls_Manager::TEXT,
                'placeholder' => 'custom-list-wrapper',
                'condition' => [
                    'layout_type' => ['unformatted', 'html_list'],
                ],
            ]
        );

        $repeater->add_control(
            'list_item_class',
            [
                'label' => ___elementor_adapter('Item CSS Class', 'elementor'),
                'type' => Controls_Manager::TEXT,
                'placeholder' => 'custom-item-class',
                'condition' => [
                    'layout_type' => ['unformatted', 'html_list'],
                ],
            ]
        );

        // Slider/Carousel Controls
        $repeater->add_control(
            'slider_autoplay',
            [
                'label' => ___elementor_adapter('Autoplay', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => [
                    'layout_type' => 'slider',
                ],
            ]
        );

        $repeater->add_control(
            'slider_speed',
            [
                'label' => ___elementor_adapter('Slide Speed (ms)', 'elementor'),
                'type' => Controls_Manager::NUMBER,
                'default' => 3000,
                'min' => 1000,
                'step' => 500,
                'condition' => [
                    'layout_type' => 'slider',
                    'slider_autoplay' => 'yes',
                ],
            ]
        );

        $repeater->add_control(
            'slider_navigation',
            [
                'label' => ___elementor_adapter('Show Navigation', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => [
                    'layout_type' => 'slider',
                ],
            ]
        );

        $repeater->add_control(
            'slider_pagination',
            [
                'label' => ___elementor_adapter('Show Pagination', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'default' => 'yes',
                'condition' => [
                    'layout_type' => 'slider',
                ],
            ]
        );

        // Row Plugin Settings (for Views)
        $repeater->add_control(
            'row_settings_heading',
            [
                'label' => ___elementor_adapter('Row Settings', 'elementor'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => [
                    'block_id' => array_keys(array_filter($block_options, function($label, $id) {
                        return strpos($id, 'views_block:') === 0;
                    }, ARRAY_FILTER_USE_BOTH))
                ],
            ]
        );

        $repeater->add_control(
            'row_type',
            [
                'label' => ___elementor_adapter('Row Plugin', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    'fields' => 'Fields',
                    'entity:node' => 'Content (Node)',
                    'entity:user' => 'User',
                    'rss_fields' => 'RSS Fields',
                ],
                'default' => 'fields',
                'condition' => [
                    'block_id' => array_keys(array_filter($block_options, function($label, $id) {
                        return strpos($id, 'views_block:') === 0;
                    }, ARRAY_FILTER_USE_BOTH))
                ],
            ]
        );

        $repeater->add_control(
            'inline_fields',
            [
                'label' => ___elementor_adapter('Inline Fields', 'elementor'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => 'Yes',
                'label_off' => 'No',
                'return_value' => 'yes',
                'condition' => [
                    'row_type' => 'fields',
                    'block_id' => array_keys(array_filter($block_options, function($label, $id) {
                        return strpos($id, 'views_block:') === 0;
                    }, ARRAY_FILTER_USE_BOTH))
                ],
            ]
        );

        $repeater->add_control(
            'separator',
            [
                'label' => ___elementor_adapter('Field Separator', 'elementor'),
                'type' => Controls_Manager::TEXT,
                'default' => ' | ',
                'condition' => [
                    'row_type' => 'fields',
                    'inline_fields' => 'yes',
                    'block_id' => array_keys(array_filter($block_options, function($label, $id) {
                        return strpos($id, 'views_block:') === 0;
                    }, ARRAY_FILTER_USE_BOTH))
                ],
            ]
        );

        // Entity view mode control
        $repeater->add_control(
            'view_mode',
            [
                'label' => ___elementor_adapter('View Mode', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    'teaser' => 'Teaser',
                    'full' => 'Full Content',
                    'default' => 'Default',
                ],
                'default' => 'teaser',
                'condition' => [
                    'row_type' => ['entity:node', 'entity:user'],
                    'block_id' => array_keys(array_filter($block_options, function($label, $id) {
                        return strpos($id, 'views_block:') === 0;
                    }, ARRAY_FILTER_USE_BOTH))
                ],
            ]
        );
      

        // Add a hidden field to store the formatted label for title display
        $repeater->add_control(
          'block_title_label',
          [
            'type' => Controls_Manager::HIDDEN,
            'default' => '',
          ]
        );

        // Update repeater field
        $this->add_control(
          'blocks',
          [
              'label' => ___elementor_adapter('Add Blocks', 'elementor'),
              'type' => Controls_Manager::REPEATER,
              'fields' => $repeater->get_controls(),
              'default' => [],
              'title_field' => '{{{ block_title_label }}}',
          ]
        );

        $this->end_controls_section();

        // --- Style Tab ---
        $this->start_controls_section(
            'section_style_block',
            [
                'label' => ___elementor_adapter('Block Style', 'elementor'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'block_background_color',
            [
                'label' => ___elementor_adapter('Background Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
          'block_text_color',
          [
              'label' => ___elementor_adapter('Text Color', 'elementor'),
              'type' => Controls_Manager::COLOR,
              'selectors' => [
                  '{{WRAPPER}} .elementor-drupal-block' => 'color: {{VALUE}};',
              ],
          ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'block_typography',
                'selector' => '{{WRAPPER}} .elementor-drupal-block',
            ]
        );

        $this->end_controls_section();
    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        $blocks = $settings['blocks'] ?? [];

        if (empty($blocks)) {
            echo '<div class="elementor-alert">No blocks selected.</div>';
            return;
        }

        echo '<div class="elementor-drupal-block">';
        foreach ($blocks as $block) {
            $block_id = $block['block_id'];
            $layout_type = $block['layout_type'] ?? '';
            echo '<div class="drupal-block-item">';
            echo $this->render_block($block_id, $layout_type);
            echo '</div>';
        }
        echo '</div>';
    }

    private function render_layout_styles($item, $layout_type)
    {
        $widget_id = $this->get_id();
        echo '<style>';
        
        if ($layout_type === 'grid' || $layout_type === 'grid_responsive') {
            $columns = $item['grid_columns'] ?? 3;
            $gap = $item['grid_gap']['size'] ?? 20;
            $row_class = $item['grid_row_class'] ?? '';
            
            echo "#{$widget_id} .layout-{$layout_type} { 
                display: grid; 
                grid-template-columns: repeat({$columns}, 1fr); 
                gap: {$gap}px; 
            }";
            
            if ($row_class) {
                echo "#{$widget_id} .layout-{$layout_type} .{$row_class} { 
                    grid-column: 1 / -1; 
                }";
            }
        }
        
        if ($layout_type === 'table') {
            $responsive = ($item['table_responsive'] ?? 'yes') === 'yes';
            $sticky = ($item['table_sticky'] ?? '') === 'yes';
            $grouping = !empty($item['table_grouping_field']);
            
            echo "#{$widget_id} .layout-table table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 0; 
            }";
            
            if ($responsive) {
                echo "@media (max-width: 768px) {
                    #{$widget_id} .layout-table table { 
                        overflow-x: auto; 
                        display: block; 
                        white-space: nowrap; 
                    }
                    #{$widget_id} .layout-table th, 
                    #{$widget_id} .layout-table td { 
                        min-width: 120px; 
                        padding: 8px 4px; 
                    }
                }";
            }
            
            if ($sticky) {
                echo "#{$widget_id} .layout-table thead th { 
                    position: sticky; 
                    top: 0; 
                    background: #f8f9fa; 
                    z-index: 10; 
                    border-bottom: 2px solid #dee2e6; 
                }";
            }
            
            if ($grouping) {
                echo "#{$widget_id} .layout-table .views-group-header { 
                    background: #e9ecef; 
                    font-weight: bold; 
                    padding: 12px; 
                    border-top: 2px solid #6c757d; 
                }";
                
                echo "#{$widget_id} .layout-table .views-group { 
                    margin-bottom: 20px; 
                }";
            }
            
            // Table caption styling
            if (!empty($item['table_caption'])) {
                echo "#{$widget_id} .layout-table caption { 
                    caption-side: top; 
                    padding: 10px; 
                    font-weight: bold; 
                    text-align: left; 
                    background: #f8f9fa; 
                    border: 1px solid #dee2e6; 
                    border-bottom: none; 
                }";
            }
            
            // Sortable column styling
            if (($item['table_columns_sortable'] ?? '') === 'yes') {
                echo "#{$widget_id} .layout-table th.views-field a { 
                    text-decoration: none; 
                    color: inherit; 
                    display: block; 
                    padding: 8px; 
                }";
                
                echo "#{$widget_id} .layout-table th.views-field a:hover { 
                    background: rgba(0,0,0,0.05); 
                }";
                
                echo "#{$widget_id} .layout-table th.active { 
                    background: #e3f2fd; 
                }";
            }
        }
        
        if ($layout_type === 'slider') {
            $speed = $item['slider_speed'] ?? 3000;
            $navigation = ($item['slider_navigation'] ?? 'yes') === 'yes';
            $pagination = ($item['slider_pagination'] ?? 'yes') === 'yes';
            
            echo "#{$widget_id} .layout-slider { animation-duration: {$speed}ms; }";
            
            if (!$navigation) {
                echo "#{$widget_id} .swiper-button-next, #{$widget_id} .swiper-button-prev { display: none; }";
            }
            
            if (!$pagination) {
                echo "#{$widget_id} .swiper-pagination { display: none; }";
            }
        }
        
        echo '</style>';
    }

    private function render_slider_layout($item)
    {
        $autoplay = $item['slider_autoplay'] ?? 'yes';
        $speed = $item['slider_speed'] ?? 3000;
        
        return '<div class="swiper-container" data-autoplay="' . $autoplay . '" data-speed="' . $speed . '">' .
               '<div class="swiper-wrapper">' .
               '<div class="swiper-slide">' . $this->render_block($item['block_id'], $item) . '</div>' .
               '</div></div>';
    }

    private function render_block($block_id, $layout_type = '')
{
    if (!$block_id) return '';

    // ✅ Views block
    if (strpos($block_id, 'views_block:') === 0) {
        [, $view_display] = explode(':', $block_id);
        [$view_id, $display_id] = explode('-', $view_display, 2);

        /** @var \Drupal\views\Entity\View $view */
        $view = \Drupal\views\Entity\View::load($view_id);
        if (!$view) {
            return "<div class='elementor-alert'>View not found</div>";
        }

        // ✅ Valid plugin mapping
        $layout_type_map = [
            'list' => 'html_list',
            'table' => 'table',
            'grid' => 'grid',
            'grid_responsive' => 'grid_responsive',
            'rss' => 'rss',
            'opml' => 'opml',
        ];

        if ($layout_type) {
            $valid_style = $layout_type_map[$layout_type] ?? null;

            if ($valid_style) {
                $displays = $view->get('display');

                if (!empty($displays[$display_id])) {
                    $displays[$display_id]['display_options']['defaults']['style'] = FALSE;
                    $displays[$display_id]['display_options']['style']['type'] = $valid_style;

                    $view->set('display', $displays);
                    $view->save();

                    \Drupal::service('cache_tags.invalidator')
                        ->invalidateTags(['views', 'config:view.view.' . $view_id]);
                }
            } else {
                // ❌ If invalid layout_type is passed
                return "<div class='elementor-alert'>Invalid layout type: $layout_type</div>";
            }
        }

        // ✅ Execute & render
        $view_obj = Views::getView($view_id);
        $view_obj->setDisplay($display_id);
        $view_obj->preExecute();
        $view_obj->execute();
        $build = $view_obj->buildRenderable($display_id);

        return \Drupal::service('renderer')->renderRoot($build);
    }

    // ✅ Normal block
    try {
        $block_manager = \Drupal::service('plugin.manager.block');
        $plugin_block = $block_manager->createInstance($block_id, []);
        $render = $plugin_block->build();
        return \Drupal::service('renderer')->renderRoot($render);
    } catch (\Exception $e) {
        return "<div class='elementor-alert'>Block error: " . $e->getMessage() . "</div>";
    }
}

    private function render_view_block($block_id, $layout_type = 'list')
    {
      [, $view_display] = explode(':', $block_id);
      [$view_id, $display_id] = explode('-', $view_display, 2);

      $view = \Drupal\views\Views::getView($view_id);
      if (!$view) {
          return "<div class='elementor-alert'>View not found: $view_id</div>";
      }

      $view->setDisplay($display_id);
      $view->execute();

      // Render array le lo
      $render_array = $view->render();

      return \Drupal::service('renderer')->renderRoot($render_array);
    }

    private function apply_view_style_settings($view, $item)
    {
        $layout_type = $item['layout_type'];
        $style_options = [];
        $row_options = [];
        
        // Style plugin options
        switch ($layout_type) {
            case 'grid':
            case 'grid_responsive':
                $style_options = [
                    'columns' => $item['grid_columns'] ?? 3,
                    'alignment' => $item['grid_alignment'] ?? 'horizontal',
                    'row_class' => $item['grid_row_class'] ?? '',
                    'default_row_class' => true,
                ];
                break;
                
            case 'table':
                $style_options = [
                    'override' => ($item['table_override'] ?? 'yes') === 'yes',
                    'sticky' => ($item['table_sticky'] ?? '') === 'yes',
                    'responsive' => ($item['table_responsive'] ?? 'yes') === 'yes',
                    'caption' => $item['table_caption'] ?? '',
                    'summary' => $item['table_summary'] ?? '',
                    'columns' => [],
                    'default' => $item['table_default_sort'] ?? '',
                    'info' => [
                        'title' => [
                            'sortable' => ($item['table_columns_sortable'] ?? '') === 'yes',
                            'default_sort_order' => $item['table_sort_order'] ?? 'asc',
                        ],
                    ],
                    'empty_column' => ($item['table_empty_column'] ?? '') === 'yes',
                ];
                
                // Grouping settings
                if (!empty($item['table_grouping_field'])) {
                    $style_options['grouping'] = [
                        [
                            'field' => $item['table_grouping_field'],
                            'rendered' => ($item['table_group_rendered'] ?? '') === 'yes',
                            'rendered_strip' => false,
                        ],
                    ];
                }
                break;
                
            case 'unformatted':
            case 'html_list':
                $style_options = [
                    'type' => $item['list_type'] ?? 'ul',
                    'wrapper_class' => $item['list_wrapper_class'] ?? '',
                    'class' => $item['list_item_class'] ?? '',
                ];
                break;
        }
        
        // Row plugin options
        if (!empty($item['row_type'])) {
            switch ($item['row_type']) {
                case 'fields':
                    $row_options = [
                        'inline' => [
                            'first_field' => ($item['inline_fields'] ?? '') === 'yes',
                        ],
                        'separator' => $item['separator'] ?? ' | ',
                        'hide_empty' => true,
                    ];
                    break;
                    
                case 'entity:node':
                case 'entity:user':
                    $row_options = [
                        'view_mode' => $item['view_mode'] ?? 'teaser',
                    ];
                    break;
            }
        }
        
        // Apply settings to view
        $display = $view->getDisplay();
        
        if (!empty($style_options)) {
            $display->setOption('style', [
                'type' => $layout_type,
                'options' => $style_options,
            ]);
        }
        
        if (!empty($row_options)) {
            $display->setOption('row', [
                'type' => $item['row_type'] ?? 'fields',
                'options' => $row_options,
            ]);
        }
    }


    public function render_plain_content()
    {
        echo 'Drupal Blocks';
    }

    protected function _content_template()
    {
        // Editor preview - keep minimal
    }
}
