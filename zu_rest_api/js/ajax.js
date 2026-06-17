(function ($, Drupal, once) {

  Drupal.behaviors.publishToggle = {
    attach: function (context, settings) {

      // CLICK HANDLER
      $(once("togglePublishOnce", ".toggle-Publish, .toggle-Unpublish", context))
        .on("click", function () {
          const $link = $(this);
          if (!this.id || this.id.indexOf("toggle-publish-") === -1) return;

          
          if ($link.hasClass("toggle-Publish")) {
            $link.text(Drupal.t("Publishing..."));
          } else {
            $link.text(Drupal.t("Unpublishing..."));
          }
        });

      $(once('deployevent', '.button.button--add.deploy-events', context))
        .on('click', function (e) {
          const $link = $(this);

          if ($link.hasClass('use-ajax')) {
            const originalText = $link.text();
            $link.text(Drupal.t('Deploying...'));

            $(document).one('ajaxComplete.deployEvents', function (event, xhr, settings) {
              if (settings.url && settings.url.indexOf('events_redirect') !== -1) {
                $link.text(originalText);
              }
            });
          }
        });
    }
  };

})(jQuery, Drupal, once);

(function (Drupal, once) {
  Drupal.AjaxCommands.prototype.scrollTop = function (ajax, response, status) {
    // Do nothing — this prevents Drupal from auto-scrolling after AJAX.
    return;
  };
})(Drupal, once);
