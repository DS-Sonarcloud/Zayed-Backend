<?php

namespace Drupal\elementor;

use Elementor\Controls_Manager;
use Elementor\Controls_Stack;

class CustomCss {

    /**
     * Register Custom CSS control in every element automatically.
     */
    public static function attach_controls() {
        add_action_elementor_adapter('elementor/element/after_section_end', [__CLASS__, 'register_controls'], 10, 2);
    }

    /**
     * Add Custom CSS control to each element
     */
    public static function register_controls(Controls_Stack $element, $section_id) {
        // Only attach to the last "Advanced" section
        if ($section_id !== 'section_custom_css_pro') {
            return;
        }

        $element->start_controls_section(
            'section_custom_css',
            [
                'label' => t('Custom CSS'),
                'tab' => Controls_Manager::TAB_ADVANCED,
            ]
        );

        $element->add_control(
            'custom_css',
            [
                'label' => t('Add your own custom CSS'),
                'type' => Controls_Manager::CODE,
                'language' => 'css',
                'render_type' => 'none',
                'description' => t('Use "selector" to target this element.'),
            ]
        );

        $element->end_controls_section();
    }

    /**
     * Collect and render all custom CSS from the page.
     * Call this at the end of page render.
     */
    public static function render_all_widgets_css($elementor_data) {
        if (empty($elementor_data['elements'])) {
            return;
        }

        $css_output = '';

        foreach ($elementor_data['elements'] as $element) {
            $css_output .= self::extract_widget_css($element);
        }

        if ($css_output) {
            echo '<style>' . $css_output . '</style>';
        }
    }

    /**
     * Recursively extract CSS from widget settings
     */
    protected static function extract_widget_css($element) {
        $css_output = '';

        if (!empty($element['settings']['custom_css'])) {
            $widget_id = '.elementor-element-' . $element['id'];
            $css = str_replace('selector', $widget_id, $element['settings']['custom_css']);
            $css_output .= $css;
        }

        // Check nested elements (columns/inner sections)
        if (!empty($element['elements'])) {
            foreach ($element['elements'] as $child) {
                $css_output .= self::extract_widget_css($child);
            }
        }

        return $css_output;
    }
}
