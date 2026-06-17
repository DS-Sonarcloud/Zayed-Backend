
( function( $ ){
	$( document ).ready( function () {
		$( '.accordion-container' ).on( 'click keydown', '.accordion-section-title', function( e ) {
			if ( e.type === 'keydown' && 13 !== e.which ) { 
				return;
			}
			e.preventDefault(); 
			accordionSwitch( $( this ) );
		});
	});
	function accordionSwitch ( el ) {
		var section = el.closest( '.accordion-section' ),
			sectionToggleControl = section.find( '[aria-expanded]' ).first(),
			container = section.closest( '.accordion-container' ),
			siblings = container.find( '.open' ),
			siblingsToggleControl = siblings.find( '[aria-expanded]' ).first(),
			content = section.find( '.accordion-section-content' );
		if ( section.hasClass( 'cannot-expand' ) ) {
			return;
		}
		container.addClass( 'opening' );
		if ( section.hasClass( 'open' ) ) {
			section.toggleClass( 'open' );
			content.toggle( true ).slideToggle( 150 );
		} else {
			siblingsToggleControl.attr( 'aria-expanded', 'false' );
			siblings.removeClass( 'open' );
			siblings.find( '.accordion-section-content' ).show().slideUp( 150 );
			content.toggle( false ).slideToggle( 150 );
			section.toggleClass( 'open' );
		}
		setTimeout(function(){
		    container.removeClass( 'opening' );
		}, 150);
		if ( sectionToggleControl ) {
			sectionToggleControl.attr( 'aria-expanded', String( sectionToggleControl.attr( 'aria-expanded' ) === 'false' ) );
		}
	}
})(jQuery);
