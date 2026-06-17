(function ($, Drupal, once) {
  'use strict';

  Drupal.behaviors.zuPermissionFilter = {
    attach: function (context) {
      var $filter = $(once('permission-filter', '.permission-filter', context));
      if (!$filter.length) {
        return;
      }

      $filter.on('keyup', function () {
        var query = $(this).val().toLowerCase().trim();
        var $groups = $('.permission-provider-group');

        if (!query) {
          // Show everything.
          $groups.show();
          $('.permission-item').show();
          return;
        }

        $groups.each(function () {
          var $group = $(this);
          var $items = $group.find('.permission-item');
          var visibleCount = 0;

          $items.each(function () {
            var $item = $(this);
            var label = $item.find('label').text().toLowerCase();
            var permName = $item.find('.permission-checkbox').attr('data-permission') || '';

            if (label.indexOf(query) !== -1 || permName.toLowerCase().indexOf(query) !== -1) {
              $item.show();
              visibleCount++;
            } else {
              $item.hide();
            }
          });

          if (visibleCount > 0) {
            $group.show();
            // Auto-open groups with matches.
            if (!$group.attr('open')) {
              $group.attr('open', true);
            }
          } else {
            $group.hide();
          }
        });
      });

      // Select all / deselect all handlers.
      $(once('select-all', '.select-all-provider', context)).on('click', function (e) {
        e.preventDefault();
        var provider = $(this).attr('data-provider');
        $('[data-provider="' + provider + '"].permission-checkbox').prop('checked', true);
      });

      $(once('deselect-all', '.deselect-all-provider', context)).on('click', function (e) {
        e.preventDefault();
        var provider = $(this).attr('data-provider');
        $('[data-provider="' + provider + '"].permission-checkbox').prop('checked', false);
      });
    }
  };

})(jQuery, Drupal, once);
