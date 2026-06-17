<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor structure control.
 *
 * A base control for creating structure control. A private control for section
 * columns structure.
 *
 * @since 1.0.0
 */
class Control_Structure extends Base_Data_Control {

	/**
	 * Get structure control type.
	 *
	 * Retrieve the control type, in this case `structure`.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Control type.
	 */
	public function get_type() {
		return 'structure';
	}

	/**
	 * Render structure control output in the editor.
	 *
	 * Used to generate the control HTML in the editor using Underscore JS
	 * template. The variables for the class are available using `data` JS
	 * object.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function content_template() {
		$preset_control_uid = $this->get_control_uid( '{{ preset.key }}' );
		?>
		<div class="drupal_layoutbuilder-control-field">
			<div class="drupal_layoutbuilder-control-input-wrapper">
				<div class="drupal_layoutbuilder-control-structure-title"><?php echo ___layoutbridge_adapter( 'Structure', 'elementor' ); ?></div>
				<# var currentPreset = elementor.presetsFactory.getPresetByStructure( data.controlValue ); #>
				<div class="drupal_layoutbuilder-control-structure-preset drupal_layoutbuilder-control-structure-current-preset">
					{{{ elementor.presetsFactory.getPresetSVG( currentPreset.preset, 233, 72, 5 ).outerHTML }}}
				</div>
				<div class="drupal_layoutbuilder-control-structure-reset">
					<i class="fa fa-undo" aria-hidden="true"></i>
					<?php echo ___layoutbridge_adapter( 'Reset Structure', 'elementor' ); ?>
				</div>
				<#
				var morePresets = getMorePresets();

				if ( morePresets.length > 1 ) { #>
					<div class="drupal_layoutbuilder-control-structure-more-presets-title"><?php echo ___layoutbridge_adapter( 'More Structures', 'elementor' ); ?></div>
					<div class="drupal_layoutbuilder-control-structure-more-presets">
						<# _.each( morePresets, function( preset ) { #>
							<div class="drupal_layoutbuilder-control-structure-preset-wrapper">
								<input id="<?php echo $preset_control_uid; ?>" type="radio" name="drupal_layoutbuilder-control-structure-preset-{{ data._cid }}" data-setting="structure" value="{{ preset.key }}">
								<label for="<?php echo $preset_control_uid; ?>" class="drupal_layoutbuilder-control-structure-preset">
									{{{ elementor.presetsFactory.getPresetSVG( preset.preset, 102, 42 ).outerHTML }}}
								</label>
								<div class="drupal_layoutbuilder-control-structure-preset-title">{{{ preset.preset.join( ', ' ) }}}</div>
							</div>
						<# } ); #>
					</div>
				<# } #>
			</div>
		</div>

		<# if ( data.description ) { #>
			<div class="drupal_layoutbuilder-control-field-description">{{{ data.description }}}</div>
		<# } #>
		<?php
	}

	/**
	 * Get structure control default settings.
	 *
	 * Retrieve the default settings of the structure control. Used to return the
	 * default settings while initializing the structure control.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Control default settings.
	 */
	protected function get_default_settings() {
		return [
			'separator' => 'none',
			'label_block' => true,
		];
	}
}
