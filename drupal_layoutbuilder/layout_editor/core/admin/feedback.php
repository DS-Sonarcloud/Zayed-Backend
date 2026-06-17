<?php
namespace DrupalLayoutbuilder\Core\Admin;

use DrupalLayoutbuilder\Api;
use DrupalLayoutbuilder\Tracker;
use DrupalLayoutbuilder\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Feedback {

	/**
	 * Enqueue feedback dialog scripts.
	 *
	 * Registers the feedback dialog scripts and enqueues them.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function enqueue_feedback_dialog_scripts() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || ! in_array( $screen->id, [ 'plugins', 'plugins-network' ], true ) ) {
			return;
		}

		add_action_layoutbridge_adapter( 'admin_footer', [ $this, 'print_deactivate_feedback_dialog' ] );

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_register_script_layoutbridge_adapter(
			'drupal_layoutbuilder-admin-feedback',
			DRUPAL_LAYOUTBUILDER_ASSETS_URL . 'js/admin-feedback' . $suffix . '.js',
			[
				'jquery',
				'underscore',
				'drupal_layoutbuilder-dialog',
			],
			DRUPAL_LAYOUTBUILDER_VERSION,
			true
		);

		wp_enqueue_script_layoutbridge_adapter( 'drupal_layoutbuilder-admin-feedback' );

		wp_localize_script(
			'drupal_layoutbuilder-admin-feedback',
			'ElementorAdminFeedbackArgs',
			[
				'is_tracker_opted_in' => Tracker::is_allow_track(),
				'i18n' => [
					'submit_n_deactivate' => ___layoutbridge_adapter( 'Submit & Deactivate', 'elementor' ),
					'skip_n_deactivate' => ___layoutbridge_adapter( 'Skip & Deactivate', 'elementor' ),
				],
			]
		);
	}

	/**
	 * Print deactivate feedback dialog.
	 *
	 * Display a dialog box to ask the user why he deactivated Elementor.
	 *
	 * Fired by `admin_footer` filter.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function print_deactivate_feedback_dialog() {
		$deactivate_reasons = [
			'no_longer_needed' => [
				'title' => ___layoutbridge_adapter( 'I no longer need the plugin', 'elementor' ),
				'input_placeholder' => '',
			],
			'found_a_better_plugin' => [
				'title' => ___layoutbridge_adapter( 'I found a better plugin', 'elementor' ),
				'input_placeholder' => ___layoutbridge_adapter( 'Please share which plugin', 'elementor' ),
			],
			'couldnt_get_the_plugin_to_work' => [
				'title' => ___layoutbridge_adapter( 'I couldn\'t get the plugin to work', 'elementor' ),
				'input_placeholder' => '',
			],
			'temporary_deactivation' => [
				'title' => ___layoutbridge_adapter( 'It\'s a temporary deactivation', 'elementor' ),
				'input_placeholder' => '',
			],
			'elementor_pro' => [
				'title' => ___layoutbridge_adapter( 'I have Elementor Pro', 'elementor' ),
				'input_placeholder' => '',
				'alert' => ___layoutbridge_adapter( 'Wait! Don\'t deactivate Elementor. You have to activate both Elementor and Elementor Pro in order for the plugin to work.', 'elementor' ),
			],
			'other' => [
				'title' => ___layoutbridge_adapter( 'Other', 'elementor' ),
				'input_placeholder' => ___layoutbridge_adapter( 'Please share the reason', 'elementor' ),
			],
		];

		?>
		<div id="drupal_layoutbuilder-deactivate-feedback-dialog-wrapper">
			<div id="drupal_layoutbuilder-deactivate-feedback-dialog-header">
				<i class="eicon-drupal_layoutbuilder-square" aria-hidden="true"></i>
				<span id="drupal_layoutbuilder-deactivate-feedback-dialog-header-title"><?php echo ___layoutbridge_adapter( 'Quick Feedback', 'elementor' ); ?></span>
			</div>
			<form id="drupal_layoutbuilder-deactivate-feedback-dialog-form" method="post">
				<?php
				wp_nonce_field( '_elementor_deactivate_feedback_nonce' );
				?>
				<input type="hidden" name="action" value="elementor_deactivate_feedback" />

				<div id="drupal_layoutbuilder-deactivate-feedback-dialog-form-caption"><?php echo ___layoutbridge_adapter( 'If you have a moment, please share why you are deactivating Elementor:', 'elementor' ); ?></div>
				<div id="drupal_layoutbuilder-deactivate-feedback-dialog-form-body">
					<?php foreach ( $deactivate_reasons as $reason_key => $reason ) : ?>
						<div class="drupal_layoutbuilder-deactivate-feedback-dialog-input-wrapper">
							<input id="drupal_layoutbuilder-deactivate-feedback-<?php echo esc_attr_layoutbridge_adapter( $reason_key ); ?>" class="drupal_layoutbuilder-deactivate-feedback-dialog-input" type="radio" name="reason_key" value="<?php echo esc_attr_layoutbridge_adapter( $reason_key ); ?>" />
							<label for="drupal_layoutbuilder-deactivate-feedback-<?php echo esc_attr_layoutbridge_adapter( $reason_key ); ?>" class="drupal_layoutbuilder-deactivate-feedback-dialog-label"><?php echo esc_html_layoutbridge_adapter( $reason['title'] ); ?></label>
							<?php if ( ! empty( $reason['input_placeholder'] ) ) : ?>
								<input class="drupal_layoutbuilder-feedback-text" type="text" name="reason_<?php echo esc_attr_layoutbridge_adapter( $reason_key ); ?>" placeholder="<?php echo esc_attr_layoutbridge_adapter( $reason['input_placeholder'] ); ?>" />
							<?php endif; ?>
							<?php if ( ! empty( $reason['alert'] ) ) : ?>
								<div class="drupal_layoutbuilder-feedback-text"><?php echo esc_html_layoutbridge_adapter( $reason['alert'] ); ?></div>
							<?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			</form>
		</div>
		<?php
	}

	/**
	 * Ajax elementor deactivate feedback.
	 *
	 * Send the user feedback when Elementor is deactivated.
	 *
	 * Fired by `wp_ajax_elementor_deactivate_feedback` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function ajax_elementor_deactivate_feedback() {
		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce_layoutbridge_adapter( $_POST['_wpnonce'], '_elementor_deactivate_feedback_nonce' ) ) {
			wp_send_json_error_layoutbridge_adapter();
		}

		$reason_text = '';
		$reason_key = '';

		if ( ! empty( $_POST['reason_key'] ) ) {
			$reason_key = $_POST['reason_key'];
		}

		if ( ! empty( $_POST[ "reason_{$reason_key}" ] ) ) {
			$reason_text = $_POST[ "reason_{$reason_key}" ];
		}

		Api::send_feedback( $reason_key, $reason_text );

		wp_send_json_success_layoutbridge_adapter();
	}

	public function admin_notices() {
		$notice_id = 'rate_us_feedback';
		if ( User::is_user_notice_viewed( $notice_id ) ) {
			return;
		}

		if ( Tracker::is_notice_shown() ) {
			return;
		}

		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || ! in_array( $screen->id, [ 'dashboard' ], true ) ) {
			return;
		}

		$elementor_pages = new \WP_Query( [
			'post_type' => 'any',
			'post_status' => 'publish',
			'fields' => 'ids',
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'meta_key' => '_elementor_edit_mode',
			'meta_value' => 'builder',
		] );

		if ( 10 > $elementor_pages->post_count ) {
			return;
		}

		?>
		<div class="notice updated is-dismissible drupal_layoutbuilder-message drupal_layoutbuilder-message-dismissed" data-notice_id="<?php echo esc_attr_layoutbridge_adapter( $notice_id ); ?>">
			<div class="drupal_layoutbuilder-message-inner">
				<div class="drupal_layoutbuilder-message-icon">
					<div class="e-logo-wrapper">
						<i class="eicon-elementor" aria-hidden="true"></i>
					</div>
				</div>
				<div class="drupal_layoutbuilder-message-content">
					<p><strong><?php echo ___layoutbridge_adapter( 'Congrats!', 'elementor' ); ?></strong> <?php _e( 'You created over 10 pages with Elementor. Great job! If you can spare a minute, please help us by leaving a five star review on WordPress.org.', 'elementor' ); ?></p>
					<p class="drupal_layoutbuilder-message-actions">
						<a href="https://go.elementor.com/admin-review/" target="_blank" class="button button-primary"><?php _e( 'Happy To Help', 'elementor' ); ?></a>
						<a href="#" class="button drupal_layoutbuilder-button-notice-dismiss"><?php _e( 'Hide Notification', 'elementor' ); ?></a>
					</p>
				</div>
			</div>
		</div>
		<?php
	}

	public function __construct() {
		add_action_layoutbridge_adapter( 'admin_enqueue_scripts', [ $this, 'enqueue_feedback_dialog_scripts' ] );

		// Ajax.
		add_action_layoutbridge_adapter( 'wp_ajax_elementor_deactivate_feedback', [ $this, 'ajax_elementor_deactivate_feedback' ] );

		// Review Plugin
		add_action_layoutbridge_adapter( 'admin_notices', [ $this, 'admin_notices' ], 20 );
	}
}
