<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor column element.
 *
 * Elementor column handler class is responsible for initializing the column
 * element.
 *
 * @since 1.0.0
 */
class Element_Column extends Element_Base {

	/**
	 * Element edit tools.
	 *
	 * Holds all the edit tools of the element. For example: delete, duplicate etc.
	 *
	 * @access protected
	 * @static
	 *
	 * @var array
	 */
	protected static $_edit_tools;

	/**
	 * Get column name.
	 *
	 * Retrieve the column name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Column name.
	 */
	public function get_name() {
		return 'column';
	}

	/**
	 * Get element type.
	 *
	 * Retrieve the element type, in this case `column`.
	 *
	 * @since 2.1.0
	 * @access public
	 * @static
	 *
	 * @return string The type.
	 */
	public static function get_type() {
		return 'column';
	}

	/**
	 * Get column title.
	 *
	 * Retrieve the column title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Column title.
	 */
	public function get_title() {
		return ___layoutbridge_adapter( 'Column', 'elementor' );
	}

	/**
	 * Get column icon.
	 *
	 * Retrieve the column icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Column icon.
	 */
	public function get_icon() {
		return 'eicon-column';
	}

	/**
	 * Get default edit tools.
	 *
	 * Retrieve the element default edit tools. Used to set initial tools.
	 *
	 * @since 2.1.0
	 * @access protected
	 * @static
	 *
	 * @return array Default edit tools.
	 */
	protected static function get_default_edit_tools() {
		$column_label = ___layoutbridge_adapter( 'Column', 'elementor' );

		$edit_tools = [
			'edit' => [
				'title' => ___layoutbridge_adapter( 'Edit', 'elementor' ),
				'icon' => 'column',
			],
		];

		if ( self::is_edit_buttons_enabled() ) {
			$edit_tools += [
				'duplicate' => [
					/* translators: %s: Column label */
					'title' => sprintf( ___layoutbridge_adapter( 'Duplicate %s', 'elementor' ), $column_label ),
					'icon' => 'clone',
				],
				'add' => [
					/* translators: %s: Column label */
					'title' => sprintf( ___layoutbridge_adapter( 'Add %s', 'elementor' ), $column_label ),
					'icon' => 'plus',
				],
				'remove' => [
					/* translators: %s: Column label */
					'title' => sprintf( ___layoutbridge_adapter( 'Remove %s', 'elementor' ), $column_label ),
					'icon' => 'close',
				],
			];
		}

		return $edit_tools;
	}

