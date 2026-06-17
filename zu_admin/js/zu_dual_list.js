/**
 * zu_dual_list.js
 *
 * Handles the dual-list (available ↔ assigned) widgets for
 * Groups (AddUser form) and Users (EditGroup form).
 *
 * Markup expected:
 *   <div class="zu-dual-list" id="{type}-dual-list" data-type="{type}">
 *     <div class="zu-dual-list__pane">
 *       <select id="{type}-available" multiple>…</select>
 *     </div>
 *     <div class="zu-dual-list__controls">
 *       <button class="zu-dual-btn--forward" data-dual-target="{type}">»</button>
 *       <button class="zu-dual-btn--back"    data-dual-target="{type}">«</button>
 *     </div>
 *     <div class="zu-dual-list__pane">
 *       <select id="{type}-assigned" multiple>…</select>
 *     </div>
 *   </div>
 *   <input type="hidden" id="{type}-value">
 */
(function (Drupal, once) {
  'use strict';

  /**
   * Move selected options from one <select> to another.
   */
  function moveSelected(source, target) {
    var options = Array.from(source.options);
    options.forEach(function (opt) {
      if (opt.selected) {
        target.appendChild(opt);
      }
    });
  }

  /**
   * Move ALL options from source to target.
   */
  function moveAll(source, target) {
    Array.from(source.options).forEach(function (opt) {
      target.appendChild(opt);
    });
  }

  /**
   * Serialize all option values from a <select> into a comma-separated hidden field.
   */
  function syncHidden(assignedSelect, hiddenInput) {
    if (!hiddenInput) return;
    var values = Array.from(assignedSelect.options).map(function (o) { return o.value; });
    hiddenInput.value = values.join(',');
  }

  Drupal.behaviors.zuDualList = {
    attach: function (context) {

      // ── Initialise each dual-list widget ─────────────────────────────────
      once('zu-dual-list', '.zu-dual-list', context).forEach(function (widget) {
        var type      = widget.dataset.type;
        var available = widget.querySelector('#' + type + '-available');
        var assigned  = widget.querySelector('#' + type + '-assigned');
        var hidden    = document.getElementById(type + '-value');
        var fwdBtn    = widget.querySelector('.zu-dual-btn--forward');
        var backBtn   = widget.querySelector('.zu-dual-btn--back');

        if (!available || !assigned) return;

        // Move selected → assigned
        if (fwdBtn) {
          fwdBtn.addEventListener('click', function () {
            moveSelected(available, assigned);
            syncHidden(assigned, hidden);
          });
        }

        // Move selected ← available
        if (backBtn) {
          backBtn.addEventListener('click', function () {
            moveSelected(assigned, available);
            syncHidden(assigned, hidden);
          });
        }

        // Double-click to move individual item
        available.addEventListener('dblclick', function () {
          moveSelected(available, assigned);
          syncHidden(assigned, hidden);
        });

        assigned.addEventListener('dblclick', function () {
          moveSelected(assigned, available);
          syncHidden(assigned, hidden);
        });
      });

      // ── Pre-submit: serialise assigned values into hidden field ───────────
      once('zu-dual-list-submit', 'form', context).forEach(function (form) {
        form.addEventListener('submit', function () {
          // Select all options in every assigned pane so they POST correctly.
          form.querySelectorAll('.zu-dual-list__pane select[id$="-assigned"]')
            .forEach(function (sel) {
              Array.from(sel.options).forEach(function (o) { o.selected = true; });
              // Also update the hidden value field.
              var type   = sel.id.replace('-assigned', '');
              var hidden = document.getElementById(type + '-value');
              syncHidden(sel, hidden);
            });
        });
      });

    }
  };

})(Drupal, once);
