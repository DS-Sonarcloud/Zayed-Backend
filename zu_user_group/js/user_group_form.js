(function ($, Drupal, once) {
  Drupal.behaviors.zuUserGroupPagerAjax = {
    attach: function (context, settings) {
      // 1. Clean up pager links using URL API to ensure they are standard links
      once('zu-pager-clean', '.pager__item a', context).forEach(function(el) {
        try {
          let url = new URL(el.href);
          url.searchParams.delete('ajax_form');
          url.searchParams.delete('_wrapper_format');
          el.href = url.pathname + url.search + url.hash;
        } catch (e) {
          // Fallback if URL API fails
        }
      });

      // 2. Intercept pager links for AJAX navigation
      const pagerLinks = once('zu-pager-ajax', '.pager__item a', context);
      $(pagerLinks).on('click', function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        if (!href) return;

        // Sync the hidden 'current_page' field so the server knows which page to load
        try {
          let url = new URL(href, window.location.origin);
          let pageParam = url.searchParams.get('page') || 0;
          $('input[name="current_page"]').val(pageParam);
        } catch (e) {
           console.error('Failed to parse pager URL:', e);
        }

        // Update the browser URL without refreshing
        window.history.pushState({ path: href }, '', href);

        // Find the 'target_webforms' field which has our AJAX callback attached.
        // We use a wildcard 'start-with' selector to catch both target_webforms[] and target_webforms.
        const $webformSelect = $('select[name^="target_webforms"]');
        if ($webformSelect.length) {
          const selectId = $webformSelect.attr('id');
          if (Drupal.ajax && Drupal.ajax.instances && Drupal.ajax.instances[selectId]) {
             // Update the AJAX instance's URL to include the new page parameter
             let ajaxUrl = new URL(href, window.location.origin);
             ajaxUrl.searchParams.set('ajax_form', '1');
             ajaxUrl.searchParams.set('_wrapper_format', 'drupal_ajax');
             Drupal.ajax.instances[selectId].options.url = ajaxUrl.pathname + ajaxUrl.search + ajaxUrl.hash;
             
             // Trigger the AJAX call immediately
             Drupal.ajax.instances[selectId].execute();
          } else {
             // Fallback: trigger a change event
             $webformSelect.trigger('change');
          }
        }
      });
    }
  };
})(jQuery, Drupal, once);
