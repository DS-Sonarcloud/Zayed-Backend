/*!
 * AEGov Page Builder — Admin UI
 */
(function ($, Drupal, once) {
  'use strict';

  // Component currently being dragged from the palette
  var dragCompId = null;
  var dragCompLabel = null;

  Drupal.behaviors.aegovPageBuilder = {
    attach: function (context, settings) {
      // Palette items — drag + double-click
      once('pb-palette-item', '.aegov-palette__item', context).forEach(function (item) {
        setupPaletteItem(item);
      });

      // Canvas drop target
      once('pb-canvas-drop', '#aegov-canvas-regions', context).forEach(function (canvas) {
        setupCanvasDrop(canvas);
      });

      // Region reorder handles
      once('pb-region-reorder', '#aegov-canvas-regions', context).forEach(function (canvas) {
        setupRegionReorder(canvas);
      });
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // PALETTE ITEM
  // ──────────────────────────────────────────────────────────────────────────
  function setupPaletteItem(item) {
    item.setAttribute('draggable', 'true');

    item.addEventListener('dragstart', function (e) {
      dragCompId    = item.getAttribute('data-component-id');
      dragCompLabel = item.getAttribute('data-component-label');
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', dragCompId);
      item.classList.add('pb-dragging');

      // Highlight drop zone
      var hint = document.querySelector('.aegov-canvas__drop-hint');
      if (hint) hint.classList.add('pb-hint-active');
    });

    item.addEventListener('dragend', function () {
      dragCompId = null;
      item.classList.remove('pb-dragging');
      var hint = document.querySelector('.aegov-canvas__drop-hint');
      if (hint) hint.classList.remove('pb-hint-active');
      document.querySelectorAll('.pb-canvas-over').forEach(function (el) {
        el.classList.remove('pb-canvas-over');
      });
    });

    // Double-click → add via AJAX
    // preventDefault stops form submit; stopPropagation stops summary toggle
    item.addEventListener('dblclick', function (e) {
      e.preventDefault();
      e.stopPropagation();
      doAddRegion(
        item.getAttribute('data-component-id'),
        item.getAttribute('data-component-label')
      );
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CANVAS DROP
  // ──────────────────────────────────────────────────────────────────────────
  function setupCanvasDrop(canvas) {
    canvas.addEventListener('dragover', function (e) {
      if (!dragCompId) return;        // not a palette drag — ignore
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      canvas.classList.add('pb-canvas-over');
    });

    canvas.addEventListener('dragleave', function (e) {
      if (!canvas.contains(e.relatedTarget)) {
        canvas.classList.remove('pb-canvas-over');
      }
    });

    canvas.addEventListener('drop', function (e) {
      if (!dragCompId) return;
      e.preventDefault();
      canvas.classList.remove('pb-canvas-over');
      var id    = dragCompId;
      var label = dragCompLabel;
      dragCompId = null;
      var hint = document.querySelector('.aegov-canvas__drop-hint');
      if (hint) hint.classList.remove('pb-hint-active');
      doAddRegion(id, label);
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADD REGION — write pending component then fire Drupal AJAX on the button
  // ──────────────────────────────────────────────────────────────────────────
  function doAddRegion(compId, compLabel) {
    if (!compId) return;

    // Write into the hidden field so PHP sees it in POST
    var pending = document.getElementById('aegov-pending-component');
    if (pending) {
      pending.value = compId;
      pending.setAttribute('name', 'pending_component');
    }

    // Fire the AJAX button the Drupal way — via its registered ajaxInstance
    var btn = document.getElementById('aegov-add-region');
    if (!btn) {
      console.warn('AEGov PB: #aegov-add-region not found');
      return;
    }

    // Drupal.ajax attaches an ajaxInstance to the element.
    // Use it directly if available; fall back to jQuery trigger.
    var ajaxInst = $(btn).data('uiAjax') || $(btn).data('ajax');
    if (ajaxInst && typeof ajaxInst.execute === 'function') {
      ajaxInst.execute();
    } else {
      // Drupal ajax.js listens on jQuery 'click' (not native click)
      $(btn).trigger('click');
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // REGION REORDER (drag handle to reorder existing regions)
  // ──────────────────────────────────────────────────────────────────────────
  function setupRegionReorder(canvas) {
    var sortSrc = null;

    canvas.addEventListener('dragstart', function (e) {
      if (dragCompId) return;   // palette drag takes over
      var handle = e.target.closest('.aegov-region__handle');
      if (!handle) { e.preventDefault(); return; }
      sortSrc = handle.closest('.aegov-region');
      if (!sortSrc) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'reorder');
      sortSrc.classList.add('pb-region-sorting');
    });

    canvas.addEventListener('dragover', function (e) {
      if (!sortSrc || dragCompId) return;
      var region = e.target.closest('.aegov-region');
      if (!region || region === sortSrc) return;
      e.preventDefault();
      canvas.querySelectorAll('.pb-region-over').forEach(function (r) { r.classList.remove('pb-region-over'); });
      region.classList.add('pb-region-over');
    });

    canvas.addEventListener('dragleave', function (e) {
      if (!sortSrc) return;
      var region = e.target.closest('.aegov-region');
      if (region) region.classList.remove('pb-region-over');
    });

    canvas.addEventListener('drop', function (e) {
      if (!sortSrc || dragCompId) return;
      var target = e.target.closest('.aegov-region');
      if (!target || target === sortSrc) return;
      e.preventDefault();
      target.classList.remove('pb-region-over');
      var allRegions = Array.from(canvas.querySelectorAll('.aegov-region'));
      if (allRegions.indexOf(sortSrc) < allRegions.indexOf(target)) {
        target.after(sortSrc);
      } else {
        target.before(sortSrc);
      }
      sortSrc.classList.remove('pb-region-sorting');
      sortSrc = null;
    });

    canvas.addEventListener('dragend', function () {
      if (sortSrc) { sortSrc.classList.remove('pb-region-sorting'); sortSrc = null; }
      canvas.querySelectorAll('.pb-region-over').forEach(function (r) { r.classList.remove('pb-region-over'); });
    });
  }

})(jQuery, Drupal, once);
