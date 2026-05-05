<?php

namespace Drupal\elementor;

use Elementor\Control_Base_Multiple;
use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Custom CSS control for Elementor (free version compatible)
 */
class Control_Drupal_Custom_CSS extends Control_Base_Multiple {

	public function get_type() {
		return 'drupal_custom_css';
	}

	public function get_default_value() {
		return '';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<label class="elementor-control-title">{{{ data.label }}}</label>

			<div class="elementor-control-input-wrapper">
				<textarea
					class="elementor-control-tag-area"
					rows="10"
					placeholder="selector { color: red; }"
					data-setting="{{ data.name }}"
					style="font-family: monospace; width:100%; height:150px;"
				>{{ data.controlValue }}</textarea>
			</div>

			<div class="elementor-control-field-description">
				<?php echo t( 'Use "selector" to target this element.'); ?>
			</div>
		</div>
		<?php
	}

	protected function get_default_settings() {
		return [
			'label_block' => true,
			'dynamic' => [
				'active' => true,
			],
		];
	}
}
