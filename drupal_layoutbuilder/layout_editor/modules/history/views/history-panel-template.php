<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-history-page">
	<div id="drupal_layoutbuilder-panel-elements-navigation" class="drupal_layoutbuilder-panel-navigation">
		<div id="drupal_layoutbuilder-panel-elements-navigation-history" class="drupal_layoutbuilder-panel-navigation-tab drupal_layoutbuilder-active" data-view="history"><?php echo ___layoutbridge_adapter( 'Actions', 'elementor' ); ?></div>
		<div id="drupal_layoutbuilder-panel-elements-navigation-revisions" class="drupal_layoutbuilder-panel-navigation-tab" data-view="revisions"><?php echo ___layoutbridge_adapter( 'Revisions', 'elementor' ); ?></div>
	</div>
	<div id="drupal_layoutbuilder-panel-history-content"></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-history-tab">
	<div class="drupal_layoutbuilder-panel-box">
		<div class="drupal_layoutbuilder-panel-box-content">
			<div id="drupal_layoutbuilder-history-list"></div>
			<div class="drupal_layoutbuilder-history-revisions-message"><?php echo ___layoutbridge_adapter( 'Switch to Revisions tab for older versions', 'elementor' ); ?></div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-history-no-items">
	<i class="drupal_layoutbuilder-nerd-box-icon eicon-nerd"></i>
	<div class="drupal_layoutbuilder-nerd-box-title"><?php echo ___layoutbridge_adapter( 'No History Yet', 'elementor' ); ?></div>
	<div class="drupal_layoutbuilder-nerd-box-message"><?php echo ___layoutbridge_adapter( 'Once you start working, you\'ll be able to redo / undo any action you make in the editor.', 'elementor' ); ?></div>
	<div class="drupal_layoutbuilder-nerd-box-message"><?php echo ___layoutbridge_adapter( 'Switch to Revisions tab for older versions', 'elementor' ); ?></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-history-item">
	<div class="drupal_layoutbuilder-history-item drupal_layoutbuilder-history-item-{{ status }}">
		<div class="drupal_layoutbuilder-history-item__details">
			<span class="drupal_layoutbuilder-history-item__title">{{{ title }}} </span>
			<span class="drupal_layoutbuilder-history-item__subtitle">{{{ subTitle }}} </span>
			<span class="drupal_layoutbuilder-history-item__action">{{{ action }}}</span>
		</div>
		<div class="drupal_layoutbuilder-history-item__icon">
			<span class="fa" aria-hidden="true"></span>
		</div>
	</div>
</script>
