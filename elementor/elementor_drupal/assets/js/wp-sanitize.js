
( function () {
	window.wp = window.wp || {};
	wp.sanitize = {
		stripTags: function( text ) {
			text = text || '';
			var _text = text
					.replace( /<!--[\s\S]*?(-->|$)/g, '' )
					.replace( /<(script|style)[^>]*>[\s\S]*?(<\/\1>|$)/ig, '' )
					.replace( /<\/?[a-z][\s\S]*?(>|$)/ig, '' );
			if ( _text !== text ) {
				return wp.sanitize.stripTags( _text );
			}
			return _text;
		},
		stripTagsAndEncodeText: function( text ) {
			var _text = wp.sanitize.stripTags( text ),
				textarea = document.createElement( 'textarea' );
			try {
				textarea.textContent = _text;
				_text = wp.sanitize.stripTags( textarea.value );
			} catch ( er ) {}
			return _text;
		}
	};
}() );
