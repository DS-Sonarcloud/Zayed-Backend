
wp.customHtmlWidgets = ( function( $ ) {
	'use strict';
	var component = {
		idBases: [ 'custom_html' ],
		codeEditorSettings: {},
		l10n: {
			errorNotice: {
				singular: '',
				plural: ''
			}
		}
	};
	component.CustomHtmlWidgetControl = Backbone.View.extend({
		events: {},
		initialize: function initialize( options ) {
			var control = this;
			if ( ! options.el ) {
				throw new Error( 'Missing options.el' );
			}
			if ( ! options.syncContainer ) {
				throw new Error( 'Missing options.syncContainer' );
			}
			Backbone.View.prototype.initialize.call( control, options );
			control.syncContainer = options.syncContainer;
			control.widgetIdBase = control.syncContainer.parent().find( '.id_base' ).val();
			control.widgetNumber = control.syncContainer.parent().find( '.widget_number' ).val();
			control.customizeSettingId = 'widget_' + control.widgetIdBase + '[' + String( control.widgetNumber ) + ']';
			control.$el.addClass( 'custom-html-widget-fields' );
			control.$el.html( wp.template( 'widget-custom-html-control-fields' )( { codeEditorDisabled: component.codeEditorSettings.disabled } ) );
			control.errorNoticeContainer = control.$el.find( '.code-editor-error-container' );
			control.currentErrorAnnotations = [];
			control.saveButton = control.syncContainer.add( control.syncContainer.parent().find( '.widget-control-actions' ) ).find( '.widget-control-save, #savewidget' );
			control.saveButton.addClass( 'custom-html-widget-save-button' ); 
			control.fields = {
				title: control.$el.find( '.title' ),
				content: control.$el.find( '.content' )
			};
			_.each( control.fields, function( fieldInput, fieldName ) {
				fieldInput.on( 'input change', function updateSyncField() {
					var syncInput = control.syncContainer.find( '.sync-input.' + fieldName );
					if ( syncInput.val() !== fieldInput.val() ) {
						syncInput.val( fieldInput.val() );
						syncInput.trigger( 'change' );
					}
				});
				fieldInput.val( control.syncContainer.find( '.sync-input.' + fieldName ).val() );
			});
		},
		updateFields: function updateFields() {
			var control = this, syncInput;
			if ( ! control.fields.title.is( document.activeElement ) ) {
				syncInput = control.syncContainer.find( '.sync-input.title' );
				control.fields.title.val( syncInput.val() );
			}
			control.contentUpdateBypassed = control.fields.content.is( document.activeElement ) || control.editor && control.editor.codemirror.state.focused || 0 !== control.currentErrorAnnotations;
			if ( ! control.contentUpdateBypassed ) {
				syncInput = control.syncContainer.find( '.sync-input.content' );
				control.fields.content.val( syncInput.val() ).trigger( 'change' );
			}
		},
		updateErrorNotice: function( errorAnnotations ) {
			var control = this, errorNotice, message = '', customizeSetting;
			if ( 1 === errorAnnotations.length ) {
				message = component.l10n.errorNotice.singular.replace( '%d', '1' );
			} else if ( errorAnnotations.length > 1 ) {
				message = component.l10n.errorNotice.plural.replace( '%d', String( errorAnnotations.length ) );
			}
			if ( control.fields.content[0].setCustomValidity ) {
				control.fields.content[0].setCustomValidity( message );
			}
			if ( wp.customize && wp.customize.has( control.customizeSettingId ) ) {
				customizeSetting = wp.customize( control.customizeSettingId );
				customizeSetting.notifications.remove( 'htmlhint_error' );
				if ( 0 !== errorAnnotations.length ) {
					customizeSetting.notifications.add( 'htmlhint_error', new wp.customize.Notification( 'htmlhint_error', {
						message: message,
						type: 'error'
					} ) );
				}
			} else if ( 0 !== errorAnnotations.length ) {
				errorNotice = $( '<div class="inline notice notice-error notice-alt"></div>' );
				errorNotice.append( $( '<p></p>', {
					text: message
				} ) );
				control.errorNoticeContainer.empty();
				control.errorNoticeContainer.append( errorNotice );
				control.errorNoticeContainer.slideDown( 'fast' );
				wp.a11y.speak( message );
			} else {
				control.errorNoticeContainer.slideUp( 'fast' );
			}
		},
		initializeEditor: function initializeEditor() {
			var control = this, settings;
			if ( component.codeEditorSettings.disabled ) {
				return;
			}
			settings = _.extend( {}, component.codeEditorSettings, {
				onTabPrevious: function onTabPrevious() {
					control.fields.title.focus();
				},
				onTabNext: function onTabNext() {
					var tabbables = control.syncContainer.add( control.syncContainer.parent().find( '.widget-position, .widget-control-actions' ) ).find( ':tabbable' );
					tabbables.first().focus();
				},
				onChangeLintingErrors: function onChangeLintingErrors( errorAnnotations ) {
					control.currentErrorAnnotations = errorAnnotations;
				},
				onUpdateErrorNotice: function onUpdateErrorNotice( errorAnnotations ) {
					control.saveButton.toggleClass( 'validation-blocked disabled', errorAnnotations.length > 0 );
					control.updateErrorNotice( errorAnnotations );
				}
			});
			control.editor = wp.codeEditor.initialize( control.fields.content, settings );
			$( control.editor.codemirror.display.lineDiv )
				.attr({
					role: 'textbox',
					'aria-multiline': 'true',
					'aria-labelledby': control.fields.content[0].id + '-label',
					'aria-describedby': 'editor-keyboard-trap-help-1 editor-keyboard-trap-help-2 editor-keyboard-trap-help-3 editor-keyboard-trap-help-4'
				});
			$( '#' + control.fields.content[0].id + '-label' ).on( 'click', function() {
				control.editor.codemirror.focus();
			});
			control.fields.content.on( 'change', function() {
				if ( this.value !== control.editor.codemirror.getValue() ) {
					control.editor.codemirror.setValue( this.value );
				}
			});
			control.editor.codemirror.on( 'change', function() {
				var value = control.editor.codemirror.getValue();
				if ( value !== control.fields.content.val() ) {
					control.fields.content.val( value ).trigger( 'change' );
				}
			});
			control.editor.codemirror.on( 'blur', function() {
				if ( control.contentUpdateBypassed ) {
					control.syncContainer.find( '.sync-input.content' ).trigger( 'change' );
				}
			});
			if ( wp.customize ) {
				control.editor.codemirror.on( 'keydown', function onKeydown( codemirror, event ) {
					var escKeyCode = 27;
					if ( escKeyCode === event.keyCode ) {
						event.stopPropagation();
					}
				});
			}
		}
	});
	component.widgetControls = {};
	component.handleWidgetAdded = function handleWidgetAdded( event, widgetContainer ) {
		var widgetForm, idBase, widgetControl, widgetId, animatedCheckDelay = 50, renderWhenAnimationDone, fieldContainer, syncContainer;
		widgetForm = widgetContainer.find( '> .widget-inside > .form, > .widget-inside > form' ); 
		idBase = widgetForm.find( '> .id_base' ).val();
		if ( -1 === component.idBases.indexOf( idBase ) ) {
			return;
		}
		widgetId = widgetForm.find( '.widget-id' ).val();
		if ( component.widgetControls[ widgetId ] ) {
			return;
		}
		fieldContainer = $( '<div></div>' );
		syncContainer = widgetContainer.find( '.widget-content:first' );
		syncContainer.before( fieldContainer );
		widgetControl = new component.CustomHtmlWidgetControl({
			el: fieldContainer,
			syncContainer: syncContainer
		});
		component.widgetControls[ widgetId ] = widgetControl;
		renderWhenAnimationDone = function() {
			if ( ! ( wp.customize ? widgetContainer.parent().hasClass( 'expanded' ) : widgetContainer.hasClass( 'open' ) ) ) { 
				setTimeout( renderWhenAnimationDone, animatedCheckDelay );
			} else {
				widgetControl.initializeEditor();
			}
		};
		renderWhenAnimationDone();
	};
	component.setupAccessibleMode = function setupAccessibleMode() {
		var widgetForm, idBase, widgetControl, fieldContainer, syncContainer;
		widgetForm = $( '.editwidget > form' );
		if ( 0 === widgetForm.length ) {
			return;
		}
		idBase = widgetForm.find( '> .widget-control-actions > .id_base' ).val();
		if ( -1 === component.idBases.indexOf( idBase ) ) {
			return;
		}
		fieldContainer = $( '<div></div>' );
		syncContainer = widgetForm.find( '> .widget-inside' );
		syncContainer.before( fieldContainer );
		widgetControl = new component.CustomHtmlWidgetControl({
			el: fieldContainer,
			syncContainer: syncContainer
		});
		widgetControl.initializeEditor();
	};
	component.handleWidgetUpdated = function handleWidgetUpdated( event, widgetContainer ) {
		var widgetForm, widgetId, widgetControl, idBase;
		widgetForm = widgetContainer.find( '> .widget-inside > .form, > .widget-inside > form' );
		idBase = widgetForm.find( '> .id_base' ).val();
		if ( -1 === component.idBases.indexOf( idBase ) ) {
			return;
		}
		widgetId = widgetForm.find( '> .widget-id' ).val();
		widgetControl = component.widgetControls[ widgetId ];
		if ( ! widgetControl ) {
			return;
		}
		widgetControl.updateFields();
	};
	component.init = function init( settings ) {
		var $document = $( document );
		_.extend( component.codeEditorSettings, settings );
		$document.on( 'widget-added', component.handleWidgetAdded );
		$document.on( 'widget-synced widget-updated', component.handleWidgetUpdated );
		$( function initializeExistingWidgetContainers() {
			var widgetContainers;
			if ( 'widgets' !== window.pagenow ) {
				return;
			}
			widgetContainers = $( '.widgets-holder-wrap:not(#available-widgets)' ).find( 'div.widget' );
			widgetContainers.one( 'click.toggle-widget-expanded', function toggleWidgetExpanded() {
				var widgetContainer = $( this );
				component.handleWidgetAdded( new jQuery.Event( 'widget-added' ), widgetContainer );
			});
			$( window ).on( 'load', function() {
				component.setupAccessibleMode();
			});
		});
	};
	return component;
})( jQuery );
