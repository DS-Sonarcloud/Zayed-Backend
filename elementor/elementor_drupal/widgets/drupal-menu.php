<?php

namespace Drupal\elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use Elementor\Repeater;
use Elementor\Group_Control_Typography;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\Core\Url;

if (!defined('ABSPATH')) {
    exit;
}

class Widget_Drupal_Menu extends Widget_Base
{

    public function get_name()
    {
        return 'drupal-menu';
    }

    public function get_title()
    {
        return \t('Drupal menu');
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
        return ['drupal', 'menu', 'code'];
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
                'label' => \t('Menus'),
            ]
        );

        $menuStorage = \Drupal::entityTypeManager()->getStorage('menu');
        $menus = $menuStorage->loadMultiple();
        $menu_options = [];
        $all_menu_items = [];
        foreach ($menus as $menu_id => $menu) {
            $menu_options[$menu_id] = $menu->label() . ' (' . $menu_id . ')';
            // Get all menu items for this menu
            $menu_link_storage = \Drupal::entityTypeManager()->getStorage('menu_link_content');
            $menu_items = $menu_link_storage->loadByProperties(['menu_name' => 'footer']);
            $all_menu_items[$menu_id] = $this->getMenuItems($menu_id);
          
        }
        $repeater = new Repeater();

        $repeater->add_control(
            'block_menu_data',
            [
                'type' => Controls_Manager::HIDDEN,
                'default' => $all_menu_items,
            ]
        );

        $repeater->add_control(
            'block_id',
            [
                'label' => \t('Select Menu'),
                'type' => Controls_Manager::SELECT,
                'options' => $menu_options,
                'default' => '',
            ]
        );

        $repeater->add_control(
            'level',
            [
                'label' => \t('Start Level'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    1 => '1 (Top level)',
                    2 => '2',
                    3 => '3',
                ],
                'default' => 1,
            ]
        );

        $repeater->add_control(
            'depth',
            [
                'label' => \t('Number of Levels'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    0 => \t('Unlimited'),
                    1 => '1',
                    2 => '2',
                    3 => '3',
                ],
                'default' => 2,
            ]
        );

        $repeater->add_control(
            'expand_all_items',
            [
                'label' => \t('Expand All Menu Items'),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => \t('Yes'),
                'label_off' => \t('No'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $repeater->add_control(
            'block_title_label',
            [
                'type' => Controls_Manager::HIDDEN,
                'default' => '',
            ]
        );

        $this->add_control(
            'blocks',
            [
                'label' => \t('Add Menu'),
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
                'label' => \t('Menu Styling'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'menu_style',
            [
                'label' => \t('Menu Style'),
                'type' => Controls_Manager::SELECT,
                'default' => 'dropdown',
                'options' => [
                    'dropdown' => \t('Dropdown'),
                    'tabs' => \t('Tabs'),
                    'vertical' => \t('Vertical'),
                ],
            ]
        );

        $this->add_control(
            'parent_text_color',
            [
                'label' => \t('Parent Item Text Color'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu > li > a' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'parent_hover_text_color',
            [
                'label' => \t('Parent Item Hover Text Color'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu > li > a:hover' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'child_text_color',
            [
                'label' => \t('Child Item Text Color'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu ul li a' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'child_hover_text_color',
            [
                'label' => \t('Child Item Hover Text Color'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu ul li a:hover' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'dropdown_background_color',
            [
                'label' => \t('Dropdown Background Color'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu ul' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'hover_background',
            [
                'label' => \t('Hover Background'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu a:hover' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'active_background_color',
            [
                'label' => \t('Active Menu Item Background Color'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu li.active > a' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'menu_background_color',
            [
                'label' => \t('Menu Background Color'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'dropdown_border_radius',
            [
                'label' => \t('Dropdown Border Radius'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%', 'em'],
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu ul' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'alignment',
            [
                'label' => \t('Menu Alignment'),
                'type' => Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => \t('Left'),
                        'icon' => 'eicon-text-align-left',
                    ],
                    'center' => [
                        'title' => \t('Center'),
                        'icon' => 'eicon-text-align-center',
                    ],
                    'right' => [
                        'title' => \t('Right'),
                        'icon' => 'eicon-text-align-right',
                    ],
                ],
                'default' => 'left',
                'selectors' => [
                    '{{WRAPPER}} .elementor-drupal-block .menu' => 'text-align: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'typography',
                'selector' => '{{WRAPPER}} .elementor-drupal-block .menu a',
            ]
        );

        $this->end_controls_section();
    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        $blocks = $settings['blocks'] ?? [];

        if (empty($blocks)) {
            echo '<div class="elementor-alert">' . \t('No menus selected.') . '</div>';
            return;
        }

        $menu_style = $settings['menu_style'] ?? 'dropdown';

        // Unique ID for this widget instance
        $unique_id = 'elementor-drupal-block-' . $this->get_id();

        // Scoped styles for this widget instance
        echo '<style>';
        $dropdown_bg = $settings['dropdown_background_color'] ?? '';
        $active_background_color = $settings['active_background_color'] ?? '';

        if ($menu_style === 'dropdown') {
            echo "
                #$unique_id .menu ul {
                    display: none;
                    position: absolute;
                    background: white;
                    padding: 0;
                    list-style: none;
                    z-index: 999;
                    min-width: 150px;
                    margin: 0;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }
                #$unique_id .menu li:hover > ul {
                    display: block;
                }
                #$unique_id .menu li {
                    position: relative;
                }
                #$unique_id .menu a {
                    display: block;
                    padding: 10px 15px;
                    text-decoration: none;
                }
            ";
        } elseif ($menu_style === 'tabs') {
            echo "
                #$unique_id .menu {
                    display: flex;
                    border-bottom: 2px solid #ccc;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    position: relative;
                }
                #$unique_id .menu > li {
                    position: relative;
                    margin-right: 15px;
                }
                #$unique_id .menu > li > a {
                    padding: 10px 20px;
                    display: block;
                    border: 1px solid transparent;
                    border-bottom: none;
                    cursor: pointer;
                    text-decoration: none;
                }
                #$unique_id .menu > li:hover > a,
                #$unique_id .menu > li.active > a {
                    border: 1px solid #ccc;
                    border-bottom: 2px solid white;
                    background-color: {$active_background_color} !important;
                }
                /* Base submenu styles */
                #$unique_id .menu ul {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    background:{$dropdown_bg} !important;
                    border: 1px solid #ccc;
                    padding: 0;
                    margin: 0;
                    list-style: none;
                    min-width: 150px;
                    z-index: 9999;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                }
                /* Show submenu and all nested submenus on hover or active */
                #$unique_id .menu > li:hover > ul,
                #$unique_id .menu > li.active > ul,
                #$unique_id .menu ul li:hover > ul {
                    display: block;
                }
                /* Submenus inside submenus positioned to the right */
                #$unique_id .menu ul ul {
                    top: 0;
                    left: 100%;
                    margin-left: 1px;
                }
                #$unique_id .menu ul li a {
                    padding: 10px 15px;
                    display: block;
                    white-space: nowrap;
                    text-decoration: none;
                }
                #$unique_id .menu ul li a:hover {
                    background-color: #eee;
                }
            ";
        } elseif ($menu_style === 'vertical') {
            echo "
                #$unique_id .menu {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                #$unique_id .menu > li {
                    border-bottom: 1px solid #ccc;
                }
                #$unique_id .menu a {
                    display: block;
                    padding: 10px 15px;
                    text-decoration: none;
                }
                #$unique_id .menu ul {
                    padding-left: 15px;
                    margin: 0;
                    list-style: none;
                    display: none;
                }
                #$unique_id .menu li:hover > ul {
                    display: block;
                }
            ";
        }

        echo '</style>';

        // Wrapper with unique ID
        echo '<div id="' . $unique_id . '" class="elementor-drupal-block menu-style-' . $menu_style . '">';

        foreach ($blocks as $item) {
            if (empty($item['block_id'])) {
                echo '<div class="elementor-alert elementor-alert-warning">';
                echo \Drupal::translation()->translate('No menu block selected for this item.');
                echo '</div>';
                continue;
            }

            try {
                $block_output = $this->render_block(
                    $item['block_id'],
                    (int) ($item['level'] ?? 1),
                    (int) ($item['depth'] ?? 2),
                    $item['expand_all_items'] === 'yes'
                );

                if (empty($block_output)) {
                    echo '<div class="elementor-alert elementor-alert-danger">';
                    echo \Drupal::translation()->translate('Unable to render the selected menu block.');
                    echo '</div>';
                } else {
                    echo '<div class="drupal-block-item">';
                    echo '<div class="drupal-menu-wrapper">';
                    echo $block_output;
                    echo '</div>';
                    echo '</div>';
                }
            } catch (\Exception $e) {
                echo '<div class="elementor-alert elementor-alert-danger">';
                echo \Drupal::translation()->translate('Error loading menu block: ') . htmlspecialchars($e->getMessage());
                echo '</div>';
            }
        }

        echo '</div>';

        // Scoped JS for tabs menu style
        if ($menu_style === 'tabs') {
            echo "
            <script>
                (function(\$){
                    \$('#$unique_id.menu-style-tabs .menu > li > a').click(function(e){
                        e.preventDefault();
                        var \$parentLi = \$(this).parent();
                        if (\$parentLi.hasClass('active')) {
                            \$parentLi.removeClass('active');
                        } else {
                            \$parentLi.siblings().removeClass('active');
                            \$parentLi.addClass('active');
                        }
                    });
                })(jQuery);
            </script>
            ";
        }
    }

    private function render_block($menu_id, $level = 1, $depth = 2, $expand_all_items = true)
    {
        $block_manager = \Drupal::service('plugin.manager.block');
        $block_plugin_id = 'system_menu_block:' . $menu_id;

        $configuration = [
            'level' => $level,
            'depth' => $depth,
            'expand_all_items' => $expand_all_items,
        ];

        $block = $block_manager->createInstance($block_plugin_id, $configuration);

        $renderer = \Drupal::service('renderer');
        $build = $block->build();

        // Render block array to HTML
        $html = $renderer->renderRoot($build);

        return $html;
    }

    private function getMenuItems($menu_name)
    {
        $menu_tree = \Drupal::menuTree();
 
        // Load parameters (fetch full tree depth)
        $params = (new MenuTreeParameters())->setMaxDepth(10);
 
        // Load menu tree
        $tree = $menu_tree->load($menu_name, $params);
 
        // Apply manipulators: check access + sorting
        $manipulators = [
            ['callable' => 'menu.default_tree_manipulators:checkAccess'],
            ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
        ];
        $tree = $menu_tree->transform($tree, $manipulators);
 
        // Recursive builder
        $buildMenu = function ($tree) use (&$buildMenu) {
            $items = [];
            foreach ($tree as $element) {
                $link = $element->link;
                $item = [
                    'title' => (string) $link->getTitle(),
                    'url'   => $link->getUrlObject() instanceof Url ? $link->getUrlObject()->toString() : '',
                ];
 
                // If has children, process recursively
                if (!empty($element->subtree)) {
                    $item['children'] = $buildMenu($element->subtree);
                }
 
                $items[] = $item;
            }
            return $items;
        };
 
        return $buildMenu($tree);
    }
}
