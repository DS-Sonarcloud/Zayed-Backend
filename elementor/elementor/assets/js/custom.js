(function ($, Drupal, once) {
  Drupal.behaviors.elementorCarousel = {
    attach: function (context) {
      once('elementorCarouselInit', '.elementor-image-carousel', context).forEach(function (el) {
        var $carousel = $(el);

        var rawSettings = $carousel.attr('data-settings');
        var settingsData = {};

        try {
          settingsData = JSON.parse(rawSettings);
        } catch (e) {
          console.error("Failed to parse settings", rawSettings, e);
        }
        if ($.fn.slick) {
          try {
            $carousel.slick(settingsData);
          } catch (e) {
            console.error("Slick init failed:", e);
          }
        } else {
          console.error("Slick not loaded");
        }
      });
    }
  };
})(jQuery, Drupal, once);


