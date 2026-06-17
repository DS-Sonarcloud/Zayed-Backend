<?php

/**
 * @file
 * Contains \Drupal\drupal_layoutbuilder\DrupalLayoutbuilderPlugin.
 */

namespace Drupal\drupal_layoutbuilder;

use Drupal\Core\DrupalKernelInterface;

define('DOING_AJAX', true);

define('ABSPATH', false);

/**
 * Version reported to the browser (ElementorConfig / window.elementor.config).
 * Internal Elementor engine constants remain separate for compatibility.
 */
if (!defined('DRUPAL_LAYOUTBUILDER_MODULE_VERSION')) {
    $layoutbuilder_info = \Drupal::service('extension.list.module')->getExtensionInfo('drupal_layoutbuilder');
    define('DRUPAL_LAYOUTBUILDER_MODULE_VERSION', $layoutbuilder_info['version'] ?? '1.0.1');
}

define('DRUPAL_LAYOUTBUILDER_VERSION', '2.2.1');
define('DRUPAL_LAYOUTBUILDER_PREVIOUS_STABLE_VERSION', '2.1.8');

define('DRUPAL_LAYOUTBUILDER_FILE', __FILE__);
define('DRUPAL_LAYOUTBUILDER_PLUGIN_BASE', '');
$drupal_layoutbuilder_rel_path = \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layout_editor/';
define('DRUPAL_LAYOUTBUILDER_PATH', $drupal_layoutbuilder_rel_path);
if (defined('DRUPAL_LAYOUTBUILDER_TESTS') && DRUPAL_LAYOUTBUILDER_TESTS) {
    define('DRUPAL_LAYOUTBUILDER_URL', 'file://' . DRUPAL_LAYOUTBUILDER_PATH);
} else {
    define('DRUPAL_LAYOUTBUILDER_URL', '');
}
define('DRUPAL_LAYOUTBUILDER_MODULES_PATH', '');
// Include language / subdirectory prefix (e.g. /en/) so PHP-built URLs match Twig and avoid redirects.
$drupal_layoutbuilder_req_base = \Drupal::request()->getBasePath();
$drupal_layoutbuilder_assets_prefix = ($drupal_layoutbuilder_req_base === '' || $drupal_layoutbuilder_req_base === '/') ? '/' : rtrim($drupal_layoutbuilder_req_base, '/') . '/';
define('DRUPAL_LAYOUTBUILDER_ASSETS_URL', $drupal_layoutbuilder_assets_prefix . $drupal_layoutbuilder_rel_path . 'assets/');

require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/do-actions-functions.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/bridge_legacy_api.php';

require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layout_editor/includes/plugin.php';

require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/template-library/classes/class-import-images.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/template-library/sources/remote.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/template-library/sources/local.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/template-library/manager.php';

require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/revisions-manager.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/ajax-manager.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/document-types/node.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/post-css.php';
require \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layoutbuilder_bridge/DrupalLayoutbuilderSdk.php';

use Drupal\drupal_layoutbuilder\DocumentDrupal;
use Drupal\drupal_layoutbuilder\DrupalPost_CSS;
use Drupal\drupal_layoutbuilder\Drupal_Ajax_Manager;
use Drupal\drupal_layoutbuilder\Drupal_Revisions_Manager;
use Drupal\drupal_layoutbuilder\Drupal_TemplateLibrary_Manager;
use Drupal\drupal_layoutbuilder\DrupalLayoutbuilderSdk;

use DrupalLayoutbuilder\Editor;
use DrupalLayoutbuilder\Plugin;
use DrupalLayoutbuilder\Schemes_Manager;

