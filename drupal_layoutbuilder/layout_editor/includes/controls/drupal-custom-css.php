<?php

namespace Drupal\drupal_layoutbuilder;

use DrupalLayoutbuilder\Control_Base_Multiple;
use DrupalLayoutbuilder\Modules\DynamicTags\Module as TagsModule;

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
		<div class="drupal_layoutbuilder-control-field">
			<label class="drupal_layoutbuilder-control-title">{{{ data.label }}}</label>

			<div class="drupal_layoutbuilder-control-input-wrapper">
				<textarea
					class="drupal_layoutbuilder-control-tag-area"
					rows="10"
					placeholder="selector { color: red; }"
					data-setting="{{ data.name }}"
					style="font-family: monospace; width:100%; height:150px;"
				>{{ data.controlValue }}</textarea>
			</div>

			<div class="drupal_layoutbuilder-control-field-description">
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
