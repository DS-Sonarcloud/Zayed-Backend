
(function( wp, $ ){
	if ( ! wp || ! wp.customize ) { return; }
	var api = wp.customize,
		l10n;
	api.Widgets = api.Widgets || {};
	api.Widgets.savedWidgetIds = {};
	api.Widgets.data = _wpCustomizeWidgetsSettings || {};
	l10n = api.Widgets.data.l10n;
	api.Widgets.WidgetModel = Backbone.Model.extend({
		id: null,
		temp_id: null,
		classname: null,
		control_tpl: null,
		description: null,
		is_disabled: null,
		is_multi: null,
		multi_number: null,
		name: null,
		id_base: null,
		transport: null,
		params: [],
		width: null,
		height: null,
		search_matched: true
	});
	api.Widgets.WidgetCollection = Backbone.Collection.extend({
		model: api.Widgets.WidgetModel,
		doSearch: function( value ) {
			if ( this.terms === value ) {
				return;
			}
			this.terms = value;
			if ( this.terms.length > 0 ) {
				this.search( this.terms );
			}
			if ( this.terms === '' ) {
				this.each( function ( widget ) {
					widget.set( 'search_matched', true );
				} );
			}
		},
		search: function( term ) {
			var match, haystack;
			term = term.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
			term = term.replace( / /g, ')(?=.*' );
			match = new RegExp( '^(?=.*' + term + ').+', 'i' );
			this.each( function ( data ) {
				haystack = [ data.get( 'name' ), data.get( 'id' ), data.get( 'description' ) ].join( ' ' );
				data.set( 'search_matched', match.test( haystack ) );
			} );
		}
	});
	api.Widgets.availableWidgets = new api.Widgets.WidgetCollection( api.Widgets.data.availableWidgets );
	api.Widgets.SidebarModel = Backbone.Model.extend({
		after_title: null,
		after_widget: null,
		before_title: null,
		before_widget: null,
		'class': null,
		description: null,
		id: null,
		name: null,
		is_rendered: false
	});
	api.Widgets.SidebarCollection = Backbone.Collection.extend({
		model: api.Widgets.SidebarModel
	});
	api.Widgets.registeredSidebars = new api.Widgets.SidebarCollection( api.Widgets.data.registeredSidebars );
	api.Widgets.AvailableWidgetsPanelView = wp.Backbone.View.extend({
		el: '#available-widgets',
		events: {
			'input #widgets-search': 'search',
			'keyup #widgets-search': 'search',
			'focus .widget-tpl' : 'focus',
			'click .widget-tpl' : '_submit',
			'keypress .widget-tpl' : '_submit',
			'keydown' : 'keyboardAccessible'
		},
		selected: null,
		currentSidebarControl: null,
		$search: null,
		$clearResults: null,
		searchMatchesCount: null,
		initialize: function() {
			var self = this;
			this.$search = $( '#widgets-search' );
			this.$clearResults = this.$el.find( '.clear-results' );
			_.bindAll( this, 'close' );
			this.listenTo( this.collection, 'change', this.updateList );
			this.updateList();
			this.searchMatchesCount = this.collection.length;
			$( '#customize-controls, #available-widgets .customize-section-title' ).on( 'click keydown', function( e ) {
				var isAddNewBtn = $( e.target ).is( '.add-new-widget, .add-new-widget *' );
				if ( $( 'body' ).hasClass( 'adding-widget' ) && ! isAddNewBtn ) {
					self.close();
				}
			} );
			this.$clearResults.on( 'click', function() {
				self.$search.val( '' ).focus().trigger( 'keyup' );
			} );
			api.previewer.bind( 'url', this.close );
		},
		search: function( event ) {
			var firstVisible;
			this.collection.doSearch( event.target.value );
			this.updateSearchMatchesCount();
			this.announceSearchMatches();
			if ( this.selected && ! this.selected.is( ':visible' ) ) {
				this.selected.removeClass( 'selected' );
				this.selected = null;
			}
			if ( this.selected && ! event.target.value ) {
				this.selected.removeClass( 'selected' );
				this.selected = null;
			}
			if ( ! this.selected && event.target.value ) {
				firstVisible = this.$el.find( '> .widget-tpl:visible:first' );
				if ( firstVisible.length ) {
					this.select( firstVisible );
				}
			}
			if ( '' !== event.target.value ) {
				this.$clearResults.addClass( 'is-visible' );
			} else if ( '' === event.target.value ) {
				this.$clearResults.removeClass( 'is-visible' );
			}
			if ( ! this.searchMatchesCount ) {
				this.$el.addClass( 'no-widgets-found' );
			} else {
				this.$el.removeClass( 'no-widgets-found' );
			}
		},
		updateSearchMatchesCount: function() {
			this.searchMatchesCount = this.collection.where({ search_matched: true }).length;
		},
		announceSearchMatches: _.debounce( function() {
			var message = l10n.widgetsFound.replace( '%d', this.searchMatchesCount ) ;
			if ( ! this.searchMatchesCount ) {
				message = l10n.noWidgetsFound;
			}
			wp.a11y.speak( message );
		}, 500 ),
		updateList: function() {
			this.collection.each( function( widget ) {
				var widgetTpl = $( '#widget-tpl-' + widget.id );
				widgetTpl.toggle( widget.get( 'search_matched' ) && ! widget.get( 'is_disabled' ) );
				if ( widget.get( 'is_disabled' ) && widgetTpl.is( this.selected ) ) {
					this.selected = null;
				}
			} );
		},
		select: function( widgetTpl ) {
			this.selected = $( widgetTpl );
			this.selected.siblings( '.widget-tpl' ).removeClass( 'selected' );
			this.selected.addClass( 'selected' );
		},
		focus: function( event ) {
			this.select( $( event.currentTarget ) );
		},
		_submit: function( event ) {
			if ( event.type === 'keypress' && ( event.which !== 13 && event.which !== 32 ) ) {
				return;
			}
			this.submit( $( event.currentTarget ) );
		},
		submit: function( widgetTpl ) {
			var widgetId, widget, widgetFormControl;
			if ( ! widgetTpl ) {
				widgetTpl = this.selected;
			}
			if ( ! widgetTpl || ! this.currentSidebarControl ) {
				return;
			}
			this.select( widgetTpl );
			widgetId = $( this.selected ).data( 'widget-id' );
			widget = this.collection.findWhere( { id: widgetId } );
			if ( ! widget ) {
				return;
			}
			widgetFormControl = this.currentSidebarControl.addWidget( widget.get( 'id_base' ) );
			if ( widgetFormControl ) {
				widgetFormControl.focus();
			}
			this.close();
		},
		open: function( sidebarControl ) {
			this.currentSidebarControl = sidebarControl;
			_( this.currentSidebarControl.getWidgetFormControls() ).each( function( control ) {
				if ( control.params.is_wide ) {
					control.collapseForm();
				}
			} );
			if ( api.section.has( 'publish_settings' ) ) {
				api.section( 'publish_settings' ).collapse();
			}
			$( 'body' ).addClass( 'adding-widget' );
			this.$el.find( '.selected' ).removeClass( 'selected' );
			this.collection.doSearch( '' );
			if ( ! api.settings.browser.mobile ) {
				this.$search.focus();
			}
		},
		close: function( options ) {
			options = options || {};
			if ( options.returnFocus && this.currentSidebarControl ) {
				this.currentSidebarControl.container.find( '.add-new-widget' ).focus();
			}
			this.currentSidebarControl = null;
			this.selected = null;
			$( 'body' ).removeClass( 'adding-widget' );
			this.$search.val( '' );
		},
		keyboardAccessible: function( event ) {
			var isEnter = ( event.which === 13 ),
				isEsc = ( event.which === 27 ),
				isDown = ( event.which === 40 ),
				isUp = ( event.which === 38 ),
				isTab = ( event.which === 9 ),
				isShift = ( event.shiftKey ),
				selected = null,
				firstVisible = this.$el.find( '> .widget-tpl:visible:first' ),
				lastVisible = this.$el.find( '> .widget-tpl:visible:last' ),
				isSearchFocused = $( event.target ).is( this.$search ),
				isLastWidgetFocused = $( event.target ).is( '.widget-tpl:visible:last' );
			if ( isDown || isUp ) {
				if ( isDown ) {
					if ( isSearchFocused ) {
						selected = firstVisible;
					} else if ( this.selected && this.selected.nextAll( '.widget-tpl:visible' ).length !== 0 ) {
						selected = this.selected.nextAll( '.widget-tpl:visible:first' );
					}
				} else if ( isUp ) {
					if ( isSearchFocused ) {
						selected = lastVisible;
					} else if ( this.selected && this.selected.prevAll( '.widget-tpl:visible' ).length !== 0 ) {
						selected = this.selected.prevAll( '.widget-tpl:visible:first' );
					}
				}
				this.select( selected );
				if ( selected ) {
					selected.focus();
				} else {
					this.$search.focus();
				}
				return;
			}
			if ( isEnter && ! this.$search.val() ) {
				return;
			}
			if ( isEnter ) {
				this.submit();
			} else if ( isEsc ) {
				this.close( { returnFocus: true } );
			}
			if ( this.currentSidebarControl && isTab && ( isShift && isSearchFocused || ! isShift && isLastWidgetFocused ) ) {
				this.currentSidebarControl.container.find( '.add-new-widget' ).focus();
				event.preventDefault();
			}
		}
	});
	api.Widgets.formSyncHandlers = {
		rss: function( e, widget, newForm ) {
			var oldWidgetError = widget.find( '.widget-error:first' ),
				newWidgetError = $( '<div>' + newForm + '</div>' ).find( '.widget-error:first' );
			if ( oldWidgetError.length && newWidgetError.length ) {
				oldWidgetError.replaceWith( newWidgetError );
			} else if ( oldWidgetError.length ) {
				oldWidgetError.remove();
			} else if ( newWidgetError.length ) {
				widget.find( '.widget-content:first' ).prepend( newWidgetError );
			}
		}
	};
	api.Widgets.WidgetControl = api.Control.extend({
		defaultExpandedArguments: {
			duration: 'fast',
			completeCallback: $.noop
		},
		initialize: function( id, options ) {
			var control = this;
			control.widgetControlEmbedded = false;
			control.widgetContentEmbedded = false;
			control.expanded = new api.Value( false );
			control.expandedArgumentsQueue = [];
			control.expanded.bind( function( expanded ) {
				var args = control.expandedArgumentsQueue.shift();
				args = $.extend( {}, control.defaultExpandedArguments, args );
				control.onChangeExpanded( expanded, args );
			});
			control.altNotice = true;
			api.Control.prototype.initialize.call( control, id, options );
		},
		ready: function() {
			var control = this;
			if ( ! control.section() ) {
				control.embedWidgetControl();
			} else {
				api.section( control.section(), function( section ) {
					var onExpanded = function( isExpanded ) {
						if ( isExpanded ) {
							control.embedWidgetControl();
							section.expanded.unbind( onExpanded );
						}
					};
					if ( section.expanded() ) {
						onExpanded( true );
					} else {
						section.expanded.bind( onExpanded );
					}
				} );
			}
		},
		embedWidgetControl: function() {
			var control = this, widgetControl;
			if ( control.widgetControlEmbedded ) {
				return;
			}
			control.widgetControlEmbedded = true;
			widgetControl = $( control.params.widget_control );
			control.container.append( widgetControl );
			control._setupModel();
			control._setupWideWidget();
			control._setupControlToggle();
			control._setupWidgetTitle();
			control._setupReorderUI();
			control._setupHighlightEffects();
			control._setupUpdateUI();
			control._setupRemoveUI();
		},
		embedWidgetContent: function() {
			var control = this, widgetContent;
			control.embedWidgetControl();
			if ( control.widgetContentEmbedded ) {
				return;
			}
			control.widgetContentEmbedded = true;
			control.notifications.container = control.getNotificationsContainerElement();
			control.notifications.render();
			widgetContent = $( control.params.widget_content );
			control.container.find( '.widget-content:first' ).append( widgetContent );
			$( document ).trigger( 'widget-added', [ control.container.find( '.widget:first' ) ] );
		},
		_setupModel: function() {
			var self = this, rememberSavedWidgetId;
			rememberSavedWidgetId = function() {
				api.Widgets.savedWidgetIds[self.params.widget_id] = true;
			};
			api.bind( 'ready', rememberSavedWidgetId );
			api.bind( 'saved', rememberSavedWidgetId );
			this._updateCount = 0;
			this.isWidgetUpdating = false;
			this.liveUpdateMode = true;
			this.setting.bind( function( to, from ) {
				if ( ! _( from ).isEqual( to ) && ! self.isWidgetUpdating ) {
					self.updateWidget( { instance: to } );
				}
			} );
		},
		_setupWideWidget: function() {
			var self = this, $widgetInside, $widgetForm, $customizeSidebar,
				$themeControlsContainer, positionWidget;
			if ( ! this.params.is_wide || $( window ).width() <= 640  ) {
				return;
			}
			$widgetInside = this.container.find( '.widget-inside' );
			$widgetForm = $widgetInside.find( '> .form' );
			$customizeSidebar = $( '.wp-full-overlay-sidebar-content:first' );
			this.container.addClass( 'wide-widget-control' );
			this.container.find( '.form:first' ).css( {
				'max-width': this.params.width,
				'min-height': this.params.height
			} );
			positionWidget = function() {
				var offsetTop = self.container.offset().top,
					windowHeight = $( window ).height(),
					formHeight = $widgetForm.outerHeight(),
					top;
				$widgetInside.css( 'max-height', windowHeight );
				top = Math.max(
					0, 
					Math.min(
						Math.max( offsetTop, 0 ), 
						windowHeight - formHeight 
					)
				);
				$widgetInside.css( 'top', top );
			};
			$themeControlsContainer = $( '#customize-theme-controls' );
			this.container.on( 'expand', function() {
				positionWidget();
				$customizeSidebar.on( 'scroll', positionWidget );
				$( window ).on( 'resize', positionWidget );
				$themeControlsContainer.on( 'expanded collapsed', positionWidget );
			} );
			this.container.on( 'collapsed', function() {
				$customizeSidebar.off( 'scroll', positionWidget );
				$( window ).off( 'resize', positionWidget );
				$themeControlsContainer.off( 'expanded collapsed', positionWidget );
			} );
			api.each( function( setting ) {
				if ( 0 === setting.id.indexOf( 'sidebars_widgets[' ) ) {
					setting.bind( function() {
						if ( self.container.hasClass( 'expanded' ) ) {
							positionWidget();
						}
					} );
				}
			} );
		},
		_setupControlToggle: function() {
			var self = this, $closeBtn;
			this.container.find( '.widget-top' ).on( 'click', function( e ) {
				e.preventDefault();
				var sidebarWidgetsControl = self.getSidebarWidgetsControl();
				if ( sidebarWidgetsControl.isReordering ) {
					return;
				}
				self.expanded( ! self.expanded() );
			} );
			$closeBtn = this.container.find( '.widget-control-close' );
			$closeBtn.on( 'click', function( e ) {
				e.preventDefault();
				self.collapse();
				self.container.find( '.widget-top .widget-action:first' ).focus(); 
			} );
		},
		_setupWidgetTitle: function() {
			var self = this, updateTitle;
			updateTitle = function() {
				var title = self.setting().title,
					inWidgetTitle = self.container.find( '.in-widget-title' );
				if ( title ) {
					inWidgetTitle.text( ': ' + title );
				} else {
					inWidgetTitle.text( '' );
				}
			};
			this.setting.bind( updateTitle );
			updateTitle();
		},
		_setupReorderUI: function() {
			var self = this, selectSidebarItem, $moveWidgetArea,
				$reorderNav, updateAvailableSidebars, template;
			selectSidebarItem = function( li ) {
				li.siblings( '.selected' ).removeClass( 'selected' );
				li.addClass( 'selected' );
				var isSelfSidebar = ( li.data( 'id' ) === self.params.sidebar_id );
				self.container.find( '.move-widget-btn' ).prop( 'disabled', isSelfSidebar );
			};
			this.container.find( '.widget-title-action' ).after( $( api.Widgets.data.tpl.widgetReorderNav ) );
			template = _.template( api.Widgets.data.tpl.moveWidgetArea );
			$moveWidgetArea = $( template( {
					sidebars: _( api.Widgets.registeredSidebars.toArray() ).pluck( 'attributes' )
				} )
			);
			this.container.find( '.widget-top' ).after( $moveWidgetArea );
			updateAvailableSidebars = function() {
				var $sidebarItems = $moveWidgetArea.find( 'li' ), selfSidebarItem,
					renderedSidebarCount = 0;
				selfSidebarItem = $sidebarItems.filter( function(){
					return $( this ).data( 'id' ) === self.params.sidebar_id;
				} );
				$sidebarItems.each( function() {
					var li = $( this ),
						sidebarId, sidebar, sidebarIsRendered;
					sidebarId = li.data( 'id' );
					sidebar = api.Widgets.registeredSidebars.get( sidebarId );
					sidebarIsRendered = sidebar.get( 'is_rendered' );
					li.toggle( sidebarIsRendered );
					if ( sidebarIsRendered ) {
						renderedSidebarCount += 1;
					}
					if ( li.hasClass( 'selected' ) && ! sidebarIsRendered ) {
						selectSidebarItem( selfSidebarItem );
					}
				} );
				if ( renderedSidebarCount > 1 ) {
					self.container.find( '.move-widget' ).show();
				} else {
					self.container.find( '.move-widget' ).hide();
				}
			};
			updateAvailableSidebars();
			api.Widgets.registeredSidebars.on( 'change:is_rendered', updateAvailableSidebars );
			$reorderNav = this.container.find( '.widget-reorder-nav' );
			$reorderNav.find( '.move-widget, .move-widget-down, .move-widget-up' ).each( function() {
				$( this ).prepend( self.container.find( '.widget-title' ).text() + ': ' );
			} ).on( 'click keypress', function( event ) {
				if ( event.type === 'keypress' && ( event.which !== 13 && event.which !== 32 ) ) {
					return;
				}
				$( this ).focus();
				if ( $( this ).is( '.move-widget' ) ) {
					self.toggleWidgetMoveArea();
				} else {
					var isMoveDown = $( this ).is( '.move-widget-down' ),
						isMoveUp = $( this ).is( '.move-widget-up' ),
						i = self.getWidgetSidebarPosition();
					if ( ( isMoveUp && i === 0 ) || ( isMoveDown && i === self.getSidebarWidgetsControl().setting().length - 1 ) ) {
						return;
					}
					if ( isMoveUp ) {
						self.moveUp();
						wp.a11y.speak( l10n.widgetMovedUp );
					} else {
						self.moveDown();
						wp.a11y.speak( l10n.widgetMovedDown );
					}
					$( this ).focus(); 
				}
			} );
			this.container.find( '.widget-area-select' ).on( 'click keypress', 'li', function( event ) {
				if ( event.type === 'keypress' && ( event.which !== 13 && event.which !== 32 ) ) {
					return;
				}
				event.preventDefault();
				selectSidebarItem( $( this ) );
			} );
			this.container.find( '.move-widget-btn' ).click( function() {
				self.getSidebarWidgetsControl().toggleReordering( false );
				var oldSidebarId = self.params.sidebar_id,
					newSidebarId = self.container.find( '.widget-area-select li.selected' ).data( 'id' ),
					oldSidebarWidgetsSetting, newSidebarWidgetsSetting,
					oldSidebarWidgetIds, newSidebarWidgetIds, i;
				oldSidebarWidgetsSetting = api( 'sidebars_widgets[' + oldSidebarId + ']' );
				newSidebarWidgetsSetting = api( 'sidebars_widgets[' + newSidebarId + ']' );
				oldSidebarWidgetIds = Array.prototype.slice.call( oldSidebarWidgetsSetting() );
				newSidebarWidgetIds = Array.prototype.slice.call( newSidebarWidgetsSetting() );
				i = self.getWidgetSidebarPosition();
				oldSidebarWidgetIds.splice( i, 1 );
				newSidebarWidgetIds.push( self.params.widget_id );
				oldSidebarWidgetsSetting( oldSidebarWidgetIds );
				newSidebarWidgetsSetting( newSidebarWidgetIds );
				self.focus();
			} );
		},
		_setupHighlightEffects: function() {
			var self = this;
			this.container.on( 'mouseenter click', function() {
				self.setting.previewer.send( 'highlight-widget', self.params.widget_id );
			} );
			this.setting.bind( function() {
				self.setting.previewer.send( 'highlight-widget', self.params.widget_id );
			} );
		},
		_setupUpdateUI: function() {
			var self = this, $widgetRoot, $widgetContent,
				$saveBtn, updateWidgetDebounced, formSyncHandler;
			$widgetRoot = this.container.find( '.widget:first' );
			$widgetContent = $widgetRoot.find( '.widget-content:first' );
			$saveBtn = this.container.find( '.widget-control-save' );
			$saveBtn.val( l10n.saveBtnLabel );
			$saveBtn.attr( 'title', l10n.saveBtnTooltip );
			$saveBtn.removeClass( 'button-primary' );
			$saveBtn.on( 'click', function( e ) {
				e.preventDefault();
				self.updateWidget( { disable_form: true } ); 
			} );
			updateWidgetDebounced = _.debounce( function() {
				self.updateWidget();
			}, 250 );
			$widgetContent.on( 'keydown', 'input', function( e ) {
				if ( 13 === e.which ) { 
					e.preventDefault();
					self.updateWidget( { ignoreActiveElement: true } );
				}
			} );
			$widgetContent.on( 'change input propertychange', ':input', function( e ) {
				if ( ! self.liveUpdateMode ) {
					return;
				}
				if ( e.type === 'change' || ( this.checkValidity && this.checkValidity() ) ) {
					updateWidgetDebounced();
				}
			} );
			this.setting.previewer.channel.bind( 'synced', function() {
				self.container.removeClass( 'previewer-loading' );
			} );
			api.previewer.bind( 'widget-updated', function( updatedWidgetId ) {
				if ( updatedWidgetId === self.params.widget_id ) {
					self.container.removeClass( 'previewer-loading' );
				}
			} );
			formSyncHandler = api.Widgets.formSyncHandlers[ this.params.widget_id_base ];
			if ( formSyncHandler ) {
				$( document ).on( 'widget-synced', function( e, widget ) {
					if ( $widgetRoot.is( widget ) ) {
						formSyncHandler.apply( document, arguments );
					}
				} );
			}
		},
		onChangeActive: function ( active, args ) {
			this.container.toggleClass( 'widget-rendered', active );
			if ( args.completeCallback ) {
				args.completeCallback();
			}
		},
		_setupRemoveUI: function() {
			var self = this, $removeBtn, replaceDeleteWithRemove;
			$removeBtn = this.container.find( '.widget-control-remove' );
			$removeBtn.on( 'click', function( e ) {
				e.preventDefault();
				var $adjacentFocusTarget;
				if ( self.container.next().is( '.customize-control-widget_form' ) ) {
					$adjacentFocusTarget = self.container.next().find( '.widget-action:first' );
				} else if ( self.container.prev().is( '.customize-control-widget_form' ) ) {
					$adjacentFocusTarget = self.container.prev().find( '.widget-action:first' );
				} else {
					$adjacentFocusTarget = self.container.next( '.customize-control-sidebar_widgets' ).find( '.add-new-widget:first' );
				}
				self.container.slideUp( function() {
					var sidebarsWidgetsControl = api.Widgets.getSidebarWidgetControlContainingWidget( self.params.widget_id ),
						sidebarWidgetIds, i;
					if ( ! sidebarsWidgetsControl ) {
						return;
					}
					sidebarWidgetIds = sidebarsWidgetsControl.setting().slice();
					i = _.indexOf( sidebarWidgetIds, self.params.widget_id );
					if ( -1 === i ) {
						return;
					}
					sidebarWidgetIds.splice( i, 1 );
					sidebarsWidgetsControl.setting( sidebarWidgetIds );
					$adjacentFocusTarget.focus(); 
				} );
			} );
			replaceDeleteWithRemove = function() {
				$removeBtn.text( l10n.removeBtnLabel ); 
				$removeBtn.attr( 'title', l10n.removeBtnTooltip );
			};
			if ( this.params.is_new ) {
				api.bind( 'saved', replaceDeleteWithRemove );
			} else {
				replaceDeleteWithRemove();
			}
		},
		_getInputs: function( container ) {
			return $( container ).find( ':input[name]' );
		},
		_getInputsSignature: function( inputs ) {
			var inputsSignatures = _( inputs ).map( function( input ) {
				var $input = $( input ), signatureParts;
				if ( $input.is( ':checkbox, :radio' ) ) {
					signatureParts = [ $input.attr( 'id' ), $input.attr( 'name' ), $input.prop( 'value' ) ];
				} else {
					signatureParts = [ $input.attr( 'id' ), $input.attr( 'name' ) ];
				}
				return signatureParts.join( ',' );
			} );
			return inputsSignatures.join( ';' );
		},
		_getInputState: function( input ) {
			input = $( input );
			if ( input.is( ':radio, :checkbox' ) ) {
				return input.prop( 'checked' );
			} else if ( input.is( 'select[multiple]' ) ) {
				return input.find( 'option:selected' ).map( function () {
					return $( this ).val();
				} ).get();
			} else {
				return input.val();
			}
		},
		_setInputState: function ( input, state ) {
			input = $( input );
			if ( input.is( ':radio, :checkbox' ) ) {
				input.prop( 'checked', state );
			} else if ( input.is( 'select[multiple]' ) ) {
				if ( ! $.isArray( state ) ) {
					state = [];
				} else {
					state = _.map( state, function ( value ) {
						return String( value );
					} );
				}
				input.find( 'option' ).each( function () {
					$( this ).prop( 'selected', -1 !== _.indexOf( state, String( this.value ) ) );
				} );
			} else {
				input.val( state );
			}
		},
		getSidebarWidgetsControl: function() {
			var settingId, sidebarWidgetsControl;
			settingId = 'sidebars_widgets[' + this.params.sidebar_id + ']';
			sidebarWidgetsControl = api.control( settingId );
			if ( ! sidebarWidgetsControl ) {
				return;
			}
			return sidebarWidgetsControl;
		},
		updateWidget: function( args ) {
			var self = this, instanceOverride, completeCallback, $widgetRoot, $widgetContent,
				updateNumber, params, data, $inputs, processing, jqxhr, isChanged;
			self.embedWidgetContent();
			args = $.extend( {
				instance: null,
				complete: null,
				ignoreActiveElement: false
			}, args );
			instanceOverride = args.instance;
			completeCallback = args.complete;
			this._updateCount += 1;
			updateNumber = this._updateCount;
			$widgetRoot = this.container.find( '.widget:first' );
			$widgetContent = $widgetRoot.find( '.widget-content:first' );
			$widgetContent.find( '.widget-error' ).remove();
			this.container.addClass( 'widget-form-loading' );
			this.container.addClass( 'previewer-loading' );
			processing = api.state( 'processing' );
			processing( processing() + 1 );
			if ( ! this.liveUpdateMode ) {
				this.container.addClass( 'widget-form-disabled' );
			}
			params = {};
			params.action = 'update-widget';
			params.wp_customize = 'on';
			params.nonce = api.settings.nonce['update-widget'];
			params.customize_theme = api.settings.theme.stylesheet;
			params.customized = wp.customize.previewer.query().customized;
			data = $.param( params );
			$inputs = this._getInputs( $widgetContent );
			$inputs.each( function() {
				$( this ).data( 'state' + updateNumber, self._getInputState( this ) );
			} );
			if ( instanceOverride ) {
				data += '&' + $.param( { 'sanitized_widget_setting': JSON.stringify( instanceOverride ) } );
			} else {
				data += '&' + $inputs.serialize();
			}
			data += '&' + $widgetContent.find( '~ :input' ).serialize();
			if ( this._previousUpdateRequest ) {
				this._previousUpdateRequest.abort();
			}
			jqxhr = $.post( wp.ajax.settings.url, data );
			this._previousUpdateRequest = jqxhr;
			jqxhr.done( function( r ) {
				var message, sanitizedForm,	$sanitizedInputs, hasSameInputsInResponse,
					isLiveUpdateAborted = false;
				if ( '0' === r ) {
					api.previewer.preview.iframe.hide();
					api.previewer.login().done( function() {
						self.updateWidget( args );
						api.previewer.preview.iframe.show();
					} );
					return;
				}
				if ( '-1' === r ) {
					api.previewer.cheatin();
					return;
				}
				if ( r.success ) {
					sanitizedForm = $( '<div>' + r.data.form + '</div>' );
					$sanitizedInputs = self._getInputs( sanitizedForm );
					hasSameInputsInResponse = self._getInputsSignature( $inputs ) === self._getInputsSignature( $sanitizedInputs );
					if ( hasSameInputsInResponse && ! self.liveUpdateMode ) {
						self.liveUpdateMode = true;
						self.container.removeClass( 'widget-form-disabled' );
						self.container.find( 'input[name="savewidget"]' ).hide();
					}
					if ( hasSameInputsInResponse && self.liveUpdateMode ) {
						$inputs.each( function( i ) {
							var $input = $( this ),
								$sanitizedInput = $( $sanitizedInputs[i] ),
								submittedState, sanitizedState,	canUpdateState;
							submittedState = $input.data( 'state' + updateNumber );
							sanitizedState = self._getInputState( $sanitizedInput );
							$input.data( 'sanitized', sanitizedState );
							canUpdateState = ( ! _.isEqual( submittedState, sanitizedState ) && ( args.ignoreActiveElement || ! $input.is( document.activeElement ) ) );
							if ( canUpdateState ) {
								self._setInputState( $input, sanitizedState );
							}
						} );
						$( document ).trigger( 'widget-synced', [ $widgetRoot, r.data.form ] );
					} else if ( self.liveUpdateMode ) {
						self.liveUpdateMode = false;
						self.container.find( 'input[name="savewidget"]' ).show();
						isLiveUpdateAborted = true;
					} else {
						$widgetContent.html( r.data.form );
						self.container.removeClass( 'widget-form-disabled' );
						$( document ).trigger( 'widget-updated', [ $widgetRoot ] );
					}
					isChanged = ! isLiveUpdateAborted && ! _( self.setting() ).isEqual( r.data.instance );
					if ( isChanged ) {
						self.isWidgetUpdating = true; 
						self.setting( r.data.instance );
						self.isWidgetUpdating = false;
					} else {
						self.container.removeClass( 'previewer-loading' );
					}
					if ( completeCallback ) {
						completeCallback.call( self, null, { noChange: ! isChanged, ajaxFinished: true } );
					}
				} else {
					message = l10n.error;
					if ( r.data && r.data.message ) {
						message = r.data.message;
					}
					if ( completeCallback ) {
						completeCallback.call( self, message );
					} else {
						$widgetContent.prepend( '<p class="widget-error"><strong>' + message + '</strong></p>' );
					}
				}
			} );
			jqxhr.fail( function( jqXHR, textStatus ) {
				if ( completeCallback ) {
					completeCallback.call( self, textStatus );
				}
			} );
			jqxhr.always( function() {
				self.container.removeClass( 'widget-form-loading' );
				$inputs.each( function() {
					$( this ).removeData( 'state' + updateNumber );
				} );
				processing( processing() - 1 );
			} );
		},
		expandControlSection: function() {
			api.Control.prototype.expand.call( this );
		},
		_toggleExpanded: api.Section.prototype._toggleExpanded,
		expand: api.Section.prototype.expand,
		expandForm: function() {
			this.expand();
		},
		collapse: api.Section.prototype.collapse,
		collapseForm: function() {
			this.collapse();
		},
		toggleForm: function( showOrHide ) {
			if ( typeof showOrHide === 'undefined' ) {
				showOrHide = ! this.expanded();
			}
			this.expanded( showOrHide );
		},
		onChangeExpanded: function ( expanded, args ) {
			var self = this, $widget, $inside, complete, prevComplete, expandControl, $toggleBtn;
			self.embedWidgetControl(); 
			if ( expanded ) {
				self.embedWidgetContent();
			}
			if ( args.unchanged ) {
				if ( expanded ) {
					api.Control.prototype.expand.call( self, {
						completeCallback:  args.completeCallback
					});
				}
				return;
			}
			$widget = this.container.find( 'div.widget:first' );
			$inside = $widget.find( '.widget-inside:first' );
			$toggleBtn = this.container.find( '.widget-top button.widget-action' );
			expandControl = function() {
				api.control.each( function( otherControl ) {
					if ( self.params.type === otherControl.params.type && self !== otherControl ) {
						otherControl.collapse();
					}
				} );
				complete = function() {
					self.container.removeClass( 'expanding' );
					self.container.addClass( 'expanded' );
					$widget.addClass( 'open' );
					$toggleBtn.attr( 'aria-expanded', 'true' );
					self.container.trigger( 'expanded' );
				};
				if ( args.completeCallback ) {
					prevComplete = complete;
					complete = function () {
						prevComplete();
						args.completeCallback();
					};
				}
				if ( self.params.is_wide ) {
					$inside.fadeIn( args.duration, complete );
				} else {
					$inside.slideDown( args.duration, complete );
				}
				self.container.trigger( 'expand' );
				self.container.addClass( 'expanding' );
			};
			if ( expanded ) {
				if ( api.section.has( self.section() ) ) {
					api.section( self.section() ).expand( {
						completeCallback: expandControl
					} );
				} else {
					expandControl();
				}
			} else {
				complete = function() {
					self.container.removeClass( 'collapsing' );
					self.container.removeClass( 'expanded' );
					$widget.removeClass( 'open' );
					$toggleBtn.attr( 'aria-expanded', 'false' );
					self.container.trigger( 'collapsed' );
				};
				if ( args.completeCallback ) {
					prevComplete = complete;
					complete = function () {
						prevComplete();
						args.completeCallback();
					};
				}
				self.container.trigger( 'collapse' );
				self.container.addClass( 'collapsing' );
				if ( self.params.is_wide ) {
					$inside.fadeOut( args.duration, complete );
				} else {
					$inside.slideUp( args.duration, function() {
						$widget.css( { width:'', margin:'' } );
						complete();
					} );
				}
			}
		},
		getWidgetSidebarPosition: function() {
			var sidebarWidgetIds, position;
			sidebarWidgetIds = this.getSidebarWidgetsControl().setting();
			position = _.indexOf( sidebarWidgetIds, this.params.widget_id );
			if ( position === -1 ) {
				return;
			}
			return position;
		},
		moveUp: function() {
			this._moveWidgetByOne( -1 );
		},
		moveDown: function() {
			this._moveWidgetByOne( 1 );
		},
		_moveWidgetByOne: function( offset ) {
			var i, sidebarWidgetsSetting, sidebarWidgetIds,	adjacentWidgetId;
			i = this.getWidgetSidebarPosition();
			sidebarWidgetsSetting = this.getSidebarWidgetsControl().setting;
			sidebarWidgetIds = Array.prototype.slice.call( sidebarWidgetsSetting() ); 
			adjacentWidgetId = sidebarWidgetIds[i + offset];
			sidebarWidgetIds[i + offset] = this.params.widget_id;
			sidebarWidgetIds[i] = adjacentWidgetId;
			sidebarWidgetsSetting( sidebarWidgetIds );
		},
		toggleWidgetMoveArea: function( showOrHide ) {
			var self = this, $moveWidgetArea;
			$moveWidgetArea = this.container.find( '.move-widget-area' );
			if ( typeof showOrHide === 'undefined' ) {
				showOrHide = ! $moveWidgetArea.hasClass( 'active' );
			}
			if ( showOrHide ) {
				$moveWidgetArea.find( '.selected' ).removeClass( 'selected' );
				$moveWidgetArea.find( 'li' ).filter( function() {
					return $( this ).data( 'id' ) === self.params.sidebar_id;
				} ).addClass( 'selected' );
				this.container.find( '.move-widget-btn' ).prop( 'disabled', true );
			}
			$moveWidgetArea.toggleClass( 'active', showOrHide );
		},
		highlightSectionAndControl: function() {
			var $target;
			if ( this.container.is( ':hidden' ) ) {
				$target = this.container.closest( '.control-section' );
			} else {
				$target = this.container;
			}
			$( '.highlighted' ).removeClass( 'highlighted' );
			$target.addClass( 'highlighted' );
			setTimeout( function() {
				$target.removeClass( 'highlighted' );
			}, 500 );
		}
	} );
	api.Widgets.WidgetsPanel = api.Panel.extend({
		ready: function () {
			var panel = this;
			api.Panel.prototype.ready.call( panel );
			panel.deferred.embedded.done(function() {
				var panelMetaContainer, noticeContainer, updateNotice, getActiveSectionCount, shouldShowNotice;
				panelMetaContainer = panel.container.find( '.panel-meta' );
				noticeContainer = $( '<div></div>', {
					'class': 'no-widget-areas-rendered-notice'
				});
				panelMetaContainer.append( noticeContainer );
				getActiveSectionCount = function() {
					return _.filter( panel.sections(), function( section ) {
						return section.active();
					} ).length;
				};
				shouldShowNotice = function() {
					var activeSectionCount = getActiveSectionCount();
					if ( 0 === activeSectionCount ) {
						return true;
					} else {
						return activeSectionCount !== api.Widgets.data.registeredSidebars.length;
					}
				};
				updateNotice = function() {
					var activeSectionCount = getActiveSectionCount(), someRenderedMessage, nonRenderedAreaCount, registeredAreaCount;
					noticeContainer.empty();
					registeredAreaCount = api.Widgets.data.registeredSidebars.length;
					if ( activeSectionCount !== registeredAreaCount ) {
						if ( 0 !== activeSectionCount ) {
							nonRenderedAreaCount = registeredAreaCount - activeSectionCount;
							someRenderedMessage = l10n.someAreasShown[ nonRenderedAreaCount ];
						} else {
							someRenderedMessage = l10n.noAreasShown;
						}
						if ( someRenderedMessage ) {
							noticeContainer.append( $( '<p></p>', {
								text: someRenderedMessage
							} ) );
						}
						noticeContainer.append( $( '<p></p>', {
							text: l10n.navigatePreview
						} ) );
					}
				};
				updateNotice();
				noticeContainer.toggle( shouldShowNotice() );
				api.previewer.deferred.active.done( function () {
					noticeContainer.toggle( shouldShowNotice() );
				});
				api.bind( 'pane-contents-reflowed', function() {
					var duration = ( 'resolved' === api.previewer.deferred.active.state() ) ? 'fast' : 0;
					updateNotice();
					if ( shouldShowNotice() ) {
						noticeContainer.slideDown( duration );
					} else {
						noticeContainer.slideUp( duration );
					}
				});
			});
		},
		isContextuallyActive: function() {
			var panel = this;
			return panel.active();
		}
	});
	api.Widgets.SidebarSection = api.Section.extend({
		ready: function () {
			var section = this, registeredSidebar;
			api.Section.prototype.ready.call( this );
			registeredSidebar = api.Widgets.registeredSidebars.get( section.params.sidebarId );
			section.active.bind( function ( active ) {
				registeredSidebar.set( 'is_rendered', active );
			});
			registeredSidebar.set( 'is_rendered', section.active() );
		}
	});
	api.Widgets.SidebarControl = api.Control.extend({
		ready: function() {
			this.$controlSection = this.container.closest( '.control-section' );
			this.$sectionContent = this.container.closest( '.accordion-section-content' );
			this._setupModel();
			this._setupSortable();
			this._setupAddition();
			this._applyCardinalOrderClassNames();
		},
		_setupModel: function() {
			var self = this;
			this.setting.bind( function( newWidgetIds, oldWidgetIds ) {
				var widgetFormControls, removedWidgetIds, priority;
				removedWidgetIds = _( oldWidgetIds ).difference( newWidgetIds );
				newWidgetIds = _( newWidgetIds ).filter( function( newWidgetId ) {
					var parsedWidgetId = parseWidgetId( newWidgetId );
					return !! api.Widgets.availableWidgets.findWhere( { id_base: parsedWidgetId.id_base } );
				} );
				widgetFormControls = _( newWidgetIds ).map( function( widgetId ) {
					var widgetFormControl = api.Widgets.getWidgetFormControlForWidget( widgetId );
					if ( ! widgetFormControl ) {
						widgetFormControl = self.addWidget( widgetId );
					}
					return widgetFormControl;
				} );
				widgetFormControls.sort( function( a, b ) {
					var aIndex = _.indexOf( newWidgetIds, a.params.widget_id ),
						bIndex = _.indexOf( newWidgetIds, b.params.widget_id );
					return aIndex - bIndex;
				});
				priority = 0;
				_( widgetFormControls ).each( function ( control ) {
					control.priority( priority );
					control.section( self.section() );
					priority += 1;
				});
				self.priority( priority ); 
				self._applyCardinalOrderClassNames();
				_( widgetFormControls ).each( function( widgetFormControl ) {
					widgetFormControl.params.sidebar_id = self.params.sidebar_id;
				} );
				_( removedWidgetIds ).each( function( removedWidgetId ) {
					setTimeout( function() {
						var removedControl, wasDraggedToAnotherSidebar, inactiveWidgets, removedIdBase,
							widget, isPresentInAnotherSidebar = false;
						api.each( function( otherSetting ) {
							if ( otherSetting.id === self.setting.id || 0 !== otherSetting.id.indexOf( 'sidebars_widgets[' ) || otherSetting.id === 'sidebars_widgets[wp_inactive_widgets]' ) {
								return;
							}
							var otherSidebarWidgets = otherSetting(), i;
							i = _.indexOf( otherSidebarWidgets, removedWidgetId );
							if ( -1 !== i ) {
								isPresentInAnotherSidebar = true;
							}
						} );
						if ( isPresentInAnotherSidebar ) {
							return;
						}
						removedControl = api.Widgets.getWidgetFormControlForWidget( removedWidgetId );
						wasDraggedToAnotherSidebar = removedControl && $.contains( document, removedControl.container[0] ) && ! $.contains( self.$sectionContent[0], removedControl.container[0] );
						if ( removedControl && ! wasDraggedToAnotherSidebar ) {
							api.control.remove( removedControl.id );
							removedControl.container.remove();
						}
						if ( api.Widgets.savedWidgetIds[removedWidgetId] ) {
							inactiveWidgets = api.value( 'sidebars_widgets[wp_inactive_widgets]' )().slice();
							inactiveWidgets.push( removedWidgetId );
							api.value( 'sidebars_widgets[wp_inactive_widgets]' )( _( inactiveWidgets ).unique() );
						}
						removedIdBase = parseWidgetId( removedWidgetId ).id_base;
						widget = api.Widgets.availableWidgets.findWhere( { id_base: removedIdBase } );
						if ( widget && ! widget.get( 'is_multi' ) ) {
							widget.set( 'is_disabled', false );
						}
					} );
				} );
			} );
		},
		_setupSortable: function() {
			var self = this;
			this.isReordering = false;
			this.$sectionContent.sortable( {
				items: '> .customize-control-widget_form',
				handle: '.widget-top',
				axis: 'y',
				tolerance: 'pointer',
				connectWith: '.accordion-section-content:has(.customize-control-sidebar_widgets)',
				update: function() {
					var widgetContainerIds = self.$sectionContent.sortable( 'toArray' ), widgetIds;
					widgetIds = $.map( widgetContainerIds, function( widgetContainerId ) {
						return $( '#' + widgetContainerId ).find( ':input[name=widget-id]' ).val();
					} );
					self.setting( widgetIds );
				}
			} );
			this.$controlSection.find( '.accordion-section-title' ).droppable({
				accept: '.customize-control-widget_form',
				over: function() {
					var section = api.section( self.section.get() );
					section.expand({
						allowMultiple: true, 
						completeCallback: function () {
							api.section.each( function ( otherSection ) {
								if ( otherSection.container.find( '.customize-control-sidebar_widgets' ).length ) {
									otherSection.container.find( '.accordion-section-content:first' ).sortable( 'refreshPositions' );
								}
							} );
						}
					});
				}
			});
			this.container.find( '.reorder-toggle' ).on( 'click', function() {
				self.toggleReordering( ! self.isReordering );
			} );
		},
		_setupAddition: function() {
			var self = this;
			this.container.find( '.add-new-widget' ).on( 'click', function() {
				var addNewWidgetBtn = $( this );
				if ( self.$sectionContent.hasClass( 'reordering' ) ) {
					return;
				}
				if ( ! $( 'body' ).hasClass( 'adding-widget' ) ) {
					addNewWidgetBtn.attr( 'aria-expanded', 'true' );
					api.Widgets.availableWidgetsPanel.open( self );
				} else {
					addNewWidgetBtn.attr( 'aria-expanded', 'false' );
					api.Widgets.availableWidgetsPanel.close();
				}
			} );
		},
		_applyCardinalOrderClassNames: function() {
			var widgetControls = [];
			_.each( this.setting(), function ( widgetId ) {
				var widgetControl = api.Widgets.getWidgetFormControlForWidget( widgetId );
				if ( widgetControl ) {
					widgetControls.push( widgetControl );
				}
			});
			if ( 0 === widgetControls.length || ( 1 === api.Widgets.registeredSidebars.length && widgetControls.length <= 1 ) ) {
				this.container.find( '.reorder-toggle' ).hide();
				return;
			} else {
				this.container.find( '.reorder-toggle' ).show();
			}
			$( widgetControls ).each( function () {
				$( this.container )
					.removeClass( 'first-widget' )
					.removeClass( 'last-widget' )
					.find( '.move-widget-down, .move-widget-up' ).prop( 'tabIndex', 0 );
			});
			_.first( widgetControls ).container
				.addClass( 'first-widget' )
				.find( '.move-widget-up' ).prop( 'tabIndex', -1 );
			_.last( widgetControls ).container
				.addClass( 'last-widget' )
				.find( '.move-widget-down' ).prop( 'tabIndex', -1 );
		},
		toggleReordering: function( showOrHide ) {
			var addNewWidgetBtn = this.$sectionContent.find( '.add-new-widget' ),
				reorderBtn = this.container.find( '.reorder-toggle' ),
				widgetsTitle = this.$sectionContent.find( '.widget-title' );
			showOrHide = Boolean( showOrHide );
			if ( showOrHide === this.$sectionContent.hasClass( 'reordering' ) ) {
				return;
			}
			this.isReordering = showOrHide;
			this.$sectionContent.toggleClass( 'reordering', showOrHide );
			if ( showOrHide ) {
				_( this.getWidgetFormControls() ).each( function( formControl ) {
					formControl.collapse();
				} );
				addNewWidgetBtn.attr({ 'tabindex': '-1', 'aria-hidden': 'true' });
				reorderBtn.attr( 'aria-label', l10n.reorderLabelOff );
				wp.a11y.speak( l10n.reorderModeOn );
				widgetsTitle.attr( 'aria-hidden', 'true' );
			} else {
				addNewWidgetBtn.removeAttr( 'tabindex aria-hidden' );
				reorderBtn.attr( 'aria-label', l10n.reorderLabelOn );
				wp.a11y.speak( l10n.reorderModeOff );
				widgetsTitle.attr( 'aria-hidden', 'false' );
			}
		},
		getWidgetFormControls: function() {
			var formControls = [];
			_( this.setting() ).each( function( widgetId ) {
				var settingId = widgetIdToSettingId( widgetId ),
					formControl = api.control( settingId );
				if ( formControl ) {
					formControls.push( formControl );
				}
			} );
			return formControls;
		},
		addWidget: function( widgetId ) {
			var self = this, controlHtml, $widget, controlType = 'widget_form', controlContainer, controlConstructor,
				parsedWidgetId = parseWidgetId( widgetId ),
				widgetNumber = parsedWidgetId.number,
				widgetIdBase = parsedWidgetId.id_base,
				widget = api.Widgets.availableWidgets.findWhere( {id_base: widgetIdBase} ),
				settingId, isExistingWidget, widgetFormControl, sidebarWidgets, settingArgs, setting;
			if ( ! widget ) {
				return false;
			}
			if ( widgetNumber && ! widget.get( 'is_multi' ) ) {
				return false;
			}
			if ( widget.get( 'is_multi' ) && ! widgetNumber ) {
				widget.set( 'multi_number', widget.get( 'multi_number' ) + 1 );
				widgetNumber = widget.get( 'multi_number' );
			}
			controlHtml = $.trim( $( '#widget-tpl-' + widget.get( 'id' ) ).html() );
			if ( widget.get( 'is_multi' ) ) {
				controlHtml = controlHtml.replace( /<[^<>]+>/g, function( m ) {
					return m.replace( /__i__|%i%/g, widgetNumber );
				} );
			} else {
				widget.set( 'is_disabled', true ); 
			}
			$widget = $( controlHtml );
			controlContainer = $( '<li/>' )
				.addClass( 'customize-control' )
				.addClass( 'customize-control-' + controlType )
				.append( $widget );
			controlContainer.find( '> .widget-icon' ).remove();
			if ( widget.get( 'is_multi' ) ) {
				controlContainer.find( 'input[name="widget_number"]' ).val( widgetNumber );
				controlContainer.find( 'input[name="multi_number"]' ).val( widgetNumber );
			}
			widgetId = controlContainer.find( '[name="widget-id"]' ).val();
			controlContainer.hide(); 
			settingId = 'widget_' + widget.get( 'id_base' );
			if ( widget.get( 'is_multi' ) ) {
				settingId += '[' + widgetNumber + ']';
			}
			controlContainer.attr( 'id', 'customize-control-' + settingId.replace( /\]/g, '' ).replace( /\[/g, '-' ) );
			isExistingWidget = api.has( settingId );
			if ( ! isExistingWidget ) {
				settingArgs = {
					transport: api.Widgets.data.selectiveRefreshableWidgets[ widget.get( 'id_base' ) ] ? 'postMessage' : 'refresh',
					previewer: this.setting.previewer
				};
				setting = api.create( settingId, settingId, '', settingArgs );
				setting.set( {} ); 
			}
			controlConstructor = api.controlConstructor[controlType];
			widgetFormControl = new controlConstructor( settingId, {
				settings: {
					'default': settingId
				},
				content: controlContainer,
				sidebar_id: self.params.sidebar_id,
				widget_id: widgetId,
				widget_id_base: widget.get( 'id_base' ),
				type: controlType,
				is_new: ! isExistingWidget,
				width: widget.get( 'width' ),
				height: widget.get( 'height' ),
				is_wide: widget.get( 'is_wide' )
			} );
			api.control.add( widgetFormControl );
			api.each( function( otherSetting ) {
				if ( otherSetting.id === self.setting.id ) {
					return;
				}
				if ( 0 !== otherSetting.id.indexOf( 'sidebars_widgets[' ) ) {
					return;
				}
				var otherSidebarWidgets = otherSetting().slice(),
					i = _.indexOf( otherSidebarWidgets, widgetId );
				if ( -1 !== i ) {
					otherSidebarWidgets.splice( i );
					otherSetting( otherSidebarWidgets );
				}
			} );
			sidebarWidgets = this.setting().slice();
			if ( -1 === _.indexOf( sidebarWidgets, widgetId ) ) {
				sidebarWidgets.push( widgetId );
				this.setting( sidebarWidgets );
			}
			controlContainer.slideDown( function() {
				if ( isExistingWidget ) {
					widgetFormControl.updateWidget( {
						instance: widgetFormControl.setting()
					} );
				}
			} );
			return widgetFormControl;
		}
	} );
	$.extend( api.panelConstructor, {
		widgets: api.Widgets.WidgetsPanel
	});
	$.extend( api.sectionConstructor, {
		sidebar: api.Widgets.SidebarSection
	});
	$.extend( api.controlConstructor, {
		widget_form: api.Widgets.WidgetControl,
		sidebar_widgets: api.Widgets.SidebarControl
	});
	api.bind( 'ready', function() {
		api.Widgets.availableWidgetsPanel = new api.Widgets.AvailableWidgetsPanelView({
			collection: api.Widgets.availableWidgets
		});
		api.previewer.bind( 'highlight-widget-control', api.Widgets.highlightWidgetFormControl );
		api.previewer.bind( 'focus-widget-control', api.Widgets.focusWidgetFormControl );
	} );
	api.Widgets.highlightWidgetFormControl = function( widgetId ) {
		var control = api.Widgets.getWidgetFormControlForWidget( widgetId );
		if ( control ) {
			control.highlightSectionAndControl();
		}
	},
	api.Widgets.focusWidgetFormControl = function( widgetId ) {
		var control = api.Widgets.getWidgetFormControlForWidget( widgetId );
		if ( control ) {
			control.focus();
		}
	},
	api.Widgets.getSidebarWidgetControlContainingWidget = function( widgetId ) {
		var foundControl = null;
		api.control.each( function( control ) {
			if ( control.params.type === 'sidebar_widgets' && -1 !== _.indexOf( control.setting(), widgetId ) ) {
				foundControl = control;
			}
		} );
		return foundControl;
	};
	api.Widgets.getWidgetFormControlForWidget = function( widgetId ) {
		var foundControl = null;
		api.control.each( function( control ) {
			if ( control.params.type === 'widget_form' && control.params.widget_id === widgetId ) {
				foundControl = control;
			}
		} );
		return foundControl;
	};
	$( document ).on( 'widget-added', function( event, widgetContainer ) {
		var parsedWidgetId, widgetControl, navMenuSelect, editMenuButton;
		parsedWidgetId = parseWidgetId( widgetContainer.find( '> .widget-inside > .form > .widget-id' ).val() );
		if ( 'nav_menu' !== parsedWidgetId.id_base ) {
			return;
		}
		widgetControl = api.control( 'widget_nav_menu[' + String( parsedWidgetId.number ) + ']' );
		if ( ! widgetControl ) {
			return;
		}
		navMenuSelect = widgetContainer.find( 'select[name*="nav_menu"]' );
		editMenuButton = widgetContainer.find( '.edit-selected-nav-menu > button' );
		if ( 0 === navMenuSelect.length || 0 === editMenuButton.length ) {
			return;
		}
		navMenuSelect.on( 'change', function() {
			if ( api.section.has( 'nav_menu[' + navMenuSelect.val() + ']' ) ) {
				editMenuButton.parent().show();
			} else {
				editMenuButton.parent().hide();
			}
		});
		editMenuButton.on( 'click', function() {
			var section = api.section( 'nav_menu[' + navMenuSelect.val() + ']' );
			if ( section ) {
				focusConstructWithBreadcrumb( section, widgetControl );
			}
		} );
	} );
	function focusConstructWithBreadcrumb( focusConstruct, returnConstruct ) {
		focusConstruct.focus();
		function onceCollapsed( isExpanded ) {
			if ( ! isExpanded ) {
				focusConstruct.expanded.unbind( onceCollapsed );
				returnConstruct.focus();
			}
		}
		focusConstruct.expanded.bind( onceCollapsed );
	}
	function parseWidgetId( widgetId ) {
		var matches, parsed = {
			number: null,
			id_base: null
		};
		matches = widgetId.match( /^(.+)-(\d+)$/ );
		if ( matches ) {
			parsed.id_base = matches[1];
			parsed.number = parseInt( matches[2], 10 );
		} else {
			parsed.id_base = widgetId;
		}
		return parsed;
	}
	function widgetIdToSettingId( widgetId ) {
		var parsed = parseWidgetId( widgetId ), settingId;
		settingId = 'widget_' + parsed.id_base;
		if ( parsed.number ) {
			settingId += '[' + parsed.number + ']';
		}
		return settingId;
	}
})( window.wp, jQuery );