	/**
	 * Register column controls.
	 *
	 * Used to add new controls to the column element.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		// Section Layout.
		$this->start_controls_section(
			'layout',
			[
				'label' => ___layoutbridge_adapter( 'Layout', 'elementor' ),
				'tab' => Controls_Manager::TAB_LAYOUT,
			]
		);

		$this->add_control(
			'_title',
			[
				'label' => ___layoutbridge_adapter( 'Title', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'render_type' => 'none',
			]
		);

		$this->add_responsive_control(
			'_inline_size',
			[
				'label' => ___layoutbridge_adapter( 'Column Width', 'elementor' ) . ' (%)',
				'type' => Controls_Manager::NUMBER,
				'min' => 2,
				'max' => 98,
				'required' => true,
				'device_args' => [
					Controls_Stack::RESPONSIVE_TABLET => [
						'max' => 100,
						'required' => false,
					],
					Controls_Stack::RESPONSIVE_MOBILE => [
						'max' => 100,
						'required' => false,
					],
				],
				'min_affected_device' => [
					Controls_Stack::RESPONSIVE_DESKTOP => Controls_Stack::RESPONSIVE_TABLET,
					Controls_Stack::RESPONSIVE_TABLET => Controls_Stack::RESPONSIVE_TABLET,
				],
				'selectors' => [
					'{{WRAPPER}}' => 'width: {{VALUE}}%',
				],
			]
		);

		$this->add_control(
			'content_position',
			[
				'label' => ___layoutbridge_adapter( 'Content Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => ___layoutbridge_adapter( 'Default', 'elementor' ),
					'top' => ___layoutbridge_adapter( 'Top', 'elementor' ),
					'center' => ___layoutbridge_adapter( 'Middle', 'elementor' ),
					'bottom' => ___layoutbridge_adapter( 'Bottom', 'elementor' ),
				],
				'selectors_dictionary' => [
					'top' => 'flex-start',
					'bottom' => 'flex-end',
				],
				'selectors' => [
					'{{WRAPPER}}.drupal_layoutbuilder-column .drupal_layoutbuilder-column-wrap' => 'align-items: {{VALUE}}',
				],
			]
		);

		$this->add_control(
			'space_between_widgets',
			[
				'label' => ___layoutbridge_adapter( 'Widgets Space', 'elementor' ) . ' (px)',
				'type' => Controls_Manager::NUMBER,
				'placeholder' => 20,
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-column-wrap > .drupal_layoutbuilder-widget-wrap > .drupal_layoutbuilder-widget:not(:last-child)' => 'margin-bottom: {{VALUE}}px', //Need the full path for exclude the inner section
				],
			]
		);

		$possible_tags = [
			'div',
			'header',
			'footer',
			'main',
			'article',
			'section',
			'aside',
			'nav',
      'marquee',
		];

		$options = [
			'' => ___layoutbridge_adapter( 'Default', 'elementor' ),
		] + array_combine( $possible_tags, $possible_tags );

		$this->add_control(
			'html_tag',
			[
				'label' => ___layoutbridge_adapter( 'HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => $options,
			]
		);

    $this->add_control(
      'marquee_behavior',
      [
        'label' => ___layoutbridge_adapter('Marquee Behavior', 'elementor'),
        'type' => Controls_Manager::SELECT,
        'default' => 'scroll',
        'options' => [
          'scroll' => 'Scroll',
          'slide' => 'Slide',
          'alternate' => 'Alternate',
        ],
        'condition' => [
          'html_tag' => 'marquee',
        ],
      ]
    );

    $this->add_control(
      'marquee_direction',
      [
        'label' => ___layoutbridge_adapter('Marquee Direction', 'elementor'),
        'type' => Controls_Manager::SELECT,
        'default' => 'left',
        'options' => [
          'left' => 'Left',
          'right' => 'Right',
          'up' => 'Up',
          'down' => 'Down',
        ],
        'condition' => [
          'html_tag' => 'marquee',
        ],
      ]
    );

    $this->add_control(
      'marquee_speed',
      [
        'label' => ___layoutbridge_adapter('Scroll Speed', 'elementor'),
        'type' => Controls_Manager::NUMBER,
        'min' => 1,
        'max' => 20,
        'default' => 5,
        'condition' => [
          'html_tag' => 'marquee',
        ],
      ]
    );

    $marquee_loop_options = [
      'yes' => ___layoutbridge_adapter('Yes', 'elementor'),
      'no' => ___layoutbridge_adapter('No', 'elementor'),
    ];
    $this->add_control(
      'marquee_pause_on_hover',
      [
        'label' => ___layoutbridge_adapter('Pause on Hover', 'elementor'),
        'type' => Controls_Manager::SELECT,
        'default' => 'yes',
        'options' => $marquee_loop_options,
        'condition' => [
          'html_tag' => 'marquee',
        ],
      ]
    );

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			[
				'label' => ___layoutbridge_adapter( 'Background', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_background' );

		$this->start_controls_tab(
			'tab_background_normal',
			[
				'label' => ___layoutbridge_adapter( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background',
				'selector' => '{{WRAPPER}} > .drupal_layoutbuilder-element-populated',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_background_hover',
			[
				'label' => ___layoutbridge_adapter( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_hover',
				'selector' => '{{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated',
			]
		);

		$this->add_control(
			'background_hover_transition',
			[
				'label' => ___layoutbridge_adapter( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0.3,
				],
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
				'render_type' => 'ui',
				'separator' => 'before',
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		// Section Column Background Overlay.
		$this->start_controls_section(
			'section_background_overlay',
			[
				'label' => ___layoutbridge_adapter( 'Background Overlay', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'background_background' => [ 'classic', 'gradient' ],
				],
			]
		);

		$this->start_controls_tabs( 'tabs_background_overlay' );

		$this->start_controls_tab(
			'tab_background_overlay_normal',
			[
				'label' => ___layoutbridge_adapter( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_overlay',
				'selector' => '{{WRAPPER}} > .drupal_layoutbuilder-element-populated >  .drupal_layoutbuilder-background-overlay',
			]
		);

		$this->add_control(
			'background_overlay_opacity',
			[
				'label' => ___layoutbridge_adapter( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => .5,
				],
				'range' => [
					'px' => [
						'max' => 1,
						'step' => 0.01,
					],
				],
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated >  .drupal_layoutbuilder-background-overlay' => 'opacity: {{SIZE}};',
				],
				'condition' => [
					'background_overlay_background' => [ 'classic', 'gradient' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			[
				'name' => 'css_filters',
				'selector' => '{{WRAPPER}} > .drupal_layoutbuilder-element-populated >  .drupal_layoutbuilder-background-overlay',
			]
		);

		$this->add_control(
			'overlay_blend_mode',
			[
				'label' => ___layoutbridge_adapter( 'Blend Mode', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'' => ___layoutbridge_adapter( 'Normal', 'elementor' ),
					'multiply' => 'Multiply',
					'screen' => 'Screen',
					'overlay' => 'Overlay',
					'darken' => 'Darken',
					'lighten' => 'Lighten',
					'color-dodge' => 'Color Dodge',
					'saturation' => 'Saturation',
					'color' => 'Color',
					'luminosity' => 'Luminosity',
				],
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated > .drupal_layoutbuilder-background-overlay' => 'mix-blend-mode: {{VALUE}}',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_background_overlay_hover',
			[
				'label' => ___layoutbridge_adapter( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_overlay_hover',
				'selector' => '{{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated >  .drupal_layoutbuilder-background-overlay',
			]
		);

		$this->add_control(
			'background_overlay_hover_opacity',
			[
				'label' => ___layoutbridge_adapter( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => .5,
				],
				'range' => [
					'px' => [
						'max' => 1,
						'step' => 0.01,
					],
				],
				'selectors' => [
					'{{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated >  .drupal_layoutbuilder-background-overlay' => 'opacity: {{SIZE}};',
				],
				'condition' => [
					'background_overlay_hover_background' => [ 'classic', 'gradient' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			[
				'name' => 'css_filters_hover',
				'selector' => '{{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated >  .drupal_layoutbuilder-background-overlay',
			]
		);

		$this->add_control(
			'background_overlay_hover_transition',
			[
				'label' => ___layoutbridge_adapter( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0.3,
				],
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
				'render_type' => 'ui',
				'separator' => 'before',
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		$this->start_controls_section(
			'section_border',
			[
				'label' => ___layoutbridge_adapter( 'Border', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_border' );

		$this->start_controls_tab(
			'tab_border_normal',
			[
				'label' => ___layoutbridge_adapter( 'Normal', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border',
				'selector' => '{{WRAPPER}} > .drupal_layoutbuilder-element-populated',
			]
		);

		$this->add_control(
			'border_radius',
			[
				'label' => ___layoutbridge_adapter( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated, {{WRAPPER}} > .drupal_layoutbuilder-element-populated > .drupal_layoutbuilder-background-overlay' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
				'selector' => '{{WRAPPER}} > .drupal_layoutbuilder-element-populated',
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_border_hover',
			[
				'label' => ___layoutbridge_adapter( 'Hover', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border_hover',
				'selector' => '{{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated',
			]
		);

		$this->add_control(
			'border_radius_hover',
			[
				'label' => ___layoutbridge_adapter( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated, {{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated > .drupal_layoutbuilder-background-overlay' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow_hover',
				'selector' => '{{WRAPPER}}:hover > .drupal_layoutbuilder-element-populated',
			]
		);

		$this->add_control(
			'border_hover_transition',
			[
				'label' => ___layoutbridge_adapter( 'Transition Duration', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'separator' => 'before',
				'default' => [
					'size' => 0.3,
				],
				'range' => [
					'px' => [
						'max' => 3,
						'step' => 0.1,
					],
				],
				'conditions' => [
					'relation' => 'or',
					'terms' => [
						[
							'name' => 'background_background',
							'operator' => '!==',
							'value' => '',
						],
						[
							'name' => 'border_border',
							'operator' => '!==',
							'value' => '',
						],
					],
				],
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated' => 'transition: background {{background_hover_transition.SIZE}}s, border {{SIZE}}s, border-radius {{SIZE}}s, box-shadow {{SIZE}}s',
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated > .drupal_layoutbuilder-background-overlay' => 'transition: background {{background_overlay_hover_transition.SIZE}}s, border-radius {{SIZE}}s, opacity {{background_overlay_hover_transition.SIZE}}s',
				],
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		// Section Typography.
		$this->start_controls_section(
			'section_typo',
			[
				'label' => ___layoutbridge_adapter( 'Typography', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		if ( in_array( Scheme_Color::get_type(), Schemes_Manager::get_enabled_schemes(), true ) ) {
			$this->add_control(
				'colors_warning',
				[
					'type' => Controls_Manager::RAW_HTML,
					'raw' => ___layoutbridge_adapter( 'Note: The following colors won\'t work if Default Colors are enabled.', 'elementor' ),
					'content_classes' => 'drupal_layoutbuilder-panel-alert drupal_layoutbuilder-panel-alert-warning',
				]
			);
		}

		$this->add_control(
			'heading_color',
			[
				'label' => ___layoutbridge_adapter( 'Heading Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .drupal_layoutbuilder-element-populated .drupal_layoutbuilder-heading-title' => 'color: {{VALUE}};',
				],
				'separator' => 'none',
			]
		);

		$this->add_control(
			'color_text',
			[
				'label' => ___layoutbridge_adapter( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'color_link',
			[
				'label' => ___layoutbridge_adapter( 'Link Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .drupal_layoutbuilder-element-populated a' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'color_link_hover',
			[
				'label' => ___layoutbridge_adapter( 'Link Hover Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .drupal_layoutbuilder-element-populated a:hover' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'text_align',
			[
				'label' => ___layoutbridge_adapter( 'Text Align', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => ___layoutbridge_adapter( 'Left', 'elementor' ),
						'icon' => 'fa fa-align-left',
					],
					'center' => [
						'title' => ___layoutbridge_adapter( 'Center', 'elementor' ),
						'icon' => 'fa fa-align-center',
					],
					'right' => [
						'title' => ___layoutbridge_adapter( 'Right', 'elementor' ),
						'icon' => 'fa fa-align-right',
					],
				],
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->end_controls_section();

		// Section Advanced.
		$this->start_controls_section(
			'section_advanced',
			[
				'label' => ___layoutbridge_adapter( 'Advanced', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		$this->add_responsive_control(
			'margin',
			[
				'label' => ___layoutbridge_adapter( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'padding',
			[
				'label' => ___layoutbridge_adapter( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'selectors' => [
					'{{WRAPPER}} > .drupal_layoutbuilder-element-populated' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'z_index',
			[
				'label' => ___layoutbridge_adapter( 'Z-Index', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'selectors' => [
					'{{WRAPPER}}' => 'z-index: {{VALUE}};',
				],
				'label_block' => false,
			]
		);

		$this->add_control(
			'animation',
			[
				'label' => ___layoutbridge_adapter( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'default' => '',
				'prefix_class' => 'animated ',
				'label_block' => false,
				'frontend_available' => true,
			]
		);

		$this->add_control(
			'animation_duration',
			[
				'label' => ___layoutbridge_adapter( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'slow' => ___layoutbridge_adapter( 'Slow', 'elementor' ),
					'' => ___layoutbridge_adapter( 'Normal', 'elementor' ),
					'fast' => ___layoutbridge_adapter( 'Fast', 'elementor' ),
				],
				'prefix_class' => 'animated-',
				'condition' => [
					'animation!' => '',
				],
			]
		);

		// $this->add_control(
		// 	'animation_delay',
		// 	[
		// 		'label' => ___layoutbridge_adapter( 'Animation Delay', 'elementor' ) . ' (ms)',
		// 		'type' => Controls_Manager::NUMBER,
		// 		'default' => '',
		// 		'min' => 0,
		// 		'step' => 100,
		// 		'condition' => [
		// 			'animation!' => '',
		// 		],
		// 		'render_type' => 'none',
		// 		'frontend_available' => true,
		// 	]
		// );

		$this->add_control(
			'_element_id',
			[
				'label' => ___layoutbridge_adapter( 'CSS ID', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'title' => ___layoutbridge_adapter( 'Add your custom id WITHOUT the Pound key. e.g: my-id', 'elementor' ),
				'label_block' => false,
				'style_transfer' => false,
			]
		);

		$this->add_control(
			'css_classes',
			[
				'label' => ___layoutbridge_adapter( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'prefix_class' => '',
				'title' => ___layoutbridge_adapter( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
				'label_block' => false,
			]
		);

		// TODO: Backward comparability for deprecated controls
		$this->add_control(
			'screen_sm',
			[
				'type' => Controls_Manager::HIDDEN,
			]
		);

		$this->add_control(
			'screen_sm_width',
			[
				'type' => Controls_Manager::HIDDEN,
				'condition' => [
					'screen_sm' => [ 'custom' ],
				],
				'prefix_class' => 'drupal_layoutbuilder-sm-',
			]
		);
		// END Backward comparability

		$this->end_controls_section();

		Plugin::$instance->controls_manager->add_custom_css_controls( $this );
	}

	/**
	 * Render column edit tools.
	 *
	 * Used to generate the edit tools HTML.
	 *
	 * @since 1.8.0
	 * @access protected
	 */
	protected function render_edit_tools() {
		?>
		<div class="drupal_layoutbuilder-element-overlay">
			<ul class="drupal_layoutbuilder-editor-element-settings drupal_layoutbuilder-editor-column-settings">
				<?php foreach ( self::get_edit_tools() as $edit_tool_name => $edit_tool ) : ?>
					<li class="drupal_layoutbuilder-editor-element-setting drupal_layoutbuilder-editor-element-<?php echo $edit_tool_name; ?>" title="<?php echo $edit_tool['title']; ?>">
						<i class="eicon-<?php echo $edit_tool['icon']; ?>" aria-hidden="true"></i>
						<span class="drupal_layoutbuilder-screen-only"><?php echo $edit_tool['title']; ?></span>
					</li>
				<?php endforeach; ?>
			</ul>
			<div class="drupal_layoutbuilder-column-percents-tooltip"></div>
		</div>
		<?php
	}