class DrupalLayoutbuilderPlugin
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
            // null avoids client-side version mismatch with bundled editor assets.
            'version' => null,
            'ajaxurl' => base_path() . 'drupal-layoutbuilder/update',
            'home_url' => base_path(),
            'assets_url' => base_path() . \Drupal::moduleHandler()->getModule('drupal_layoutbuilder')->getPath() . '/layout_editor/assets/',
            "post_id" => $id,
            "is_rtl" => $dir == 'rtl',
            'data' => $data['elements'],
            'elements_categories' => $this->plugin->elements_manager->get_categories(),
            'controls' => $this->plugin->controls_manager->get_controls_data(),
            'elements' => $this->plugin->elements_manager->get_element_types_config(),
            'widgets' => $widgets,
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

        $localized_settings = apply_filters_layoutbridge_adapter('elementor/editor/localize_settings', $localized_settings, $id);

        if (!empty($localized_settings)) {
            $config = array_replace_recursive($config, $localized_settings);
        }
        unset($config['version']);

        ob_start();
        $this->plugin->editor->wp_footer();
        $tmp_scripts = ob_get_clean();

        $layoutbuilder_settings = \Drupal::config('drupal_layoutbuilder.settings');

        $config = json_encode($config, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);

        ob_start();

        $url  = $base_url . "/node/" . $id;
        echo '<script>' . PHP_EOL;
        echo '/* <![CDATA[ */' . PHP_EOL;

        echo 'var _ElementorConfig = ' . $config . ';' . PHP_EOL;
        echo 'if (typeof ElementorConfig !== "undefined") {' . PHP_EOL;
        echo '  Object.assign(ElementorConfig, _ElementorConfig);' . PHP_EOL;
        echo '} else {' . PHP_EOL;
        echo '  var ElementorConfig = _ElementorConfig;' . PHP_EOL;
        echo '}' . PHP_EOL;
        echo 'try { delete ElementorConfig.version; delete _ElementorConfig.version; } catch (e) {}' . PHP_EOL;
        echo 'window.drupalLayoutbuilderModuleVersion = ' . json_encode(DRUPAL_LAYOUTBUILDER_MODULE_VERSION, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) . ';' . PHP_EOL;

        echo 'var base_url = "' . $base_url . '";' . PHP_EOL;
        echo 'var ajaxurl = "/drupal-layoutbuilder/autosave";' . PHP_EOL;
        echo 'ElementorConfig.document.id = ' . $id . ';' . PHP_EOL;
        echo 'ElementorConfig.document.urls = {
            preview: "'. $url .'?dlb_preview=1",
            exit_to_dashboard: "' . $url . '",
        };' . PHP_EOL;

        echo 'ElementorConfig.settings.general.settings.elementor_default_generic_fonts =  "' . $layoutbuilder_settings->get('default_generic_fonts') . '";' . PHP_EOL;
        echo 'ElementorConfig.settings.general.settings.elementor_container_width = "' . $layoutbuilder_settings->get('container_width') . '";' . PHP_EOL;
        echo 'ElementorConfig.settings.general.settings.elementor_space_between_widgets = "' . $layoutbuilder_settings->get('space_between_widgets') . '";' . PHP_EOL;
        echo 'ElementorConfig.settings.general.settings.elementor_stretched_section_container = "' . $layoutbuilder_settings->get('stretched_section_container') . '";' . PHP_EOL;

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
        return do_ajax_layoutbridge_adapter($_REQUEST['action']);
    }

    /**
     * Register widgets.
     *
     * @since 1.0.0
     * @access public
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
     * Initializing DrupalLayoutbuilderPlugin integration.
     *
     * @since 1.0.0
     * @access private
     */
    public function __construct(array $data = []) {
      $this->plugin = Plugin::$instance;
      do_action_layoutbridge_adapter('init');

      $this->plugin->ajax = new Drupal_Ajax_Manager();
      $this->plugin->revisions_manager = new Drupal_Revisions_Manager();
      $this->plugin->templates_manager = new Drupal_TemplateLibrary_Manager();

      $this->plugin->documents->register_document_type(
          'DocumentDrupal',
          DocumentDrupal::get_class_full_name()
      );

      $this->sdk = new DrupalLayoutbuilderSdk;

      add_action_layoutbridge_adapter('elementor/widgets/widgets_registered', [$this, 'register_widget']);
  }
}

// // if (!defined('DRUPAL_LAYOUTBUILDER_TESTS')) {
// //     // In tests we run the instance manually.
//     DrupalLayoutbuilderPlugin::instance();
// // }
