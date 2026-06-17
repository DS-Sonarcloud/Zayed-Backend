<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-empty-preview">
	<div class="drupal_layoutbuilder-first-add">
		<div class="drupal_layoutbuilder-icon eicon-plus"></div>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-preview">
	<div class="drupal_layoutbuilder-section-wrap"></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-add-section">
	<div class="drupal_layoutbuilder-add-section-inner">
		<div class="drupal_layoutbuilder-add-section-close">
			<i class="eicon-close" aria-hidden="true"></i>
			<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Close', 'elementor' ); ?></span>
		</div>
		<div class="drupal_layoutbuilder-add-new-section">
			<div class="drupal_layoutbuilder-add-section-area-button drupal_layoutbuilder-add-section-button" title="<?php echo ___layoutbridge_adapter( 'Add New Section', 'elementor' ); ?>">
				<i class="eicon-plus"></i>
			</div>
			<div class="drupal_layoutbuilder-add-section-area-button drupal_layoutbuilder-add-template-button" title="<?php echo ___layoutbridge_adapter( 'Add Template', 'elementor' ); ?>">
				<i class="fa fa-folder"></i>
			</div>
			<div class="drupal_layoutbuilder-add-section-drag-title"><?php echo ___layoutbridge_adapter( 'Drag widget here', 'elementor' ); ?></div>
		</div>
		<div class="drupal_layoutbuilder-select-preset">
			<div class="drupal_layoutbuilder-select-preset-title"><?php echo ___layoutbridge_adapter( 'Select your Structure', 'elementor' ); ?></div>
			<ul class="drupal_layoutbuilder-select-preset-list">
				<#
					var structures = [ 10, 20, 30, 40, 21, 22, 31, 32, 33, 50, 60, 34 ];

					_.each( structures, function( structure ) {
					var preset = elementor.presetsFactory.getPresetByStructure( structure ); #>

					<li class="drupal_layoutbuilder-preset drupal_layoutbuilder-column drupal_layoutbuilder-col-16" data-structure="{{ structure }}">
						{{{ elementor.presetsFactory.getPresetSVG( preset.preset ).outerHTML }}}
					</li>
					<# } ); #>
			</ul>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-tag-controls-stack-empty">
	<?php echo ___layoutbridge_adapter( 'This tag has no settings.', 'elementor' ); ?>
</script>
