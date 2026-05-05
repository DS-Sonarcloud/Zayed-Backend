<?php
namespace Elementor;

use Elementor\Modules\DynamicTags\Module as TagsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor audio widget.
 *
 * Elementor widget that displays an audio player.
 *
 * @since 1.0.0
 */
class Widget_Audio extends Widget_Base {

	/**
	 * Current instance.
	 *
	 * @access protected
	 *
	 * @var array
	 */
	protected $_current_instance = [];

	/**
	 * Get widget name.
	 *
	 * Retrieve audio widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'audio';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve audio widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return ___elementor_adapter( 'SoundCloud', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve audio widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-headphones';
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
		return [ 'audio', 'player', 'soundcloud', 'embed' ];
	}

	/**
	 * Register audio widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->start_controls_section(
			'section_audio',
			[
				'label' => ___elementor_adapter( 'SoundCloud', 'elementor' ),
			]
		);

		$this->add_control(
			'link',
			[
				'label' => ___elementor_adapter( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'dynamic' => [
					'active' => true,
					'categories' => [
						TagsModule::POST_META_CATEGORY,
						TagsModule::URL_CATEGORY,
					],
				],
				'default' => [
					'url' => 'https://soundcloud.com/shchxango/john-coltrane-1963-my-favorite',
				],
				'show_external' => false,
			]
		);
		/*
		$this->add_control(
			'visual',
			[
				'label' => ___elementor_adapter( 'Visual Player', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'options' => [
					'yes' => ___elementor_adapter( 'Yes', 'elementor' ),
					'no' => ___elementor_adapter( 'No', 'elementor' ),
				],
			]
		);
		*/
		$this->add_control(
			'sc_options',
			[
				'label' => ___elementor_adapter( 'Additional Options', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			]
		);

		$this->add_control(
			'sc_auto_play',
			[
				'label' => ___elementor_adapter( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
			]
		);
		/*
		$this->add_control(
			'sc_buying',
			[
				'label' => ___elementor_adapter( 'Buy Button', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
			]
		);

		$this->add_control(
			'sc_liking',
			[
				'label' => ___elementor_adapter( 'Like Button', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
			]
		);

		$this->add_control(
			'sc_download',
			[
				'label' => ___elementor_adapter( 'Download Button', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
			]
		);

		$this->add_control(
			'sc_show_artwork',
			[
				'label' => ___elementor_adapter( 'Artwork', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
				'condition' => [
					'visual' => 'no',
				],
			]
		);

		$this->add_control(
			'sc_sharing',
			[
				'label' => ___elementor_adapter( 'Share Button', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
			]
		);

		$this->add_control(
			'sc_show_comments',
			[
				'label' => ___elementor_adapter( 'Comments', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
			]
		);

		$this->add_control(
			'sc_show_playcount',
			[
				'label' => ___elementor_adapter( 'Play Counts', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
			]
		);

		$this->add_control(
			'sc_show_user',
			[
				'label' => ___elementor_adapter( 'Username', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => ___elementor_adapter( 'Hide', 'elementor' ),
				'label_on' => ___elementor_adapter( 'Show', 'elementor' ),
				'default' => 'yes',
			]
		);
		
		$this->add_control(
			'sc_color',
			[
				'label' => ___elementor_adapter( 'Controls Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
			]
		);
		*/
		$this->add_control(
			'view',
			[
				'label' => ___elementor_adapter( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'soundcloud',
			]
		);

		$this->end_controls_section();

	}

	/**
	 * Render audio widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	// In your Widget_Audio class
	private function build_sc_params(array $s): array {
		/*
		$keys = [
			'auto_play','buying','liking','download','sharing',
			'show_comments','show_playcount','show_user','show_artwork'
		];
		*/
		$keys = ['auto_play'];
		$p = [];
		foreach ($keys as $k) {
			// Elementor switcher returns "yes" or "" (empty)
			$p[$k] = (!empty($s['sc_'.$k]) && $s['sc_'.$k] === 'yes') ? 'true' : 'false';
		}

		// Handle color
		if (!empty($s['sc_color'])) {
			$p['color'] = ltrim($s['sc_color'], '#');
		}

		return $p;
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		if ( empty( $settings['link']['url'] ) ) {
			return;
		}

		$params = $this->build_sc_params($settings);
		$visual = ($settings['visual'] ?? 'no') === 'yes';

		// Call the adapter with extra args for SoundCloud
		$html = wp_oembed_get_elementor_adapter($settings['link']['url'], [
			'soundcloud' => [
				'params' => $params,
				'visual' => $visual,
				'height' => $visual ? 400 : 200,
			],
		]);

		if ($html) {
			$autoPlayFlag = (!empty($settings['sc_auto_play']) && $settings['sc_auto_play'] === 'yes') ? 'true' : 'false';

		echo '<div class="elementor-soundcloud-wrapper" data-autoplay="' . $autoPlayFlag . '">' 
			. $html 
			. '</div>';
		}
	}


	/**
	 * Filter audio widget oEmbed results.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param string $html The HTML returned by the oEmbed provider.
	 *
	 * @return string Filtered audio widget oEmbed HTML.
	 */
	public function filter_oembed_result( $html ) {
    // Only pass supported SoundCloud widget parameters
    /*
	$allowed_params = [
        'auto_play',
        'buying',
        'liking',
        'sharing',
        'show_comments',
        'show_playcount',
        'show_user',
        'show_artwork',
        'color',
    ];
	*/
	$allowed_params = [
        'auto_play',
        'color',
    ];
    $params = [];

    // Autoplay: set explicitly true/false
    if ( isset($this->_current_instance['sc_auto_play']) ) {
        $params['auto_play'] = ($this->_current_instance['sc_auto_play'] === 'yes') ? 'true' : 'false';
    }

    // Color
    if ( !empty($this->_current_instance['sc_color']) ) {
        $params['color'] = str_replace('#', '', $this->_current_instance['sc_color']);
    }

    // Extract iframe src
    if ( preg_match('/<iframe.*src="([^"]+)".*><\/iframe>/isU', $html, $matches) ) {
        $url = esc_url_elementor_adapter(
            add_query_arg_elementor_adapter($params, $matches[1])
        );

        $html = str_replace($matches[1], $url, $html);
    }

    return $html;
}


	/**
	 * Render audio widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _content_template() {}
}
