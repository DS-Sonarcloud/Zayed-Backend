
(function($) {
	var frame;
	$( function() {
		var $headers = $('.available-headers');
		$headers.imagesLoaded( function() {
			$headers.masonry({
				itemSelector: '.default-header',
				isRTL: !! ( 'undefined' != typeof isRtl && isRtl )
			});
		});
		$('#choose-from-library-link').click( function( event ) {
			var $el = $(this);
			event.preventDefault();
			if ( frame ) {
				frame.open();
				return;
			}
			frame = wp.media.frames.customHeader = wp.media({
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
				var attachment = frame.state().get('selection').first(),
					link = $el.data('updateLink');
				window.location = link + '&file=' + attachment.id;
			});
			frame.open();
		});
	});
}(jQuery));
