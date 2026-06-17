(function ($, Drupal, once) {
  Drupal.behaviors.userGroupsSelectAll = {
    attach: function (context) {
      $(once('userGroupsSelectAll', '.role-select-all', context)).on('change', function () {
        const fieldset = $(this).closest('fieldset');
        const checkboxes = fieldset.find('.role-user-list');
        checkboxes.prop('checked', $(this).is(':checked'));
      });
    }
  };
})(jQuery, Drupal, once);
