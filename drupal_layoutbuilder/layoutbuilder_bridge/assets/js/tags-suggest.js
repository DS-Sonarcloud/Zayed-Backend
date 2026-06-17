
( function( $ ) {
	if ( typeof window.tagsSuggestL10n === 'undefined' || typeof window.uiAutocompleteL10n === 'undefined' ) {
		return;
	}
	var tempID = 0;
	var separator = window.tagsSuggestL10n.tagDelimiter || ',';
	function split( val ) {
		return val.split( new RegExp( separator + '\\s*' ) );
	}
	function getLast( term ) {
		return split( term ).pop();
	}
	$.fn.wpTagsSuggest = function( options ) {
		var cache;
		var last;
		var $element = $( this );
		options = options || {};
		var taxonomy = options.taxonomy || $element.attr( 'data-wp-taxonomy' ) || 'post_tag';
		delete( options.taxonomy );
		options = $.extend( {
			source: function( request, response ) {
				var term;
				if ( last === request.term ) {
					response( cache );
					return;
				}
				term = getLast( request.term );
				$.get( window.ajaxurl, {
					action: 'ajax-tag-search',
					tax: taxonomy,
					q: term
				} ).always( function() {
					$element.removeClass( 'ui-autocomplete-loading' ); 
				} ).done( function( data ) {
					var tagName;
					var tags = [];
					if ( data ) {
						data = data.split( '\n' );
						for ( tagName in data ) {
							var id = ++tempID;
							tags.push({
								id: id,
								name: data[tagName]
							});
						}
						cache = tags;
						response( tags );
					} else {
						response( tags );
					}
				} );
				last = request.term;
			},
			focus: function( event, ui ) {
				$element.attr( 'aria-activedescendant', 'wp-tags-autocomplete-' + ui.item.id );
				event.preventDefault();
			},
			select: function( event, ui ) {
				var tags = split( $element.val() );
				tags.pop();
				tags.push( ui.item.name, '' );
				$element.val( tags.join( separator + ' ' ) );
				if ( $.ui.keyCode.TAB === event.keyCode ) {
					window.wp.a11y.speak( window.tagsSuggestL10n.termSelected, 'assertive' );
					event.preventDefault();
				} else if ( $.ui.keyCode.ENTER === event.keyCode ) {
					event.preventDefault();
					event.stopPropagation();
				}
				return false;
			},
			open: function() {
				$element.attr( 'aria-expanded', 'true' );
			},
			close: function() {
				$element.attr( 'aria-expanded', 'false' );
			},
			minLength: 2,
			position: {
				my: 'left top+2',
				at: 'left bottom',
				collision: 'none'
			},
			messages: {
				noResults: window.uiAutocompleteL10n.noResults,
				results: function( number ) {
					if ( number > 1 ) {
						return window.uiAutocompleteL10n.manyResults.replace( '%d', number );
					}
					return window.uiAutocompleteL10n.oneResult;
				}
			}
		}, options );
		$element.on( 'keydown', function() {
			$element.removeAttr( 'aria-activedescendant' );
		} )
		.autocomplete( options )
		.autocomplete( 'instance' )._renderItem = function( ul, item ) {
			return $( '<li role="option" id="wp-tags-autocomplete-' + item.id + '">' )
				.text( item.name )
				.appendTo( ul );
		};
		$element.attr( {
			'role': 'combobox',
			'aria-autocomplete': 'list',
			'aria-expanded': 'false',
			'aria-owns': $element.autocomplete( 'widget' ).attr( 'id' )
		} )
		.on( 'focus', function() {
			var inputValue = split( $element.val() ).pop();
			if ( inputValue ) {
				$element.autocomplete( 'search' );
			}
		} )
		.autocomplete( 'widget' )
			.addClass( 'wp-tags-autocomplete' )
			.attr( 'role', 'listbox' )
			.removeAttr( 'tabindex' ) 
			.on( 'menufocus', function( event, ui ) {
				ui.item.attr( 'aria-selected', 'true' );
			})
			.on( 'menublur', function() {
				$( this ).find( '[aria-selected="true"]' ).removeAttr( 'aria-selected' );
			});
		return this;
	};
}( jQuery ) );