	/**
	 * Render column output in the editor.
	 *
	 * Used to generate the live preview, using a Backbone JavaScript template.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _content_template() {
		?>
		<div class="drupal_layoutbuilder-column-wrap">
			<div class="drupal_layoutbuilder-background-overlay"></div>
			<div class="drupal_layoutbuilder-widget-wrap"></div>
		</div>
		<?php
	}

	/**
	 * Before column rendering.
	 *
	 * Used to add stuff before the column element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function before_render() {
		$settings = $this->get_settings_for_display();

		$has_background_overlay = in_array( $settings['background_overlay_background'], [ 'classic', 'gradient' ], true ) ||
								  in_array( $settings['background_overlay_hover_background'], [ 'classic', 'gradient' ], true );

		$column_wrap_class = 'drupal_layoutbuilder-column-wrap';
		if ( $this->get_children() ) {
			$column_wrap_class .= ' drupal_layoutbuilder-element-populated';
		}
		?>
		<<?php echo $this->get_html_tag() . ' ' . $this->get_render_attribute_string( '_wrapper' ); ?>>
			<div class="<?php echo $column_wrap_class; ?>">
			<?php if ( $has_background_overlay ) : ?>
				<div class="drupal_layoutbuilder-background-overlay"></div>
			<?php endif; ?>
		<div class="drupal_layoutbuilder-widget-wrap">
		<?php
	}

	/**
	 * After column rendering.
	 *
	 * Used to add stuff after the column element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function after_render() {
		?>
				</div>
			</div>
		</<?php echo $this->get_html_tag(); ?>>
		<?php
	}

	/**
	 * Add column render attributes.
	 *
	 * Used to add attributes to the current column wrapper HTML tag.
	 *
	 * @since 1.3.0
	 * @access protected
	 */
	protected function _add_render_attributes() {
		parent::_add_render_attributes();

		$is_inner = $this->get_data( 'isInner' );

		$column_type = ! empty( $is_inner ) ? 'inner' : 'top';

		$settings = $this->get_settings();

		$this->add_render_attribute(
			'_wrapper', 'class', [
				'drupal_layoutbuilder-column',
				'drupal_layoutbuilder-col-' . $settings['_column_size'],
				'drupal_layoutbuilder-' . $column_type . '-column',
			]
		);

    if ( 'marquee' === $settings['html_tag'] ) {
      $this->add_render_attribute( '_wrapper', 'class', 'drupal_layoutbuilder-marquee' );
      $this->add_render_attribute( '_wrapper', 'behavior', $settings['marquee_behavior'] );
      $this->add_render_attribute( '_wrapper', 'direction', $settings['marquee_direction'] );
      $this->add_render_attribute( '_wrapper', 'speed', $settings['marquee_speed'] );
      if ( 'yes' === $settings['marquee_pause_on_hover'] ) {
        // Optional: Custom attribute for styling/reference
        $this->add_render_attribute('_wrapper', 'pause-on-hover', 'true');
    
        // Add native marquee pause/resume JS events
        $this->add_render_attribute('_wrapper', 'onmouseover', 'this.stop();');
        $this->add_render_attribute('_wrapper', 'onmouseout', 'this.start();');
      }
    }

		$this->add_render_attribute( '_wrapper', 'data-element_type', $this->get_name() );
	}

	/**
	 * Get default child type.
	 *
	 * Retrieve the column child type based on element data.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @param array $element_data Element ID.
	 *
	 * @return Element_Base Column default child type.
	 */
	protected function _get_default_child_type( array $element_data ) {
		if ( 'section' === $element_data['elType'] ) {
			return Plugin::$instance->elements_manager->get_element_types( 'section' );
		}

		return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
	}

	/**
	 * Get HTML tag.
	 *
	 * Retrieve the column element HTML tag.
	 *
	 * @since 1.5.3
	 * @access private
	 *
	 * @return string Column HTML tag.
	 */
	private function get_html_tag() {
		$html_tag = $this->get_settings( 'html_tag' );

		if ( empty( $html_tag ) ) {
			$html_tag = 'div';
		}

		return $html_tag;
	}
}
