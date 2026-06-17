<?php

namespace Drupal\drupal_layoutbuilder;

use Drupal\drupal_layoutbuilder\DrupalLayoutbuilderPlugin;
use DrupalLayoutbuilder\Core\Base\Document;
use DrupalLayoutbuilder\Core\Settings\Manager as SettingsManager;
use DrupalLayoutbuilder\Core\Settings\Page\Model;
use DrupalLayoutbuilder\DB;
use DrupalLayoutbuilder\Editor;
use DrupalLayoutbuilder\Plugin;
use DrupalLayoutbuilder\Settings;
use DrupalLayoutbuilder\TemplateLibrary\Source_Base;
use DrupalLayoutbuilder\Utils;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Elementor template library local source.
 *
 * Elementor template library local source handler class is responsible for
 * handling local Elementor templates saved by the user locally on his site.
 *
 * @since 1.0.0
 */
class Source_Local extends Source_Base
{

    /**
     * Elementor template-library post-type slug.
     */
    const CPT = 'elementor_library';

    /**
     * Elementor template-library taxonomy slug.
     */
    const TAXONOMY_TYPE_SLUG = 'elementor_library_type';

    /**
     * Elementor template-library meta key.
     */
    const TYPE_META_KEY = '_elementor_template_type';

    /**
     * Elementor template-library temporary files folder.
     */
    const TEMP_FILES_DIR = 'layout_editor/tmp';

    /**
     * Elementor template-library bulk export action name.
     */
    const BULK_EXPORT_ACTION = 'elementor_export_multiple_templates';

    /**
     * Template types.
     *
     * Holds the list of supported template types that can be displayed.
     *
     * @access private
     * @static
     *
     * @var array
     */
    private static $_template_types = [];

    /**
     * Post type object.
     *
     * Holds the post type object of the current post.
     *
     * @access private
     *
     * @var \WP_Post_Type
     */
    private $post_type_object;

    /**
     * Get local template type.
     *
     * Retrieve the template type from the post meta.
     *
     * @since 1.0.0
     * @access public
     * @static
     *
     * @param int $template_id The template ID.
     *
     * @return mixed The value of meta data field.
     */
    public static function get_template_type($template_id)
    {
        return get_post_meta_layoutbridge_adapter($template_id, self::TYPE_META_KEY, true);
    }

    /**
     * Is base templates screen.
     *
     * Whether the current screen base is edit and the post type is template.
     *
     * @since 1.0.0
     * @access public
     * @static
     *
     * @return bool True on base templates screen, False otherwise.
     */
    public static function is_base_templates_screen()
    {
        global $current_screen;

        if (!$current_screen) {
            return false;
        }

        return 'edit' === $current_screen->base && self::CPT === $current_screen->post_type;
    }

    /**
     * Add template type.
     *
     * Register new template type to the list of supported local template types.
     *
     * @since 1.0.3
     * @access public
     * @static
     *
     * @param string $type Template type.
     */
    public static function add_template_type($type)
    {
        self::$_template_types[$type] = $type;
    }

    /**
     * Remove template type.
     *
     * Remove existing template type from the list of supported local template
     * types.
     *
     * @since 1.8.0
     * @access public
     * @static
     *
     * @param string $type Template type.
     */
    public static function remove_template_type($type)
    {
        if (isset(self::$_template_types[$type])) {
            unset(self::$_template_types[$type]);
        }
    }

    /**
     * Get local template ID.
     *
     * Retrieve the local template ID.
     *
     * @since 1.0.0
     * @access public
     *
     * @return string The local template ID.
     */
    public function get_id()
    {
        return 'local';
    }

    /**
     * Get local template title.
     *
     * Retrieve the local template title.
     *
     * @since 1.0.0
     * @access public
     *
     * @return string The local template title.
     */
    public function get_title()
    {
        return ___layoutbridge_adapter('Local', 'elementor');
    }

    /**
     * Enqueue admin scripts.
     *
     * Registers all the admin scripts and enqueues them.
     *
     * Fired by `admin_enqueue_scripts` action.
     *
     * @since 2.0.0
     * @access public
     */
    public function admin_enqueue_scripts()
    {
        $screen = function_exists('get_current_screen') ? get_current_screen() : null;
        if ($screen && in_array($screen->id, ['elementor_library', 'edit-elementor_library'], true)) {
            wp_enqueue_script_layoutbridge_adapter('drupal_layoutbuilder-dialog');
            add_action_layoutbridge_adapter('admin_footer', [$this, 'print_new_template_dialog']);
        }
    }

