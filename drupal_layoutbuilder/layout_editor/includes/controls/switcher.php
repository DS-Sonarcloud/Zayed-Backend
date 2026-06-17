<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor switcher control.
 *
 * A base control for creating switcher control. Displays an on/off switcher,
 * basically a fancy UI representation of a checkbox.
 *
 * @since 1.0.0
 */
class Control_Switcher extends Base_Data_Control {

	/**
	 * Get switcher control type.
	 *
	 * Retrieve the control type, in this case `switcher`.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'switcher';
	}

	/**
	 * Render switcher control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$control_uid = $this->get_control_uid();
		?>
		<div class="drupal_layoutbuilder-control-field">
			<label for="<?php echo $control_uid; ?>" class="drupal_layoutbuilder-control-title">{{{ data.label }}}</label>
			<div class="drupal_layoutbuilder-control-input-wrapper">
				<label class="drupal_layoutbuilder-switch">
					<input id="<?php echo $control_uid; ?>" type="checkbox" data-setting="{{ data.name }}" class="drupal_layoutbuilder-switch-input" value="{{ data.return_value }}">
					<span class="drupal_layoutbuilder-switch-label" data-on="{{ data.label_on }}" data-off="{{ data.label_off }}"></span>
					<span class="drupal_layoutbuilder-switch-handle"></span>
				</label>
			</div>
		</div>
		<# if ( data.description ) { #>
		<div class="drupal_layoutbuilder-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	/**
	 * Get switcher control default settings.
	 *
	 * Retrieve the default settings of the switcher control. Used to return the
	 * default settings while initializing the switcher control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'label_off' => ___layoutbridge_adapter( 'No', 'elementor' ),
			'label_on' => ___layoutbridge_adapter( 'Yes', 'elementor' ),
			'return_value' => 'yes',
		];
	}
}
