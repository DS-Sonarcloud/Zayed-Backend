<?php
namespace DrupalLayoutbuilder;

use DrupalLayoutbuilder\Core\Responsive\Responsive;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @var Editor $this
 */
$id = \Drupal::routeMatch()->getParameter('node');
$document = Plugin::$instance->documents->get( $id );
$panel_module_version = defined('DRUPAL_LAYOUTBUILDER_MODULE_VERSION') ? DRUPAL_LAYOUTBUILDER_MODULE_VERSION : '1.0.1';

?>
<script type="text/template" id="tmpl-drupal_layoutbuilder-panel">
	<div id="drupal_layoutbuilder-mode-switcher"></div>
	<header id="drupal_layoutbuilder-panel-header-wrapper"></header>
	<main id="drupal_layoutbuilder-panel-content-wrapper"></main>
	<footer id="drupal_layoutbuilder-panel-footer">
		<div class="drupal_layoutbuilder-panel-container">
		</div>
	</footer>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-menu">
	<div id="drupal_layoutbuilder-panel-page-menu-content"></div>
	<div id="drupal_layoutbuilder-panel-page-menu-footer">
		<a href="<?php echo esc_url_layoutbridge_adapter( $document->get_exit_to_dashboard_url() ); ?>" id="drupal_layoutbuilder-panel-exit-to-dashboard" class="drupal_layoutbuilder-button drupal_layoutbuilder-button-default">
			<i class="fa fa-drupal"></i>
			<?php echo ___layoutbridge_adapter( 'Exit To Dashboard', 'elementor' ); ?>
		</a>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-menu-group">
	<div class="drupal_layoutbuilder-panel-menu-group-title">{{{ title }}}</div>
	<div class="drupal_layoutbuilder-panel-menu-items"></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-menu-item">
	<div class="drupal_layoutbuilder-panel-menu-item-icon">
		<i class="{{ icon }}"></i>
	</div>
	<div class="drupal_layoutbuilder-panel-menu-item-title">{{{ title }}}</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-header">
	<div id="drupal_layoutbuilder-panel-header-menu-button" class="drupal_layoutbuilder-header-button">
		<i class="drupal_layoutbuilder-icon eicon-menu-bar tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'Menu', 'elementor' ); ?>"></i>
		<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Menu', 'elementor' ); ?></span>
	</div>
	<div id="drupal_layoutbuilder-panel-header-title">
		<span class="drupal_layoutbuilder-panel-header-title-text"><?php echo ___layoutbridge_adapter( 'Drupal Layout Builder', 'elementor' ); ?></span><br>
		<span class="drupal_layoutbuilder-panel-header-title-version">v<?php echo htmlspecialchars($panel_module_version, ENT_QUOTES, 'UTF-8'); ?></span>
	</div>
	<div id="drupal_layoutbuilder-panel-header-add-button" class="drupal_layoutbuilder-header-button">
		<i class="drupal_layoutbuilder-icon eicon-apps tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'Widgets Panel', 'elementor' ); ?>"></i>
		<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Widgets Panel', 'elementor' ); ?></span>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-footer-content">
	<div id="drupal_layoutbuilder-panel-footer-settings" class="drupal_layoutbuilder-panel-footer-tool drupal_layoutbuilder-toggle-state drupal_layoutbuilder-leave-open tooltip-target" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'Settings', 'elementor' ); ?>">
		<i class="fa fa-cog" aria-hidden="true"></i>
		<span class="drupal_layoutbuilder-screen-only"><?php printf( esc_html___layoutbridge_adapter( '%s Settings', 'elementor' ), $document::get_title() ); ?></span>
	</div>
	<div id="drupal_layoutbuilder-panel-footer-navigator" class="drupal_layoutbuilder-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'Navigator', 'elementor' ); ?>">
		<i class="eicon-navigator" aria-hidden="true"></i>
		<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Navigator', 'elementor' ); ?></span>
	</div>
	<div id="drupal_layoutbuilder-panel-footer-history" class="drupal_layoutbuilder-panel-footer-tool drupal_layoutbuilder-leave-open tooltip-target drupal_layoutbuilder-toggle-state" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'History', 'elementor' ); ?>">
		<i class="fa fa-history" aria-hidden="true"></i>
		<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'History', 'elementor' ); ?></span>
	</div>
	<div id="drupal_layoutbuilder-panel-footer-responsive" class="drupal_layoutbuilder-panel-footer-tool drupal_layoutbuilder-toggle-state">
		<i class="eicon-device-desktop tooltip-target" aria-hidden="true" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'Responsive Mode', 'elementor' ); ?>"></i>
		<span class="drupal_layoutbuilder-screen-only">
			<?php echo ___layoutbridge_adapter( 'Responsive Mode', 'elementor' ); ?>
		</span>
		<div class="drupal_layoutbuilder-panel-footer-sub-menu-wrapper">
			<div class="drupal_layoutbuilder-panel-footer-sub-menu">
				<div class="drupal_layoutbuilder-panel-footer-sub-menu-item" data-device-mode="desktop">
					<i class="drupal_layoutbuilder-icon eicon-device-desktop" aria-hidden="true"></i>
					<span class="drupal_layoutbuilder-title"><?php echo ___layoutbridge_adapter( 'Desktop', 'elementor' ); ?></span>
					<span class="drupal_layoutbuilder-description"><?php echo ___layoutbridge_adapter( 'Default Preview', 'elementor' ); ?></span>
				</div>
				<div class="drupal_layoutbuilder-panel-footer-sub-menu-item" data-device-mode="tablet">
					<i class="drupal_layoutbuilder-icon eicon-device-tablet" aria-hidden="true"></i>
					<span class="drupal_layoutbuilder-title"><?php echo ___layoutbridge_adapter( 'Tablet', 'elementor' ); ?></span>
					<?php $breakpoints = Responsive::get_breakpoints(); ?>
					<span class="drupal_layoutbuilder-description"><?php echo sprintf( ___layoutbridge_adapter( 'Preview for %s', 'elementor' ), $breakpoints['md'] . 'px' ); ?></span>
				</div>
				<div class="drupal_layoutbuilder-panel-footer-sub-menu-item" data-device-mode="mobile">
					<i class="drupal_layoutbuilder-icon eicon-device-mobile" aria-hidden="true"></i>
					<span class="drupal_layoutbuilder-title"><?php echo ___layoutbridge_adapter( 'Mobile', 'elementor' ); ?></span>
					<span class="drupal_layoutbuilder-description"><?php echo ___layoutbridge_adapter( 'Preview for 360px', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
	<div id="drupal_layoutbuilder-panel-saver-button-preview" class="drupal_layoutbuilder-panel-footer-tool tooltip-target" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'Preview Changes', 'elementor' ); ?>">
		<span id="drupal_layoutbuilder-panel-saver-button-preview-label">
			<i class="fa fa-eye" aria-hidden="true"></i>
			<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Preview Changes', 'elementor' ); ?></span>
		</span>
	</div>
	<div id="drupal_layoutbuilder-panel-saver-publish" class="drupal_layoutbuilder-panel-footer-tool">
		<button id="drupal_layoutbuilder-panel-saver-button-publish" class="drupal_layoutbuilder-button drupal_layoutbuilder-button-success drupal_layoutbuilder-saver-disabled">
			<span class="drupal_layoutbuilder-state-icon">
				<i class="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>
			</span>
			<span id="drupal_layoutbuilder-panel-saver-button-publish-label">
				<?php echo ___layoutbridge_adapter( 'Publish', 'elementor' ); ?>
			</span>
		</button>
	</div>
	<div id="drupal_layoutbuilder-panel-saver-save-options" class="drupal_layoutbuilder-panel-footer-tool drupal_layoutbuilder-toggle-state">
		<button id="drupal_layoutbuilder-panel-saver-button-save-options" class="drupal_layoutbuilder-button drupal_layoutbuilder-button-success tooltip-target drupal_layoutbuilder-saver-disabled" data-tooltip="<?php esc_attr_e_layoutbridge_adapter( 'Save Options', 'elementor' ); ?>">
			<i class="fa fa-caret-up" aria-hidden="true"></i>
			<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Save Options', 'elementor' ); ?></span>
		</button>
		<div class="drupal_layoutbuilder-panel-footer-sub-menu-wrapper">
			<p class="drupal_layoutbuilder-last-edited-wrapper">
				<span class="drupal_layoutbuilder-state-icon">
					<i class="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>
				</span>
				<span class="drupal_layoutbuilder-last-edited">
					{{{ elementor.config.document.last_edited }}}
				</span>
			</p>
			<div class="drupal_layoutbuilder-panel-footer-sub-menu">
				<div id="drupal_layoutbuilder-panel-saver-menu-save-draft" class="drupal_layoutbuilder-panel-footer-sub-menu-item drupal_layoutbuilder-saver-disabled">
					<i class="drupal_layoutbuilder-icon fa fa-save" aria-hidden="true"></i>
					<span class="drupal_layoutbuilder-title"><?php echo ___layoutbridge_adapter( 'Save Draft', 'elementor' ); ?></span>
				</div>
				<div id="drupal_layoutbuilder-panel-saver-menu-save-template" class="drupal_layoutbuilder-panel-footer-sub-menu-item">
					<i class="drupal_layoutbuilder-icon fa fa-folder" aria-hidden="true"></i>
					<span class="drupal_layoutbuilder-title"><?php echo ___layoutbridge_adapter( 'Save as Template', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-mode-switcher-content">
	<input id="drupal_layoutbuilder-mode-switcher-preview-input" type="checkbox">
	<label for="drupal_layoutbuilder-mode-switcher-preview-input" id="drupal_layoutbuilder-mode-switcher-preview">
		<i class="fa" aria-hidden="true" title="<?php esc_attr_e_layoutbridge_adapter( 'Hide Panel', 'elementor' ); ?>"></i>
		<span class="drupal_layoutbuilder-screen-only"><?php echo ___layoutbridge_adapter( 'Hide Panel', 'elementor' ); ?></span>
	</label>
</script>

<script type="text/template" id="tmpl-editor-content">
	<div class="drupal_layoutbuilder-panel-navigation">
		<# _.each( elementData.tabs_controls, function( tabTitle, tabSlug ) {
			if ( 'content' !== tabSlug && ! elementor.userCan( 'design' ) ) {
			return;
		}
			#>
			<div class="drupal_layoutbuilder-panel-navigation-tab drupal_layoutbuilder-tab-control-{{ tabSlug }}" data-tab="{{ tabSlug }}">
				<a href="#">{{{ tabTitle }}}</a>
			</div>
		<# } ); #>
	</div>
	<# if ( elementData.reload_preview ) { #>
		<div class="drupal_layoutbuilder-update-preview">
			<div class="drupal_layoutbuilder-update-preview-title"><?php echo ___layoutbridge_adapter( 'Update changes to page', 'elementor' ); ?></div>
			<div class="drupal_layoutbuilder-update-preview-button-wrapper">
				<button class="drupal_layoutbuilder-update-preview-button drupal_layoutbuilder-button drupal_layoutbuilder-button-success"><?php echo ___layoutbridge_adapter( 'Apply', 'elementor' ); ?></button>
			</div>
		</div>
	<# } #>
	<div id="drupal_layoutbuilder-controls"></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-schemes-disabled">
	<i class="drupal_layoutbuilder-nerd-box-icon eicon-nerd" aria-hidden="true"></i>
	<div class="drupal_layoutbuilder-nerd-box-title">{{{ '<?php echo ___layoutbridge_adapter( '%s are disabled', 'elementor' ); ?>'.replace( '%s', disabledTitle ) }}}</div>
	<div class="drupal_layoutbuilder--message"><?php printf( ___layoutbridge_adapter( 'You can enable it from the <a href="%s" target="_blank">Elementor settings page</a>.', 'elementor' ), Settings::get_url() ); ?></div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-scheme-color-item">
	<div class="drupal_layoutbuilder-panel-scheme-color-input-wrapper">
		<input type="text" class="drupal_layoutbuilder-panel-scheme-color-value" value="{{ value }}" data-alpha="true" />
	</div>
	<div class="drupal_layoutbuilder-panel-scheme-color-title">{{{ title }}}</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-scheme-typography-item">
	<div class="drupal_layoutbuilder-panel-heading">
		<div class="drupal_layoutbuilder-panel-heading-toggle">
			<i class="fa" aria-hidden="true"></i>
		</div>
		<div class="drupal_layoutbuilder-panel-heading-title">{{{ title }}}</div>
	</div>
	<div class="drupal_layoutbuilder-panel-scheme-typography-items drupal_layoutbuilder-panel-box-content">
		<?php
		$scheme_fields_keys = Group_Control_Typography::get_scheme_fields_keys();

		$typography_group = Plugin::$instance->controls_manager->get_control_groups( 'typography' );
		$typography_fields = $typography_group->get_fields();

		$scheme_fields = array_intersect_key( $typography_fields, array_flip( $scheme_fields_keys ) );

		foreach ( $scheme_fields as $option_name => $option ) :
			?>
			<div class="drupal_layoutbuilder-panel-scheme-typography-item">
				<div class="drupal_layoutbuilder-panel-scheme-item-title drupal_layoutbuilder-control-title"><?php echo $option['label']; ?></div>
				<div class="drupal_layoutbuilder-panel-scheme-typography-item-value">
					<?php if ( 'select' === $option['type'] ) : ?>
						<select name="<?php echo esc_attr_layoutbridge_adapter( $option_name ); ?>" class="drupal_layoutbuilder-panel-scheme-typography-item-field">
							<?php foreach ( $option['options'] as $field_key => $field_value ) : ?>
								<option value="<?php echo esc_attr_layoutbridge_adapter( $field_key ); ?>"><?php echo $field_value; ?></option>
							<?php endforeach; ?>
						</select>
					<?php elseif ( 'font' === $option['type'] ) : ?>
						<select name="<?php echo esc_attr_layoutbridge_adapter( $option_name ); ?>" class="drupal_layoutbuilder-panel-scheme-typography-item-field">
							<option value=""><?php echo ___layoutbridge_adapter( 'Default', 'elementor' ); ?></option>
							<?php foreach ( Fonts::get_font_groups() as $group_type => $group_label ) : ?>
								<optgroup label="<?php echo esc_attr_layoutbridge_adapter( $group_label ); ?>">
									<?php foreach ( Fonts::get_fonts_by_groups( [ $group_type ] ) as $font_title => $font_type ) : ?>
										<option value="<?php echo esc_attr_layoutbridge_adapter( $font_title ); ?>"><?php echo $font_title; ?></option>
									<?php endforeach; ?>
								</optgroup>
							<?php endforeach; ?>
						</select>
					<?php elseif ( 'text' === $option['type'] ) : ?>
						<input name="<?php echo esc_attr_layoutbridge_adapter( $option_name ); ?>" class="drupal_layoutbuilder-panel-scheme-typography-item-field" />
					<?php endif; ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-control-responsive-switchers">
	<div class="drupal_layoutbuilder-control-responsive-switchers">
		<#
			var devices = responsive.devices || [ 'desktop', 'tablet', 'mobile' ];

			_.each( devices, function( device ) { #>
				<a class="drupal_layoutbuilder-responsive-switcher drupal_layoutbuilder-responsive-switcher-{{ device }}" data-device="{{ device }}">
					<i class="eicon-device-{{ device }}"></i>
				</a>
			<# } );
		#>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-control-dynamic-switcher">
	<div class="drupal_layoutbuilder-control-dynamic-switcher-wrapper">
		<div class="drupal_layoutbuilder-control-dynamic-switcher">
			<?php echo ___layoutbridge_adapter( 'Dynamic', 'elementor' ); ?>
			<i class="fa fa-database"></i>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-control-dynamic-cover">
	<div class="drupal_layoutbuilder-dynamic-cover__settings">
		<i class="fa fa-{{ hasSettings ? 'wrench' : 'database' }}"></i>
	</div>
	<div class="drupal_layoutbuilder-dynamic-cover__title" title="{{{ title + ' ' + content }}}">{{{ title + ' ' + content }}}</div>
	<# if ( isRemovable ) { #>
		<div class="drupal_layoutbuilder-dynamic-cover__remove">
			<i class="fa fa-times-circle"></i>
		</div>
	<# } #>
</script>

<script type="text/template" id="tmpl-drupal_layoutbuilder-panel-page-settings">
	<div class="drupal_layoutbuilder-panel-navigation">
		<# _.each( elementor.config.page_settings.tabs, function( tabTitle, tabSlug ) { #>
			<div class="drupal_layoutbuilder-panel-navigation-tab drupal_layoutbuilder-tab-control-{{ tabSlug }}" data-tab="{{ tabSlug }}">
				<a href="#">{{{ tabTitle }}}</a>
			</div>
			<# } ); #>
	</div>
	<div id="drupal_layoutbuilder-panel-page-settings-controls"></div>
</script>
