<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-repeater-row">
	<div class="drupal_layoutbuilder-repeater-row-tools">
		<div class="drupal_layoutbuilder-repeater-row-handle-sortable">
			<i class="fa fa-ellipsis-v" aria-hidden="true"></i>
			<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Drag & Drop', 'elementor' ); ?></span>
		</div>
		<div class="drupal_layoutbuilder-repeater-row-item-title"></div>
		<div class="drupal_layoutbuilder-repeater-row-tool drupal_layoutbuilder-repeater-tool-duplicate">
			<i class="fa fa-copy" aria-hidden="true"></i>
			<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Duplicate', 'elementor' ); ?></span>
		</div>
		<div class="drupal_layoutbuilder-repeater-row-tool drupal_layoutbuilder-repeater-tool-remove">
			<i class="fa fa-remove" aria-hidden="true"></i>
			<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Remove', 'elementor' ); ?></span>
		</div>
	</div>
	<div class="drupal_layoutbuilder-repeater-row-controls"></div>
</script>
