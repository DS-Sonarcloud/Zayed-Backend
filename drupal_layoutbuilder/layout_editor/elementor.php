<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

define( 'DRUPAL_LAYOUTBUILDER_VERSION', '1.0.1' );
define( 'DRUPAL_LAYOUTBUILDER_PREVIOUS_STABLE_VERSION', '1.0.1' );

define( 'DRUPAL_LAYOUTBUILDER_FILE', __FILE__ );
define( 'DRUPAL_LAYOUTBUILDER_PLUGIN_BASE', plugin_basename( DRUPAL_LAYOUTBUILDER_FILE ) );
define( 'DRUPAL_LAYOUTBUILDER_PATH', plugin_dir_path( DRUPAL_LAYOUTBUILDER_FILE ) );

if ( defined( 'DRUPAL_LAYOUTBUILDER_TESTS' ) && DRUPAL_LAYOUTBUILDER_TESTS ) {
	define( 'DRUPAL_LAYOUTBUILDER_URL', 'file://' . DRUPAL_LAYOUTBUILDER_PATH );
} else {
	define( 'DRUPAL_LAYOUTBUILDER_URL', plugins_url( '/', DRUPAL_LAYOUTBUILDER_FILE ) );
}

define( 'DRUPAL_LAYOUTBUILDER_MODULES_PATH', plugin_dir_path( DRUPAL_LAYOUTBUILDER_FILE ) . '/modules' );
define( 'DRUPAL_LAYOUTBUILDER_ASSETS_PATH', DRUPAL_LAYOUTBUILDER_PATH . 'assets/' );
define( 'DRUPAL_LAYOUTBUILDER_ASSETS_URL', DRUPAL_LAYOUTBUILDER_URL . 'assets/' );

add_action_layoutbridge_adapter( 'plugins_loaded', 'elementor_load_plugin_textdomain' );

if ( ! version_compare( PHP_VERSION, '5.4', '>=' ) ) {
	add_action_layoutbridge_adapter( 'admin_notices', 'elementor_fail_php_version' );
} elseif ( ! version_compare( get_bloginfo_layoutbridge_adapter( 'version' ), '4.7', '>=' ) ) {
	add_action_layoutbridge_adapter( 'admin_notices', 'elementor_fail_wp_version' );
} else {
	require( DRUPAL_LAYOUTBUILDER_PATH . 'includes/plugin.php' );
}

/**
 * Load Elementor textdomain.
 *
 * Load gettext translate for Elementor text domain.
 *
 * @since 1.0.0
 *
 * @return void
 */
function elementor_load_plugin_textdomain() {
	load_plugin_textdomain( 'elementor' );
}

/**
 * Elementor admin notice for minimum PHP version.
 *
 * Warning when the site doesn't have the minimum required PHP version.
 *
 * @since 1.0.0
 *
 * @return void
 */
function elementor_fail_php_version() {
	/* translators: %s: PHP version */
	$message = sprintf( esc_html___layoutbridge_adapter( 'Elementor requires PHP version %s+, plugin is currently NOT RUNNING.', 'elementor' ), '5.4' );
	$html_message = sprintf( '<div class="error">%s</div>', wpautop( $message ) );
	echo wp_kses_post( $html_message );
}

/**
 * Elementor admin notice for minimum required CMS compatibility version.
 *
 * Warning when the compatibility layer reports an unsupported environment.
 *
 * @since 1.5.0
 *
 * @return void
 */
function elementor_fail_wp_version() {
	/* translators: %s: Required version number */
	$message = sprintf( esc_html___layoutbridge_adapter( 'Elementor requires WordPress version %s+. Because you are using an earlier version, the plugin is currently NOT RUNNING.', 'elementor' ), '4.7' );
	$html_message = sprintf( '<div class="error">%s</div>', wpautop( $message ) );
	echo wp_kses_post( $html_message );
}
