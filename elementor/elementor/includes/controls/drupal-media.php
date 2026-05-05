<?php

namespace Elementor;

use Elementor\Modules\DynamicTags\Module as TagsModule;

if (! defined('ABSPATH')) {
    exit;
}

/**
 * Elementor Drupal Media control.
 *
 * Looks like Elementor's native media control, but opens Drupal's Media Library.
 */
class Control_Drupal_Media extends Control_Base_Multiple
{

    /**
     * Get control type.
     */
    public function get_type()
    {
        return 'drupal_media';
    }

    /**
     * Default value.
     */
    public function get_default_value()
    {
        return [
            'url' => '',
            'id'  => '',
        ];
    }

    /**
     * Enqueue styles/scripts.
     * Reuse Elementor’s existing CSS, plus our JS handler.
     */
    public function enqueue()
    {
        global $wp_version;

        // In Drupal, SCRIPT_DEBUG may not exist, so set safe fallback.
        $suffix = \Drupal::state()->get('system.css_js_query_string') ? '' : '.min';

        // Reuse Elementor's CSS (optional).
        wp_enqueue_style_elementor_adapter(
            'media',
            admin_url_elementor_adapter('/css/media' . $suffix . '.css'),
            [],
            $wp_version
        );
    }


    /**
     * Control panel markup (Underscore template).
     */
    public function content_template() {
    ?>
    <div class="elementor-control-field">
        <label class="elementor-control-title">{{{ data.label }}}</label>

        <div class="elementor-control-input-wrapper">
            <div class="drupal-media-box elementor-control-media elementor-control-preview-area">

                <!-- Clickable area -->
                <div class="drupal-media-select-area select-drupal-media">
                    <# if ( data.controlValue && data.controlValue.url ) { #>
                        <img class="drupal-media-preview" src="{{ data.controlValue.url }}" alt="" />
                        <div class="drupal-media-overlay">
                            <i class="eicon-edit"></i>
                            <span><?php echo ___elementor_adapter('Change Media', 'elementor'); ?></span>
                        </div>
                    <# } else { #>
                        <div class="drupal-media-placeholder">
                            <i class="eicon-plus-circle"></i>
                            <span><?php echo ___elementor_adapter('Choose from Media Library', 'elementor'); ?></span>
                        </div>
                    <# } #>
                </div>

                <!-- Delete -->
                <# if ( data.controlValue && data.controlValue.id ) { #>
                    <div class="drupal-media-delete">
                        <i class="eicon-trash"></i>
                    </div>
                <# } #>

            </div>
        </div>

        <!-- Hidden binding -->
        <input type="hidden" data-setting="{{ data.name }}" value="{{ data.controlValue.id }}" />
    </div>
    <?php
}

public function get_style_value( $control, $settings ) {
	$control_name = is_array( $control ) ? $control['name'] : $control;
	$value = $settings[ $control_name ] ?? '';

	if ( is_string( $value ) && filter_var( $value, FILTER_VALIDATE_URL ) ) {
		return $value;
	}

	if ( is_array( $value ) && !empty( $value['url'] ) ) {
		return $value['url'];
	}

	if ( is_array( $value ) && !empty( $value['id'] ) ) {
		try {
			$file = \Drupal\file\Entity\File::load( $value['id'] );
			if ( $file ) {
				return \Drupal::service('file_url_generator')->generateAbsoluteString( $file->getFileUri() );
			}
		} catch ( \Exception $e ) {}
	}

	return '';
}

    /**
     * Default settings.
     */
    protected function get_default_settings()
    {
        return [
            'label_block' => true,
            'media_type'  => 'image',
            'dynamic' => [
                'categories' => [TagsModule::IMAGE_CATEGORY],
                'returnType' => 'object',
            ],
        ];
    }
}
