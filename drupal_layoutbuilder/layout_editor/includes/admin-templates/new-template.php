<?php
namespace DrupalLayoutbuilder;

use DrupalLayoutbuilder\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$document_types = Plugin::$instance->documents->get_document_types();

$types = [];

$selected = get_query_var( 'elementor_library_type' );

foreach ( $document_types as $document_type ) {
	if ( $document_type::get_property( 'show_in_library' ) ) {
		/**
		 * @var Document $instance
		 */
		$instance = new $document_type();

		$types[ $instance->get_name() ] = $document_type::get_title();
	}
}

/**
 * Create new template library dialog types.
 *
 * Filters the dialog types when printing new template dialog.
 *
 * @since 2.0.0
 *
 * @param array    $types          Types data.
 * @param Document $document_types Document types.
 */
$types = apply_filters_layoutbridge_adapter( 'elementor/template-library/create_new_dialog_types', $types, $document_types );
?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-new-template">
	<div id="drupal_layoutbuilder-new-template__description">
		<div id="drupal_layoutbuilder-new-template__description__title"><?php echo ___layoutbridge_adapter( 'Templates Help You <span>Work Efficiently</span>', 'elementor' ); ?></div>
		<div id="drupal_layoutbuilder-new-template__description__content"><?php echo ___layoutbridge_adapter( 'Use templates to create the different pieces of your site, and reuse them with one click whenever needed.', 'elementor' ); ?></div>
		<?php
		/*
		<div id="drupal_layoutbuilder-new-template__take_a_tour">
			<i class="eicon-play-o"></i>
			<a href="#"><?php echo ___layoutbridge_adapter( 'Take The Video Tour', 'elementor' ); ?></a>
		</div>
		*/
		?>
	</div>
	<form id="drupal_layoutbuilder-new-template__form" action="<?php esc_url_layoutbridge_adapter( admin_url_layoutbridge_adapter( '/edit.php' ) ); ?>">
		<input type="hidden" name="post_type" value="elementor_library">
		<input type="hidden" name="action" value="elementor_new_post">
		<input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce_layoutbridge_adapter( 'elementor_action_new_post' ); ?>">
		<div id="drupal_layoutbuilder-new-template__form__title"><?php echo ___layoutbridge_adapter( 'Choose Template Type', 'elementor' ); ?></div>
		<div id="drupal_layoutbuilder-new-template__form__template-type__wrapper" class="drupal_layoutbuilder-form-field">
			<label for="drupal_layoutbuilder-new-template__form__template-type" class="drupal_layoutbuilder-form-field__label"><?php echo ___layoutbridge_adapter( 'Select the type of template you want to work on', 'elementor' ); ?></label>
			<div class="drupal_layoutbuilder-form-field__select__wrapper">
				<select id="drupal_layoutbuilder-new-template__form__template-type" class="drupal_layoutbuilder-form-field__select" name="template_type" required>
					<option value=""><?php echo ___layoutbridge_adapter( 'Select', 'elementor' ); ?>...</option>
					<?php
					foreach ( $types as $value => $title ) {
						printf( '<option value="%1$s" %2$s>%3$s</option>', $value, selected( $selected, $value, false ), $title );
					}
					?>
				</select>
			</div>
		</div>
		<?php
		/**
		 * Template library dialog fields.
		 *
		 * Fires after Elementor template library dialog fields are displayed.
		 *
		 * @since 2.0.0
		 */
		do_action_layoutbridge_adapter( 'elementor/template-library/create_new_dialog_fields' );
		?>

		<div id="drupal_layoutbuilder-new-template__form__post-title__wrapper" class="drupal_layoutbuilder-form-field">
			<label for="drupal_layoutbuilder-new-template__form__post-title" class="drupal_layoutbuilder-form-field__label">
				<?php echo ___layoutbridge_adapter( 'Name your template', 'elementor' ); ?>
			</label>
			<div class="drupal_layoutbuilder-form-field__text__wrapper">
				<input type="text" placeholder="<?php echo esc_attr___layoutbridge_adapter( 'Enter template name (optional)', 'elementor' ); ?>" id="drupal_layoutbuilder-new-template__form__post-title" class="drupal_layoutbuilder-form-field__text" name="post_data[post_title]">
			</div>
		</div>
		<button id="drupal_layoutbuilder-new-template__form__submit" class="drupal_layoutbuilder-button drupal_layoutbuilder-button-success"><?php echo ___layoutbridge_adapter( 'Create Template', 'elementor' ); ?></button>
	</form>
</script>
