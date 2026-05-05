
wp.textWidgets = ( function( $ ) {
	'use strict';
	var component = {
		dismissedPointers: [],
		idBases: [ 'text' ]
	};
	component.TextWidgetControl = Backbone.View.extend({
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
			control.$el.addClass( 'text-widget-fields' );
			control.$el.html( wp.template( 'widget-text-control-fields' ) );
			control.customHtmlWidgetPointer = control.$el.find( '.wp-pointer.custom-html-widget-pointer' );
			if ( control.customHtmlWidgetPointer.length ) {
				control.customHtmlWidgetPointer.find( '.close' ).on( 'click', function( event ) {
					event.preventDefault();
					control.customHtmlWidgetPointer.hide();
					$( '#' + control.fields.text.attr( 'id' ) + '-html' ).focus();
					control.dismissPointers( [ 'text_widget_custom_html' ] );
				});
				control.customHtmlWidgetPointer.find( '.add-widget' ).on( 'click', function( event ) {
					event.preventDefault();
					control.customHtmlWidgetPointer.hide();
					control.openAvailableWidgetsPanel();
				});
			}
			control.pasteHtmlPointer = control.$el.find( '.wp-pointer.paste-html-pointer' );
			if ( control.pasteHtmlPointer.length ) {
				control.pasteHtmlPointer.find( '.close' ).on( 'click', function( event ) {
					event.preventDefault();
					control.pasteHtmlPointer.hide();
					control.editor.focus();
					control.dismissPointers( [ 'text_widget_custom_html', 'text_widget_paste_html' ] );
				});
			}
			control.fields = {
				title: control.$el.find( '.title' ),
				text: control.$el.find( '.text' )
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
		dismissPointers: function dismissPointers( pointers ) {
			_.each( pointers, function( pointer ) {
				wp.ajax.post( 'dismiss-wp-pointer', {
					pointer: pointer
				});
				component.dismissedPointers.push( pointer );
			});
		},
		openAvailableWidgetsPanel: function openAvailableWidgetsPanel() {
			var sidebarControl;
			wp.customize.section.each( function( section ) {
				if ( section.extended( wp.customize.Widgets.SidebarSection ) && section.expanded() ) {
					sidebarControl = wp.customize.control( 'sidebars_widgets[' + section.params.sidebarId + ']' );
				}
			});
			if ( ! sidebarControl ) {
				return;
			}
			setTimeout( function() { 
				wp.customize.Widgets.availableWidgetsPanel.open( sidebarControl );
				wp.customize.Widgets.availableWidgetsPanel.$search.val( 'HTML' ).trigger( 'keyup' );
			});
		},
		updateFields: function updateFields() {
			var control = this, syncInput;
			if ( ! control.fields.title.is( document.activeElement ) ) {
				syncInput = control.syncContainer.find( '.sync-input.title' );
				control.fields.title.val( syncInput.val() );
			}
			syncInput = control.syncContainer.find( '.sync-input.text' );
			if ( control.fields.text.is( ':visible' ) ) {
				if ( ! control.fields.text.is( document.activeElement ) ) {
					control.fields.text.val( syncInput.val() );
				}
			} else if ( control.editor && ! control.editorFocused && syncInput.val() !== control.fields.text.val() ) {
				control.editor.setContent( wp.editor.autop( syncInput.val() ) );
			}
		},
		initializeEditor: function initializeEditor() {
			var control = this, changeDebounceDelay = 1000, id, textarea, triggerChangeIfDirty, restoreTextMode = false, needsTextareaChangeTrigger = false, previousValue;
			textarea = control.fields.text;
			id = textarea.attr( 'id' );
			previousValue = textarea.val();
			triggerChangeIfDirty = function() {
				var updateWidgetBuffer = 300; 
				if ( control.editor.isDirty() ) {
					if ( wp.customize && wp.customize.state ) {
						wp.customize.state( 'processing' ).set( wp.customize.state( 'processing' ).get() + 1 );
						_.delay( function() {
							wp.customize.state( 'processing' ).set( wp.customize.state( 'processing' ).get() - 1 );
						}, updateWidgetBuffer );
					}
					if ( ! control.editor.isHidden() ) {
						control.editor.save();
					}
				}
				if ( needsTextareaChangeTrigger && previousValue !== textarea.val() ) {
					textarea.trigger( 'change' );
					needsTextareaChangeTrigger = false;
					previousValue = textarea.val();
				}
			};
			control.syncContainer.closest( '.widget' ).find( '[name=savewidget]:first' ).on( 'click', function onClickSaveButton() {
				triggerChangeIfDirty();
			});
			function buildEditor() {
				var editor, onInit, showPointerElement;
				if ( ! document.getElementById( id ) ) {
					return;
				}
				if ( typeof window.tinymce === 'undefined' ) {
					wp.editor.initialize( id, {
						quicktags: true,
						mediaButtons: true
					});
					return;
				}
				if ( tinymce.get( id ) ) {
					restoreTextMode = tinymce.get( id ).isHidden();
					wp.editor.remove( id );
				}
				$( document ).one( 'wp-before-tinymce-init.text-widget-init', function( event, init ) {
					if ( ! init.plugins ) {
						return;
					} else if ( ! /\bwpview\b/.test( init.plugins ) ) {
						init.plugins += ',wpview';
					}
				} );
				wp.editor.initialize( id, {
					tinymce: {
						wpautop: true
					},
					quicktags: true,
					mediaButtons: true
				});
				showPointerElement = function( pointerElement ) {
					pointerElement.show();
					pointerElement.find( '.close' ).focus();
					wp.a11y.speak( pointerElement.find( 'h3, p' ).map( function() {
						return $( this ).text();
					} ).get().join( '\n\n' ) );
				};
				editor = window.tinymce.get( id );
				if ( ! editor ) {
					throw new Error( 'Failed to initialize editor' );
				}
				onInit = function() {
					$( editor.getWin() ).on( 'unload', function() {
						_.defer( buildEditor );
					});
					if ( restoreTextMode ) {
						switchEditors.go( id, 'html' );
					}
					$( '#' + id + '-html' ).on( 'click', function() {
						control.pasteHtmlPointer.hide(); 
						if ( -1 !== component.dismissedPointers.indexOf( 'text_widget_custom_html' ) ) {
							return;
						}
						showPointerElement( control.customHtmlWidgetPointer );
					});
					$( '#' + id + '-tmce' ).on( 'click', function() {
						control.customHtmlWidgetPointer.hide();
					});
					editor.on( 'pastepreprocess', function( event ) {
						var content = event.content;
						if ( -1 !== component.dismissedPointers.indexOf( 'text_widget_paste_html' ) || ! content || ! /&lt;\w+.*?&gt;/.test( content ) ) {
							return;
						}
						_.delay( function() {
							showPointerElement( control.pasteHtmlPointer );
						}, 250 );
					});
				};
				if ( editor.initialized ) {
					onInit();
				} else {
					editor.on( 'init', onInit );
				}
				control.editorFocused = false;
				editor.on( 'focus', function onEditorFocus() {
					control.editorFocused = true;
				});
				editor.on( 'paste', function onEditorPaste() {
					editor.setDirty( true ); 
					triggerChangeIfDirty();
				});
				editor.on( 'NodeChange', function onNodeChange() {
					needsTextareaChangeTrigger = true;
				});
				editor.on( 'NodeChange', _.debounce( triggerChangeIfDirty, changeDebounceDelay ) );
				editor.on( 'blur hide', function onEditorBlur() {
					control.editorFocused = false;
					triggerChangeIfDirty();
				});
				control.editor = editor;
			}
			buildEditor();
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
		if ( ! widgetForm.find( '.visual' ).val() ) {
			return;
		}
		fieldContainer = $( '<div></div>' );
		syncContainer = widgetContainer.find( '.widget-content:first' );
		syncContainer.before( fieldContainer );
		widgetControl = new component.TextWidgetControl({
			el: fieldContainer,
			syncContainer: syncContainer
		});
		component.widgetControls[ widgetId ] = widgetControl;
		renderWhenAnimationDone = function() {
			if ( ! widgetContainer.hasClass( 'open' ) ) {
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
		if ( ! widgetForm.find( '.visual' ).val() ) {
			return;
		}
		fieldContainer = $( '<div></div>' );
		syncContainer = widgetForm.find( '> .widget-inside' );
		syncContainer.before( fieldContainer );
		widgetControl = new component.TextWidgetControl({
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
	component.init = function init() {
		var $document = $( document );
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