    /**
     * Print new template dialog.
     *
     * Used to output the new template dialog.
     *
     * Fired by `admin_footer` action.
     *
     * @since 2.0.0
     * @access public
     */
    public function print_new_template_dialog()
    {
        $document_types = Plugin::$instance->documents->get_document_types();
        $types = [];
        $selected = get_query_var('elementor_library_type');

        foreach ($document_types as $document_type) {
            if ($document_type::get_property('show_in_library')) {
                /**
                 * @var Document $instance
                 */
                $instance = new $document_type();

                $types[$instance->get_name()] = $document_type::get_title();
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
        $types = apply_filters_layoutbridge_adapter('elementor/template-library/create_new_dialog_types', $types, $document_types);
        ?>
		<div id="drupal_layoutbuilder-new-template-dialog" style="display: none">
			<div class="drupal_layoutbuilder-templates-modal__header">
				<div class="drupal_layoutbuilder-templates-modal__header__logo-area">
					<div class="drupal_layoutbuilder-templates-modal__header__logo">
					<span class="drupal_layoutbuilder-templates-modal__header__logo__icon-wrapper">
						<i class="eicon-elementor"></i>
					</span>
					<span><?php echo ___layoutbridge_adapter('New Template', 'elementor'); ?></span>
					</div>
				</div>
				<div class="drupal_layoutbuilder-templates-modal__header__items-area">
					<div class="drupal_layoutbuilder-templates-modal__header__close-modal drupal_layoutbuilder-templates-modal__header__item">
						<i class="eicon-close" aria-hidden="true" title="Close"></i>
						<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter('Close', 'elementor'); ?></span>
					</div>
				</div>
			</div>
			<div id="drupal_layoutbuilder-new-template-dialog-content">
				<div id="drupal_layoutbuilder-new-template__description">
					<div id="drupal_layoutbuilder-new-template__description__title"><?php echo ___layoutbridge_adapter('Templates Help You <span>Work Efficiently</span>', 'elementor'); ?></div>
					<div id="drupal_layoutbuilder-new-template__description__content"><?php echo ___layoutbridge_adapter('Use templates to create the different pieces of your site, and reuse them with one click whenever needed.', 'elementor'); ?></div>
					<?php
/*
        <div id="drupal_layoutbuilder-new-template__take_a_tour">
        <i class="eicon-play-o"></i>
        <a href="#"><?php echo ___layoutbridge_adapter( 'Take The Video Tour', 'elementor' ); ?></a>
        </div>
         */
        ?>
				</div>
				<form id="drupal_layoutbuilder-new-template__form" action="<?php esc_url_layoutbridge_adapter(admin_url_layoutbridge_adapter('/edit.php'));?>">
					<input type="hidden" name="post_type" value="elementor_library">
					<input type="hidden" name="action" value="elementor_new_post">
					<input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce('elementor_action_new_post'); ?>">
					<div id="drupal_layoutbuilder-new-template__form__title"><?php echo ___layoutbridge_adapter('Choose Template Type', 'elementor'); ?></div>
					<div id="drupal_layoutbuilder-new-template__form__template-type__wrapper" class="drupal_layoutbuilder-form-field">
						<label for="drupal_layoutbuilder-new-template__form__template-type" class="drupal_layoutbuilder-form-field__label"><?php echo ___layoutbridge_adapter('Select the type of template you want to work on', 'elementor'); ?></label>
						<div class="drupal_layoutbuilder-form-field__select__wrapper">
							<select id="drupal_layoutbuilder-new-template__form__template-type" class="drupal_layoutbuilder-form-field__select" name="template_type" required>
								<option value=""><?php echo ___layoutbridge_adapter('Select', 'elementor'); ?>...</option>
								<?php
foreach ($types as $value => $title) {
            printf('<option value="%1$s" %2$s>%3$s</option>', $value, selected($selected, $value, false), $title);
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
        do_action_layoutbridge_adapter('elementor/template-library/create_new_dialog_fields');
        ?>

					<div id="drupal_layoutbuilder-new-template__form__post-title__wrapper" class="drupal_layoutbuilder-form-field">
						<label for="drupal_layoutbuilder-new-template__form__post-title" class="drupal_layoutbuilder-form-field__label">
							<?php echo ___layoutbridge_adapter('Name your template', 'elementor'); ?>
						</label>
						<div class="drupal_layoutbuilder-form-field__text__wrapper">
							<input type="text" placeholder="<?php echo esc_attr___layoutbridge_adapter('Enter template name (optional)', 'elementor'); ?>" id="drupal_layoutbuilder-new-template__form__post-title" class="drupal_layoutbuilder-form-field__text" name="post_data[post_title]">
						</div>
					</div>
					<button id="drupal_layoutbuilder-new-template__form__submit" class="drupal_layoutbuilder-button drupal_layoutbuilder-button-success"><?php echo ___layoutbridge_adapter('Create Template', 'elementor'); ?></button>
				</form>
			</div>
		</div>
		<?php

    }

    /**
     * Register local template data.
     *
     * Used to register custom template data like a post type, a taxonomy or any
     * other data.
     *
     * The local template class registers a new `elementor_library` post type
     * and an `elementor_library_type` taxonomy. They are used to store data for
     * local templates saved by the user on his site.
     *
     * @since 1.0.0
     * @access public
     */
    public function register_data()
    {
        $labels = [
            'name' => _x_layoutbridge_adapter('My Templates', 'Template Library', 'elementor'),
            'singular_name' => _x_layoutbridge_adapter('Template', 'Template Library', 'elementor'),
            'add_new' => _x_layoutbridge_adapter('Add New', 'Template Library', 'elementor'),
            'add_new_item' => _x_layoutbridge_adapter('Add New Template', 'Template Library', 'elementor'),
            'edit_item' => _x_layoutbridge_adapter('Edit Template', 'Template Library', 'elementor'),
            'new_item' => _x_layoutbridge_adapter('New Template', 'Template Library', 'elementor'),
            'all_items' => _x_layoutbridge_adapter('All Templates', 'Template Library', 'elementor'),
            'view_item' => _x_layoutbridge_adapter('View Template', 'Template Library', 'elementor'),
            'search_items' => _x_layoutbridge_adapter('Search Template', 'Template Library', 'elementor'),
            'not_found' => _x_layoutbridge_adapter('No Templates found', 'Template Library', 'elementor'),
            'not_found_in_trash' => _x_layoutbridge_adapter('No Templates found in Trash', 'Template Library', 'elementor'),
            'parent_item_colon' => '',
            'menu_name' => _x_layoutbridge_adapter('My Templates', 'Template Library', 'elementor'),
        ];

        $args = [
            'labels' => $labels,
            'public' => true,
            'rewrite' => false,
            'show_ui' => true,
            'show_in_menu' => false,
            'show_in_nav_menus' => false,
            'exclude_from_search' => true,
            'capability_type' => 'post',
            'hierarchical' => false,
            'supports' => ['title', 'thumbnail', 'author', 'elementor'],
        ];

        /**
         * Register template library post type args.
         *
         * Filters the post type arguments when registering elementor template library post type.
         *
         * @since 1.0.0
         *
         * @param array $args Arguments for registering a post type.
         */
        $args = apply_filters_layoutbridge_adapter('elementor/template_library/sources/local/register_post_type_args', $args);

        $this->post_type_object = register_post_type_layoutbridge_adapter(self::CPT, $args);

        $args = [
            'hierarchical' => false,
            'show_ui' => false,
            'show_in_nav_menus' => false,
            'show_admin_column' => true,
            'query_var' => is_admin_layoutbridge_adapter(),
            'rewrite' => false,
            'public' => false,
            'label' => _x_layoutbridge_adapter('Type', 'Template Library', 'elementor'),
        ];

        /**
         * Register template library taxonomy args.
         *
         * Filters the taxonomy arguments when registering elementor template library taxonomy.
         *
         * @since 1.0.0
         *
         * @param array $args Arguments for registering a taxonomy.
         */
        $args = apply_filters_layoutbridge_adapter('elementor/template_library/sources/local/register_taxonomy_args', $args);

        register_taxonomy_layoutbridge_adapter(self::TAXONOMY_TYPE_SLUG, self::CPT, $args);
    }

    /**
     * Register admin menu.
     *
     * Add a top-level menu page for Elementor Template Library.
     *
     * Fired by `admin_menu` action.
     *
     * @since 1.0.0
     * @access public
     */
    public function register_admin_menu()
    {
        if (current_user_can('manage_options')) {
            add_submenu_page_layoutbridge_adapter(
                Settings::PAGE_ID,
                _x_layoutbridge_adapter('My Templates', 'Template Library', 'elementor'),
                _x_layoutbridge_adapter('My Templates', 'Template Library', 'elementor'),
                Editor::EDITING_CAPABILITY,
                'edit.php?post_type=' . self::CPT
            );
        } else {
            add_menu_page_layoutbridge_adapter(
                ___layoutbridge_adapter('Elementor', 'elementor'),
                ___layoutbridge_adapter('Elementor', 'elementor'),
                Editor::EDITING_CAPABILITY,
                'edit.php?post_type=' . self::CPT,
                '',
                '',
                99
            );
        }
    }

    /**
     * Get local templates.
     *
     * Retrieve local templates saved by the user on his site.
     *
     * @since 1.0.0
     * @access public
     *
     * @param array $args Optional. Filter templates list based on a set of
     *                    arguments. Default is an empty array.
     *
     * @return array Local templates.
     */
    public function get_items($args = [])
    {
        $templates = [];
        $result = DrupalLayoutbuilderPlugin::$instance->sdk->get_local_templates_ids($this->get_id());

        foreach ($result as $item) {
            $templates[] = $this->get_item($item->id);
        }

        return $templates;
    }

    /**
     * Save local template.
     *
     * Save new or update existing template on the database.
     *
     * @since 1.0.0
     * @access public
     *
     * @param array $template_data Local template data.
     */
    public function save_item($template_data)
    {
        $template_id = DrupalLayoutbuilderPlugin::$instance->sdk->save_local_template($this->get_id(), $template_data);

        do_action_layoutbridge_adapter('elementor/template-library/after_save_template', $template_id, $template_data);

        do_action_layoutbridge_adapter('elementor/template-library/after_update_template', $template_id, $template_data);

        return $template_id;
    }

    /**
     * Update local template.
     *
     * Update template on the database.
     *
     * @since 1.0.0
     * @access public
     *
     * @param array $new_data New template data.
     *
     * @return \WP_Error|true True if template updated, `WP_Error` otherwise.
     */
    public function update_item($new_data)
    {
        if (!current_user_can($this->post_type_object->cap->edit_post, $new_data['id'])) {
            return new \WP_Error('save_error', ___layoutbridge_adapter('Access denied.', 'elementor'));
        }

        Plugin::$instance->db->save_editor($new_data['id'], $new_data['content']);

        do_action_layoutbridge_adapter('elementor/template-library/after_update_template', $new_data['id'], $new_data);

        return true;
    }

    /**
     * Get local template.
     *
     * Retrieve a single local template saved by the user on his site.
     *
     * @since 1.0.0
     * @access public
     *
     * @param int $template_id The template ID.
     *
     * @return array Local template.
     */
    public function get_item($template_id)
    {
      $result = DrupalLayoutbuilderPlugin::$instance->sdk->get_local_template($template_id);
      $data = [
          'template_id' => $template_id,
          'source' => $this->get_id(),
          'type' => 'elementor_library',
          'title' => $result->name,
          'thumbnail' => '', //get_the_post_thumbnail_url( $post ),
          'date' => date('M j @ H:i', $result->timestamp),
          'human_date' => human_time_diff_layoutbridge_adapter($result->timestamp),
          'author' => $result->author, //$user->display_name,
          'hasPageSettings' => false,
          'tags' => [],
          'export_link' => $this->get_export_link( $template_id ),
          'url' => '/node/'.$result->nid.'/drupal-layoutbuilder',
      ];
      $data = apply_filters_layoutbridge_adapter('elementor/template-library/get_template', $data);
      return $data;
    }

    /**
     * Get template data.
     *
     * Retrieve the data of a single local template saved by the user on his site.
     *
     * @since 1.5.0
     * @access public
     *
     * @param array $args Custom template arguments.
     *
     * @return array Local template data.
     */
    public function get_data(array $args)
    {
        $result = DrupalLayoutbuilderPlugin::$instance->sdk->get_local_template($args['template_id']);

        if (!empty($result)) {
            $content = $this->replace_elements_ids($result->data);
        }

        $data = [
            'content' => $content,
        ];

        if (!empty($args['page_settings'])) {
            $data['page_settings'] = []; //$page->get_data( 'settings' );
        }

        return $data;
    }

    /**
     * Delete local template.
     *
     * Delete template from the database.
     *
     * @since 1.0.0
     * @access public
     *
     * @param int $template_id The template ID.
     */
    public function delete_template($template_id)
    {
        $result = DrupalLayoutbuilderPlugin::$instance->sdk->delete_local_template($template_id);
        return wp_send_json_success_layoutbridge_adapter();
    }

    /**
     * Export local template.
     *
     * Export template to a file.
     *
     * @since 1.0.0
     * @access public
     *
     * @param int $template_id The template ID.
     */
    public function export_template($template_id)
    {
        $file_data = $this->prepare_template_export($template_id);

        if (is_wp_error_layoutbridge_adapter($file_data)) {
            return $file_data;
        }

        $this->send_file_headers($file_data['name'], strlen($file_data['content']));

        // Clear buffering just in case.
        @ob_end_clean();

        flush();

        // Output file contents.
        echo $file_data['content'];

        die;
    }

    /**
     * Export multiple local templates.
     *
     * Export multiple template to a ZIP file.
     *
     * @since 1.6.0
     * @access public
     *
     * @param array $template_ids An array of template IDs.
     *
     * @return \WP_Error Drupal error if export failed.
     */
    public function export_multiple_templates(array $template_ids)
    {
        $files = [];

        $wp_upload_dir = wp_upload_dir_layoutbridge_adapter();

        $temp_path = $wp_upload_dir['basedir'] . '/' . self::TEMP_FILES_DIR;

        // Create temp path if it doesn't exist
        wp_mkdir_p_layoutbridge_adapter($temp_path);

        // Create all json files
        foreach ($template_ids as $template_id) {
            $file_data = $this->prepare_template_export($template_id);

            if (is_wp_error_layoutbridge_adapter($file_data)) {
                continue;
            }

            $complete_path = $temp_path . '/' . $file_data['name'];

            $put_contents = file_put_contents($complete_path, $file_data['content']);

            if (!$put_contents) {
                return new \WP_Error('404', sprintf('Cannot create file "%s".', $file_data['name']));
            }

            $files[] = [
                'path' => $complete_path,
                'name' => $file_data['name'],
            ];
        }

        // Create temporary .zip file
        $zip_archive_filename = 'drupal_layoutbuilder-templates-' . date('Y-m-d') . '.zip';

        $zip_archive = new \ZipArchive();

        $zip_complete_path = $temp_path . '/' . $zip_archive_filename;

        $zip_archive->open($zip_complete_path, \ZipArchive::CREATE);

        foreach ($files as $file) {
            $zip_archive->addFile($file['path'], $file['name']);
        }

        $zip_archive->close();

        foreach ($files as $file) {
            unlink($file['path']);
        }

        $this->send_file_headers($zip_archive_filename, filesize($zip_complete_path));

        @ob_end_flush();

        @readfile($zip_complete_path);

        unlink($zip_complete_path);

        die;
    }

    /**
     * Import local template.
     *
     * Import template from a file.
     *
     * @since 1.0.0
     * @access public
     *
     * @param string $name - The file name
     * @param string $path - The file path
     *
     * @return \WP_Error|array An array of items on success, 'WP_Error' on failure.
     */
    public function import_template($name, $path)
    {
        if (empty($path)) {
            return new \WP_Error('file_error', 'Please upload a file to import.');
        }

        $items = [];

        $file_extension = pathinfo($name, PATHINFO_EXTENSION);

        if ('zip' === $file_extension) {
            if (!class_exists('\ZipArchive')) {
                return new \WP_Error('zip_error', 'PHP Zip extension not loaded.');
            }

            $zip = new \ZipArchive();

            $wp_upload_dir = wp_upload_dir_layoutbridge_adapter();

            $temp_path = $wp_upload_dir['basedir'] . '/' . self::TEMP_FILES_DIR . '/' . uniqid();

            $zip->open($path);

            $zip->extractTo($temp_path);

            $zip->close();

            $file_names = array_diff(scandir($temp_path), ['.', '..']);

            foreach ($file_names as $file_name) {
                $full_file_name = $temp_path . '/' . $file_name;

                $items[] = $this->import_single_template($full_file_name);

                unlink($full_file_name);
            }

            rmdir($temp_path);
        } else {
            $items[] = $this->import_single_template($path);
        }

        return $items;
    }

    /**
     * Post row actions.
     *
     * Add an export link to the template library action links table list.
     *
     * Fired by `post_row_actions` filter.
     *
     * @since 1.0.0
     * @access public
     *
     * @param array    $actions An array of row action links.
     * @param \WP_Post $post    The post object.
     *
     * @return array An updated array of row action links.
     */
    public function post_row_actions($actions, \WP_Post $post)
    {
        if (self::is_base_templates_screen()) {
            if ($this->is_template_supports_export($post->ID)) {
                $actions['export-template'] = sprintf('<a href="%1$s">%2$s</a>', $this->get_export_link($post->ID), ___layoutbridge_adapter('Export Template', 'elementor'));
            }

            unset($actions['inline hide-if-no-js']);
        }

        return $actions;
    }

    /**
     * Admin import template form.
     *
     * The import form displayed in "My Library" screen in Drupal dashboard.
     *
     * The form allows the user to import template in json/zip format to the site.
     *
     * Fired by `admin_footer` action.
     *
     * @since 1.0.0
     * @access public
     */
    public function admin_import_template_form()
    {
        if (!self::is_base_templates_screen()) {
            return;
        }
        ?>
		<div id="drupal_layoutbuilder-hidden-area">
			<a id="drupal_layoutbuilder-import-template-trigger" class="page-title-action"><?php echo ___layoutbridge_adapter('Import Templates', 'elementor'); ?></a>
			<div id="drupal_layoutbuilder-import-template-area">
				<div id="drupal_layoutbuilder-import-template-title"><?php echo ___layoutbridge_adapter('Choose an Elementor template JSON file or a .zip archive of Elementor templates, and add them to the list of templates available in your library.', 'elementor'); ?></div>
				<form id="drupal_layoutbuilder-import-template-form" method="post" action="<?php echo admin_url_layoutbridge_adapter('admin-ajax.php'); ?>" enctype="multipart/form-data">
					<input type="hidden" name="action" value="elementor_import_template">
					<input type="hidden" name="_nonce" value="<?php echo Plugin::$instance->editor->create_nonce(self::CPT); ?>">
					<fieldset id="drupal_layoutbuilder-import-template-form-inputs">
						<input type="file" name="file" accept=".json,application/json,.zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed" required>
						<input type="submit" class="button" value="<?php echo esc_attr___layoutbridge_adapter('Import Now', 'elementor'); ?>">
					</fieldset>
				</form>
			</div>
		</div>
		<?php
}

    /**
     * Block template frontend
     *
     * Don't display the single view of the template library post type in the
     * frontend, for users that don't have the proper permissions.
     *
     * Fired by `template_redirect` action.
     *
     * @since 1.0.0
     * @access public
     */
    public function block_template_frontend()
    {
        if (is_singular_layoutbridge_adapter(self::CPT) && !current_user_can('edit_posts')) {
            wp_redirect_layoutbridge_adapter(site_url(), 301);
            die;
        }
    }

    /**
     * Is template library supports export.
     *
     * whether the template library supports export.
     *
     * Template saved by the user locally on his site, support export by default
     * but this can be changed using a filter.
     *
     * @since 1.0.0
     * @access public
     *
     * @param int $template_id The template ID.
     *
     * @return bool Whether the template library supports export.
     */
    public function is_template_supports_export($template_id)
    {
        $export_support = true;

        /**
         * Is template library supports export.
         *
         * Filters whether the template library supports export.
         *
         * @since 1.0.0
         *
         * @param bool $export_support Whether the template library supports export.
         *                             Default is true.
         * @param int  $template_id    Post ID.
         */
        $export_support = apply_filters_layoutbridge_adapter('elementor/template_library/is_template_supports_export', $export_support, $template_id);

        return $export_support;
    }

    /**
     * Remove Elementor post state.
     *
     * Remove the 'elementor' post state from the display states of the post.
     *
     * Used to remove the 'elementor' post state from the template library items.
     *
     * Fired by `display_post_states` filter.
     *
     * @since 1.8.0
     * @access public
     *
     * @param array    $post_states An array of post display states.
     * @param \WP_Post $post        The current post object.
     *
     * @return array Updated array of post display states.
     */
    public function remove_elementor_post_state_from_library($post_states, $post)
    {
        if (self::CPT === $post->post_type && isset($post_states['elementor'])) {
            unset($post_states['elementor']);
        }
        return $post_states;
    }

    /**
     * Get template export link.
     *
     * Retrieve the link used to export a single template based on the template
     * ID.
     *
     * @since 2.0.0
     * @access private
     *
     * @param int $template_id The template ID.
     *
     * @return string Template export URL.
     */
    private function get_export_link($template_id)
    {
        return add_query_arg_layoutbridge_adapter(
            [
                'action' => 'elementor_export_template',
                'source' => $this->get_id(),
                // '_nonce' => Plugin::$instance->editor->create_nonce(self::CPT),
                'template_id' => $template_id,
            ],
            base_path() . 'drupal-layoutbuilder/update'
        );
    }

    /**
     * On template save.
     *
     * Run this method when template is being saved.
     *
     * Fired by `save_post` action.
     *
     * @since 1.0.1
     * @access public
     *
     * @param int      $post_id Post ID.
     * @param \WP_Post $post    The current post object.
     */
    public function on_save_post($post_id, \WP_Post $post)
    {
        if (self::CPT !== $post->post_type) {
            return;
        }

        if (self::get_template_type($post_id)) { // It's already with a type
            return;
        }

        // Don't save type on import, the importer will do it.
        if (did_action_layoutbridge_adapter('import_start')) {
            return;
        }

        $this->save_item_type($post_id, 'page');
    }

    /**
     * Save item type.
     *
     * When saving/updating templates, this method is used to update the post
     * meta data and the taxonomy.
     *
     * @since 1.0.1
     * @access private
     *
     * @param int    $post_id Post ID.
     * @param string $type    Item type.
     */
    private function save_item_type($post_id, $type)
    {
        update_post_meta_layoutbridge_adapter($post_id, self::TYPE_META_KEY, $type);

        wp_set_object_terms($post_id, $type, self::TAXONOMY_TYPE_SLUG);
    }

    /**
     * Filter template types in admin query.
     *
     * Update the template types in the main admin query.
     *
     * Fired by `parse_query` action.
     *
     * @since 1.0.6
     * @access public
     *
     * @param \WP_Query $query The `WP_Query` instance.
     */
    public function admin_query_filter_types(\WP_Query $query)
    {
        if (!function_exists('get_current_screen')) {
            return;
        }

        $library_screen_id = 'edit-' . self::CPT;
        $current_screen = get_current_screen();

        if (!isset($current_screen->id) || $library_screen_id !== $current_screen->id || !empty($query->query_vars['meta_key'])) {
            return;
        }

        $query->query_vars['meta_key'] = self::TYPE_META_KEY;
        $query->query_vars['meta_value'] = array_values(self::$_template_types);
    }

    /**
     * Bulk export action.
     *
     * Adds an 'Export' action to the Bulk Actions drop-down in the template
     * library.
     *
     * Fired by `bulk_actions-edit-elementor_library` filter.
     *
     * @since 1.6.0
     * @access public
     *
     * @param array $actions An array of the available bulk actions.
     *
     * @return array An array of the available bulk actions.
     */
    public function admin_add_bulk_export_action($actions)
    {
        $actions[self::BULK_EXPORT_ACTION] = ___layoutbridge_adapter('Export', 'elementor');

        return $actions;
    }

    /**
     * Add bulk export action.
     *
     * Handles the template library bulk export action.
     *
     * Fired by `handle_bulk_actions-edit-elementor_library` filter.
     *
     * @since 1.6.0
     * @access public
     *
     * @param string $redirect_to The redirect URL.
     * @param string $action      The action being taken.
     * @param array  $post_ids    The items to take the action on.
     *
     * @return string The redirect URL.
     */
    public function admin_export_multiple_templates($redirect_to, $action, $post_ids)
    {
        if (self::BULK_EXPORT_ACTION === $action) {
            $this->export_multiple_templates($post_ids);
        }

        return $redirect_to;
    }

    /**
     * Print admin tabs.
     *
     * Used to output the template library tabs with their labels.
     *
     * Fired by `views_edit-elementor_library` filter.
     *
     * @since 2.0.0
     * @access public
     *
     * @param array $views An array of available list table views.
     *
     * @return array An updated array of available list table views.
     */
    public function admin_print_tabs($views)
    {
        $current_type = '';
        $active_class = ' nav-tab-active';
        if (!empty($_REQUEST[self::TAXONOMY_TYPE_SLUG])) {
            $current_type = $_REQUEST[self::TAXONOMY_TYPE_SLUG];
            $active_class = '';
        }

        $baseurl = admin_url_layoutbridge_adapter('edit.php?post_type=' . self::CPT);
        ?>
		<div id="drupal_layoutbuilder-template-library-tabs-wrapper" class="nav-tab-wrapper">
			<a class="nav-tab<?php echo $active_class; ?>" href="<?php echo $baseurl; ?>"><?php echo ___layoutbridge_adapter('All', 'elementor'); ?></a>
			<?php
foreach (self::$_template_types as $template_type):
            $active_class = '';

            if ($current_type === $template_type) {
                $active_class = ' nav-tab-active';
            }

            $type_url = add_query_arg_layoutbridge_adapter(self::TAXONOMY_TYPE_SLUG, $template_type, $baseurl);
            $type_label = $this->get_template_label_by_type($template_type);

            echo "<a class='nav-tab{$active_class}' href='{$type_url}'>{$type_label}</a>";
        endforeach;
        ?>
		</div>
		<?php
return $views;
    }

    /**
     * Maybe render blank state.
     *
     * When the template library has no saved templates, display a blank admin page offering
     * to create the very first template.
     *
     * Fired by `manage_posts_extra_tablenav` action.
     *
     * @since 2.0.0
     * @access public
     *
     * @param string $which The location of the extra table nav markup: 'top' or 'bottom'.
     */
    public function maybe_render_blank_state($which)
    {
        global $post_type;

        if (self::CPT !== $post_type || 'bottom' !== $which) {
            return;
        }

        global $wp_list_table;

        $total_items = $wp_list_table->get_pagination_arg('total_items');

        if (!empty($total_items) || !empty($_REQUEST['s'])) {
            return;
        }

        $inline_style = '#posts-filter .wp-list-table, #posts-filter .tablenav.top, .tablenav.bottom .actions, .wrap .subsubsub { display:none;}';

        $current_type = get_query_var('elementor_library_type');

        // TODO: Better way to exclude widget type.
        if ('widget' === $current_type) {
            return;
        }

        if (empty($current_type)) {
            $counts = (array) wp_count_posts(self::CPT);
            unset($counts['auto-draft']);
            $count = array_sum($counts);

            if (0 < $count) {
                return;
            }

            $current_type = 'template';

            $inline_style .= '#drupal_layoutbuilder-template-library-tabs-wrapper {display: none;}';
        }

        $current_type_label = $this->get_template_label_by_type($current_type);
        ?>
		<style type="text/css"><?php echo $inline_style; ?></style>
		<div class="drupal_layoutbuilder-template_library-blank_state">
			<div class="drupal_layoutbuilder-blank_state">
				<i class="eicon-folder"></i>
				<h2>
					<?php
/* translators: %s: Template type label. */
        printf(___layoutbridge_adapter('Create Your First %s', 'elementor'), $current_type_label);
        ?>
				</h2>
				<p><?php echo ___layoutbridge_adapter('Add templates and reuse them across your website. Easily export and import them to any other project, for an optimized workflow.', 'elementor'); ?></p>
				<a id="drupal_layoutbuilder-template-library-add-new" class="drupal_layoutbuilder-button drupal_layoutbuilder-button-success" href="<?php esc_url_layoutbridge_adapter(Utils::get_pro_link('https://elementor.com/pro/?utm_source=wp-custom-fonts&utm_campaign=gopro&utm_medium=wp-dash'));?>">
					<?php
/* translators: %s: Template type label. */
        printf(___layoutbridge_adapter('Add New %s', 'elementor'), $current_type_label);
        ?>
				</a>
			</div>
		</div>
		<?php
}

    /**
     * Import single template.
     *
     * Import template from a file to the database.
     *
     * @since 1.6.0
     * @access private
     *
     * @param string $file_name File name.
     *
     * @return \WP_Error|int|array Local template array, or template ID, or
     *                             `WP_Error`.
     */
    private function import_single_template($file_name)
    {
        $data = json_decode(file_get_contents($file_name), true);

        if (empty($data)) {
            return new \WP_Error('file_error', 'Invalid File.');
        }

        $content = $data['content'];

        if (!is_array($content)) {
            return new \WP_Error('file_error', 'Invalid File.');
        }

        $content = $this->process_export_import_content($content, 'on_import');

        $page_settings = [];

        if (!empty($data['page_settings'])) {
            $page = new Model([
                'id' => 0,
                'settings' => $data['page_settings'],
            ]);

            $page_settings_data = $this->process_element_export_import_content($page, 'on_import');

            if (!empty($page_settings_data['settings'])) {
                $page_settings = $page_settings_data['settings'];
            }
        }

        $template_id = $this->save_item([
            'content' => $content,
            'title' => $data['title'],
            'type' => $data['type'],
            'page_settings' => $page_settings,
        ]);

        if (is_wp_error_layoutbridge_adapter($template_id)) {
            return $template_id;
        }

        return $this->get_item($template_id);
    }

    /**
     * Prepare template to export.
     *
     * Retrieve the relevant template data and return them as an array.
     *
     * @since 1.6.0
     * @access private
     *
     * @param int $template_id The template ID.
     *
     * @return \WP_Error|array Exported template data.
     */
    private function prepare_template_export($template_id)
    {
        $template_data = $this->get_data([
            'template_id' => $template_id,
        ]);

        if (empty($template_data['content'])) {
            return new \WP_Error('404', 'The template does not exist.');
        }

        $template_data['content'] = $this->process_export_import_content($template_data['content'], 'on_export');

        /* if (get_post_meta_layoutbridge_adapter($template_id, '_elementor_page_settings', true)) {
            $page = SettingsManager::get_settings_managers('page')->get_model($template_id);

            $page_settings_data = $this->process_element_export_import_content($page, 'on_export');

            if (!empty($page_settings_data['settings'])) {
                $template_data['page_settings'] = $page_settings_data['settings'];
            }
        } */

        $result = DrupalLayoutbuilderPlugin::$instance->sdk->get_local_template($template_id);

        $export_data = [
            'version' => DB::DB_VERSION,
            'title' => $result->name,
            'type' => $result->type,
        ];

        $export_data += $template_data;

        return [
            'name' => 'drupal_layoutbuilder-' . $template_id . '-' . date('Y-m-d') . '.json',
            'content' => wp_json_encode_layoutbridge_adapter($export_data),
        ];
    }

    /**
     * Send file headers.
     *
     * Set the file header when export template data to a file.
     *
     * @since 1.6.0
     * @access private
     *
     * @param string $file_name File name.
     * @param int    $file_size File size.
     */
    private function send_file_headers($file_name, $file_size)
    {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=' . $file_name);
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . $file_size);
    }

    /**
     * Get template label by type.
     *
     * Retrieve the template label for any given template type.
     *
     * @since 2.0.0
     * @access private
     *
     * @param string $template_type Template type.
     *
     * @return string Template label.
     */
    private function get_template_label_by_type($template_type)
    {
        $document_types = Plugin::instance()->documents->get_document_types();

        if (isset($document_types[$template_type])) {
            $template_label = call_user_func([$document_types[$template_type], 'get_title']);
        } else {
            $template_label = ucwords(str_replace(['_', '-'], ' ', $template_type));
        }

        if ('page' === $template_type) {
            $template_label = ___layoutbridge_adapter('Content', 'elementor');
        }

        /**
         * Template label by template type.
         *
         * Filters the template label by template type in the template library .
         *
         * @since 2.0.0
         *
         * @param string $template_label Template label.
         * @param string $template_type  Template type.
         */
        $template_label = apply_filters_layoutbridge_adapter('elementor/template-library/get_template_label_by_type', $template_label, $template_type);

        return $template_label;
    }

    /**
     * Add template library actions.
     *
     * Register filters and actions for the template library.
     *
     * @since 2.0.0
     * @access private
     */
    private function add_actions()
    {
        if (is_admin_layoutbridge_adapter()) {
            add_action_layoutbridge_adapter('admin_menu', [$this, 'register_admin_menu'], 50);
            add_action_layoutbridge_adapter('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 11);
            add_filter_layoutbridge_adapter('post_row_actions', [$this, 'post_row_actions'], 10, 2);
            add_action_layoutbridge_adapter('admin_footer', [$this, 'admin_import_template_form']);
            add_action_layoutbridge_adapter('save_post', [$this, 'on_save_post'], 10, 2);
            add_action_layoutbridge_adapter('parse_query', [$this, 'admin_query_filter_types']);
            add_filter_layoutbridge_adapter('display_post_states', [$this, 'remove_elementor_post_state_from_library'], 11, 2);

            // Template type column.
            add_action_layoutbridge_adapter('manage_' . self::CPT . '_posts_columns', [$this, 'admin_columns_headers']);
            add_action_layoutbridge_adapter('manage_' . self::CPT . '_posts_custom_column', [$this, 'admin_columns_content'], 10, 2);

            // Template library bulk actions.
            add_filter_layoutbridge_adapter('bulk_actions-edit-elementor_library', [$this, 'admin_add_bulk_export_action']);
            add_filter_layoutbridge_adapter('handle_bulk_actions-edit-elementor_library', [$this, 'admin_export_multiple_templates'], 10, 3);

            // Print template library tabs.
            add_filter_layoutbridge_adapter('views_edit-' . self::CPT, [$this, 'admin_print_tabs']);

            // Show blank state.
            add_action_layoutbridge_adapter('manage_posts_extra_tablenav', [$this, 'maybe_render_blank_state']);
        }

        add_action_layoutbridge_adapter('template_redirect', [$this, 'block_template_frontend']);
    }

    public function admin_columns_content($column_name, $post_id)
    {
        if ('elementor_library_type' === $column_name) {
            /** @var Document $document */
            $document = Plugin::$instance->documents->get($post_id);

            if ($document) {
                $admin_filter_url = admin_url_layoutbridge_adapter('/edit.php?post_type=elementor_library&elementor_library_type=' . $document->get_name());
                printf('<a href="%s">%s</a>', $admin_filter_url, $document->get_title());
            }
        }
    }

    public function admin_columns_headers($posts_columns)
    {
        // Replace original column that bind to the taxonomy - with another column.
        unset($posts_columns['taxonomy-elementor_library_type']);

        $offset = 2;

        $posts_columns = array_slice($posts_columns, 0, $offset, true) + [
            'elementor_library_type' => ___layoutbridge_adapter('Type', 'elementor'),
        ] + array_slice($posts_columns, $offset, null, true);

        return $posts_columns;
    }

    /**
     * Template library local source constructor.
     *
     * Initializing the template library local source base by registering custom
     * template data and running custom actions.
     *
     * @since 1.0.0
     * @access public
     */
    public function __construct()
    {
        parent::__construct();

        $this->add_actions();
    }
}
