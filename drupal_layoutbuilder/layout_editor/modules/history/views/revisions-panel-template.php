<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-revisions">
	<div class="drupal_layoutbuilder-panel-box">
	<div class="drupal_layoutbuilder-panel-scheme-buttons">
			<div class="drupal_layoutbuilder-panel-scheme-button-wrapper drupal_layoutbuilder-panel-scheme-discard">
				<button class="drupal_layoutbuilder-button" disabled>
					<i class="fa fa-times" aria-hidden="true"></i>
					<?php echo ___layoutbridge_adapter( 'Discard', 'elementor' ); ?>
				</button>
			</div>
			<div class="drupal_layoutbuilder-panel-scheme-button-wrapper drupal_layoutbuilder-panel-scheme-save">
				<button class="drupal_layoutbuilder-button drupal_layoutbuilder-button-success" disabled>
					<?php echo ___layoutbridge_adapter( 'Apply', 'elementor' ); ?>
				</button>
			</div>
		</div>
	</div>

	<div class="drupal_layoutbuilder-panel-box">
		<div class="drupal_layoutbuilder-panel-heading">
			<div class="drupal_layoutbuilder-panel-heading-title"><?php echo ___layoutbridge_adapter( 'Revisions', 'elementor' ); ?></div>
		</div>
		<div id="drupal_layoutbuilder-revisions-list" class="drupal_layoutbuilder-panel-box-content"></div>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-revisions-no-revisions">
	<i class="drupal_layoutbuilder-nerd-box-icon eicon-nerd" aria-hidden="true"></i>
	<div class="drupal_layoutbuilder-nerd-box-title"><?php echo ___layoutbridge_adapter( 'No Revisions Saved Yet', 'elementor' ); ?></div>
	<div class="drupal_layoutbuilder-nerd-box-message">{{{ elementor.translate( elementor.config.revisions_enabled ? 'no_revisions_1' : 'revisions_disabled_1' ) }}}</div>
	<div class="drupal_layoutbuilder-nerd-box-message">{{{ elementor.translate( elementor.config.revisions_enabled ? 'no_revisions_2' : 'revisions_disabled_2' ) }}}</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-revisions-revision-item">
	<div class="drupal_layoutbuilder-revision-item__wrapper {{ type }}">
		<div class="drupal_layoutbuilder-revision-item__gravatar">{{{ gravatar }}}</div>
		<div class="drupal_layoutbuilder-revision-item__details">
			<div class="drupal_layoutbuilder-revision-date">{{{ date }}}</div>
			<div class="drupal_layoutbuilder-revision-meta"><span>{{{ elementor.translate( type ) }}}</span> <?php echo ___layoutbridge_adapter( 'By', 'elementor' ); ?> {{{ author }}}</div>
		</div>
		<div class="drupal_layoutbuilder-revision-item__tools">
			<# if ( 'current' === type ) { #>
				<i class="drupal_layoutbuilder-revision-item__tools-current fa fa-star" aria-hidden="true"></i>
				<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Current', 'elementor' ); ?></span>
			<# } else { #>
				<i class="drupal_layoutbuilder-revision-item__tools-delete fa fa-times" aria-hidden="true"></i>
				<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Delete', 'elementor' ); ?></span>
			<# } #>

			<i class="drupal_layoutbuilder-revision-item__tools-spinner fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>
		</div>
	</div>
</script>
