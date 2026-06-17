
window.wp = window.wp || {};
( function ( wp, $ ) {
	'use strict';
	var $containerPolite,
		$containerAssertive,
		previousMessage = '';
	function speak( message, ariaLive ) {
		clear();
		message = $( '<p>' ).html( message ).text();
		if ( previousMessage === message ) {
			message = message + '\u00A0';
		}
		previousMessage = message;
		if ( $containerAssertive && 'assertive' === ariaLive ) {
			$containerAssertive.text( message );
		} else if ( $containerPolite ) {
			$containerPolite.text( message );
		}
	}
	function addContainer( ariaLive ) {
		ariaLive = ariaLive || 'polite';
		var $container = $( '<div>', {
			'id': 'wp-a11y-speak-' + ariaLive,
			'aria-live': ariaLive,
			'aria-relevant': 'additions text',
			'aria-atomic': 'true',
			'class': 'screen-reader-text wp-a11y-speak-region'
		});
		$( document.body ).append( $container );
		return $container;
	}
	function clear() {
		$( '.wp-a11y-speak-region' ).text( '' );
	}
	$( document ).ready( function() {
		$containerPolite = $( '#wp-a11y-speak-polite' );
		$containerAssertive = $( '#wp-a11y-speak-assertive' );
		if ( ! $containerPolite.length ) {
			$containerPolite = addContainer( 'polite' );
		}
		if ( ! $containerAssertive.length ) {
			$containerAssertive = addContainer( 'assertive' );
		}
	});
	wp.a11y = wp.a11y || {};
	wp.a11y.speak = speak;
}( window.wp, window.jQuery ));
