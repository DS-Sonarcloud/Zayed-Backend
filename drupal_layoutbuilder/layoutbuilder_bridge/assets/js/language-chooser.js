jQuery( function($) {
var select = $( '#language' ),
	submit = $( '#language-continue' );
if ( ! $( 'body' ).hasClass( 'language-chooser' ) ) {
	return;
}
select.focus().on( 'change', function() {
	var option = select.children( 'option:selected' );
	submit.attr({
		value: option.data( 'continue' ),
		lang: option.attr( 'lang' )
	});
});
$( 'form' ).submit( function() {
	if ( ! select.children( 'option:selected' ).data( 'installed' ) ) {
		$( this ).find( '.step .spinner' ).css( 'visibility', 'visible' );
	}
});
});
