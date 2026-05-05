<?php

/**
 * @file
 * Contains \Drupal\elementor\ElementorPlugin.
 */

namespace Drupal\elementor;

use Drupal\Core\DrupalKernelInterface;

define('DOING_AJAX', true);

define('ABSPATH', false);
define('ELEMENTOR_VERSION', '2.2.1');
define('ELEMENTOR_PREVIOUS_STABLE_VERSION', '2.1.8');

define('ELEMENTOR__FILE__', __FILE__);
define('ELEMENTOR_PLUGIN_BASE', '');
define('ELEMENTOR_PATH', \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor/');
if (defined('ELEMENTOR_TESTS') && ELEMENTOR_TESTS) {
    define('ELEMENTOR_URL', 'file://' . ELEMENTOR_PATH);
} else {
    define('ELEMENTOR_URL', '');
}
define('ELEMENTOR_MODULES_PATH', '');
define('ELEMENTOR_ASSETS_URL', '/' . ELEMENTOR_PATH . 'assets/'); // base_path() is null

require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/do-actions-functions.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/wordpress-functions.php';

require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor/includes/plugin.php';

require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/template-library/classes/class-import-images.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/template-library/sources/remote.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/template-library/sources/local.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/template-library/manager.php';

require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/revisions-manager.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/ajax-manager.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/document-types/node.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/post-css.php';
require \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor_drupal/ElementorSDK.php';

use Drupal\elementor\DocumentDrupal;
use Drupal\elementor\DrupalPost_CSS;
use Drupal\elementor\Drupal_Ajax_Manager;
use Drupal\elementor\Drupal_Revisions_Manager;
use Drupal\elementor\Drupal_TemplateLibrary_Manager;
use Drupal\elementor\ElementorSDK;

use Elementor\Editor;
use Elementor\Plugin;
use Elementor\Schemes_Manager;

class ElementorPlugin
{
    protected $plugin;
    public $sdk;
    /**
     * Instance.
     *
     * Holds the plugin instance.
     *
     * @since 1.0.0
     * @access public
     * @static
     *
     * 
     */
    public static $instance = null;

    /**
     * Sdk.
     *
     * Holds the sdk instance.
     *
     * @since 1.0.0
     * @access public
     * @static
     *
     * 
     */
    // public static $sdk = null;

    /**
     * Instance.
     *
     * Ensures only one instance of the plugin class is loaded or can be loaded.
     *
     * @since 1.0.0
     * @access public
     * @static
     *
     * @return Plugin An instance of the class.
     */

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Render data.
     *
     * Get the markup of data by elementor data.
     *
     * @since 1.0.0
     * @access private
     */
    private function render_data($id)
    {
        $elements_data = $this->sdk->get_data($id);

        $data = [
            'elements' => isset($elements_data['elements']) ? $elements_data['elements'] : [],
            'settings' => isset($elements_data['settings']) ? $elements_data['settings'] : [],
        ];

        $with_html_content = true;
        $editor_data = [];

        foreach ($data['elements'] as $element_data) {
            $element = Plugin::$instance->elements_manager->create_element_instance($element_data);

            if (!$element) {
                continue;
            }

            $editor_data[] = $element->get_raw_data($with_html_content);
        }

        $data['elements'] = $editor_data;

        return $data;
    }

    /**
     * Editor.
     *
     * Get the editor tmp_scripts & config_data (no: js/css assets).
     *
     * @since 1.0.0
     * @access public
     */
    public function editor($id)
    {
        global $base_url, $language;
        $dir = \Drupal::languageManager()->getCurrentLanguage()->getDirection();
        $data = $this->render_data($id);

        $widgets = $this->plugin->widgets_manager->get_widget_types_config();

        $config = [
            'version' => ELEMENTOR_VERSION,
            'ajaxurl' => base_path() . 'elementor/update',
            'home_url' => base_path(),
            'assets_url' => base_path() . \Drupal::moduleHandler()->getModule('elementor')->getPath() . '/elementor/assets/',
            "post_id" => $id,
            "is_rtl" => $dir == 'rtl',
            'data' => $data['elements'],
            'elements_categories' => $this->plugin->elements_manager->get_categories(),
            'controls' => $this->plugin->controls_manager->get_controls_data(),
            'elements' => $this->plugin->elements_manager->get_element_types_config(),
            'widgets' =>$widgets,
            'schemes' => [
                'items' => Plugin::$instance->schemes_manager->get_registered_schemes_data(),
                'enabled_schemes' => Schemes_Manager::get_enabled_schemes(),
            ],
            'default_schemes' => Plugin::$instance->schemes_manager->get_schemes_defaults(),
            'system_schemes' => Plugin::$instance->schemes_manager->get_system_schemes(),
            'i18n' => [
                // ...existing code...
            ],
        ];

        $localized_settings = [];

        $localized_settings = apply_filters_elementor_adapter('elementor/editor/localize_settings', $localized_settings, $id);

        if (!empty($localized_settings)) {
            $config = array_replace_recursive($config, $localized_settings);
        }

        ob_start();
        $this->plugin->editor->wp_footer();
        $tmp_scripts = ob_get_clean();

        $elementor_settings = \Drupal::config('elementor.settings');

        $config = json_encode($config);

        ob_start();

        $url  = $base_url . "/node/" . $id;
        echo '<script>' . PHP_EOL;
        echo '/* <![CDATA[ */' . PHP_EOL;

        echo 'var _ElementorConfig = ' . $config . ';' . PHP_EOL;
        echo 'Object.assign(ElementorConfig, _ElementorConfig);' . PHP_EOL;

        echo 'var base_url = "' . $base_url . '";' . PHP_EOL;
        echo 'var ajaxurl = "/elementor/autosave";' . PHP_EOL; //_ElementorConfig.ajaxurl;' . PHP_EOL;
        echo 'ElementorConfig.document.id = ' . $id . ';' . PHP_EOL;
        echo 'ElementorConfig.document.urls = {
            preview: "'. $url .'",
            exit_to_dashboard: "' . $url . '",
        };' . PHP_EOL;

        echo 'ElementorConfig.settings.general.settings.elementor_default_generic_fonts =  "' . $elementor_settings->get('default_generic_fonts') . '";' . PHP_EOL;
        echo 'ElementorConfig.settings.general.settings.elementor_container_width = "' . $elementor_settings->get('container_width') . '";' . PHP_EOL;
        echo 'ElementorConfig.settings.general.settings.elementor_space_between_widgets = "' . $elementor_settings->get('space_between_widgets') . '";' . PHP_EOL;
        echo 'ElementorConfig.settings.general.settings.elementor_stretched_section_container = "' . $elementor_settings->get('stretched_section_container') . '";' . PHP_EOL;

        echo '/* ]]> */' . PHP_EOL;
        echo '</script>';

        $config_data = ob_get_clean();

        return $tmp_scripts . $config_data;
    }

    /**
     * Frontend.
     *
     * Get the frontend css & html (no: js/css assets).
     *
     * @since 1.0.0
     * @access public
     */
    public function frontend($id)
    {
        $elements_data = $this->sdk->get_data($id);

        if (empty($elements_data) || !isset($elements_data['elements'])) {
            return '';
        }

        $css_file = new DrupalPost_CSS($id);

        ob_start();

        foreach ($elements_data['elements'] as $element_data) {
            $element = $this->plugin->elements_manager->create_element_instance($element_data);

            if (!$element) {
                continue;
            }

            $element->print_element();
            $css_file->render_styles($element);
        }

        $html = ob_get_clean();

        ob_start();
        $css_file->print_css();
        $css = ob_get_clean();

        return $css . $html;
    }

    /**
     * Preview.
     *
     * Get the preview css & html (no: js/css assets).
     *
     * @since 1.0.0
     * @access public
     */
    public function preview($id)
    {
        return [];
    }

    /**
     * General Elementor updater.
     *
     * @since 1.2.0
     * @access public
     */
    public function update($request)
    {
        // Moves the request to the Elmentor .
        return do_ajax_elementor_adapter($_REQUEST['action']);
    }

    /**
     * Register widgets.
     *
     * @since 1.0.0
     * @access protected
     */
    public function register_widget()
    {
        $sdk_widgets = $this->sdk->init_widgets();

        foreach ($sdk_widgets as $widget) {
            $this->plugin->widgets_manager->register_widget_type($widget);
            $widgets[$widget->get_name()] = $widget->get_config();
        }
    }


    /**
     * Plugin constructor.
     *
     * Initializing ElementorPlugin integration.
     *
     * @since 1.0.0
     * @access private
     */
    public function __construct(array $data = []) {
      $this->plugin = Plugin::$instance;
      do_action_elementor_adapter('init');

      $this->plugin->ajax = new Drupal_Ajax_Manager();
      $this->plugin->revisions_manager = new Drupal_Revisions_Manager();
      $this->plugin->templates_manager = new Drupal_TemplateLibrary_Manager();

      $this->plugin->documents->register_document_type(
          'DocumentDrupal',
          DocumentDrupal::get_class_full_name()
      );

      $this->sdk = new ElementorSDK;

      add_action_elementor_adapter('elementor/widgets/widgets_registered', [$this, 'register_widget']);
  }
}

// // if (!defined('ELEMENTOR_TESTS')) {
// //     // In tests we run the instance manually.
//     ElementorPlugin::instance();
// // }
