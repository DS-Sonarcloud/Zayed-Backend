<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-templates-modal__header">
	<div class="drupal_layoutbuilder-templates-modal__header__logo-area"></div>
	<div class="drupal_layoutbuilder-templates-modal__header__menu-area"></div>
	<div class="drupal_layoutbuilder-templates-modal__header__items-area">
		<div class="drupal_layoutbuilder-templates-modal__header__close drupal_layoutbuilder-templates-modal__header__close--{{{ 'skip' === closeType ? 'skip' : 'normal' }}} drupal_layoutbuilder-templates-modal__header__item">
			<# if ( 'skip' === closeType ) { #>
			<span><?php echo ___layoutbridge_adapter( 'Skip', 'elementor' ); ?></span>
			<# } #>
			<i class="eicon-close" aria-hidden="true" title="<?php echo ___layoutbridge_adapter( 'Close', 'elementor' ); ?>"></i>
			<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Close', 'elementor' ); ?></span>
		</div>
		<div id="drupal_layoutbuilder-template-library-header-tools"></div>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-templates-modal__header__logo">
	<span class="drupal_layoutbuilder-templates-modal__header__logo__icon-wrapper">
		<i class="eicon-elementor"></i>
	</span>
	<span class="drupal_layoutbuilder-templates-modal__header__logo__title">{{{ title }}}</span>
</script>
