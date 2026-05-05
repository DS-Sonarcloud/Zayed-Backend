
(function ( window, document ) {
	'use strict';
	const supportedBrowser = ( document.querySelector && window.addEventListener );
	let loaded = false,
		secret,
		secretTimeout,
		resizing;
	function sendEmbedMessage( message, value ) {
		window.parent.postMessage( {
			message: message,
			value: value,
			secret: secret
		}, '*' );
	}
	function sendHeightMessage() {
		sendEmbedMessage( 'height', Math.ceil( document.body.getBoundingClientRect().height ) );
	}
	function onLoad() {
		if ( loaded ) {
			return;
		}
		loaded = true;
		const share_dialog = document.querySelector( '.wp-embed-share-dialog' ),
			share_dialog_open = document.querySelector( '.wp-embed-share-dialog-open' ),
			share_dialog_close = document.querySelector( '.wp-embed-share-dialog-close' ),
			share_input = document.querySelectorAll( '.wp-embed-share-input' ),
			share_dialog_tabs = document.querySelectorAll( '.wp-embed-share-tab-button button' ),
			featured_image = document.querySelector( '.wp-embed-featured-image img' );
		let i;
		if ( share_input ) {
			for ( i = 0; i < share_input.length; i++ ) {
				share_input[ i ].addEventListener( 'click', function ( e ) {
					e.target.select();
				} );
			}
		}
		function openSharingDialog() {
			share_dialog.className = share_dialog.className.replace( 'hidden', '' );
			document.querySelector( '.wp-embed-share-tab-button [aria-selected="true"]' ).focus();
		}
		function closeSharingDialog() {
			share_dialog.className += ' hidden';
			document.querySelector( '.wp-embed-share-dialog-open' ).focus();
		}
		if ( share_dialog_open ) {
			share_dialog_open.addEventListener( 'click', function () {
				openSharingDialog();
			} );
		}
		if ( share_dialog_close ) {
			share_dialog_close.addEventListener( 'click', function () {
				closeSharingDialog();
			} );
		}
		function shareClickHandler( e ) {
			const currentTab = document.querySelector( '.wp-embed-share-tab-button [aria-selected="true"]' );
			currentTab.setAttribute( 'aria-selected', 'false' );
			document.querySelector( '#' + currentTab.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'true' );
			e.target.setAttribute( 'aria-selected', 'true' );
			document.querySelector( '#' + e.target.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'false' );
		}
		function shareKeyHandler( e ) {
			const target = e.target,
				previousSibling = target.parentElement.previousElementSibling,
				nextSibling = target.parentElement.nextElementSibling;
			let newTab, newTabChild;
			if ( 'ArrowLeft' === e.key ) {
				newTab = previousSibling;
			} else if ( 'ArrowRight' === e.key ) {
				newTab = nextSibling;
			} else {
				return false;
			}
			if ( 'rtl' === document.documentElement.getAttribute( 'dir' ) ) {
				newTab = ( newTab === previousSibling ) ? nextSibling : previousSibling;
			}
			if ( newTab ) {
				newTabChild = newTab.firstElementChild;
				target.setAttribute( 'tabindex', '-1' );
				target.setAttribute( 'aria-selected', false );
				document.querySelector( '#' + target.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'true' );
				newTabChild.setAttribute( 'tabindex', '0' );
				newTabChild.setAttribute( 'aria-selected', 'true' );
				newTabChild.focus();
				document.querySelector( '#' + newTabChild.getAttribute( 'aria-controls' ) ).setAttribute( 'aria-hidden', 'false' );
			}
		}
		if ( share_dialog_tabs ) {
			for ( i = 0; i < share_dialog_tabs.length; i++ ) {
				share_dialog_tabs[ i ].addEventListener( 'click', shareClickHandler );
				share_dialog_tabs[ i ].addEventListener( 'keydown', shareKeyHandler );
			}
		}
		document.addEventListener( 'keydown', function ( e ) {
			if ( 'Escape' === e.key && -1 === share_dialog.className.indexOf( 'hidden' ) ) {
				closeSharingDialog();
			} else if ( 'Tab' === e.key ) {
				constrainTabbing( e );
			}
		}, false );
		function constrainTabbing( e ) {
			const firstFocusable = document.querySelector( '.wp-embed-share-tab-button [aria-selected="true"]' );
			if ( share_dialog_close === e.target && ! e.shiftKey ) {
				firstFocusable.focus();
				e.preventDefault();
			} else if ( firstFocusable === e.target && e.shiftKey ) {
				share_dialog_close.focus();
				e.preventDefault();
			}
		}
		if ( window.self === window.top ) {
			return;
		}
		sendHeightMessage();
		if ( featured_image ) {
			featured_image.addEventListener( 'load', sendHeightMessage );
		}
		function linkClickHandler( e ) {
			var target = e.target,
				href;
			if ( target.hasAttribute( 'href' ) ) {
				href = target.getAttribute( 'href' );
			} else {
				href = target.parentElement.getAttribute( 'href' );
			}
			if ( e.altKey || e.ctrlKey || e.metaKey || e.shiftKey ) {
				return;
			}
			if ( href ) {
				sendEmbedMessage( 'link', href );
				e.preventDefault();
			}
		}
		document.addEventListener( 'click', linkClickHandler );
	}
	function onResize() {
		if ( window.self === window.top ) {
			return;
		}
		clearTimeout( resizing );
		resizing = setTimeout( sendHeightMessage, 100 );
	}
	function onMessage( event ) {
		const data = event.data;
		if ( ! data ) {
			return;
		}
		if ( event.source !== window.parent ) {
			return;
		}
		if ( ! ( data.secret || data.message ) ) {
			return;
		}
		if ( data.secret !== secret ) {
			return;
		}
		if ( 'ready' === data.message ) {
			sendHeightMessage();
		}
	}
	function getSecret() {
		if ( window.self === window.top || !!secret ) {
			return;
		}
		secret = window.location.hash.replace( /.*secret=(\w{10}).*/, '$1' );
		clearTimeout( secretTimeout );
		secretTimeout = setTimeout( function () {
			getSecret();
		}, 100 );
	}
	if ( supportedBrowser ) {
		getSecret();
		document.documentElement.className = document.documentElement.className.replace( /\bno-js\b/, '' ) + ' js';
		document.addEventListener( 'DOMContentLoaded', onLoad, false );
		window.addEventListener( 'load', onLoad, false );
		window.addEventListener( 'resize', onResize, false );
		window.addEventListener( 'message', onMessage, false );
	}
})( window, document );
