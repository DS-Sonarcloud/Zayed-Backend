<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

global $wp_version;

$document = Plugin::$instance->documents->get( $this->_post_id );

$body_classes = [
	'drupal_layoutbuilder-editor-active',
	'wp-version-' . str_replace( '.', '-', $wp_version ),
];

if ( is_rtl_layoutbridge_adapter() ) {
	$body_classes[] = 'rtl';
}
if ( ! Plugin::$instance->role_manager->user_can( 'design' ) ) {
	$body_classes[] = 'drupal_layoutbuilder-editor-content-only';
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><?php echo ___layoutbridge_adapter( 'Elementor', 'elementor' ) . ' | ' . get_the_title_layoutbridge_adapter(); ?></title>
	<?php wp_head(); ?>
	<script>
		var ajaxurl = '<?php echo admin_url_layoutbridge_adapter( 'admin-ajax.php', 'relative' ); ?>';
	</script>
</head>
<body class="<?php echo implode( ' ', $body_classes ); ?>">
<div id="drupal_layoutbuilder-editor-wrapper">
	<div id="drupal_layoutbuilder-panel" class="drupal_layoutbuilder-panel"></div>
	<div id="drupal_layoutbuilder-preview">
		<div id="drupal_layoutbuilder-loading">
			<div class="drupal_layoutbuilder-loader-wrapper">
				<div class="drupal_layoutbuilder-loader">
					<div class="drupal_layoutbuilder-loader-boxes">
						<div class="drupal_layoutbuilder-loader-box"></div>
						<div class="drupal_layoutbuilder-loader-box"></div>
						<div class="drupal_layoutbuilder-loader-box"></div>
						<div class="drupal_layoutbuilder-loader-box"></div>
					</div>
				</div>
				<div class="drupal_layoutbuilder-loading-title"><?php echo ___layoutbridge_adapter( 'Loading', 'elementor' ); ?></div>
			</div>
		</div>
		<div id="drupal_layoutbuilder-preview-responsive-wrapper" class="drupal_layoutbuilder-device-desktop drupal_layoutbuilder-device-rotate-portrait">
			<div id="drupal_layoutbuilder-preview-loading">
				<i class="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>
			</div>
			<?php
			// IFrame will be create here by the Javascript later.
			?>
		</div>
	</div>
	<div id="drupal_layoutbuilder-navigator"></div>
</div>
<?php
	wp_footer();
	/** This action is documented in wp-admin/admin-footer.php */
	do_action_layoutbridge_adapter( 'admin_print_footer_scripts' );
?>
</body>
</html>
