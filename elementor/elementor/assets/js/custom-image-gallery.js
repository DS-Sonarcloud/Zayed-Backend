(function ($, Drupal, once) {
  Drupal.behaviors.elementorGallery = {
    attach: function (context, settings) {

      $(once('elementorGallery', 'a[data-elementor-open-lightbox="yes"]', context))
        .each(function () {
          var slideshow = $(this).data('elementor-lightbox-slideshow') || 'gallery';
          this.dataset.fancybox = slideshow;
        });
      
      var $dialogChild = jQuery('.dialog-widget').children().first();
      if ($dialogChild.length) {
          $dialogChild.css({
              top: '0px',
              left: '0px'
          });
      }
    }
  };
})(jQuery, Drupal, once);