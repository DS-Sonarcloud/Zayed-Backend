<?php

namespace Drupal\drupal_layoutbuilder;

use DrupalLayoutbuilder\Controls_Manager;
use DrupalLayoutbuilder\Widget_Base;
use DrupalLayoutbuilder\Repeater;
use DrupalLayoutbuilder\Group_Control_Typography;
use DrupalLayoutbuilder\Group_Control_Background;
use Drupal\views\Views;
use Drupal\views\Plugin\views\style\StylePluginBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use DrupalLayoutbuilder\Group_Control_Border;
use Drupal\webform\Entity\Webform;
use Drupal\Core\StringTranslation\StringTranslationTrait;


if (!defined('ABSPATH')) {
    exit;
}

class Widget_Drupal_Webform extends Widget_Base
{
    use StringTranslationTrait;
    public function get_name()
    {
        return 'drupal-webform';
    }

    public function get_title()
    {
        return ___layoutbridge_adapter('Drupal webform', 'elementor');
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
        return ['drupal', 'webform', 'code'];
    }

    public function is_reload_preview_required()
    {
        return false;
    }

    protected function _register_controls()
    {
        // --- Content Tab ---
        $this->start_controls_section(
            'section_content',
            [
                'label' => ___layoutbridge_adapter('Content', 'elementor'),
            ]
        );


        $this->add_control(
            'webform_id',
            [
                'label' => ___layoutbridge_adapter('Select Webform', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => $this->get_webform_list(),
                'default' => '',
            ]
        );

        $this->add_control(
            'field_select_webform',
            [
                'label' => ___layoutbridge_adapter('Webform Data', 'elementor'),
                'type' => Controls_Manager::HIDDEN,
                'default' => '',
            ]
        );
        $this->add_control(
            'webform_ajax_conditions',
            [
                'label' => ___layoutbridge_adapter('AJAX Conditions', 'elementor'),
                'type' => Controls_Manager::HIDDEN,
                'default' => '',
            ]
        );
        $this->end_controls_section();

        $this->start_controls_section(
            'webform_body',
            [
                'label' => ___layoutbridge_adapter('Body Style', 'elementor'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );
        $this->add_control(
            'webform_body_color',
            [
                'label' => ___layoutbridge_adapter('Background Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform' => 'background-color: {{VALUE}};',
                ],
            ]
        );
        $this->add_responsive_control(
            'body_padding',
            [
                'label' => ___layoutbridge_adapter('Padding', 'elementor'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em', '%'],
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );
        $this->add_responsive_control(
            'body_margin',
            [
                'label' => ___layoutbridge_adapter('Margin', 'elementor'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', 'em', '%'],
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();

        // --- Style Tab ---
        $this->start_controls_section(
            'section_title_block',
            [
                'label' => ___layoutbridge_adapter('Title Style', 'elementor'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );
        $this->add_control(
            'webform_text_color',
            [
                'label' => ___layoutbridge_adapter('Text Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper .webform-title' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'block_typography',
                'selector' => '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper .webform-title',
            ]
        );

        $this->add_responsive_control(
            'title_align',
            [
                'label' => ___layoutbridge_adapter('Title Alignment', 'elementor'),
                'type' => Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => ___layoutbridge_adapter('Left', 'elementor'),
                        'icon' => 'fa fa-align-left',
                    ],
                    'center' => [
                        'title' => ___layoutbridge_adapter('Center', 'elementor'),
                        'icon' => 'fa fa-align-center',
                    ],
                    'right' => [
                        'title' => ___layoutbridge_adapter('Right', 'elementor'),
                        'icon' => 'fa fa-align-right',
                    ],
                ],
                'default' => 'left',
                'selectors' => [
                    '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper .webform-title' => 'text-align: {{VALUE}};',
                ],
            ]
        );

        $this->end_controls_section();

        $this->start_controls_section(
            'section_fields',
            [
                'label' => ___layoutbridge_adapter('Field Style', 'elementor'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );
        $this->add_control(
            'webform_field_color',
            [
                'label' => ___layoutbridge_adapter('Field Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper label' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'webform_required_color',
            [
                'label' => ___layoutbridge_adapter('Mandatory Color', 'elementor'),
                'type' => \DrupalLayoutbuilder\Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper label.form-required::after' => 'color: {{VALUE}}; content:" *"; background:none;',
                ],
            ]
        );


        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'field_typography',
                'selector' => '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper label',
            ]
        );

        $this->add_responsive_control(
            'field_align',
            [
                'label' => ___layoutbridge_adapter('Alignment', 'elementor'),
                'type' => \DrupalLayoutbuilder\Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => ___layoutbridge_adapter('Left', 'elementor'),
                        'icon' => 'fa fa-align-left',
                    ],
                    'center' => [
                        'title' => ___layoutbridge_adapter('Center', 'elementor'),
                        'icon' => 'fa fa-align-center',
                    ],
                    'right' => [
                        'title' => ___layoutbridge_adapter('Right', 'elementor'),
                        'icon' => 'fa fa-align-right',
                    ],
                ],
                'default' => '',
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper' => 'text-align: {{VALUE}};', // aligns labels inline
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper input:not([type="submit"]),
             {{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper textarea' => 'margin-{{VALUE}}: 0; display: inline-block;',
                ],
            ]
        );


        $this->add_control(
            'field_style',
            [
                'label' => ___layoutbridge_adapter('Field', 'elementor'),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
            ]
        );

        $this->add_control(
            'field_width',
            [
                'label' => ___layoutbridge_adapter('Field Size Width', 'elementor'),
                'type' => \DrupalLayoutbuilder\Controls_Manager::SLIDER,
                'size_units' => ['%'], // only percentage allowed
                'range' => [
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 100,
                ],
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper input:not([type="submit"]):not([type="checkbox"]):not([type="radio"]), 
             {{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper textarea' => 'width: {{SIZE}}{{UNIT}};',
                ],
            ]
        );



        $this->add_control(
            'border_width',
            [
                'label' => ___layoutbridge_adapter('Border Width', 'elementor'),
                'type' => Controls_Manager::SLIDER,
                'default' => [
                    'size' => 1,
                ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 10,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper input, 
                    {{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper textarea' => 'border-width: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'border_radius',
            [
                'label' => ___layoutbridge_adapter('Border Radius', 'elementor'),
                'type' => Controls_Manager::SLIDER,
                'default' => [
                    'size' => 1,
                ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 50,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper input, 
                    {{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper textarea' => 'border-radius: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'border_color',
            [
                'label' => ___layoutbridge_adapter('Border Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper input, 
                    {{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper textarea, 
                    {{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper select' => 'border-color: {{VALUE}};',
                ],
            ]
        );


        $this->add_control(
            'button_color',
            [
                'label' => ___layoutbridge_adapter('Button Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper input[type="submit"]' => 'background-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'button_border_color',
            [
                'label' => ___layoutbridge_adapter('Button Border Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper input[type="submit"]' => 'border-color: {{VALUE}};',
                ],
            ]
        );

        $this->add_control(
            'button_inner_text_color',
            [
                'label' => ___layoutbridge_adapter('Button Text Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}}  .drupal_layoutbuilder-drupal-webform .webform-wrapper input[type="submit"]' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_align',
            [
                'label' => ___layoutbridge_adapter('Alignment', 'elementor'),
                'type' => \DrupalLayoutbuilder\Controls_Manager::CHOOSE,
                'options' => [
                    'left' => [
                        'title' => ___layoutbridge_adapter('Left', 'elementor'),
                        'icon' => 'fa fa-align-left',
                    ],
                    'center' => [
                        'title' => ___layoutbridge_adapter('Center', 'elementor'),
                        'icon' => 'fa fa-align-center',
                    ],
                    'right' => [
                        'title' => ___layoutbridge_adapter('Right', 'elementor'),
                        'icon' => 'fa fa-align-right',
                    ],
                ],
                'default' => 'center',
                'selectors_dictionary' => [
                    'left' => 'margin-left: 0; margin-right: auto;',
                    'center' => 'margin-left: auto; margin-right: auto;',
                    'right' => 'margin-left: auto; margin-right: 0;',
                ],
                'selectors' => [
                    '{{WRAPPER}} .drupal_layoutbuilder-drupal-webform .webform-wrapper .form-actions input' => '{{VALUE}}',
                ],
            ]
        );



        $this->end_controls_section();
    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        $webform_id = $settings['webform_id'] ?? null;

        $webform = Webform::load($webform_id);
        //dd($webform);
        if ($webform) {

            $build = [
                '#type' => 'webform',
                '#webform' => $webform->id(),
                '#default_data' => [],
                '#submission' => NULL,
                '#title' => $webform->label(),
            ];

            $rendered_form = \Drupal::service('renderer')->render($build);

            echo '<div class="drupal_layoutbuilder-drupal-webform">';
            echo '<div class="webform-wrapper"><h2 class="webform-title">' . $webform->label() . '</h2>'; // Manually add title
            echo $rendered_form;
            echo '</div></div>';
        } else {
            echo "<div class='drupal_layoutbuilder-alert'>Webform not found.</div>";
        }
    }

    protected function get_webform_fields_json($webform_id)
    {
        if (empty($webform_id)) {
            return '';
        }

        $webform = \Drupal\webform\Entity\Webform::load($webform_id);
        if (!$webform) {
            return '';
        }

        $allowed_keys = ['uuid', 'langcode', 'status', 'id', 'title', 'description', 'elements'];
        $webform_array = $webform->toArray();
        $clean_webform = array_intersect_key($webform_array, array_flip($allowed_keys));

        if (!empty($clean_webform['elements']) && is_string($clean_webform['elements'])) {
            try {
                $parsed_elements = \Drupal\Component\Serialization\Yaml::decode($clean_webform['elements']);
                $clean_webform['elements'] = $parsed_elements;
            } catch (\Exception $e) {
                // Ignore parse errors, keep raw string
            }
        }
        return json_encode($clean_webform);
    }


    public function render_plain_content()
    {
        echo 'Drupal Webforms';
    }

    protected function _content_template()
    {
        // Editor preview - keep minimal
    }

    protected function get_webform_list()
    {
        $options = ['' => $this->t('None')];

        try {
            $current_user = \Drupal::currentUser();
            $uid = $current_user->id();
            $storage = \Drupal::entityTypeManager()->getStorage('webform');

            // Load only user's own webforms (bypass permission sees all)
            if ($current_user->hasPermission('bypass content owner restrictions')) {
                $webforms = $storage->loadMultiple();
            } else {
                $webforms = $storage->loadByProperties(['uid' => $uid]);
            }

            if (empty($webforms)) {
                return $options;
            }

            $used_webforms = $this->getUsedWebforms();

            foreach ($webforms as $id => $webform) {
                // Only show active webforms
                if ($webform->status() !== TRUE) {
                    continue;
                }

                if (!$this->hasElementorCategory($webform)) {
                    continue;
                }

                // Exclude webforms already assigned to a node
                if (in_array($id, $used_webforms)) {
                    continue;
                }

                $options[$id] = $webform->label();
            }
        } catch (\Exception $e) {
            \Drupal::logger('drupal_layoutbuilder')->error('Error loading webform list: @msg', ['@msg' => $e->getMessage()]);
        }

        return $options;
    }

    /**
     * Check if webform has "Elementor" category.
     *
     */
    protected function hasElementorCategory($webform)
    {
        $category = $webform->get('category');
        if (empty($category)) {
            $category = $webform->get('categories');
        }

        if (empty($category)) {
            return false;
        }

        if (is_array($category)) {
            foreach ($category as $cat) {
                if (is_string($cat) && strtolower(trim($cat)) === 'elementor') {
                    return true;
                }
            }
            return false;
        }

        return is_string($category) && strtolower(trim($category)) === 'elementor';
    }

    /**
     * Get list of webform IDs that are already assigned to nodes.
     *
     */
    protected function getUsedWebforms()
    {
        $used_webforms = [];

        try {
            $connection = \Drupal::database();

            // Check if webform_usage table exists
            if ($connection->schema()->tableExists('webform_usage')) {
                $result = $connection->select('webform_usage', 'wu')
                    ->fields('wu', ['webform_id'])
                    ->distinct()
                    ->execute();

                foreach ($result as $row) {
                    $used_webforms[] = $row->webform_id;
                }
            }
        } catch (\Exception $e) {
            \Drupal::logger('drupal_layoutbuilder')->error('Error checking webform usage: @msg', ['@msg' => $e->getMessage()]);
        }

        return $used_webforms;
    }
}
