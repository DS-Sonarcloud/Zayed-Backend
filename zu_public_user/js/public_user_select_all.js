(function ($, Drupal, once) {
  Drupal.behaviors.publicUserSelectAll = {
    attach: function (context) {
      $(once('publicUserSelectAll', '.public-user-select-all', context)).on('change', function () {
        const fieldset = $(this).closest('fieldset');
        const checkboxes = fieldset.find('.public-user-list input:checkbox');
        checkboxes.prop('checked', $(this).is(':checked'));
      });
    }
  };
})(jQuery, Drupal, once);
