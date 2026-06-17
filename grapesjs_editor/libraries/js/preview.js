(function ($, Drupal, once) {
  Drupal.behaviors.grapesjsScreenshotPreview = {
    attach: function (context, settings) {
      const elements = once('grapesjs-preview', '.screenshot-preview', context);
      
      $(elements).on('click', function (e) {
        e.preventDefault();
        const imgUri = $(this).attr('src');
        const imgAlt = $(this).attr('alt');

        // Create a container for the modal content
        const $previewContainer = $('<div class="gjs-screenshot-modal-content"></div>');
        const $img = $('<img src="' + imgUri + '" alt="' + imgAlt + '" style="width: 100%; height: auto; display: block;">');
        $previewContainer.append($img);

        // Open the Drupal Modal
        const previewDialog = Drupal.dialog($previewContainer, {
          title: imgAlt || Drupal.t('Screenshot Preview'),
          width: '80%',
          buttons: [
            {
              text: Drupal.t('Close'),
              click: function () {
                $(this).dialog('close');
              }
            }
          ]
        });

        previewDialog.showModal();
      });
    }
  };
})(jQuery, Drupal, once);
