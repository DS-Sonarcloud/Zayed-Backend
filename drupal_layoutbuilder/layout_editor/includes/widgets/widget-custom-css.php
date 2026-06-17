<?php

namespace Drupal\drupal_layoutbuilder;

use DrupalLayoutbuilder\Widget_Base;
use DrupalLayoutbuilder\Controls_Manager;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class Widget_Custom_CSS extends Widget_Base {

    public function get_name() {
        return 'custom-css-widget';
    }

    public function get_title() {
        return __('Custom CSS Widget', 'elementor');
    }

    public function get_icon() {
        return 'eicon-code'; // Elementor icon
    }

    public function get_categories() {
        return [ 'general' ]; // Change category if needed
    }

    protected function _register_controls() {
        // Custom CSS section
        $this->start_controls_section(
            'section_custom_css',
            [
                'label' => __('Custom CSS', 'elementor'),
                'tab' => Controls_Manager::TAB_ADVANCED,
            ]
        );

        $this->add_control(
            'custom_css',
            [
                'label' => __('Custom CSS', 'elementor'),
                'type' => Controls_Manager::CODE,
                'language' => 'css',
                'rows' => 20,
                'default' => "selector {\n    color: red;\n}",
            ]
        );

        $this->end_controls_section();
    }

    // Frontend render (live site)
    protected function render() {
        $settings = $this->get_settings_for_display();

        // Custom CSS injection
        if (!empty($settings['custom_css'])) {
            $custom_css = str_replace(
                'selector',
                '.drupal_layoutbuilder-element-' . $this->get_id(),
                $settings['custom_css']
            );
            echo '<style>' . $custom_css . '</style>';
        }

        // Widget HTML
        echo '<div class="drupal_layoutbuilder-my-widget">Hello from Custom CSS Widget</div>';
    }

    // Editor live preview
    protected function content_template() {
        ?>
        <div class="drupal_layoutbuilder-my-widget">Hello from Custom CSS Widget</div>
        <# if ( settings.custom_css ) { #>
            <style>
                {{{ settings.custom_css.replace(/selector/g, '.drupal_layoutbuilder-element-{{ view.getID() }}') }}}
            </style>
        <# } #>
        <?php
    }
}
