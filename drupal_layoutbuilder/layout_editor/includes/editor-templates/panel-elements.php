<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-elements">
	<div id="drupal_layoutbuilder-panel-elements-navigation" class="drupal_layoutbuilder-panel-navigation">
		<div id="drupal_layoutbuilder-panel-elements-navigation-all" class="drupal_layoutbuilder-panel-navigation-tab drupal_layoutbuilder-active" data-view="categories"><?php echo ___layoutbridge_adapter( 'Elements', 'elementor' ); ?></div>
		<div id="drupal_layoutbuilder-panel-elements-navigation-global" class="drupal_layoutbuilder-panel-navigation-tab" data-view="global"><?php echo ___layoutbridge_adapter( 'Global', 'elementor' ); ?></div>
	</div>
	<div id="drupal_layoutbuilder-panel-elements-search-area"></div>
	<div id="drupal_layoutbuilder-panel-elements-wrapper"></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-categories">
	<div id="drupal_layoutbuilder-panel-categories"></div>

	<!-- <div id="drupal_layoutbuilder-panel-get-pro-elements" class="drupal_layoutbuilder-nerd-box">
		<i class="drupal_layoutbuilder-nerd-box-icon eicon-hypster" aria-hidden="true"></i>
		<div class="drupal_layoutbuilder-nerd-box-message"><?php echo ___layoutbridge_adapter( 'Get more with Elementor Pro', 'elementor' ); ?></div>
		<a class="drupal_layoutbuilder-button drupal_layoutbuilder-button-default drupal_layoutbuilder-nerd-box-link" target="_blank" href="<?php echo Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=panel-widgets&utm_campaign=gopro&utm_medium=wp-dash' ); ?>"><?php echo ___layoutbridge_adapter( 'Go Pro', 'elementor' ); ?></a>
	</div> -->
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-elements-category">
	<div class="drupal_layoutbuilder-panel-category-title">{{{ title }}}</div>
	<div class="drupal_layoutbuilder-panel-category-items"></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-element-search">
	<label for="drupal_layoutbuilder-panel-elements-search-input" class="screen-reader-text"><?php echo ___layoutbridge_adapter( 'Search Widget:', 'elementor' ); ?></label>
	<input type="search" id="drupal_layoutbuilder-panel-elements-search-input" placeholder="<?php esc_attr_e_layoutbridge_adapter( 'Search Widget...', 'elementor' ); ?>" />
	<i class="fa fa-search" aria-hidden="true"></i>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-element-library-element">
	<div class="drupal_layoutbuilder-element">
		<div class="icon">
			<i class="{{ icon }}" aria-hidden="true"></i>
		</div>
		<div class="drupal_layoutbuilder-element-title-wrapper">
			<div class="title">{{{ title }}}</div>
		</div>
	</div>
</script>

<!-- <script type="text/template" id="tmpl-drupal_layoutbuilder-panel-global">
	<div class="drupal_layoutbuilder-nerd-box">
		<i class="drupal_layoutbuilder-nerd-box-icon eicon-hypster" aria-hidden="true"></i>
		<div class="drupal_layoutbuilder-nerd-box-title"><?php echo ___layoutbridge_adapter( 'Meet Our Global Widget', 'elementor' ); ?></div>
		<div class="drupal_layoutbuilder-nerd-box-message"><?php echo ___layoutbridge_adapter( 'With this feature, you can save a widget as global, then add it to multiple areas. All areas will be editable from one single place.', 'elementor' ); ?></div>
		<div class="drupal_layoutbuilder-nerd-box-message"><?php echo ___layoutbridge_adapter( 'This feature is only available on Elementor Pro.', 'elementor' ); ?></div>
		<a class="drupal_layoutbuilder-button drupal_layoutbuilder-button-default drupal_layoutbuilder-nerd-box-link" target="_blank" href="<?php echo Utils::get_pro_link( 'https://elementor.com/pro/?utm_source=panel-global&utm_campaign=gopro&utm_medium=wp-dash' ); ?>"><?php echo ___layoutbridge_adapter( 'Go Pro', 'elementor' ); ?></a>
	</div>
</script> -->
