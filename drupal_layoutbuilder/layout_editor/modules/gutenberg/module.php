<?php
namespace DrupalLayoutbuilder\Modules\Gutenberg;

use DrupalLayoutbuilder\Core\Base\Module as BaseModule;
use DrupalLayoutbuilder\Plugin;
use DrupalLayoutbuilder\User;
use DrupalLayoutbuilder\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	protected $is_gutenberg_editor_active = false;

	public function get_name() {
		return 'gutenberg';
	}

	public static function is_active() {
		return function_exists( 'the_gutenberg_project' );
	}

	public function register_elementor_rest_field() {
		register_rest_field( get_post_types( '', 'names' ),
			'gutenberg_elementor_mode', [
				'update_callback' => function( $request_value, $object ) {
					if ( ! User::is_current_user_can_edit( $object->ID ) ) {
						return false;
					}

					Plugin::$instance->db->set_is_elementor_page( $object->ID, false );

					return true;
				},
			]
		);
	}

	public function enqueue_assets() {
		$post_id = get_the_ID_layoutbridge_adapter();

		if ( ! User::is_current_user_can_edit( $post_id ) ) {
			return;
		}

		$this->is_gutenberg_editor_active = true;

		$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

		wp_enqueue_script_layoutbridge_adapter( 'drupal_layoutbuilder-gutenberg', DRUPAL_LAYOUTBUILDER_ASSETS_URL . 'js/gutenberg' . $suffix . '.js', [ 'jquery' ], DRUPAL_LAYOUTBUILDER_VERSION, true );

		$elementor_settings = [
			'isElementorMode' => Plugin::$instance->db->is_built_with_elementor( $post_id ),
			'editLink' => Utils::get_edit_link( $post_id ),
		];

		wp_localize_script( 'drupal_layoutbuilder-gutenberg', 'ElementorGutenbergSettings', $elementor_settings );
	}

	public function print_admin_js_template() {
		if ( ! $this->is_gutenberg_editor_active ) {
			return;
		}

		?>
		<script id="drupal_layoutbuilder-gutenberg-button-switch-mode" type="text/html">
			<div id="drupal_layoutbuilder-switch-mode">
				<button id="drupal_layoutbuilder-switch-mode-button" type="button" class="button button-primary button-large">
					<span class="drupal_layoutbuilder-switch-mode-on"><?php echo ___layoutbridge_adapter( '&#8592; Back to WordPress Editor', 'elementor' ); ?></span>
					<span class="drupal_layoutbuilder-switch-mode-off">
						<i class="eicon-drupal_layoutbuilder-square" aria-hidden="true"></i>
						<?php echo ___layoutbridge_adapter( 'Edit with Elementor', 'elementor' ); ?>
					</span>
				</button>
			</div>
		</script>

		<script id="drupal_layoutbuilder-gutenberg-panel" type="text/html">
			<div id="drupal_layoutbuilder-editor"><a id="drupal_layoutbuilder-go-to-edit-page-link" href="#">
					<div id="drupal_layoutbuilder-editor-button" class="button button-primary button-hero">
						<i class="eicon-drupal_layoutbuilder-square" aria-hidden="true"></i>
						<?php echo ___layoutbridge_adapter( 'Edit with Elementor', 'elementor' ); ?>
					</div>
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
				</a></div>
		</script>
		<?php
	}

	public function __construct() {
		add_action_layoutbridge_adapter( 'rest_api_init', [ $this, 'register_elementor_rest_field' ] );
		add_action_layoutbridge_adapter( 'enqueue_block_editor_assets', [ $this, 'enqueue_assets' ] );
		add_action_layoutbridge_adapter( 'admin_footer', [ $this, 'print_admin_js_template' ] );
	}
}
