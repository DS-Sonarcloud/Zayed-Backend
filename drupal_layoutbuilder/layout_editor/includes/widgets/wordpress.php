<?php
namespace DrupalLayoutbuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor Drupal widget.
 *
 * Elementor widget that displays all the Drupal widgets.
 *
 * @since 1.0.0
 */
class Widget_WordPress extends Widget_Base {

	/**
	 * Drupal widget name.
	 *
	 * @access private
	 *
	 * @var string
	 */
	private $_widget_name = null;

	/**
	 * Drupal widget instance.
	 *
	 * @access private
	 *
	 * @var \WP_Widget
	 */
	private $_widget_instance = null;

	/**
	 * Whether the widget is a Pojo widget or not.
	 *
	 * @since 2.0.0
	 * @access private
	 *
	 * @return bool
	 */
	private function is_pojo_widget() {
		return $this->get_widget_instance() instanceof \Pojo_Widget_Base;
	}

	/**
	 * Get widget name.
	 *
	 * Retrieve Drupal/Pojo widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'wp-widget-' . $this->get_widget_instance()->id_base;
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve Drupal/Pojo widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return $this->get_widget_instance()->name;
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the Drupal/Pojo widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return array Widget categories. Returns either a Drupal category or Pojo category.
	 */
	public function get_categories() {
		if ( $this->is_pojo_widget() ) {
			$category = 'pojo';
		} else {
			$category = 'wordpress'; // WPCS: spelling ok.
		}
		return [ $category ];
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve Drupal/Pojo widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon. Returns either a Drupal icon or Pojo icon.
	 */
	public function get_icon() {
		if ( $this->is_pojo_widget() ) {
			return 'eicon-pojome';
		}
		return 'eicon-wordpress';
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
	public function get_keywords() {
		return [ 'wordpress', 'widget' ];
	}

	/**
	 * Whether the reload preview is required or not.
	 *
	 * Used to determine whether the reload preview is required.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return bool Whether the reload preview is required.
	 */
	public function is_reload_preview_required() {
		return true;
	}

	/**
	 * Retrieve Drupal/Pojo widget form.
	 *
	 * Returns the Drupal widget form, to be used in Elementor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget form.
	 */
	public function get_form() {
		$instance = $this->get_widget_instance();

		ob_start();
		echo '<div class="widget-inside media-widget-control"><div class="form wp-core-ui">';
		echo '<input type="hidden" class="id_base" value="' . esc_attr_layoutbridge_adapter( $instance->id_base ) . '" />';
		echo '<input type="hidden" class="widget-id" value="widget-' . esc_attr_layoutbridge_adapter( $this->get_id() ) . '" />';
		echo '<div class="widget-content">';
		$instance->form( $this->get_settings( 'wp' ) );
		echo '</div></div></div>';
		return ob_get_clean();
	}

	/**
	 * Retrieve Drupal/Pojo widget instance.
	 *
	 * Returns an instance of Drupal widget, to be used in Elementor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return \WP_Widget
	 */
	public function get_widget_instance() {
		if ( is_null( $this->_widget_instance ) ) {
			global $wp_widget_factory;

			if ( isset( $wp_widget_factory->widgets[ $this->_widget_name ] ) ) {
				$this->_widget_instance = $wp_widget_factory->widgets[ $this->_widget_name ];
				$this->_widget_instance->_set( 'REPLACE_TO_ID' );
			} elseif ( class_exists( $this->_widget_name ) ) {
				$this->_widget_instance = new $this->_widget_name();
				$this->_widget_instance->_set( 'REPLACE_TO_ID' );
			}
		}
		return $this->_widget_instance;
	}

	/**
	 * Retrieve Drupal/Pojo widget parsed settings.
	 *
	 * Returns the Drupal widget settings, to be used in Elementor.
	 *
	 * @access protected
	 * @since 1.0.0
	 *
	 * @return array Parsed settings.
	 */
	protected function _get_parsed_settings() {
		$settings = parent::_get_parsed_settings();

		if ( ! empty( $settings['wp'] ) ) {
			$settings['wp'] = $this->get_widget_instance()->update( $settings['wp'], [] );
		}

		return $settings;
	}

	/**
	 * Register Drupal/Pojo widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->add_control(
			'wp',
			[
				'label' => ___layoutbridge_adapter( 'Form', 'elementor' ),
				'type' => Controls_Manager::WP_WIDGET,
				'widget' => $this->get_name(),
				'id_base' => $this->get_widget_instance()->id_base,
			]
		);
	}

	/**
	 * Render Drupal/Pojo widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$default_widget_args = [
			'widget_id' => $this->get_name(),
			'before_widget' => '',
			'after_widget' => '',
			'before_title' => '<h5>',
			'after_title' => '</h5>',
		];

		/**
		 * Widget instance arguments.
		 *
		 * Filters the widget arguments when they are rendered in the Elementor panel.
		 *
		 * @since 1.0.0
		 *
		 * @param array            $default_widget_args Default widget arguments.
		 * @param Widget_WordPress $this                The widget instance.
		 */
		$default_widget_args = apply_filters_layoutbridge_adapter( 'elementor/widgets/wordpress/widget_args', $default_widget_args, $this ); // WPCS: spelling ok.

		$this->get_widget_instance()->widget( $default_widget_args, $this->get_settings( 'wp' ) );
	}

	/**
	 * Render Drupal/Pojo widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function content_template() {}

	/**
	 * Drupal/Pojo widget constructor.
	 *
	 * Used to run Drupal widget constructor.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $data Widget data. Default is an empty array.
	 * @param array $args Widget arguments. Default is null.
	 */
	public function __construct( $data = [], $args = null ) {
		$this->_widget_name = $args['widget_name'];

		parent::__construct( $data, $args );
	}

	/**
	 * Render Drupal/Pojo widget as plain content.
	 *
	 * Override the default render behavior, don't render widget content.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $instance Widget instance. Default is empty array.
	 */
	public function render_plain_content( $instance = [] ) {}
}
