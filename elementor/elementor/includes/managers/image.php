<?php
namespace Elementor;

use Drupal\image\Entity\ImageStyle;
use Drupal\file\Entity\File;
use Drupal\file\FileUrlGeneratorInterface;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor images manager.
 *
 * Elementor images manager handler class is responsible for retrieving image
 * details.
 *
 * @since 1.0.0
 */
class Images_Manager {

	/**
	 * Get images details.
	 *
	 * Retrieve details for all the images.
	 *
	 * Fired by `wp_ajax_elementor_get_images_details` action.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function get_images_details() {
		$items = $_POST['items'];
		$urls  = [];

		foreach ( $items as $item ) {
			$urls[ $item['id'] ] = $this->get_details( $item['id'], $item['size'], $item['is_first_time'] );
		}
		wp_send_json_success_elementor_adapter( $urls );
	}

	/**
	 * Get image details.
	 *
	 * Retrieve single image details.
	 *
	 * Fired by `wp_ajax_elementor_get_image_details` action.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string       $id            Image attachment ID.
	 * @param string|array $size          Image size. Accepts any valid image
	 *                                    size, or an array of width and height
	 *                                    values in pixels (in that order).
	 * @param string       $is_first_time Set 'true' string to force reloading
	 *                                    all image sizes.
	 *
	 * @return array URLs with different image sizes.
	 */
	public function get_details($fid, $style_name, $is_first_time) {
    $file = File::load($fid);
    if (!$file) {
        return [];
    }

    $file_uri = $file->getFileUri();
    $urls = [];

    $file_url_generator = \Drupal::service('file_url_generator');

    // 1️⃣ First time → load all image styles + original
    // if ($is_first_time === 'true') {
        $styles = ImageStyle::loadMultiple();
        foreach ($styles as $name => $style) {
            $urls[$name] = $style->buildUrl($file_uri);
        }
        $urls['original'] = $file_url_generator->generateAbsoluteString($file_uri);
    // }

    // 2️⃣ Requested style
    if ($style_name) {
        if (strpos($style_name, 'custom_') === 0) {
            if (preg_match('/custom_(\d+)x(\d+)/', $style_name, $matches)) {
                $width = $matches[1];
                $height = $matches[2];
                // On-the-fly derivative (query params for responsive)
                $urls[$style_name] = $file_url_generator->generateAbsoluteString($file_uri) . "?width=$width&height=$height";
            }
        } elseif ($style = ImageStyle::load($style_name)) {
            $urls[$style_name] = $style->buildUrl($file_uri);
        } else {
            $urls[$style_name] = $file_url_generator->generateAbsoluteString($file_uri);
        }
    }

    return $urls;
  }

	/**
	 * Images manager constructor.
	 *
	 * Initializing Elementor images manager.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function __construct() {
		add_action_elementor_adapter( 'wp_ajax_elementor_get_images_details', [ $this, 'get_images_details' ] );
	}
}
