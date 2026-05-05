
(function ( window, document ) {
	'use strict';
	if ( ! document.querySelector || ! window.addEventListener || typeof URL === 'undefined' ) {
		return;
	}
	window.wp = window.wp || {};
	if ( window.wp.receiveEmbedMessage ) {
		return;
	}
	window.wp.receiveEmbedMessage = function( e ) {
		const data = e.data;
		if (
			! ( data || data.secret || data.message || data.value ) ||
			/[^a-zA-Z0-9]/.test( data.secret )
		) {
			return;
		}
		const iframes = document.querySelectorAll( 'iframe[data-secret="' + data.secret + '"]' ),
			blockquotes = document.querySelectorAll( 'blockquote[data-secret="' + data.secret + '"]' ),
			allowedProtocols = /^https?:$/i;
		let i, source, height, sourceURL, targetURL;
		for ( i = 0; i < blockquotes.length; i++ ) {
			blockquotes[ i ].style.display = 'none';
		}
		for ( i = 0; i < iframes.length; i++ ) {
			source = iframes[ i ];
			if ( e.source !== source.contentWindow ) {
				continue;
			}
			source.removeAttribute( 'style' );
			if ( 'height' === data.message ) {
				height = Number.parseInt( data.value, 10 );
				if ( height > 1000 ) {
					height = 1000;
				} else if ( Math.trunc( height ) < 200 ) {
					height = 200;
				}
				source.height = height;
			} else if ( 'link' === data.message ) {
				sourceURL = new URL( source.getAttribute( 'src' ) );
				targetURL = new URL( data.value );
				if (
					allowedProtocols.test( targetURL.protocol ) &&
					targetURL.host === sourceURL.host &&
					document.activeElement === source
				) {
					window.top.location.href = data.value;
				}
			}
		}
	};
	function onLoad() {
		const iframes = document.querySelectorAll( 'iframe.wp-embedded-content' );
		let i, source, secret;
		for ( i = 0; i < iframes.length; i++ ) {
			source = iframes[ i ];
			secret = source.dataset.secret;
			if ( ! secret ) {
				secret = Math.random().toString( 36 ).substring( 2, 12 );
				source.src += '#?secret=' + secret;
				source.dataset.secret = secret;
			}
			source.contentWindow.postMessage( {
				message: 'ready',
				secret: secret
			}, '*' );
		}
	}
	window.addEventListener( 'message', window.wp.receiveEmbedMessage, false );
	document.addEventListener( 'DOMContentLoaded', onLoad, false );
})( window, document );
