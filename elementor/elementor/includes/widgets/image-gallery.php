<?php

namespace Elementor;

use Drupal\file\Entity\File;
use Drupal\image\Entity\ImageStyle;

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor image gallery widget.
 *
 * Elementor widget that displays a set of images in an aligned grid.
 *
 * @since 1.0.0
 */
class Widget_Image_Gallery extends Widget_Base
{

	/**
	 * Get widget name.
	 *
	 * Retrieve image gallery widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name()
	{
		return 'image-gallery';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve image gallery widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title()
	{
		return ___elementor_adapter('Image Gallery', 'elementor');
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve image gallery widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon()
	{
		return 'eicon-gallery-grid';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords()
	{
		return ['image', 'photo', 'visual', 'gallery'];
	}

	/**
	 * Add lightbox data to image link.
	 *
	 * Used to add lightbox data attributes to image link HTML.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @param string $link_html Image link HTML.
	 *
	 * @return string Image link HTML with lightbox data attributes.
	 */
	public function add_lightbox_data_to_image_link($link_html)
	{
		return preg_replace('/^<a/', '<a ' . $this->get_render_attribute_string('link'), $link_html);
	}

	/**
	 * Register image gallery widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls()
	{
		$this->start_controls_section(
			'section_gallery',
			[
				'label' => ___elementor_adapter('Image Gallery', 'elementor'),
			]
		);

		$this->add_control(
			'wp_gallery',
			[
				'label' => ___elementor_adapter('Add Images', 'elementor'),
				'type' => Controls_Manager::GALLERY_DRUPAL,
				'show_label' => false,
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			[
				'name' => 'thumbnail', // Usage: `{name}_size` and `{name}_custom_dimension`, in this case `thumbnail_size` and `thumbnail_custom_dimension`.
				'exclude' => ['custom'],
				'separator' => 'none',
			]
		);

		$gallery_columns = range(1, 10);
		$gallery_columns = array_combine($gallery_columns, $gallery_columns);

		$this->add_control(
			'gallery_columns',
			[
				'label' => ___elementor_adapter('Columns', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'default' => 4,
				'options' => $gallery_columns,
			]
		);

		$this->add_control(
			'gallery_link',
			[
				'label' => ___elementor_adapter('Link to', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'default' => 'file',
				'options' => [
					'file' => ___elementor_adapter('Media File', 'elementor'),
					'attachment' => ___elementor_adapter('Attachment Page', 'elementor'),
					'none' => ___elementor_adapter('None', 'elementor'),
				],
			]
		);

		$this->add_control(
			'open_lightbox',
			[
				'label' => ___elementor_adapter('Lightbox', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => ___elementor_adapter('Default', 'elementor'),
					'yes' => ___elementor_adapter('Yes', 'elementor'),
					'no' => ___elementor_adapter('No', 'elementor'),
				],
				'condition' => [
					'gallery_link' => 'file',
				],
			]
		);

		$this->add_control(
			'gallery_rand',
			[
				'label' => ___elementor_adapter('Ordering', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => ___elementor_adapter('Default', 'elementor'),
					'rand' => ___elementor_adapter('Random', 'elementor'),
				],
				'default' => '',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => ___elementor_adapter('View', 'elementor'),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_gallery_images',
			[
				'label' => ___elementor_adapter('Images', 'elementor'),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'image_spacing',
			[
				'label' => ___elementor_adapter('Spacing', 'elementor'),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => ___elementor_adapter('Default', 'elementor'),
					'custom' => ___elementor_adapter('Custom', 'elementor'),
				],
				'prefix_class' => 'gallery-spacing-',
				'default' => '',
			]
		);

		$columns_margin = is_rtl_elementor_adapter() ? '0 0 -{{SIZE}}{{UNIT}} -{{SIZE}}{{UNIT}};' : '0 -{{SIZE}}{{UNIT}} -{{SIZE}}{{UNIT}} 0;';
		$columns_padding = is_rtl_elementor_adapter() ? '0 0 {{SIZE}}{{UNIT}} {{SIZE}}{{UNIT}};' : '0 {{SIZE}}{{UNIT}} {{SIZE}}{{UNIT}} 0;';

		$this->add_control(
			'image_spacing_custom',
			[
				'label' => ___elementor_adapter('Image Spacing', 'elementor'),
				'type' => Controls_Manager::SLIDER,
				'show_label' => false,
				'range' => [
					'px' => [
						'max' => 100,
					],
				],
				'default' => [
					'size' => 15,
				],
				'selectors' => [
					'{{WRAPPER}} .gallery-item' => 'padding:' . $columns_padding,
					'{{WRAPPER}} .gallery' => 'margin: ' . $columns_margin,
				],
				'condition' => [
					'image_spacing' => 'custom',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'image_border',
				'selector' => '{{WRAPPER}} .gallery-item img',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'image_border_radius',
			[
				'label' => ___elementor_adapter('Border Radius', 'elementor'),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => ['px', '%'],
				'selectors' => [
					'{{WRAPPER}} .gallery-item img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		// $this->start_controls_section(
		// 	'section_caption',
		// 	[
		// 		'label' => ___elementor_adapter('Caption', 'elementor'),
		// 		'tab' => Controls_Manager::TAB_STYLE,
		// 	]
		// );

		// $this->add_control(
		// 	'gallery_display_caption',
		// 	[
		// 		'label' => ___elementor_adapter('Display', 'elementor'),
		// 		'type' => Controls_Manager::SELECT,
		// 		'default' => '',
		// 		'options' => [
		// 			'' => ___elementor_adapter('Show', 'elementor'),
		// 			'none' => ___elementor_adapter('Hide', 'elementor'),
		// 		],
		// 		'selectors' => [
		// 			'{{WRAPPER}} .gallery-item .gallery-caption' => 'display: {{VALUE}};',
		// 		],
		// 	]
		// );

		// $this->add_control(
		// 	'align',
		// 	[
		// 		'label' => ___elementor_adapter('Alignment', 'elementor'),
		// 		'type' => Controls_Manager::CHOOSE,
		// 		'options' => [
		// 			'left' => [
		// 				'title' => ___elementor_adapter('Left', 'elementor'),
		// 				'icon' => 'fa fa-align-left',
		// 			],
		// 			'center' => [
		// 				'title' => ___elementor_adapter('Center', 'elementor'),
		// 				'icon' => 'fa fa-align-center',
		// 			],
		// 			'right' => [
		// 				'title' => ___elementor_adapter('Right', 'elementor'),
		// 				'icon' => 'fa fa-align-right',
		// 			],
		// 			'justify' => [
		// 				'title' => ___elementor_adapter('Justified', 'elementor'),
		// 				'icon' => 'fa fa-align-justify',
		// 			],
		// 		],
		// 		'default' => 'center',
		// 		'selectors' => [
		// 			'{{WRAPPER}} .gallery-item .gallery-caption' => 'text-align: {{VALUE}};',
		// 		],
		// 		'condition' => [
		// 			'gallery_display_caption' => '',
		// 		],
		// 	]
		// );

		// $this->add_control(
		// 	'text_color',
		// 	[
		// 		'label' => ___elementor_adapter('Text Color', 'elementor'),
		// 		'type' => Controls_Manager::COLOR,
		// 		'default' => '',
		// 		'selectors' => [
		// 			'{{WRAPPER}} .gallery-item .gallery-caption' => 'color: {{VALUE}};',
		// 		],
		// 		'condition' => [
		// 			'gallery_display_caption' => '',
		// 		],
		// 	]
		// );

		// $this->add_group_control(
		// 	Group_Control_Typography::get_type(),
		// 	[
		// 		'name' => 'typography',
		// 		'scheme' => Scheme_Typography::TYPOGRAPHY_4,
		// 		'selector' => '{{WRAPPER}} .gallery-item .gallery-caption',
		// 		'condition' => [
		// 			'gallery_display_caption' => '',
		// 		],
		// 	]
		// );

		// $this->end_controls_section();
	}

	/**
	 * Render image gallery widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render()
	{
		$settings = $this->get_settings_for_display();

		$gallery_items = $settings['wp_gallery'] ?? [];
		if (empty($gallery_items) || !is_array($gallery_items)) {
			return;
		}

		$gallery_id = $this->get_id();
		$columns = !empty($settings['gallery_columns']) ? intval($settings['gallery_columns']) : 3;
		$lightbox = $settings['open_lightbox'] ?? 'yes';

		$image_style = 'thumbnail';
		if (!empty($settings['thumbnail_size'])) {
			if (is_array($settings['thumbnail_size'])) {
				$image_style = $settings['thumbnail_size']['size'] ?? 'thumbnail';
			} else {
				$image_style = $settings['thumbnail_size'];
			}
		}

		$mapping = [
			'thumbnail' => 'thumbnail',
			'medium'    => 'medium',
			'large'     => 'large',
			'full'      => '',
		];
		$image_style = $mapping[$image_style] ?? $image_style;
		$style = !empty($image_style) ? \Drupal\image\Entity\ImageStyle::load($image_style) : NULL;

		echo '<div class="elementor-drupal-gallery">';
		$grid_style = sprintf(
			'display: grid; grid-template-columns: repeat(%d, 1fr); gap: 10px; margin: 0; padding: 0;',
			max(1, $columns)
		);

		echo '<div id="gallery-' . $gallery_id . '" 
        class="gallery galleryid-' . $gallery_id . ' gallery-columns-' . $columns . ' gallery-size-' . $image_style . '" 
        style="' . $grid_style . '">';


		foreach ($gallery_items as $index => $image) {
			if (empty($image['id'])) continue;

			$file = \Drupal\file\Entity\File::load($image['id']);
			if (!$file) continue;

			$uri = $file->getFileUri();
			$thumb_url = $style
				? $style->buildUrl($uri)
				: \Drupal::service('file_url_generator')->generateAbsoluteString($uri);

			$file_url = \Drupal::service('file_url_generator')->generateAbsoluteString($uri);
			$caption = $image['caption'] ?? '';
			$fig_id = 'gallery-' . $gallery_id . '-' . ($image['id'] ?? $index);

			echo '<div class="gallery-item">';
			echo '<div class="gallery-icon landscape">';

			if ($settings['gallery_link'] === 'file') {
				echo '<a href="' . $file_url . '"
              data-elementor-open-lightbox="' . $lightbox . '"
              data-elementor-lightbox-slideshow="' . $gallery_id . '"
              data-elementor-lightbox-title="' . htmlspecialchars($caption) . '">';
			}

			echo '<img decoding="async"
            src="' . $thumb_url . '" 
            class="attachment-thumbnail size-thumbnail"
            alt="' . htmlspecialchars($caption) . '"
            aria-describedby="' . $fig_id . '">';

			if ($settings['gallery_link'] === 'file') {
				echo '</a>';
			}

			echo '</div>';

			if (!empty($caption)) {
				echo '<figcaption class="wp-caption-text gallery-caption" id="' . $fig_id . '">' . htmlspecialchars($caption) . '</figcaption>';
			}

			echo '</div>';
		}

		echo '</div>';
		echo '</div>';
	}
}
