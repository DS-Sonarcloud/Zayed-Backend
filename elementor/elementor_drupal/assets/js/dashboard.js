
var ajaxWidgets, ajaxPopulateWidgets, quickPressLoad;
window.wp = window.wp || {};
jQuery(document).ready( function($) {
	var welcomePanel = $( '#welcome-panel' ),
		welcomePanelHide = $('#wp_welcome_panel-hide'),
		updateWelcomePanel;
	updateWelcomePanel = function( visible ) {
		$.post( ajaxurl, {
			action: 'update-welcome-panel',
			visible: visible,
			welcomepanelnonce: $( '#welcomepanelnonce' ).val()
		});
	};
	if ( welcomePanel.hasClass('hidden') && welcomePanelHide.prop('checked') ) {
		welcomePanel.removeClass('hidden');
	}
	$('.welcome-panel-close, .welcome-panel-dismiss a', welcomePanel).click( function(e) {
		e.preventDefault();
		welcomePanel.addClass('hidden');
		updateWelcomePanel( 0 );
		$('#wp_welcome_panel-hide').prop('checked', false);
	});
	welcomePanelHide.click( function() {
		welcomePanel.toggleClass('hidden', ! this.checked );
		updateWelcomePanel( this.checked ? 1 : 0 );
	});
	ajaxWidgets = ['dashboard_primary'];
	ajaxPopulateWidgets = function(el) {
		function show(i, id) {
			var p, e = $('#' + id + ' div.inside:visible').find('.widget-loading');
			if ( e.length ) {
				p = e.parent();
				setTimeout( function(){
					p.load( ajaxurl + '?action=dashboard-widgets&widget=' + id + '&pagenow=' + pagenow, '', function() {
						p.hide().slideDown('normal', function(){
							$(this).css('display', '');
						});
					});
				}, i * 500 );
			}
		}
		if ( el ) {
			el = el.toString();
			if ( $.inArray(el, ajaxWidgets) !== -1 ) {
				show(0, el);
			}
		} else {
			$.each( ajaxWidgets, show );
		}
	};
	ajaxPopulateWidgets();
	postboxes.add_postbox_toggles(pagenow, { pbshow: ajaxPopulateWidgets } );
	quickPressLoad = function() {
		var act = $('#quickpost-action'), t;
		$( '#quick-press .submit input[type="submit"], #quick-press .submit input[type="reset"]' ).prop( 'disabled' , false );
		t = $('#quick-press').submit( function( e ) {
			e.preventDefault();
			$('#dashboard_quick_press #publishing-action .spinner').show();
			$('#quick-press .submit input[type="submit"], #quick-press .submit input[type="reset"]').prop('disabled', true);
			$.post( t.attr( 'action' ), t.serializeArray(), function( data ) {
				$('#dashboard_quick_press .inside').html( data );
				$('#quick-press').removeClass('initial-form');
				quickPressLoad();
				highlightLatestPost();
				$('#title').focus();
			});
			function highlightLatestPost () {
				var latestPost = $('.drafts ul li').first();
				latestPost.css('background', '#fffbe5');
				setTimeout(function () {
					latestPost.css('background', 'none');
				}, 1000);
			}
		} );
		$('#publish').click( function() { act.val( 'post-quickpress-publish' ); } );
		$('#title, #tags-input, #content').each( function() {
			var input = $(this), prompt = $('#' + this.id + '-prompt-text');
			if ( '' === this.value ) {
				prompt.removeClass('screen-reader-text');
			}
			prompt.click( function() {
				$(this).addClass('screen-reader-text');
				input.focus();
			});
			input.blur( function() {
				if ( '' === this.value ) {
					prompt.removeClass('screen-reader-text');
				}
			});
			input.focus( function() {
				prompt.addClass('screen-reader-text');
			});
		});
		$('#quick-press').on( 'click focusin', function() {
			wpActiveEditor = 'content';
		});
		autoResizeTextarea();
	};
	quickPressLoad();
	$( '.meta-box-sortables' ).sortable( 'option', 'containment', '#wpwrap' );
	function autoResizeTextarea() {
		if ( document.documentMode && document.documentMode < 9 ) {
			return;
		}
		$('body').append( '<div class="quick-draft-textarea-clone" style="display: none;"></div>' );
		var clone = $('.quick-draft-textarea-clone'),
			editor = $('#content'),
			editorHeight = editor.height(),
			editorMaxHeight = $(window).height() - 100;
		clone.css({
			'font-family': editor.css('font-family'),
			'font-size':   editor.css('font-size'),
			'line-height': editor.css('line-height'),
			'padding-bottom': editor.css('paddingBottom'),
			'padding-left': editor.css('paddingLeft'),
			'padding-right': editor.css('paddingRight'),
			'padding-top': editor.css('paddingTop'),
			'white-space': 'pre-wrap',
			'word-wrap': 'break-word',
			'display': 'none'
		});
		editor.on('focus input propertychange', function() {
			var $this = $(this),
				textareaContent = $this.val() + '&nbsp;',
				cloneHeight = clone.css('width', $this.css('width')).text(textareaContent).outerHeight() + 2;
			editor.css('overflow-y', 'auto');
			if ( cloneHeight === editorHeight || ( cloneHeight >= editorMaxHeight && editorHeight >= editorMaxHeight ) ) {
				return;
			}
			if ( cloneHeight > editorMaxHeight ) {
				editorHeight = editorMaxHeight;
			} else {
				editorHeight = cloneHeight;
			}
			editor.css('overflow', 'hidden');
			$this.css('height', editorHeight + 'px');
		});
	}
} );
jQuery( function( $ ) {
	'use strict';
	var communityEventsData = window.communityEventsData || {},
		app;
	app = window.wp.communityEvents = {
		initialized: false,
		model: null,
		init: function() {
			if ( app.initialized ) {
				return;
			}
			var $container = $( '#community-events' );
			$( '.community-events-errors' )
				.attr( 'aria-hidden', 'true' )
				.removeClass( 'hide-if-js' );
			$container.on( 'click', '.community-events-toggle-location, .community-events-cancel', app.toggleLocationForm );
			$container.on( 'submit', '.community-events-form', function( event ) {
				var location = $.trim( $( '#community-events-location' ).val() );
				event.preventDefault();
				if ( ! location ) {
					return;
				}
				app.getEvents({
					location: location
				});
			});
			if ( communityEventsData && communityEventsData.cache && communityEventsData.cache.location && communityEventsData.cache.events ) {
				app.renderEventsTemplate( communityEventsData.cache, 'app' );
			} else {
				app.getEvents();
			}
			app.initialized = true;
		},
		toggleLocationForm: function( action ) {
			var $toggleButton = $( '.community-events-toggle-location' ),
				$cancelButton = $( '.community-events-cancel' ),
				$form         = $( '.community-events-form' ),
				$target       = $();
			if ( 'object' === typeof action ) {
				$target = $( action.target );
				action = 'true' == $toggleButton.attr( 'aria-expanded' ) ? 'hide' : 'show';
			}
			if ( 'hide' === action ) {
				$toggleButton.attr( 'aria-expanded', 'false' );
				$cancelButton.attr( 'aria-expanded', 'false' );
				$form.attr( 'aria-hidden', 'true' );
				if ( $target.hasClass( 'community-events-cancel' ) ) {
					$toggleButton.focus();
				}
			} else {
				$toggleButton.attr( 'aria-expanded', 'true' );
				$cancelButton.attr( 'aria-expanded', 'true' );
				$form.attr( 'aria-hidden', 'false' );
			}
		},
		getEvents: function( requestParams ) {
			var initiatedBy,
				app = this,
				$spinner = $( '.community-events-form' ).children( '.spinner' );
			requestParams          = requestParams || {};
			requestParams._wpnonce = communityEventsData.nonce;
			requestParams.timezone = window.Intl ? window.Intl.DateTimeFormat().resolvedOptions().timeZone : '';
			initiatedBy = requestParams.location ? 'user' : 'app';
			$spinner.addClass( 'is-active' );
			wp.ajax.post( 'get-community-events', requestParams )
				.always( function() {
					$spinner.removeClass( 'is-active' );
				})
				.done( function( response ) {
					if ( 'no_location_available' === response.error ) {
						if ( requestParams.location ) {
							response.unknownCity = requestParams.location;
						} else {
							delete response.error;
						}
					}
					app.renderEventsTemplate( response, initiatedBy );
				})
				.fail( function() {
					app.renderEventsTemplate({
						'location' : false,
						'error'    : true
					}, initiatedBy );
				});
		},
		renderEventsTemplate: function( templateParams, initiatedBy ) {
			var template,
				elementVisibility,
				l10nPlaceholder  = /%(?:\d\$)?s/g, 
				$toggleButton    = $( '.community-events-toggle-location' ),
				$locationMessage = $( '#community-events-location-message' ),
				$results         = $( '.community-events-results' );
			elementVisibility = {
				'.community-events'                  : true,
				'.community-events-loading'          : false,
				'.community-events-errors'           : false,
				'.community-events-error-occurred'   : false,
				'.community-events-could-not-locate' : false,
				'#community-events-location-message' : false,
				'.community-events-toggle-location'  : false,
				'.community-events-results'          : false
			};
			if ( templateParams.location.ip ) {
				$locationMessage.text( communityEventsData.l10n.attend_event_near_generic );
				if ( templateParams.events.length ) {
					template = wp.template( 'community-events-event-list' );
					$results.html( template( templateParams ) );
				} else {
					template = wp.template( 'community-events-no-upcoming-events' );
					$results.html( template( templateParams ) );
				}
				elementVisibility['#community-events-location-message'] = true;
				elementVisibility['.community-events-toggle-location']  = true;
				elementVisibility['.community-events-results']          = true;
			} else if ( templateParams.location.description ) {
				template = wp.template( 'community-events-attend-event-near' );
				$locationMessage.html( template( templateParams ) );
				if ( templateParams.events.length ) {
					template = wp.template( 'community-events-event-list' );
					$results.html( template( templateParams ) );
				} else {
					template = wp.template( 'community-events-no-upcoming-events' );
					$results.html( template( templateParams ) );
				}
				if ( 'user' === initiatedBy ) {
					wp.a11y.speak( communityEventsData.l10n.city_updated.replace( l10nPlaceholder, templateParams.location.description ), 'assertive' );
				}
				elementVisibility['#community-events-location-message'] = true;
				elementVisibility['.community-events-toggle-location']  = true;
				elementVisibility['.community-events-results']          = true;
			} else if ( templateParams.unknownCity ) {
				template = wp.template( 'community-events-could-not-locate' );
				$( '.community-events-could-not-locate' ).html( template( templateParams ) );
				wp.a11y.speak( communityEventsData.l10n.could_not_locate_city.replace( l10nPlaceholder, templateParams.unknownCity ) );
				elementVisibility['.community-events-errors']           = true;
				elementVisibility['.community-events-could-not-locate'] = true;
			} else if ( templateParams.error && 'user' === initiatedBy ) {
				wp.a11y.speak( communityEventsData.l10n.error_occurred_please_try_again );
				elementVisibility['.community-events-errors']         = true;
				elementVisibility['.community-events-error-occurred'] = true;
			} else {
				$locationMessage.text( communityEventsData.l10n.enter_closest_city );
				elementVisibility['#community-events-location-message'] = true;
				elementVisibility['.community-events-toggle-location']  = true;
			}
			_.each( elementVisibility, function( isVisible, element ) {
				$( element ).attr( 'aria-hidden', ! isVisible );
			});
			$toggleButton.attr( 'aria-expanded', elementVisibility['.community-events-toggle-location'] );
			if ( templateParams.location && ( templateParams.location.ip || templateParams.location.latitude ) ) {
				app.toggleLocationForm( 'hide' );
				if ( 'user' === initiatedBy ) {
					$toggleButton.focus();
				}
			} else {
				app.toggleLocationForm( 'show' );
			}
		}
	};
	if ( $( '#dashboard_primary' ).is( ':visible' ) ) {
		app.init();
	} else {
		$( document ).on( 'postbox-toggled', function( event, postbox ) {
			var $postbox = $( postbox );
			if ( 'dashboard_primary' === $postbox.attr( 'id' ) && $postbox.is( ':visible' ) ) {
				app.init();
			}
		});
	}
});
