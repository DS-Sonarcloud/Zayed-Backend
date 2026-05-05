
( function wpEmojiLoader( window, document, settings ) {
	if ( typeof Promise === 'undefined' ) {
		return;
	}
	var sessionStorageKey = 'wpEmojiSettingsSupports';
	var tests = [ 'flag', 'emoji' ];
	function supportsWorkerOffloading() {
		return (
			typeof Worker !== 'undefined' &&
			typeof OffscreenCanvas !== 'undefined' &&
			typeof URL !== 'undefined' &&
			URL.createObjectURL &&
			typeof Blob !== 'undefined'
		);
	}
	function getSessionSupportTests() {
		try {
			var item = JSON.parse(
				sessionStorage.getItem( sessionStorageKey )
			);
			if (
				typeof item === 'object' &&
				typeof item.timestamp === 'number' &&
				new Date().valueOf() < item.timestamp + 604800 && 
				typeof item.supportTests === 'object'
			) {
				return item.supportTests;
			}
		} catch ( e ) {}
		return null;
	}
	function setSessionSupportTests( supportTests ) {
		try {
			var item = {
				supportTests: supportTests,
				timestamp: new Date().valueOf()
			};
			sessionStorage.setItem(
				sessionStorageKey,
				JSON.stringify( item )
			);
		} catch ( e ) {}
	}
	function emojiSetsRenderIdentically( context, set1, set2 ) {
		context.clearRect( 0, 0, context.canvas.width, context.canvas.height );
		context.fillText( set1, 0, 0 );
		var rendered1 = new Uint32Array(
			context.getImageData(
				0,
				0,
				context.canvas.width,
				context.canvas.height
			).data
		);
		context.clearRect( 0, 0, context.canvas.width, context.canvas.height );
		context.fillText( set2, 0, 0 );
		var rendered2 = new Uint32Array(
			context.getImageData(
				0,
				0,
				context.canvas.width,
				context.canvas.height
			).data
		);
		return rendered1.every( function ( rendered2Data, index ) {
			return rendered2Data === rendered2[ index ];
		} );
	}
	function emojiRendersEmptyCenterPoint( context, emoji ) {
		context.clearRect( 0, 0, context.canvas.width, context.canvas.height );
		context.fillText( emoji, 0, 0 );
		var centerPoint = context.getImageData(16, 16, 1, 1);
		for ( var i = 0; i < centerPoint.data.length; i++ ) {
			if ( centerPoint.data[ i ] !== 0 ) {
				return false;
			}
		}
		return true;
	}
	function browserSupportsEmoji( context, type, emojiSetsRenderIdentically, emojiRendersEmptyCenterPoint ) {
		var isIdentical;
		switch ( type ) {
			case 'flag':
				isIdentical = emojiSetsRenderIdentically(
					context,
					'\uD83C\uDFF3\uFE0F\u200D\u26A7\uFE0F', 
					'\uD83C\uDFF3\uFE0F\u200B\u26A7\uFE0F' 
				);
				if ( isIdentical ) {
					return false;
				}
				isIdentical = emojiSetsRenderIdentically(
					context,
					'\uD83C\uDDE8\uD83C\uDDF6', 
					'\uD83C\uDDE8\u200B\uD83C\uDDF6' 
				);
				if ( isIdentical ) {
					return false;
				}
				isIdentical = emojiSetsRenderIdentically(
					context,
					'\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F',
					'\uD83C\uDFF4\u200B\uDB40\uDC67\u200B\uDB40\uDC62\u200B\uDB40\uDC65\u200B\uDB40\uDC6E\u200B\uDB40\uDC67\u200B\uDB40\uDC7F'
				);
				return ! isIdentical;
			case 'emoji':
				var notSupported = emojiRendersEmptyCenterPoint( context, '\uD83E\uDEDF' );
				return ! notSupported;
		}
		return false;
	}
	function testEmojiSupports( tests, browserSupportsEmoji, emojiSetsRenderIdentically, emojiRendersEmptyCenterPoint ) {
		var canvas;
		if (
			typeof WorkerGlobalScope !== 'undefined' &&
			self instanceof WorkerGlobalScope
		) {
			canvas = new OffscreenCanvas( 300, 150 ); 
		} else {
			canvas = document.createElement( 'canvas' );
		}
		var context = canvas.getContext( '2d', { willReadFrequently: true } );
		context.textBaseline = 'top';
		context.font = '600 32px Arial';
		var supports = {};
		tests.forEach( function ( test ) {
			supports[ test ] = browserSupportsEmoji( context, test, emojiSetsRenderIdentically, emojiRendersEmptyCenterPoint );
		} );
		return supports;
	}
	function addScript( src ) {
		var script = document.createElement( 'script' );
		script.src = src;
		script.defer = true;
		document.head.appendChild( script );
	}
	settings.supports = {
		everything: true,
		everythingExceptFlag: true
	};
	var domReadyPromise = new Promise( function ( resolve ) {
		document.addEventListener( 'DOMContentLoaded', resolve, {
			once: true
		} );
	} );
	new Promise( function ( resolve ) {
		var supportTests = getSessionSupportTests();
		if ( supportTests ) {
			resolve( supportTests );
			return;
		}
		if ( supportsWorkerOffloading() ) {
			try {
				var workerScript =
					'postMessage(' +
					testEmojiSupports.toString() +
					'(' +
					[
						JSON.stringify( tests ),
						browserSupportsEmoji.toString(),
						emojiSetsRenderIdentically.toString(),
						emojiRendersEmptyCenterPoint.toString()
					].join( ',' ) +
					'));';
				var blob = new Blob( [ workerScript ], {
					type: 'text/javascript'
				} );
				var worker = new Worker( URL.createObjectURL( blob ), { name: 'wpTestEmojiSupports' } );
				worker.onmessage = function ( event ) {
					supportTests = event.data;
					setSessionSupportTests( supportTests );
					worker.terminate();
					resolve( supportTests );
				};
				return;
			} catch ( e ) {}
		}
		supportTests = testEmojiSupports( tests, browserSupportsEmoji, emojiSetsRenderIdentically, emojiRendersEmptyCenterPoint );
		setSessionSupportTests( supportTests );
		resolve( supportTests );
	} )
		.then( function ( supportTests ) {
			for ( var test in supportTests ) {
				settings.supports[ test ] = supportTests[ test ];
				settings.supports.everything =
					settings.supports.everything && settings.supports[ test ];
				if ( 'flag' !== test ) {
					settings.supports.everythingExceptFlag =
						settings.supports.everythingExceptFlag &&
						settings.supports[ test ];
				}
			}
			settings.supports.everythingExceptFlag =
				settings.supports.everythingExceptFlag &&
				! settings.supports.flag;
			settings.DOMReady = false;
			settings.readyCallback = function () {
				settings.DOMReady = true;
			};
		} )
		.then( function () {
			return domReadyPromise;
		} )
		.then( function () {
			if ( ! settings.supports.everything ) {
				settings.readyCallback();
				var src = settings.source || {};
				if ( src.concatemoji ) {
					addScript( src.concatemoji );
				} else if ( src.wpemoji && src.twemoji ) {
					addScript( src.twemoji );
					addScript( src.wpemoji );
				}
			}
		} );
} )( window, document, window._wpemojiSettings );
