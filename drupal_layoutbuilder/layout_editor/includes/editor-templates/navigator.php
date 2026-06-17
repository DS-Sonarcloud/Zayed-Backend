<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-navigator">
	<div id="drupal_layoutbuilder-navigator__header">
		<i id="drupal_layoutbuilder-navigator__toggle-all" class="eicon-expand" data-drupal_layoutbuilder-action="expand"></i>
		<div id="drupal_layoutbuilder-navigator__header__title"><?php echo ___layoutbridge_adapter( 'Navigator', 'elementor' ); ?></div>
		<i id="drupal_layoutbuilder-navigator__close" class="eicon-close"></i>
	</div>
	<div id="drupal_layoutbuilder-navigator__elements"></div>
	<div id="drupal_layoutbuilder-navigator__footer">
		<i class="eicon-ellipsis-h"></i>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-navigator__elements">
	<# if ( obj.elType ) { #>
		<div class="drupal_layoutbuilder-navigator__item">
			<div class="drupal_layoutbuilder-navigator__element__list-toggle">
				<i class="eicon-sort-down"></i>
			</div>
			<#
			if ( icon ) { #>
				<div class="drupal_layoutbuilder-navigator__element__element-type">
					<i class="{{{ icon }}}"></i>
				</div>
			<# } #>
			<div class="drupal_layoutbuilder-navigator__element__title">
				<span class="drupal_layoutbuilder-navigator__element__title__text">{{{ title }}}</span>
			</div>
			<# if ( 'column' !== elType ) { #>
				<div class="drupal_layoutbuilder-navigator__element__toggle">
					<i class="eicon-eye"></i>
				</div>
			<# } #>
		</div>
	<# } #>
	<div class="drupal_layoutbuilder-navigator__elements"></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-navigator__elements--empty">
	<div class="drupal_layoutbuilder-empty-view__title"><?php echo ___layoutbridge_adapter( 'Empty', 'elementor' ); ?></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-navigator__root--empty">
	<i class="drupal_layoutbuilder-nerd-box-icon eicon-nerd" aria-hidden="true"></i>
	<div class="drupal_layoutbuilder-nerd-box-title"><?php echo ___layoutbridge_adapter( 'Easy Navigation is Here!', 'elementor' ); ?></div>
	<div class="drupal_layoutbuilder-nerd-box-message"><?php echo ___layoutbridge_adapter( 'Once you fill your page with content, this window will give you an overview display of all the page elements. This way, you can easily move the different sections, columns, and widgets.', 'elementor' ); ?></div>
</script>
