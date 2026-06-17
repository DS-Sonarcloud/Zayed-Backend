/**
 * @file
 * Contains drupal-blocks.js 
 */
(function (window, $) {

  // --- Utils ---

  /**
   * Fetch block content from the server and inject into an mj-text component.
   */
  const fetchBlockContent = (editor, mjTextComponent, pluginId, selectedNids, opts) => {
    // Show loading state
    mjTextComponent.components('<div class="lds-dual-ring"></div> ' + Drupal.t('Loading...'));

    const blockRoute = opts.block_route || '/grapesjs-editor/blocks/block';
    const params = { 'block-plugin-id': pluginId };
    if (selectedNids) {
      params['selected-nids'] = selectedNids;
    }

    $.get(blockRoute, params).then((response) => {
      let content = response;
      if (typeof response === 'string') {
        content = response;
      } else if (response && response.content) {
        content = response.content;
      } else if (response) {
        content = JSON.stringify(response);
      }
      mjTextComponent.components(content || Drupal.t('Block content loaded.'));
    }).catch((response) => {
      const errorMsg = (response && response.responseJSON) || Drupal.t('Error loading block');
      mjTextComponent.components('<div class="gjs-drupal-block gjs-block-error">' + errorMsg + '</div>');
    });
  };

  /**
   * Open content selection modal for special blocks (event, news, faculty_staff).
   */
  const openContentModal = (editor, mjTextComponent, pluginId, opts = {}) => {
    const modal = editor.Modal;

    const specialBlocks = {
      'grapesjs_event_list_block': { type: 'event', label: Drupal.t('Select Event') },
      'grapesjs_news_list_block': { type: 'news', label: Drupal.t('Select News') },
      'grapesjs_faculty_staff_list_block': { type: 'faculty_staff', label: Drupal.t('Select Faculty/Staff') }
    };

    if (!specialBlocks[pluginId]) return false;

    const config = specialBlocks[pluginId];
    const items = (opts.content_options && opts.content_options[config.type]) ? opts.content_options[config.type] : [];

    if (items.length === 0) {
      modal.setContent('<div style="padding: 20px; text-align: center;">' + Drupal.t('No items available for selection.') + '</div>');
    } else {
      let html = '<div class="drupal-block-modal-container"><div class="drupal-block-content-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; max-height: 400px; overflow-y: auto;">';

      items.forEach(item => {
        html += '<div class="drupal-block-content-item" data-id="' + item.id + '" style="padding: 10px; border: 1px solid #444; border-radius: 4px; cursor: pointer; background: #333; color: #eee;">' +
          '<strong>' + item.name + '</strong><br><small>ID: ' + item.id + '</small>' +
          '</div>';
      });

      html += '</div></div>';
      modal.setContent(html);

      // Attach events using jQuery
      $('.drupal-block-content-item').on('click', function () {
        const id = $(this).data('id');

        // Store the selected nid as a data attribute on the mj-text component
        const attrs = mjTextComponent.get('attributes') || {};
        attrs['data-selected-nids'] = id;
        attrs['data-block-plugin-id'] = pluginId;
        mjTextComponent.set('attributes', Object.assign({}, attrs));

        // Fetch the block content with the selected nid
        fetchBlockContent(editor, mjTextComponent, pluginId, id, opts);
        modal.close();
      }).on('mouseenter', function () {
        $(this).css('background', '#444');
      }).on('mouseleave', function () {
        $(this).css('background', '#333');
      });
    }

    modal.setTitle(config.label);
    modal.open();
    return true;
  };

  /**
   * Walk component tree to find the first mj-text child.
   */
  const findMjText = (comp) => {
    if (!comp) return null;
    const type = comp.get('type');
    if (type === 'mj-text' || type === 'mj-raw') return comp;
    const children = comp.components();
    if (!children || !children.length) return null;
    for (let i = 0; i < children.length; i++) {
      const found = findMjText(children.at(i));
      if (found) return found;
    }
    return null;
  };

  /**
   * Check if a plugin_id is a special block that needs a content selector modal.
   */
  const isSpecialBlock = (pluginId) => {
    return [
      'grapesjs_event_list_block',
      'grapesjs_news_list_block',
      'grapesjs_faculty_staff_list_block'
    ].includes(pluginId);
  };

  // --- Main Plugin ---
  window['drupal-blocks'] = (editor, opts = {}) => {
    const config = $.extend(true, {
      category: {
        id: 'drupal-blocks',
        label: Drupal.t('Drupal Blocks'),
        open: false,
        order: 20,
      },
      componentLabel: Drupal.t('Drupal Block'),
    }, opts);

    const blockManager = editor.Blocks || editor.BlockManager;
    const blocks = config.blocks || [];

    // Register blocks in the sidebar
    blocks.forEach((block) => {
      const { plugin_id, label } = block;
      const blockId = 'drupal-block-' + plugin_id;

      blockManager.add(blockId, {
        label: label,
        category: config.category,
        attributes: { class: 'fa fa-drupal' },
        content: '<mj-section><mj-column><mj-text data-block-plugin-id="' + plugin_id + '">' + Drupal.t('Loading block...') + '</mj-text></mj-column></mj-section>'
      });
    });

    // Detect when a drupal block is dropped and auto-fetch content / open modal
    editor.on('block:drag:stop', (component, block) => {
      if (!block) return;
      const blockId = block.get('id') || '';
      if (!blockId.startsWith('drupal-block-')) return;
      if (!component) return;

      // Extract plugin_id from block ID
      const pluginId = blockId.replace('drupal-block-', '');

      const mjText = findMjText(component);
      if (!mjText) return;

      // Store plugin-id as a data attribute
      const attrs = mjText.get('attributes') || {};
      attrs['data-block-plugin-id'] = pluginId;
      mjText.set('attributes', Object.assign({}, attrs));

      // For special blocks, open content selection modal first
      if (isSpecialBlock(pluginId)) {
        setTimeout(() => {
          openContentModal(editor, mjText, pluginId, config);
        }, 200);
      } else {
        // For regular blocks, fetch content immediately
        fetchBlockContent(editor, mjText, pluginId, '', config);
      }
    });

    // Double-click on mj-text with block data to re-open content modal
    editor.on('component:dblclick', (component) => {
      if (!component) return;
      const type = component.get('type');
      if (type !== 'mj-text' && type !== 'mj-raw') return;

      const attrs = component.get('attributes') || {};
      const pluginId = attrs['data-block-plugin-id'];
      if (!pluginId) return;

      if (isSpecialBlock(pluginId)) {
        // Open the content selection modal for re-selection
        openContentModal(editor, component, pluginId, config);
      } else {
        // For regular blocks, re-fetch the content
        fetchBlockContent(editor, component, pluginId, attrs['data-selected-nids'] || '', config);
      }
    });
  };

})(window, jQuery);
