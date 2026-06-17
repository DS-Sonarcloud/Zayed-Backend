<?php

/**
 * @file
 * Contains \Drupal\drupal_layoutbuilder\Drupal_Revisions_Manager.
 */

namespace Drupal\drupal_layoutbuilder;

use DrupalLayoutbuilder\Core\Settings\Manager;
use DrupalLayoutbuilder\Modules\History\Revisions_Manager;
use DrupalLayoutbuilder\Utils;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class Drupal_Revisions_Manager extends Revisions_Manager
{

    public function __construct()
    {
        self::register_actions();
    }

    public static function get_revisions($id = 1, $query_args = [], $parse_result = true)
    {
        $result = DrupalLayoutbuilderPlugin::$instance->sdk->get_revisions($id);
        $revisions = [];

        foreach ($result as $revision) {
            date_default_timezone_set('UTC');
            $date = date('M j @ H:i', $revision->timestamp);
            $human_time = human_time_diff_layoutbridge_adapter($revision->timestamp);

            $type = 'revision';

            $revisions[] = [
                'id' => $revision->id,
                'author' => $revision->author,
                'timestamp' => strtotime($date),
                'date' => sprintf(
                    ___layoutbridge_adapter('%1$s ago (%2$s)', 'elementor'),
                    $human_time,
                    $date
                ),
                'type' => $type,
                'gravatar' => null,
            ];
        }

        return $revisions;
    }

    public static function get_revisions_ids($id = 1, $query_args = [], $parse_result = true)
    {
        $revisions = DrupalLayoutbuilderPlugin::$instance->sdk->get_revisions_ids($id);
        return $revisions;
    }

    public static function on_revision_data_request()
    {
        $revision_data = DrupalLayoutbuilderPlugin::$instance->sdk->get_revision_data($_POST['id']);
        return wp_send_json_success_layoutbridge_adapter($revision_data);
    }

    public static function on_delete_revision_request()
    {
        $result = DrupalLayoutbuilderPlugin::$instance->sdk->delete_revision($_POST['id']);
        return wp_send_json_success_layoutbridge_adapter();
    }

    public static function on_ajax_save_builder_data($return_data, $document)
    {
        $id = $_POST['editor_post_id'];

        $latest_revisions = self::get_revisions($id);

        $all_revision_ids = self::get_revisions_ids($id);

        // Send revisions data only if has revisions.
        if (!empty($latest_revisions)) {
            $current_revision_id = $id;

            $return_data = array_replace_recursive($return_data, [
                'config' => [
                    'current_revision_id' => $current_revision_id,
                ],
                'latest_revisions' => $latest_revisions,
                'revisions_ids' => $all_revision_ids,
            ]);
        }

        return $return_data;
    }

    public static function db_before_save($status, $has_changes)
    {

    }

    public static function editor_settings($settings, $id)
    {
        $settings = array_replace_recursive($settings, [
            'revisions' => self::get_revisions(),
            'revisions_enabled' => true,
            'current_revision_id' => $id,
            'i18n' => [
				'edit_draft' => ___layoutbridge_adapter( 'Edit Draft', 'elementor' ),
				'edit_published' => ___layoutbridge_adapter( 'Edit Published', 'elementor' ),
				'no_revisions_1' => ___layoutbridge_adapter( 'Revision history lets you save your previous versions of your work, and restore them any time.', 'elementor' ),
				'no_revisions_2' => ___layoutbridge_adapter( 'Start designing your page and you\'ll be able to see the entire revision history here.', 'elementor' ),
				'current' => ___layoutbridge_adapter( 'Current Version', 'elementor' ),
				'restore' => ___layoutbridge_adapter( 'Restore', 'elementor' ),
				'restore_auto_saved_data' => ___layoutbridge_adapter( 'Restore Auto Saved Data', 'elementor' ),
				'restore_auto_saved_data_message' => ___layoutbridge_adapter( 'There is an autosave of this post that is more recent than the version below. You can restore the saved data fron the Revisions panel', 'elementor' ),
				'revision' => ___layoutbridge_adapter( 'Revision', 'elementor' ),
				'revision_history' => ___layoutbridge_adapter( 'Revision History', 'elementor' ),
				'revisions_disabled_1' => ___layoutbridge_adapter( 'It looks like the post revision feature is unavailable in your website.', 'elementor' ),
				'revisions_disabled_2' => sprintf(
					/* translators: %s: Codex URL */
					___layoutbridge_adapter( 'Learn more about <a target="_blank" href="%s">WordPress revisions</a>', 'elementor' ),
					'https://codex.wordpress.org/Revisions#Revision_Options'
				),
				'elementor' => ___layoutbridge_adapter( 'Elementor', 'elementor' ),
				'delete' => ___layoutbridge_adapter( 'Delete', 'elementor' ),
				'cancel' => ___layoutbridge_adapter( 'Cancel', 'elementor' ),
				/* translators: %s: Element name. */
				'edit_element' => ___layoutbridge_adapter( 'Edit %s', 'elementor' ),

				// Menu.
				'about_elementor' => ___layoutbridge_adapter( 'About Elementor', 'elementor' ),
				'color_picker' => ___layoutbridge_adapter( 'Color Picker', 'elementor' ),
				'elementor_settings' => ___layoutbridge_adapter( 'Dashboard Settings', 'elementor' ),
				'global_colors' => ___layoutbridge_adapter( 'Default Colors', 'elementor' ),
				'global_fonts' => ___layoutbridge_adapter( 'Default Fonts', 'elementor' ),
				'global_style' => ___layoutbridge_adapter( 'Style', 'elementor' ),
				'settings' => ___layoutbridge_adapter( 'Settings', 'elementor' ),

				// Elements.
				'inner_section' => ___layoutbridge_adapter( 'Inner Section', 'elementor' ),

				// Control Order.
				'asc' => ___layoutbridge_adapter( 'Ascending order', 'elementor' ),
				'desc' => ___layoutbridge_adapter( 'Descending order', 'elementor' ),

				// Clear Page.
				'clear_page' => ___layoutbridge_adapter( 'Delete All Content', 'elementor' ),
				'dialog_confirm_clear_page' => ___layoutbridge_adapter( 'Attention: We are going to DELETE ALL CONTENT from this page. Are you sure you want to do that?', 'elementor' ),

				// Panel Preview Mode.
				'back_to_editor' => ___layoutbridge_adapter( 'Show Panel', 'elementor' ),
				'preview' => ___layoutbridge_adapter( 'Hide Panel', 'elementor' ),

				// Inline Editing.
				'type_here' => ___layoutbridge_adapter( 'Type Here', 'elementor' ),

				// Library.
				'an_error_occurred' => ___layoutbridge_adapter( 'An error occurred', 'elementor' ),
				'category' => ___layoutbridge_adapter( 'Category', 'elementor' ),
				'delete_template' => ___layoutbridge_adapter( 'Delete Template', 'elementor' ),
				'delete_template_confirm' => ___layoutbridge_adapter( 'Are you sure you want to delete this template?', 'elementor' ),
				'import_template_dialog_header' => ___layoutbridge_adapter( 'Import Document Settings', 'elementor' ),
				'import_template_dialog_message' => ___layoutbridge_adapter( 'Do you want to also import the document settings of the template?', 'elementor' ),
				'import_template_dialog_message_attention' => ___layoutbridge_adapter( 'Attention: Importing may override previous settings.', 'elementor' ),
				'library' => ___layoutbridge_adapter( 'Library', 'elementor' ),
				'no' => ___layoutbridge_adapter( 'No', 'elementor' ),
				'page' => ___layoutbridge_adapter( 'Page', 'elementor' ),
				/* translators: %s: Template type. */
				'save_your_template' => ___layoutbridge_adapter( 'Save Your %s to Library', 'elementor' ),
				'save_your_template_description' => ___layoutbridge_adapter( 'Your designs will be available for export and reuse on any page or website', 'elementor' ),
				'section' => ___layoutbridge_adapter( 'Section', 'elementor' ),
				'templates_empty_message' => ___layoutbridge_adapter( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ),
				'templates_empty_title' => ___layoutbridge_adapter( 'Haven’t Saved Templates Yet?', 'elementor' ),
				'templates_no_favorites_message' => ___layoutbridge_adapter( 'You can mark any pre-designed template as a favorite.', 'elementor' ),
				'templates_no_favorites_title' => ___layoutbridge_adapter( 'No Favorite Templates', 'elementor' ),
				'templates_no_results_message' => ___layoutbridge_adapter( 'Please make sure your search is spelled correctly or try a different words.', 'elementor' ),
				'templates_no_results_title' => ___layoutbridge_adapter( 'No Results Found', 'elementor' ),
				'templates_request_error' => ___layoutbridge_adapter( 'The following error(s) occurred while processing the request:', 'elementor' ),
				'yes' => ___layoutbridge_adapter( 'Yes', 'elementor' ),

				// Incompatible Device.
				'device_incompatible_header' => ___layoutbridge_adapter( 'Your browser isn\'t compatible', 'elementor' ),
				'device_incompatible_message' => ___layoutbridge_adapter( 'Your browser isn\'t compatible with all of DrupalLayoutbuilder\'s editing features. We recommend you switch to another browser like Chrome or Firefox.', 'elementor' ),
				'proceed_anyway' => ___layoutbridge_adapter( 'Proceed Anyway', 'elementor' ),

				// Preview not loaded.
				'learn_more' => ___layoutbridge_adapter( 'Learn More', 'elementor' ),
				'preview_el_not_found_header' => ___layoutbridge_adapter( 'Sorry, the content area was not found in your page.', 'elementor' ),
				'preview_el_not_found_message' => ___layoutbridge_adapter( 'You must call \'the_content\' function in the current template, in order for Elementor to work on this page.', 'elementor' ),
				'preview_not_loading_header' => ___layoutbridge_adapter( 'The preview could not be loaded', 'elementor' ),
				'preview_not_loading_message' => ___layoutbridge_adapter( 'We\'re sorry, but something went wrong. Click on \'Learn more\' and follow each of the steps to quickly solve it.', 'elementor' ),

				// Gallery.
				'delete_gallery' => ___layoutbridge_adapter( 'Reset Gallery', 'elementor' ),
				'dialog_confirm_gallery_delete' => ___layoutbridge_adapter( 'Are you sure you want to reset this gallery?', 'elementor' ),
				/* translators: %s: The number of images. */
				'gallery_images_selected' => ___layoutbridge_adapter( '%s Images Selected', 'elementor' ),
				'gallery_no_images_selected' => ___layoutbridge_adapter( 'No Images Selected', 'elementor' ),
				'insert_media' => ___layoutbridge_adapter( 'Insert Media', 'elementor' ),

				// Take Over.
				/* translators: %s: User name. */
				'dialog_user_taken_over' => ___layoutbridge_adapter( '%s has taken over and is currently editing. Do you want to take over this page editing?', 'elementor' ),
				'go_back' => ___layoutbridge_adapter( 'Go Back', 'elementor' ),
				'take_over' => ___layoutbridge_adapter( 'Take Over', 'elementor' ),

				// Revisions.
				/* translators: %s: Element type. */
				'delete_element' => ___layoutbridge_adapter( 'Delete %s', 'elementor' ),
				/* translators: %s: Template type. */
				'dialog_confirm_delete' => ___layoutbridge_adapter( 'Are you sure you want to remove this %s?', 'elementor' ),

				// Saver.
				'before_unload_alert' => ___layoutbridge_adapter( 'Please note: All unsaved changes will be lost.', 'elementor' ),
				'published' => ___layoutbridge_adapter( 'Published', 'elementor' ),
				'publish' => ___layoutbridge_adapter( 'Publish', 'elementor' ),
				'save' => ___layoutbridge_adapter( 'Save', 'elementor' ),
				'saved' => ___layoutbridge_adapter( 'Saved', 'elementor' ),
				'update' => ___layoutbridge_adapter( 'Update', 'elementor' ),
				'submit' => ___layoutbridge_adapter( 'Submit', 'elementor' ),
				'working_on_draft_notification' => ___layoutbridge_adapter( 'This is just a draft. Play around and when you\'re done - click update.', 'elementor' ),
				'keep_editing' => ___layoutbridge_adapter( 'Keep Editing', 'elementor' ),
				'have_a_look' => ___layoutbridge_adapter( 'Have a look', 'elementor' ),
				'view_all_revisions' => ___layoutbridge_adapter( 'View All Revisions', 'elementor' ),
				'dismiss' => ___layoutbridge_adapter( 'Dismiss', 'elementor' ),
				'saving_disabled' => ___layoutbridge_adapter( 'Saving has been disabled until you’re reconnected.', 'elementor' ),

				// Ajax
				'server_error' => ___layoutbridge_adapter( 'Server Error', 'elementor' ),
				'server_connection_lost' => ___layoutbridge_adapter( 'Connection Lost', 'elementor' ),
				'unknown_error' => ___layoutbridge_adapter( 'Unknown Error', 'elementor' ),

				// Context Menu
				'duplicate' => ___layoutbridge_adapter( 'Duplicate', 'elementor' ),
				'copy' => ___layoutbridge_adapter( 'Copy', 'elementor' ),
				'paste' => ___layoutbridge_adapter( 'Paste', 'elementor' ),
				'copy_style' => ___layoutbridge_adapter( 'Copy Style', 'elementor' ),
				'paste_style' => ___layoutbridge_adapter( 'Paste Style', 'elementor' ),
				'reset_style' => ___layoutbridge_adapter( 'Reset Style', 'elementor' ),
				'save_as_global' => ___layoutbridge_adapter( 'Save as a Global', 'elementor' ),
				'save_as_block' => ___layoutbridge_adapter( 'Save as Template', 'elementor' ),
				'new_column' => ___layoutbridge_adapter( 'Add New Column', 'elementor' ),
				'copy_all_content' => ___layoutbridge_adapter( 'Copy All Content', 'elementor' ),
				'delete_all_content' => ___layoutbridge_adapter( 'Delete All Content', 'elementor' ),
				'navigator' => ___layoutbridge_adapter( 'Navigator', 'elementor' ),

				// Right Click Introduction
				'meet_right_click_header' => ___layoutbridge_adapter( 'Meet Right Click', 'elementor' ),
				'meet_right_click_message' => ___layoutbridge_adapter( 'Now you can access all editing actions using right click.', 'elementor' ),
				'got_it' => ___layoutbridge_adapter( 'Got It', 'elementor' ),

				// TODO: Remove.
				'autosave' => ___layoutbridge_adapter( 'Autosave', 'elementor' ),
				'elementor_docs' => ___layoutbridge_adapter( 'Documentation', 'elementor' ),
				'reload_page' => ___layoutbridge_adapter( 'Reload Page', 'elementor' ),
				'session_expired_header' => ___layoutbridge_adapter( 'Timeout', 'elementor' ),
				'session_expired_message' => ___layoutbridge_adapter( 'Your session has expired. Please reload the page to continue editing.', 'elementor' ),
				'soon' => ___layoutbridge_adapter( 'Soon', 'elementor' ),
				'unknown_value' => ___layoutbridge_adapter( 'Unknown Value', 'elementor' ),
			],
        ]);

        return $settings;
    }

    private static function register_actions()
    {
        remove_action_layoutbridge_adapter('wp_restore_post_revision', [__CLASS__, 'restore_revision'], 10, 2);
        remove_action_layoutbridge_adapter('init', [__CLASS__, 'add_revision_support_for_all_post_types'], 9999);
        remove_filter_layoutbridge_adapter('elementor/editor/localize_settings', [__CLASS__, 'editor_settings'], 10, 2);
        remove_action_layoutbridge_adapter('elementor/db/before_save', [__CLASS__, 'db_before_save'], 10, 2);
        remove_action_layoutbridge_adapter('_wp_put_post_revision', [__CLASS__, 'save_revision']);
        remove_action_layoutbridge_adapter('wp_creating_autosave', [__CLASS__, 'update_autosave']);

        // Hack to avoid delete the auto-save revision in WP editor.
        remove_action_layoutbridge_adapter('edit_post_content', [__CLASS__, 'avoid_delete_auto_save'], 10, 2);
        remove_action_layoutbridge_adapter('edit_form_after_title', [__CLASS__, 'remove_temp_post_content']);

        if (Utils::is_ajax()) {
            remove_filter_layoutbridge_adapter('elementor/documents/ajax_save/return_data', [__CLASS__, 'on_ajax_save_builder_data'], 10, 2);
            remove_action_layoutbridge_adapter('wp_ajax_elementor_get_revision_data', [__CLASS__, 'on_revision_data_request']);
            remove_action_layoutbridge_adapter('wp_ajax_elementor_delete_revision', [__CLASS__, 'on_delete_revision_request']);
        }

        add_filter_layoutbridge_adapter('elementor/editor/localize_settings', [__CLASS__, 'editor_settings'], 10, 2);
        add_action_layoutbridge_adapter('elementor/db/before_save', [__CLASS__, 'db_before_save'], 10, 2);

        if (Utils::is_ajax()) {
            add_filter_layoutbridge_adapter('elementor/documents/ajax_save/return_data', [__CLASS__, 'on_ajax_save_builder_data'], 10, 2);
            add_action_layoutbridge_adapter('wp_ajax_elementor_get_revision_data', [__CLASS__, 'on_revision_data_request']);
            add_action_layoutbridge_adapter('wp_ajax_elementor_delete_revision', [__CLASS__, 'on_delete_revision_request']);
        }
    }

}
