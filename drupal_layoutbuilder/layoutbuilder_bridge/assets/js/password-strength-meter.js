
window.wp = window.wp || {};
var passwordStrength;
(function($){
	wp.passwordStrength = {
		meter : function( password1, blacklist, password2 ) {
			if ( ! $.isArray( blacklist ) )
				blacklist = [ blacklist.toString() ];
			if (password1 != password2 && password2 && password2.length > 0)
				return 5;
			if ( 'undefined' === typeof window.zxcvbn ) {
				return -1;
			}
			var result = zxcvbn( password1, blacklist );
			return result.score;
		},
		userInputBlacklist : function() {
			var i, userInputFieldsLength, rawValuesLength, currentField,
				rawValues       = [],
				blacklist       = [],
				userInputFields = [ 'user_login', 'first_name', 'last_name', 'nickname', 'display_name', 'email', 'url', 'description', 'weblog_title', 'admin_email' ];
			rawValues.push( document.title );
			rawValues.push( document.URL );
			userInputFieldsLength = userInputFields.length;
			for ( i = 0; i < userInputFieldsLength; i++ ) {
				currentField = $( '#' + userInputFields[ i ] );
				if ( 0 === currentField.length ) {
					continue;
				}
				rawValues.push( currentField[0].defaultValue );
				rawValues.push( currentField.val() );
			}
			rawValuesLength = rawValues.length;
			for ( i = 0; i < rawValuesLength; i++ ) {
				if ( rawValues[ i ] ) {
					blacklist = blacklist.concat( rawValues[ i ].replace( /\W/g, ' ' ).split( ' ' ) );
				}
			}
			blacklist = $.grep( blacklist, function( value, key ) {
				if ( '' === value || 4 > value.length ) {
					return false;
				}
				return $.inArray( value, blacklist ) === key;
			});
			return blacklist;
		}
	};
	passwordStrength = wp.passwordStrength.meter;
})(jQuery);
