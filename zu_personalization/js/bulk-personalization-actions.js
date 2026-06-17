/**
 * Bulk personalization actions.
 *
 * Intercepts the Views bulk form Apply button when one of our two
 * personalization actions is selected, collects the selected node IDs
 * (decoding Drupal's base64 checkbox values), and opens a Drupal modal
 * dialog with a searchable, filterable rule-selection form.
 */
(function ($, Drupal, drupalSettings, once) {
  'use strict';

  const ASSIGN_ACTION = 'zu_personalization_bulk_assign_rules';
  const REMOVE_ACTION = 'zu_personalization_bulk_remove_rules';
  const MODAL_BASE    = '/admin/zu-personalization/bulk-modal';

  Drupal.behaviors.zuPersonalizationBulkActions = {
    attach(context) {

      // ── Post-submit status banner ─────────────────────────────────────────
      once('zu-bulk-status', 'body', context).forEach(() => {
        $('main, .layout-main, .page-wrapper, #main-wrapper').first().prepend(
          '<div id="zu-personalization-bulk-status" ' +
          'class="messages messages--status zp-bulk-status" ' +
          'role="status" aria-live="polite" style="display:none"></div>'
        );
      });

      // ── Attach interceptor to the bulk-actions container ──────────────────
      //
      // Drupal renders:
      //   <div data-drupal-views-bulk-actions ...>
      //     <select name="action" id="edit-action"> ... </select>
      //     <input type="submit" name="op" value="Apply to selected items">
      //   </div>
      //
      once('zu-bulk-intercept', '[data-drupal-views-bulk-actions]', context)
        .forEach((container) => {
          const $container  = $(container);
          const $form       = $container.closest('form');
          const $actionSel  = $container.find('select[name="action"]');
          // Apply button lives inside the bulk-actions section
          const $applyBtn   = $container.find('input[name="op"], button[name="op"]');

          if (!$actionSel.length || !$applyBtn.length) return;

          $applyBtn.on('click.zuBulk', function (e) {
            const action = $actionSel.val();
            if (action !== ASSIGN_ACTION && action !== REMOVE_ACTION) return; // let default run

            e.preventDefault();
            e.stopImmediatePropagation();

            const nids = collectSelectedNids($form);
            if (!nids.length) {
              showBanner(
                Drupal.t('Please check at least one item before applying a personalization rule.'),
                'warning'
              );
              return;
            }

            const actionType = action === ASSIGN_ACTION ? 'assign' : 'remove';
            openModal(actionType, nids);
          });
        });

      // ── Client-side filter inside the modal ───────────────────────────────
      once('zu-rule-filter', '.zp-bulk-modal__filter', context).forEach((input) => {
        const targetSel = $(input).data('filterTarget') || '#zp-bulk-rule-list';
        $(input).on('input.zuFilter', function () {
          const q = this.value.toLowerCase().trim();
          $(targetSel).find('.js-form-item').each(function () {
            $(this).toggle(!q || $(this).text().toLowerCase().includes(q));
          });
          // Show/hide "no results" hint
          const $list   = $(targetSel);
          const visible = $list.find('.js-form-item:visible').length;
          let   $hint   = $list.find('.zp-filter-empty');
          if (!visible) {
            if (!$hint.length) {
              $hint = $('<p class="zp-filter-empty"></p>').appendTo($list);
            }
            $hint.text(Drupal.t('No rules match "@q".', { '@q': q })).show();
          }
          else {
            $hint.hide();
          }
        });
      });
    },
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Collect NIDs from checked checkboxes.
   *
   * Drupal Views encodes checkbox values as base64 JSON: ["langcode","nid"]
   * e.g. WyJlbiIsIjIyOTMiXQ== → ["en","2293"] → NID 2293
   */
  function collectSelectedNids($form) {
    const nids = [];
    $form.find('input[name^="node_bulk_form"]:checked').each(function () {
      const nid = decodeNid(this.value);
      if (nid > 0) nids.push(nid);
    });
    return nids;
  }

  function decodeNid(value) {
    // Try base64 decode first (Drupal's Views format).
    try {
      const decoded = JSON.parse(atob(value));
      if (Array.isArray(decoded) && decoded.length >= 2) {
        return parseInt(decoded[1], 10) || 0;
      }
    }
    catch (_) { /* fall through */ }
    // Fallback: plain integer value.
    return parseInt(value, 10) || 0;
  }

  function openModal(actionType, nids) {
    const title = actionType === 'assign'
      ? Drupal.t('Assign personalization rules')
      : Drupal.t('Remove personalization rules');

    const url = MODAL_BASE + '/' + actionType + '?nids=' + nids.join(',');

    Drupal.ajax({
      url,
      dialogType: 'modal',
      dialog: {
        title,
        width: 600,
        classes: { 'ui-dialog': 'zp-bulk-modal-dialog' },
        modal: true,
      },
    }).execute();
  }

  function showBanner(msg, type) {
    type = type || 'status';
    const $banner = $('#zu-personalization-bulk-status');
    $banner
      .removeClass('messages--status messages--warning messages--error')
      .addClass('messages--' + type)
      .text(msg)
      .show();
    setTimeout(() => $banner.fadeOut(600), 5000);
  }

})(jQuery, Drupal, drupalSettings, once);
