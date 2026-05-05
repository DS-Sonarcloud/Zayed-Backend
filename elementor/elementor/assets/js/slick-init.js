(function ($, Drupal) {
  Drupal.behaviors.slickElementorFrontendInit = {
    attach: function (context, settings) {
      $('.elementor-image-carousel', context).each(function () {
        var $carousel = $(this);
        var $widget = $carousel.closest('.elementor-widget-image-carousel');
        var rawSettings = $widget.attr('data-settings');

        if (!rawSettings) return;

        try {
          var options = JSON.parse(rawSettings);
        } catch (e) {
          console.error('Invalid JSON in data-settings:', rawSettings);
          return;
        }

        var slickOptions = {
          slidesToShow: parseInt(options.slides_to_show) || 1,
          slidesToScroll: parseInt(options.slides_to_scroll) || 1,
          autoplay: options.autoplay === 'yes',
          autoplaySpeed: parseInt(options.autoplay_speed) || 3000,
          infinite: options.infinite === 'yes',
          pauseOnHover: options.pause_on_hover === 'yes',
          speed: parseInt(options.speed) || 500,
          arrows: options.navigation === 'arrows' || options.navigation === 'both',
          dots: options.navigation === 'dots' || options.navigation === 'both',
          rtl: options.direction === 'rtl'
        };

        console.log('Initializing Slick with:', slickOptions);

        if (!$carousel.hasClass('slick-initialized')) {
          $carousel.slick(slickOptions);
        }

      });
    }
  };
})(jQuery, Drupal);
