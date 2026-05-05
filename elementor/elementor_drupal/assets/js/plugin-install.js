
var tb_position;
jQuery( document ).ready( function( $ ) {
	var tbWindow,
		$iframeBody,
		$tabbables,
		$firstTabbable,
		$lastTabbable,
		$focusedBefore = $(),
		$uploadViewToggle = $( '.upload-view-toggle' ),
		$wrap = $ ( '.wrap' ),
		$body = $( document.body );
	tb_position = function() {
		var width = $( window ).width(),
			H = $( window ).height() - ( ( 792 < width ) ? 60 : 20 ),
			W = ( 792 < width ) ? 772 : width - 20;
		tbWindow = $( '#TB_window' );
		if ( tbWindow.length ) {
			tbWindow.width( W ).height( H );
			$( '#TB_iframeContent' ).width( W ).height( H );
			tbWindow.css({
				'margin-left': '-' + parseInt( ( W / 2 ), 10 ) + 'px'
			});
			if ( typeof document.body.style.maxWidth !== 'undefined' ) {
				tbWindow.css({
					'top': '30px',
					'margin-top': '0'
				});
			}
		}
		return $( 'a.thickbox' ).each( function() {
			var href = $( this ).attr( 'href' );
			if ( ! href ) {
				return;
			}
			href = href.replace( /&width=[0-9]+/g, '' );
			href = href.replace( /&height=[0-9]+/g, '' );
			$(this).attr( 'href', href + '&width=' + W + '&height=' + ( H ) );
		});
	};
	$( window ).resize( function() {
		tb_position();
	});
	$body
		.on( 'thickbox:iframe:loaded', tbWindow, function() {
			if ( ! tbWindow.hasClass( 'plugin-details-modal' ) ) {
				return;
			}
			iframeLoaded();
		})
		.on( 'thickbox:removed', function() {
			$focusedBefore.focus();
		});
	function iframeLoaded() {
		var $iframe = tbWindow.find( '#TB_iframeContent' );
		$iframeBody = $iframe.contents().find( 'body' );
		handleTabbables();
		$firstTabbable.focus();
		$( '#plugin-information-tabs a', $iframeBody ).on( 'click', function() {
			handleTabbables();
		});
		$iframeBody.on( 'keydown', function( event ) {
			if ( 27 !== event.which ) {
				return;
			}
			tb_remove();
		});
	}
	function handleTabbables() {
		var $firstAndLast;
		$tabbables = $( ':tabbable', $iframeBody );
		$firstTabbable = tbWindow.find( '#TB_closeWindowButton' );
		$lastTabbable = $tabbables.last();
		$firstAndLast = $firstTabbable.add( $lastTabbable );
		$firstAndLast.off( 'keydown.wp-plugin-details' );
		$firstAndLast.on( 'keydown.wp-plugin-details', function( event ) {
			constrainTabbing( event );
		});
	}
	function constrainTabbing( event ) {
		if ( 9 !== event.which ) {
			return;
		}
		if ( $lastTabbable[0] === event.target && ! event.shiftKey ) {
			event.preventDefault();
			$firstTabbable.focus();
		} else if ( $firstTabbable[0] === event.target && event.shiftKey ) {
			event.preventDefault();
			$lastTabbable.focus();
		}
	}
	$( '.wrap' ).on( 'click', '.thickbox.open-plugin-details-modal', function( e ) {
		var title = $( this ).data( 'title' ) ? plugininstallL10n.plugin_information + ' ' + $( this ).data( 'title' ) : plugininstallL10n.plugin_modal_label;
		e.preventDefault();
		e.stopPropagation();
		$focusedBefore = $( this );
		tb_click.call(this);
		tbWindow
			.attr({
				'role': 'dialog',
				'aria-label': plugininstallL10n.plugin_modal_label
			})
			.addClass( 'plugin-details-modal' );
		tbWindow.find( '#TB_iframeContent' ).attr( 'title', title );
	});
	$( '#plugin-information-tabs a' ).click( function( event ) {
		var tab = $( this ).attr( 'name' );
		event.preventDefault();
		$( '#plugin-information-tabs a.current' ).removeClass( 'current' );
		$( this ).addClass( 'current' );
		if ( 'description' !== tab && $( window ).width() < 772 ) {
			$( '#plugin-information-content' ).find( '.fyi' ).hide();
		} else {
			$( '#plugin-information-content' ).find( '.fyi' ).show();
		}
		$( '#section-holder div.section' ).hide(); 
		$( '#section-' + tab ).show();
	});
	if ( ! $wrap.hasClass( 'plugin-install-tab-upload' ) ) {
		$uploadViewToggle
			.attr({
				role: 'button',
				'aria-expanded': 'false'
			})
			.on( 'click', function( event ) {
				event.preventDefault();
				$body.toggleClass( 'show-upload-view' );
				$uploadViewToggle.attr( 'aria-expanded', $body.hasClass( 'show-upload-view' ) );
			});
	}
});
