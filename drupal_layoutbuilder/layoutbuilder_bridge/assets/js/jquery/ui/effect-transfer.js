
( function( factory ) {
	"use strict";
	if ( typeof define === "function" && define.amd ) {
		define( [
			"jquery",
			"../version",
			"../effect"
		], factory );
	} else {
		factory( jQuery );
	}
} )( function( $ ) {
"use strict";
var effect;
if ( $.uiBackCompat !== false ) {
	effect = $.effects.define( "transfer", function( options, done ) {
		$( this ).transfer( options, done );
	} );
}
return effect;
} );
