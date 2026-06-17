
(function($) {
	$(document).ready(function() {
		var frame,
			bgImage = $( '#custom-background-image' );
		$('#background-color').wpColorPicker({
			change: function( event, ui ) {
				bgImage.css('background-color', ui.color.toString());
			},
			clear: function() {
				bgImage.css('background-color', '');
			}
		});
		$( 'select[name="background-size"]' ).change( function() {
			bgImage.css( 'background-size', $( this ).val() );
		});
		$( 'input[name="background-position"]' ).change( function() {
			bgImage.css( 'background-position', $( this ).val() );
		});
		$( 'input[name="background-repeat"]' ).change( function() {
			bgImage.css( 'background-repeat', $( this ).is( ':checked' ) ? 'repeat' : 'no-repeat' );
		});
		$( 'input[name="background-attachment"]' ).change( function() {
			bgImage.css( 'background-attachment', $( this ).is( ':checked' ) ? 'scroll' : 'fixed' );
		});
		$('#choose-from-library-link').click( function( event ) {
			var $el = $(this);
			event.preventDefault();
			if ( frame ) {
				frame.open();
				return;
			}
			frame = wp.media.frames.customBackground = wp.media({
				title: $el.data('choose'),
				library: {
					type: 'image'
				},
				button: {
					text: $el.data('update'),
					close: false
				}
			});
			frame.on( 'select', function() {
				var attachment = frame.state().get('selection').first();
				$.post( ajaxurl, {
					action: 'set-background-image',
					attachment_id: attachment.id,
					size: 'full'
				}).done( function() {
					window.location.reload();
				});
			});
			frame.open();
		});
	});
})(jQuery);
