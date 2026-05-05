<?php

namespace Elementor;

use Elementor\Modules\DynamicTags\Module as TagsModule;

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Elementor Drupal Gallery control.
 *
 * Works like Elementor's gallery control, but uses Drupal's Media Library.
 */
class Control_Drupal_Gallery extends Control_Base_Multiple
{

	/**
	 * Control type.
	 */
	public function get_type()
	{
		return 'drupal_gallery';
	}

	/**
	 * Default value (empty array).
	 */
	public function get_default_value()
	{
		return [];
	}

	/**
	 * Enqueue any styles/scripts.
	 */
	public function enqueue()
	{
		global $wp_version;

		$suffix = \Drupal::state()->get('system.css_js_query_string') ? '' : '.min';

		// Optional: reuse Elementor's existing CSS.
		wp_enqueue_style_elementor_adapter(
			'media',
			admin_url_elementor_adapter('/css/media' . $suffix . '.css'),
			[],
			$wp_version
		);
	}

	/**
	 * Render the control UI in Elementor editor.
	 */
	public function content_template()
	{ ?>
		<div class="elementor-control-field drupal-gallery-control">
			<div class="elementor-control-title">{{{ data.label }}}</div>

			<div class="elementor-control-input-wrapper">

				<div class="drupal-gallery-container">
					<# if ( data.controlValue && data.controlValue.length ) { #>
						<div class="drupal-gallery-thumbs">
							<# _.each( data.controlValue, function( item, index ) { #>
								<div class="drupal-gallery-thumb" data-id="{{ item.id }}">
									<div class="drupal-thumb-inner">
										<img src="{{ item.url }}" alt="" />
									</div>
								</div>
								<# }); #>
						</div>
						<# } else { #>
							<div class="drupal-gallery-placeholder select-drupal-gallery">
								<i class="eicon-plus-circle"></i>
								<span><?php echo ___elementor_adapter('No images selected', 'elementor'); ?></span>
							</div>
							<# } #>
				</div>

				<div class="drupal-gallery-actions">
					<button class="elementor-button select-drupal-gallery">
						<i class="eicon-edit"></i> <?php echo ___elementor_adapter('Add / Edit Gallery', 'elementor'); ?>
					</button>
					<button class="elementor-button elementor-button-danger clear-drupal-gallery">
						<i class="eicon-trash"></i> <?php echo ___elementor_adapter('Clear', 'elementor'); ?>
					</button>
				</div>

				<input type="hidden" data-setting="{{ data.name }}" value="{{ JSON.stringify( data.controlValue ) }}" />
			</div>
		</div>

		<style>
			.drupal-gallery-container {
				margin-bottom: 10px;
			}

			.drupal-gallery-thumbs {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
			}

			.drupal-gallery-thumb {
				width: 64px;
				height: 64px;
				border-radius: 6px;
				overflow: hidden;
				position: relative;
				box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
				transition: transform 0.15s ease, box-shadow 0.15s ease;
			}

			.drupal-gallery-thumb:hover {
				transform: scale(1.04);
				box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
			}

			.drupal-thumb-inner {
				position: relative;
				width: 100%;
				height: 100%;
			}

			.drupal-gallery-thumb img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				display: block;
			}

			.drupal-gallery-placeholder {
				text-align: center;
				padding: 20px;
				border: 2px dashed #ccc;
				border-radius: 6px;
				cursor: pointer;
				color: #777;
				transition: background 0.2s, color 0.2s;
			}

			.drupal-gallery-placeholder:hover {
				background: #f8f8f8;
				color: #333;
			}

			.drupal-gallery-placeholder i {
				font-size: 20px;
				margin-bottom: 4px;
				display: block;
			}

			.drupal-gallery-actions {
				display: flex;
				gap: 8px;
				margin-top: 5px;
			}

			.drupal-gallery-actions .elementor-button {
				flex: 1;
				padding: 6px 10px;
				font-size: 13px;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 5px;
			}

			.drupal-gallery-actions .elementor-button i {
				font-size: 14px;
			}

			/* --- Elementor Drupal Gallery Layout --- */
			.elementor-drupal-gallery .gallery {
				display: grid;
				gap: 12px;
			}

			.elementor-drupal-gallery .gallery-item {
				position: relative;
				overflow: hidden;
				border-radius: 8px;
				transition: transform 0.2s ease;
			}

			.elementor-drupal-gallery .gallery-item:hover {
				transform: scale(1.02);
			}

			.elementor-drupal-gallery .gallery-item img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				display: block;
			}

			/* Column definitions based on the class */
			.gallery-columns-1 {
				grid-template-columns: repeat(1, 1fr);
			}

			.gallery-columns-2 {
				grid-template-columns: repeat(2, 1fr);
			}

			.gallery-columns-3 {
				grid-template-columns: repeat(3, 1fr);
			}

			.gallery-columns-4 {
				grid-template-columns: repeat(4, 1fr);
			}

			.gallery-columns-5 {
				grid-template-columns: repeat(5, 1fr);
			}

			.gallery-columns-6 {
				grid-template-columns: repeat(6, 1fr);
			}

			.gallery-columns-7 {
				grid-template-columns: repeat(7, 1fr);
			}

			.gallery-columns-8 {
				grid-template-columns: repeat(8, 1fr);
			}

			.gallery-columns-9 {
				grid-template-columns: repeat(9, 1fr);
			}

			.gallery-columns-10 {
				grid-template-columns: repeat(10, 1fr);
			}

			/* Responsive adjustment */
			@media (max-width: 1024px) {
				.elementor-drupal-gallery .gallery {
					grid-template-columns: repeat(3, 1fr) !important;
				}
			}

			@media (max-width: 768px) {
				.elementor-drupal-gallery .gallery {
					grid-template-columns: repeat(2, 1fr) !important;
				}
			}

			@media (max-width: 480px) {
				.elementor-drupal-gallery .gallery {
					grid-template-columns: repeat(1, 1fr) !important;
				}
			}
		</style>
<?php }




	/**
	 * Default settings.
	 */
	protected function get_default_settings()
	{
		return [
			'label_block' => true,
			'media_type'  => 'image',
			'dynamic' => [
				'categories' => [TagsModule::GALLERY_CATEGORY],
				'returnType' => 'object',
			],
		];
	}
}
