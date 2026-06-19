/*!
 * AEGov Page Builder — Visual Canvas JS
 *
 * Responsibilities:
 *  1. CanvasState  — in-memory regions array, serialized to #aegov-canvas-data on every change
 *  2. Drag & drop  — palette → canvas, region reorder
 *  3. Canvas cards — renders each region as a live HTML preview card
 *  4. Side panel   — opens on card click; editable fields; debounced live preview
 *  5. Dynamic mode — content type → field mapping → node picker inside the panel
 */
(function ($, Drupal, once, drupalSettings) {
  'use strict';

  // ─── Settings passed from PHP ───────────────────────────────────────────
  var S = drupalSettings.aegovPageBuilder || {};
  var COMPONENTS      = S.components     || {};
  var CONTENT_TYPES   = S.contentTypes   || {};
  var PREVIEW_URL     = S.previewUrl     || '';
  var CT_FIELDS_URL   = S.ctFieldsUrl    || '';
  var NODES_URL       = S.nodesUrl       || '';
  var NODE_FIELDS_URL = S.nodeFieldsUrl  || '';
  var CSS_URL         = S.cssUrl         || '';
  var JS_URL          = S.jsUrl          || '';
  var FONT_URL        = S.fontUrl        || '';
  var CSRF_TOKEN   = S.csrfToken    || '';
  var LANG         = S.lang         || 'en';

  // ─── Canvas State ────────────────────────────────────────────────────────
  var CanvasState = {
    regions: [],   // [ { component_id, data, data_source, content_type, field_map, max_items, view_mode } ]
    _openIdx: null,

    load: function (existing) {
      this.regions = existing || [];
    },

    add: function (compId) {
      var def = COMPONENTS[compId];
      if (!def) return -1;
      // Build default data from field definitions
      var data = {};
      Object.keys(def.fields || {}).forEach(function (fk) {
        data[fk] = def.fields[fk].default !== undefined ? def.fields[fk].default : '';
      });
      var region = {
        component_id: compId,
        data: data,
        data_source: 'static',
        content_type: '',
        view_mode: 'teaser',
        max_items: 6,
        field_map: {}
      };
      this.regions.push(region);
      this.sync();
      return this.regions.length - 1;
    },

    remove: function (idx) {
      this.regions.splice(idx, 1);
      this.sync();
    },

    update: function (idx, data) {
      if (!this.regions[idx]) return;
      this.regions[idx].data = data;
      this.sync();
    },

    updateMeta: function (idx, key, value) {
      if (!this.regions[idx]) return;
      this.regions[idx][key] = value;
      this.sync();
    },

    reorder: function (fromIdx, toIdx) {
      var r = this.regions.splice(fromIdx, 1)[0];
      this.regions.splice(toIdx, 0, r);
      this.sync();
    },

    sync: function () {
      var field = document.getElementById('aegov-canvas-data');
      if (field) field.value = JSON.stringify(this.regions);
      renderCanvas();
    }
  };

  // ─── Build a full srcdoc HTML string wrapping a component snippet ────────
  function wrapInPage(componentHtml, lang) {
    var dir = (lang === 'ar') ? 'rtl' : 'ltr';
    var fontLink = FONT_URL ? '<link rel="stylesheet" href="' + FONT_URL + '">' : '';
    var cssLink  = CSS_URL  ? '<link rel="stylesheet" href="' + CSS_URL  + '">' : '';
    var jsTag    = JS_URL   ? '<script src="' + JS_URL + '"><\/script>' : '';
    return '<!DOCTYPE html><html lang="' + lang + '" dir="' + dir + '">'
      + '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      + fontLink + cssLink
      + '<style>body{margin:0;padding:0;background:#fff;}</style>'
      + '</head><body class="aegov-page" data-lang="' + lang + '">'
      + componentHtml
      + jsTag
      + '</body></html>';
  }

  // ─── Preview fetch (debounced) ───────────────────────────────────────────
  var _previewTimers = {};

  function fetchPreview(cacheKey, compId, data, lang, callback) {
    clearTimeout(_previewTimers[cacheKey]);
    _previewTimers[cacheKey] = setTimeout(function () {
      fetch(PREVIEW_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': CSRF_TOKEN
        },
        body: JSON.stringify({ component_id: compId, data: data, lang: lang })
      })
      .then(function (r) { return r.json(); })
      .then(function (resp) {
        if (resp.html) callback(wrapInPage(resp.html, lang));
      })
      .catch(function () {
        callback(wrapInPage('<div style="padding:20px;color:#c0392b">Preview unavailable</div>', lang));
      });
    }, 350);
  }

  // ─── Canvas renderer ─────────────────────────────────────────────────────
  var _canvas = null;

  function renderCanvas() {
    if (!_canvas) return;

    // Keep hint visible only when no regions
    var hint = _canvas.querySelector('.aegov-canvas__drop-hint');
    if (hint) hint.style.display = CanvasState.regions.length ? 'none' : '';

    // Sync DOM cards to state — add/remove/reorder
    var existing = Array.from(_canvas.querySelectorAll('.aegov-canvas-card'));

    // Remove cards for removed regions
    existing.forEach(function (card, i) {
      if (i >= CanvasState.regions.length) card.remove();
    });

    // Add or update cards
    CanvasState.regions.forEach(function (region, idx) {
      var card = _canvas.querySelector('[data-region-idx="' + idx + '"]');
      if (!card) {
        card = buildCard(region, idx);
        _canvas.appendChild(card);
      }
      else {
        // Update label + badge in case component/source changed
        var lbl = card.querySelector('.pb-card__label');
        var def = COMPONENTS[region.component_id] || {};
        if (lbl) lbl.textContent = def.label || region.component_id;
        var badge = card.querySelector('.pb-card__source-badge');
        if (badge) {
          badge.className = 'pb-card__source-badge pb-badge--' + (region.data_source || 'static');
          badge.textContent = region.data_source === 'dynamic' ? '⚙ Dynamic' : '✎ Static';
        }
      }
      // (Re-)fetch preview into the iframe
      updateCardPreview(card, region, idx);
    });
  }

  function setIframeSrcdoc(iframe, srcdoc) {
    iframe.srcdoc = srcdoc;
    iframe.onload = function () {
      try {
        var h = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = Math.max(h, 80) + 'px';
      } catch (e) {}
    };
  }

  function updateCardPreview(card, region, idx) {
    if (!region.component_id) return;
    var iframe = card.querySelector('.pb-card__iframe');
    if (!iframe) return;

    var cacheKey = region.component_id + '_' + idx;

    // Dynamic mode with a node selected: fetch node fields, resolve through field_map
    if (region.data_source === 'dynamic' && region.preview_node_id) {
      fetch(NODE_FIELDS_URL + '?nid=' + encodeURIComponent(region.preview_node_id))
        .then(function (r) { return r.json(); })
        .then(function (resp) {
          var nodeFields = resp.fields || {};
          var fieldMap   = region.field_map || {};
          // Build resolved data: for each mapped component field, use the CT field value;
          // fall back to the static data value for unmapped fields.
          var resolved = Object.assign({}, region.data || {});
          Object.keys(fieldMap).forEach(function (compField) {
            var ctField = fieldMap[compField];
            if (ctField && nodeFields[ctField] !== undefined) {
              resolved[compField] = nodeFields[ctField];
            }
          });
          fetchPreview(cacheKey, region.component_id, resolved, LANG, function (srcdoc) {
            setIframeSrcdoc(iframe, srcdoc);
          });
        })
        .catch(function () {
          setIframeSrcdoc(iframe, wrapInPage(
            '<div style="padding:20px;color:#c0392b;font-family:sans-serif">Could not load node fields.</div>', LANG
          ));
        });
      return;
    }

    // Dynamic mode but no node chosen: show a placeholder
    if (region.data_source === 'dynamic') {
      setIframeSrcdoc(iframe, wrapInPage(
        '<div style="padding:24px;text-align:center;color:#aaa;font-family:sans-serif;font-size:13px">'
        + '&#9432; Pick a node in the side panel to preview dynamic data.</div>', LANG
      ));
      return;
    }

    // Static mode: pass region.data directly
    fetchPreview(cacheKey, region.component_id, region.data, LANG, function (srcdoc) {
      setIframeSrcdoc(iframe, srcdoc);
    });
  }

  function buildCard(region, idx) {
    var def = COMPONENTS[region.component_id] || {};
    var card = document.createElement('div');
    card.className = 'aegov-canvas-card';
    card.setAttribute('data-region-idx', idx);

    card.innerHTML =
      '<div class="pb-card__header">'
      +   '<span class="pb-card__handle" draggable="true" title="Drag to reorder">&#8597;</span>'
      +   '<span class="pb-card__label">' + (def.label || region.component_id || 'Empty Region') + '</span>'
      +   '<span class="pb-card__source-badge pb-badge--' + (region.data_source || 'static') + '">'
      +     (region.data_source === 'dynamic' ? '⚙ Dynamic' : '✎ Static')
      +   '</span>'
      +   '<div class="pb-card__actions">'
      +     '<button type="button" class="pb-card__btn pb-card__btn--edit">&#9998; Edit</button>'
      +     '<button type="button" class="pb-card__btn pb-card__btn--remove">&#10005; Remove</button>'
      +   '</div>'
      + '</div>'
      + '<div class="pb-card__preview-wrap">'
      +   '<iframe class="pb-card__iframe" frameborder="0" scrolling="no" srcdoc="<p style=\'padding:16px;color:#bbb;font-family:sans-serif\'>Loading preview&#8230;</p>"></iframe>'
      +   '<div class="pb-card__click-overlay" title="Click to edit this component"></div>'
      + '</div>';

    // Edit button
    card.querySelector('.pb-card__btn--edit').addEventListener('click', function (e) {
      e.stopPropagation();
      SidePanel.open(idx);
    });

    // Click overlay opens panel without interfering with iframe
    card.querySelector('.pb-card__click-overlay').addEventListener('click', function () {
      SidePanel.open(idx);
    });

    // Remove button
    card.querySelector('.pb-card__btn--remove').addEventListener('click', function (e) {
      e.stopPropagation();
      if (SidePanel.currentIdx === idx) SidePanel.close();
      CanvasState.remove(idx);
    });

    return card;
  }

  // ─── Side Panel ──────────────────────────────────────────────────────────
  var SidePanel = {
    el: null,
    currentIdx: null,

    init: function () {
      this.el = document.getElementById('aegov-side-panel');
      if (!this.el) {
        this.el = document.createElement('div');
        this.el.id = 'aegov-side-panel';
        this.el.className = 'aegov-side-panel';
        this.el.innerHTML =
          '<div class="sp-header">'
          +   '<span class="sp-title">Edit Component</span>'
          +   '<button type="button" class="sp-close" title="Close">&#10005;</button>'
          + '</div>'
          + '<div class="sp-body"></div>';
        document.body.appendChild(this.el);
      }
      var self = this;
      this.el.querySelector('.sp-close').addEventListener('click', function () { self.close(); });
    },

    open: function (idx) {
      this.currentIdx = idx;
      var region = CanvasState.regions[idx];
      if (!region) return;

      var def = COMPONENTS[region.component_id] || {};
      this.el.querySelector('.sp-title').textContent = (def.label || 'Edit Component');

      this._buildBody(idx, region, def);
      this.el.classList.add('is-open');
      document.getElementById('aegov-canvas').classList.add('panel-open');
    },

    close: function () {
      this.currentIdx = null;
      this.el.classList.remove('is-open');
      var canvas = document.getElementById('aegov-canvas');
      if (canvas) canvas.classList.remove('panel-open');
    },

    _buildBody: function (idx, region, def) {
      var body = this.el.querySelector('.sp-body');
      body.innerHTML = '';

      // ── Component selector ──────────────────────────────────────────────
      var compSelWrap = document.createElement('div');
      compSelWrap.className = 'sp-field-group';
      var compSelLabel = document.createElement('label');
      compSelLabel.className = 'sp-label';
      compSelLabel.textContent = 'Component';
      var compSel = document.createElement('select');
      compSel.className = 'sp-select sp-comp-select';

      // Group by category
      var cats = { 'Blocks': 'block', 'Components': 'component', 'Patterns': 'pattern' };
      Object.keys(cats).forEach(function (catLabel) {
        var catId = cats[catLabel];
        var optgroup = document.createElement('optgroup');
        optgroup.label = catLabel;
        Object.keys(COMPONENTS).forEach(function (cid) {
          if (COMPONENTS[cid].category === catId) {
            var opt = document.createElement('option');
            opt.value = cid;
            opt.textContent = COMPONENTS[cid].label;
            if (cid === region.component_id) opt.selected = true;
            optgroup.appendChild(opt);
          }
        });
        if (optgroup.children.length) compSel.appendChild(optgroup);
      });

      compSelWrap.appendChild(compSelLabel);
      compSelWrap.appendChild(compSel);
      body.appendChild(compSelWrap);

      var self = this;
      compSel.addEventListener('change', function () {
        var newComp = compSel.value;
        CanvasState.regions[idx].component_id = newComp;
        // Reset data to defaults for new component
        var newDef = COMPONENTS[newComp] || {};
        var data = {};
        Object.keys(newDef.fields || {}).forEach(function (fk) {
          data[fk] = (newDef.fields[fk].default !== undefined) ? newDef.fields[fk].default : '';
        });
        CanvasState.regions[idx].data = data;
        CanvasState.sync();
        self.open(idx); // rebuild panel for new component
      });

      // ── Data source toggle ──────────────────────────────────────────────
      var dsWrap = document.createElement('div');
      dsWrap.className = 'sp-field-group sp-source-toggle';
      dsWrap.innerHTML =
        '<label class="sp-label">Data Source</label>'
        + '<div class="sp-toggle-row">'
        +   '<label class="sp-toggle-opt' + (region.data_source !== 'dynamic' ? ' active' : '') + '" data-val="static">'
        +     '<input type="radio" name="sp_data_source_' + idx + '" value="static"' + (region.data_source !== 'dynamic' ? ' checked' : '') + '> Static'
        +   '</label>'
        +   '<label class="sp-toggle-opt' + (region.data_source === 'dynamic' ? ' active' : '') + '" data-val="dynamic">'
        +     '<input type="radio" name="sp_data_source_' + idx + '" value="dynamic"' + (region.data_source === 'dynamic' ? ' checked' : '') + '> Dynamic'
        +   '</label>'
        + '</div>';
      body.appendChild(dsWrap);

      var staticSection  = document.createElement('div');
      staticSection.className = 'sp-section sp-section--static';
      staticSection.style.display = region.data_source === 'dynamic' ? 'none' : '';

      var dynamicSection = document.createElement('div');
      dynamicSection.className = 'sp-section sp-section--dynamic';
      dynamicSection.style.display = region.data_source === 'dynamic' ? '' : 'none';

      body.appendChild(staticSection);
      body.appendChild(dynamicSection);

      // Toggle between static / dynamic
      dsWrap.querySelectorAll('input[type=radio]').forEach(function (radio) {
        radio.addEventListener('change', function () {
          var val = radio.value;
          CanvasState.updateMeta(idx, 'data_source', val);
          dsWrap.querySelectorAll('.sp-toggle-opt').forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('data-val') === val);
          });
          staticSection.style.display  = val === 'dynamic' ? 'none' : '';
          dynamicSection.style.display = val === 'dynamic' ? '' : 'none';
          if (val === 'dynamic') {
            self._buildDynamic(idx, region, def, dynamicSection);
          }
          // Trigger preview refresh for whichever mode was just selected
          var card = _canvas && _canvas.querySelector('[data-region-idx="' + idx + '"]');
          if (card) updateCardPreview(card, CanvasState.regions[idx], idx);
        });
      });

      // ── Static fields ───────────────────────────────────────────────────
      this._buildStaticFields(idx, region, def, staticSection);

      // ── Dynamic section (if already dynamic) ───────────────────────────
      if (region.data_source === 'dynamic') {
        this._buildDynamic(idx, region, def, dynamicSection);
      }
    },

    _buildStaticFields: function (idx, region, def, container) {
      container.innerHTML = '<div class="sp-section-title">Component Fields</div>';
      var fields = def.fields || {};
      var data   = region.data || {};
      var self   = this;

      Object.keys(fields).forEach(function (fk) {
        var fdef  = fields[fk];

        // Skip hidden/component_slot fields — handled by column builder below.
        if (fdef.type === 'hidden' || fdef.type === 'component_slot') return;

        var value = data[fk] !== undefined ? data[fk] : (fdef.default !== undefined ? fdef.default : '');
        var group = document.createElement('div');
        group.className = 'sp-field-group';

        var label = document.createElement('label');
        label.className = 'sp-label';
        label.textContent = fdef.label || fk;
        group.appendChild(label);

        var input = self._makeInput(fdef, value, fk);
        input.setAttribute('data-field', fk);
        group.appendChild(input);

        if (fdef.description) {
          var desc = document.createElement('small');
          desc.className = 'sp-field-desc';
          desc.textContent = fdef.description;
          group.appendChild(desc);
        }

        container.appendChild(group);

        // Live update on change
        input.addEventListener('input', function () {
          var newData = Object.assign({}, CanvasState.regions[idx].data || {});
          newData[fk] = getInputValue(input, fdef);
          CanvasState.regions[idx].data = newData;
          CanvasState.sync();
        });
        if (input.tagName === 'SELECT') {
          input.addEventListener('change', function () {
            var newData = Object.assign({}, CanvasState.regions[idx].data || {});
            newData[fk] = getInputValue(input, fdef);
            CanvasState.regions[idx].data = newData;
            CanvasState.sync();
          });
        }

        // ── Column Builder helper — shown only for the 'items' repeater on the Columns Layout block ──
        if (fk === 'items' && region.component_id === 'columns') {
          self._buildColumnSlotHelper(idx, region, input, container);
        }
      });
    },

    // Build the visual "Add Column" helper below the items textarea on the Columns Layout block.
    _buildColumnSlotHelper: function (idx, region, itemsTextarea, container) {
      var self = this;

      var helper = document.createElement('div');
      helper.className = 'sp-col-helper';

      helper.innerHTML = '<div class="sp-section-title" style="margin-top:14px">&#9632; Column Builder</div>'
        + '<p class="sp-field-desc" style="margin-bottom:10px">Pick a component and its fields, then click Add Column. It appends to the JSON above.</p>';

      // Component picker
      var pickLabel = document.createElement('label');
      pickLabel.className = 'sp-label';
      pickLabel.textContent = 'Component';
      var pickSel = document.createElement('select');
      pickSel.className = 'sp-select';
      var emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '— Pick a component —';
      pickSel.appendChild(emptyOpt);
      var cats = {'Blocks': 'block', 'Components': 'component', 'Patterns': 'pattern'};
      Object.keys(cats).forEach(function (catLabel) {
        var catId = cats[catLabel];
        var og = document.createElement('optgroup');
        og.label = catLabel;
        Object.keys(COMPONENTS).forEach(function (cid) {
          if (COMPONENTS[cid].category === catId && cid !== 'columns') {
            var o = document.createElement('option');
            o.value = cid;
            o.textContent = COMPONENTS[cid].label;
            og.appendChild(o);
          }
        });
        if (og.children.length) pickSel.appendChild(og);
      });

      // Span picker
      var spanLabel = document.createElement('label');
      spanLabel.className = 'sp-label';
      spanLabel.style.marginTop = '8px';
      spanLabel.textContent = 'Column Span';
      var spanSel = document.createElement('select');
      spanSel.className = 'sp-select';
      [['1','1 col'],['2','2 cols'],['3','3 cols']].forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o[0]; opt.textContent = o[1];
        spanSel.appendChild(opt);
      });

      // Dynamic fields area for selected component
      var compFieldsArea = document.createElement('div');
      compFieldsArea.className = 'sp-col-comp-fields';

      pickSel.addEventListener('change', function () {
        compFieldsArea.innerHTML = '';
        var cid = pickSel.value;
        if (!cid || !COMPONENTS[cid]) return;
        var cdef = COMPONENTS[cid];
        var heading = document.createElement('div');
        heading.className = 'sp-section-title';
        heading.style.fontSize = '10px';
        heading.textContent = cdef.label + ' Fields';
        compFieldsArea.appendChild(heading);

        Object.keys(cdef.fields || {}).forEach(function (cfk) {
          var cfdef = cdef.fields[cfk];
          if (cfdef.type === 'component_slot' || cfdef.type === 'hidden') return;
          var fg = document.createElement('div');
          fg.className = 'sp-field-group';
          fg.style.marginBottom = '8px';
          var lbl = document.createElement('label');
          lbl.className = 'sp-label';
          lbl.textContent = cfdef.label || cfk;
          fg.appendChild(lbl);
          var inp = self._makeInput(cfdef, cfdef.default !== undefined ? cfdef.default : '', cfk);
          inp.setAttribute('data-comp-field', cfk);
          fg.appendChild(inp);
          compFieldsArea.appendChild(fg);
        });
      });

      // Add button
      var addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'sp-col-add-btn';
      addBtn.textContent = '+ Add Column';

      addBtn.addEventListener('click', function () {
        var cid = pickSel.value;
        if (!cid) { alert('Please pick a component first.'); return; }
        var cdef = COMPONENTS[cid] || {};
        var compData = {};
        compFieldsArea.querySelectorAll('[data-comp-field]').forEach(function (inp) {
          var cfk = inp.getAttribute('data-comp-field');
          var cfdef = (cdef.fields || {})[cfk] || {};
          compData[cfk] = getInputValue(inp, cfdef);
        });

        var newItem = {
          span: spanSel.value,
          component_id: cid,
          component_data: compData
        };

        // Parse existing items textarea, append new item, write back.
        var arr = [];
        try { arr = JSON.parse(itemsTextarea.value || '[]'); } catch (e) { arr = []; }
        if (!Array.isArray(arr)) arr = [];
        arr.push(newItem);
        itemsTextarea.value = JSON.stringify(arr, null, 2);

        // Persist to CanvasState.
        var newData = Object.assign({}, CanvasState.regions[idx].data || {});
        newData['items'] = arr;
        CanvasState.regions[idx].data = newData;
        CanvasState.sync();

        // Reset picker for next column.
        pickSel.value = '';
        compFieldsArea.innerHTML = '';
        spanSel.value = '1';
      });

      // Divider line
      var hr = document.createElement('hr');
      hr.style.cssText = 'border:none;border-top:1px solid #f0f0f0;margin:10px 0;';

      // Current columns list (read-only summary + remove buttons)
      var listArea = document.createElement('div');
      listArea.className = 'sp-col-list';
      listArea.style.marginTop = '8px';

      function refreshList() {
        listArea.innerHTML = '';
        var arr = [];
        try { arr = JSON.parse(itemsTextarea.value || '[]'); } catch (e) { arr = []; }
        if (!arr.length) {
          listArea.innerHTML = '<p class="sp-note">No columns added yet.</p>';
          return;
        }
        arr.forEach(function (item, i) {
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:#fafafa;border:1px solid #eee;border-radius:4px;margin-bottom:4px;font-size:11px;';
          var cid = item.component_id || '—';
          var label = (COMPONENTS[cid] || {}).label || cid;
          row.innerHTML = '<span><strong>#' + (i+1) + '</strong> ' + label + ' <em style="color:#aaa">(span ' + (item.span || 1) + ')</em></span>';
          var rmBtn = document.createElement('button');
          rmBtn.type = 'button';
          rmBtn.textContent = '✕';
          rmBtn.style.cssText = 'border:none;background:none;color:#c0392b;cursor:pointer;font-size:13px;padding:0 4px;';
          rmBtn.addEventListener('click', function () {
            arr.splice(i, 1);
            itemsTextarea.value = JSON.stringify(arr, null, 2);
            var newData = Object.assign({}, CanvasState.regions[idx].data || {});
            newData['items'] = arr;
            CanvasState.regions[idx].data = newData;
            CanvasState.sync();
            refreshList();
          });
          row.appendChild(rmBtn);
          listArea.appendChild(row);
        });
      }

      // Refresh list whenever textarea changes manually too.
      itemsTextarea.addEventListener('input', refreshList);

      helper.appendChild(pickLabel);
      helper.appendChild(pickSel);
      helper.appendChild(spanLabel);
      helper.appendChild(spanSel);
      helper.appendChild(compFieldsArea);
      helper.appendChild(addBtn);
      helper.appendChild(hr);
      helper.appendChild(listArea);
      container.appendChild(helper);

      refreshList();
    },

    _buildDynamic: function (idx, region, def, container) {
      container.innerHTML = '<div class="sp-section-title">Dynamic Data</div>';

      // Step 1: Content type select
      var ctGroup = document.createElement('div');
      ctGroup.className = 'sp-field-group';
      ctGroup.innerHTML = '<label class="sp-label">Content Type</label>';
      var ctSel = document.createElement('select');
      ctSel.className = 'sp-select';
      var emptyOpt = document.createElement('option');
      emptyOpt.value = '';
      emptyOpt.textContent = '— Select content type —';
      ctSel.appendChild(emptyOpt);
      Object.keys(CONTENT_TYPES).forEach(function (cid) {
        var opt = document.createElement('option');
        opt.value = cid;
        opt.textContent = CONTENT_TYPES[cid];
        if (cid === region.content_type) opt.selected = true;
        ctSel.appendChild(opt);
      });
      ctGroup.appendChild(ctSel);
      container.appendChild(ctGroup);

      // Placeholder for field mapping + node picker
      var mappingArea = document.createElement('div');
      mappingArea.className = 'sp-mapping-area';
      container.appendChild(mappingArea);

      var self = this;

      function loadMapping(ct) {
        if (!ct) { mappingArea.innerHTML = ''; return; }
        CanvasState.updateMeta(idx, 'content_type', ct);
        mappingArea.innerHTML = '<div class="sp-loading">Loading fields&#8230;</div>';

        fetch(CT_FIELDS_URL + '?content_type=' + encodeURIComponent(ct))
          .then(function (r) { return r.json(); })
          .then(function (resp) {
            self._buildFieldMapping(idx, region, def, resp.fields || [], mappingArea);
          })
          .catch(function () {
            mappingArea.innerHTML = '<div class="pb-preview-error">Could not load fields.</div>';
          });
      }

      ctSel.addEventListener('change', function () { loadMapping(ctSel.value); });

      // Auto-load if already set
      if (region.content_type) loadMapping(region.content_type);
    },

    _buildFieldMapping: function (idx, region, def, ctFields, container) {
      container.innerHTML = '';

      // Step 2: Max items + view mode
      var settingsRow = document.createElement('div');
      settingsRow.className = 'sp-field-row';
      settingsRow.innerHTML =
        '<div class="sp-field-group sp-half">'
        +   '<label class="sp-label">Max Items</label>'
        +   '<input type="number" class="sp-input" min="1" max="100" value="' + (region.max_items || 6) + '" data-meta="max_items">'
        + '</div>'
        + '<div class="sp-field-group sp-half">'
        +   '<label class="sp-label">Display Mode</label>'
        +   '<select class="sp-select" data-meta="view_mode">'
        +     '<option value="teaser"' + (region.view_mode === 'teaser' ? ' selected' : '') + '>Teaser</option>'
        +     '<option value="full"'   + (region.view_mode === 'full'   ? ' selected' : '') + '>Full</option>'
        +     '<option value="card"'   + (region.view_mode === 'card'   ? ' selected' : '') + '>Card</option>'
        +   '</select>'
        + '</div>';
      container.appendChild(settingsRow);
      settingsRow.querySelectorAll('[data-meta]').forEach(function (el) {
        el.addEventListener('change', function () { CanvasState.updateMeta(idx, el.getAttribute('data-meta'), el.value); });
      });

      // Step 3: Field mapping table
      var fieldDefs = def.fields || {};
      var compFields = Object.keys(fieldDefs);
      if (!compFields.length || !ctFields.length) {
        container.insertAdjacentHTML('beforeend', '<p class="sp-note">No mappable fields found.</p>');
      }
      else {
        var mapTitle = document.createElement('div');
        mapTitle.className = 'sp-section-title';
        mapTitle.textContent = 'Map Content Type Fields';
        container.appendChild(mapTitle);

        var table = document.createElement('div');
        table.className = 'sp-map-table';
        var hdr = document.createElement('div');
        hdr.className = 'sp-map-row sp-map-header';
        hdr.innerHTML = '<span>Component Field</span><span>Content Type Field</span>';
        table.appendChild(hdr);

        compFields.forEach(function (fk) {
          var row = document.createElement('div');
          row.className = 'sp-map-row';
          var compLabel = document.createElement('span');
          compLabel.textContent = fieldDefs[fk].label || fk;

          var ctSel2 = document.createElement('select');
          ctSel2.className = 'sp-select';
          var none = document.createElement('option');
          none.value = '';
          none.textContent = '— Static —';
          ctSel2.appendChild(none);
          ctFields.forEach(function (f) {
            var o = document.createElement('option');
            o.value = f.name;
            o.textContent = f.label + ' (' + f.type + ')';
            if ((region.field_map || {})[fk] === f.name) o.selected = true;
            ctSel2.appendChild(o);
          });

          ctSel2.addEventListener('change', function () {
            var map = Object.assign({}, CanvasState.regions[idx].field_map || {});
            if (ctSel2.value) map[fk] = ctSel2.value;
            else delete map[fk];
            CanvasState.regions[idx].field_map = map;
            CanvasState.sync();
            // If a node is already selected, refresh the preview with the new mapping
            var reg = CanvasState.regions[idx];
            if (reg && reg.preview_node_id) {
              var card = _canvas && _canvas.querySelector('[data-region-idx="' + idx + '"]');
              if (card) updateCardPreview(card, reg, idx);
            }
          });

          row.appendChild(compLabel);
          row.appendChild(ctSel2);
          table.appendChild(row);
        });
        container.appendChild(table);
      }

      // Step 4: Node picker
      var ct = region.content_type;
      if (ct) {
        var nodeTitle = document.createElement('div');
        nodeTitle.className = 'sp-section-title';
        nodeTitle.textContent = 'Preview with a specific node';
        container.appendChild(nodeTitle);

        var nodeSel = document.createElement('select');
        nodeSel.className = 'sp-select';
        nodeSel.innerHTML = '<option value="">— Loading nodes&#8230; —</option>';
        container.appendChild(nodeSel);

        fetch(NODES_URL + '?content_type=' + encodeURIComponent(ct) + '&limit=30')
          .then(function (r) { return r.json(); })
          .then(function (resp) {
            nodeSel.innerHTML = '<option value="">— Pick a node (optional) —</option>';
            (resp.nodes || []).forEach(function (n) {
              var o = document.createElement('option');
              o.value = n.nid;
              o.textContent = n.title;
              if (region.preview_node_id == n.nid) o.selected = true;
              nodeSel.appendChild(o);
            });
          });

        nodeSel.addEventListener('change', function () {
          CanvasState.updateMeta(idx, 'preview_node_id', nodeSel.value);
          // Re-fetch preview immediately with the newly selected node
          var card = _canvas && _canvas.querySelector('[data-region-idx="' + idx + '"]');
          if (card) updateCardPreview(card, CanvasState.regions[idx], idx);
        });
      }
    },

    _makeInput: function (fdef, value, fk) {
      var el;
      switch (fdef.type) {
        case 'textarea':
          el = document.createElement('textarea');
          el.className = 'sp-textarea';
          el.rows = 3;
          el.value = value || '';
          break;

        case 'select':
          el = document.createElement('select');
          el.className = 'sp-select';
          Object.keys(fdef.options || {}).forEach(function (k) {
            var o = document.createElement('option');
            o.value = k;
            o.textContent = fdef.options[k];
            if (k == value) o.selected = true;
            el.appendChild(o);
          });
          break;

        case 'boolean':
          el = document.createElement('input');
          el.type = 'checkbox';
          el.className = 'sp-checkbox';
          el.checked = !!value;
          break;

        case 'image':
          el = document.createElement('input');
          el.type = 'url';
          el.className = 'sp-input';
          el.value = value || '';
          el.placeholder = '/sites/default/files/image.jpg';
          break;

        case 'repeater':
          el = document.createElement('textarea');
          el.className = 'sp-textarea sp-repeater';
          el.rows = 5;
          el.value = Array.isArray(value) ? JSON.stringify(value, null, 2) : (value || '[]');
          el.placeholder = 'JSON array of items';
          break;

        default:  // text, entity_reference, etc.
          el = document.createElement('input');
          el.type = 'text';
          el.className = 'sp-input';
          el.value = value || '';
      }
      return el;
    }
  };

  function getInputValue(input, fdef) {
    if (fdef.type === 'boolean') return input.checked;
    if (fdef.type === 'repeater') {
      try { return JSON.parse(input.value); } catch (e) { return []; }
    }
    return input.value;
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────────
  var _dragCompId   = null;
  var _dragCompLabel= null;
  var _sortSrc      = null;

  function initDragDrop() {
    once('pb-palette', '.aegov-palette__item').forEach(function (item) {
      item.setAttribute('draggable', 'true');

      item.addEventListener('dragstart', function (e) {
        _dragCompId    = item.getAttribute('data-component-id');
        _dragCompLabel = item.getAttribute('data-component-label');
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', _dragCompId);
        item.classList.add('pb-dragging');
        var hint = document.querySelector('.aegov-canvas__drop-hint');
        if (hint) hint.classList.add('pb-hint-active');
      });

      item.addEventListener('dragend', function () {
        _dragCompId = null;
        item.classList.remove('pb-dragging');
        var hint = document.querySelector('.aegov-canvas__drop-hint');
        if (hint) hint.classList.remove('pb-hint-active');
        var canvas = document.getElementById('aegov-canvas-regions');
        if (canvas) canvas.classList.remove('pb-canvas-over');
      });

      item.addEventListener('dblclick', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var newIdx = CanvasState.add(item.getAttribute('data-component-id'));
        if (newIdx >= 0) {
          // Small delay so card is rendered before opening panel
          setTimeout(function () { SidePanel.open(newIdx); }, 100);
        }
      });
    });

    var canvas = document.getElementById('aegov-canvas-regions');
    if (!canvas) return;

    canvas.addEventListener('dragover', function (e) {
      if (!_dragCompId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      canvas.classList.add('pb-canvas-over');
    });

    canvas.addEventListener('dragleave', function (e) {
      if (!canvas.contains(e.relatedTarget)) canvas.classList.remove('pb-canvas-over');
    });

    canvas.addEventListener('drop', function (e) {
      if (!_dragCompId) return;
      e.preventDefault();
      canvas.classList.remove('pb-canvas-over');
      var id = _dragCompId;
      _dragCompId = null;
      var newIdx = CanvasState.add(id);
      if (newIdx >= 0) setTimeout(function () { SidePanel.open(newIdx); }, 100);
    });

    // Region reorder via header handle
    canvas.addEventListener('dragstart', function (e) {
      if (_dragCompId) return;
      var handle = e.target.closest('.pb-card__handle');
      if (!handle) { e.preventDefault(); return; }
      _sortSrc = handle.closest('.aegov-canvas-card');
      if (!_sortSrc) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'sort');
      _sortSrc.classList.add('pb-card--sorting');
    });

    canvas.addEventListener('dragover', function (e) {
      if (!_sortSrc || _dragCompId) return;
      var card = e.target.closest('.aegov-canvas-card');
      if (card && card !== _sortSrc) {
        e.preventDefault();
        canvas.querySelectorAll('.pb-card--sort-over').forEach(function (c) { c.classList.remove('pb-card--sort-over'); });
        card.classList.add('pb-card--sort-over');
      }
    });

    canvas.addEventListener('drop', function (e) {
      if (!_sortSrc || _dragCompId) return;
      var card = e.target.closest('.aegov-canvas-card');
      if (!card || card === _sortSrc) return;
      e.preventDefault();
      card.classList.remove('pb-card--sort-over');
      var fromIdx = parseInt(_sortSrc.getAttribute('data-region-idx'));
      var toIdx   = parseInt(card.getAttribute('data-region-idx'));
      _sortSrc.classList.remove('pb-card--sorting');
      _sortSrc = null;
      if (!isNaN(fromIdx) && !isNaN(toIdx)) CanvasState.reorder(fromIdx, toIdx);
    });

    canvas.addEventListener('dragend', function () {
      if (_sortSrc) { _sortSrc.classList.remove('pb-card--sorting'); _sortSrc = null; }
      canvas.querySelectorAll('.pb-card--sort-over').forEach(function (c) { c.classList.remove('pb-card--sort-over'); });
    });
  }

  // ─── Sync lang from form select ──────────────────────────────────────────
  function initLangSync() {
    var langSel = document.querySelector('select[name="meta[lang]"]');
    if (langSel) {
      LANG = langSel.value;
      langSel.addEventListener('change', function () {
        LANG = langSel.value;
        CanvasState.sync();
      });
    }
  }

  // ─── Palette search filter ────────────────────────────────────────────────
  function initPaletteSearch() {
    var input = document.getElementById('aegov-palette-search');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      document.querySelectorAll('.aegov-palette__item').forEach(function (item) {
        var label = (item.getAttribute('data-component-label') || '').toLowerCase();
        var desc  = (item.querySelector('.aegov-palette__desc') || {}).textContent || '';
        var match = !q || label.indexOf(q) !== -1 || desc.toLowerCase().indexOf(q) !== -1;
        item.classList.toggle('pb-hidden', !match);
      });
      // Open all groups when searching, close when cleared
      document.querySelectorAll('.aegov-palette details').forEach(function (det) {
        if (q) {
          det.open = true;
        }
      });
      // Update per-category counts in summary badges
      updateCategoryBadges();
    });
  }

  // ─── Category count badges ────────────────────────────────────────────────
  function updateCategoryBadges() {
    document.querySelectorAll('.aegov-palette details').forEach(function (det) {
      var total   = det.querySelectorAll('.aegov-palette__item').length;
      var visible = det.querySelectorAll('.aegov-palette__item:not(.pb-hidden)').length;
      var badge   = det.querySelector('summary .palette-cat-count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'palette-cat-count';
        det.querySelector('summary').appendChild(badge);
      }
      badge.textContent = visible + (visible < total ? '/' + total : '');
    });
  }

  // ─── Component counter in toolbar ────────────────────────────────────────
  function updateComponentCount() {
    var el = document.getElementById('abt-component-count');
    if (!el) return;
    var n = CanvasState.regions.length;
    el.textContent = n + (n === 1 ? ' component' : ' components');
  }

  // ─── Device preview switcher ─────────────────────────────────────────────
  function initDeviceSwitcher() {
    var widths = { desktop: '', tablet: '768px', mobile: '390px' };
    document.querySelectorAll('.abt-device-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.abt-device-btn').forEach(function (b) { b.classList.remove('abt-device-btn--active'); });
        btn.classList.add('abt-device-btn--active');
        var device = btn.getAttribute('data-device');
        var canvas = document.getElementById('aegov-canvas');
        if (widths[device]) {
          canvas.style.maxWidth = widths[device];
          canvas.style.margin   = '0 auto';
        } else {
          canvas.style.maxWidth = '';
          canvas.style.margin   = '';
        }
      });
    });
  }

  // ─── Clear All button ─────────────────────────────────────────────────────
  function initClearAll() {
    var btn = document.getElementById('aegov-canvas-clear');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!CanvasState.regions.length) return;
      if (!confirm('Remove all components from the canvas?')) return;
      CanvasState.regions = [];
      CanvasState.sync();
    });
  }

  // ─── Page title sync in toolbar ──────────────────────────────────────────
  function initTitleSync() {
    var titleInput = document.querySelector('input[name="meta[title]"]');
    var label = document.querySelector('.aegov-builder-toolbar__page-name');
    if (titleInput && label) {
      titleInput.addEventListener('input', function () {
        label.textContent = titleInput.value || 'New Page';
      });
    }
  }

  // ─── Boot ────────────────────────────────────────────────────────────────
  Drupal.behaviors.aegovPageBuilderVisual = {
    attach: function (context) {
      // Use document as root so toolbar/palette elements outside #aegov-canvas are found
      var root = context === document ? document : context.ownerDocument || document;
      once('pb-visual-init', '#aegov-canvas', root).forEach(function (el) {
        _canvas = document.getElementById('aegov-canvas-regions');
        SidePanel.init();
        CanvasState.load(S.existingRegions || []);
        initLangSync();
        initDragDrop();
        initPaletteSearch();
        initDeviceSwitcher();
        initClearAll();
        initTitleSync();
        updateCategoryBadges();
        // Patch sync to update toolbar count on every canvas change
        var _origSync = CanvasState.sync.bind(CanvasState);
        CanvasState.sync = function () {
          _origSync();
          updateComponentCount();
        };
        // Initial render of any existing regions (edit mode)
        if (CanvasState.regions.length) CanvasState.sync();
        else updateComponentCount();
        var hint = _canvas.querySelector('.aegov-canvas__drop-hint');
        if (hint && CanvasState.regions.length) hint.style.display = 'none';
      });
    }
  };

})(jQuery, Drupal, once, drupalSettings);
