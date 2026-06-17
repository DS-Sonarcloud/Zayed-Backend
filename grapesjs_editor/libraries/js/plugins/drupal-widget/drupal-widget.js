/**
 * @file
 * Contains drupal-widget.js - Drupal Content Widget plugin for GrapesJS
 */
(function (window, $) {

  /**
   * Create a multi-step modal for widget configuration.
   */
  const openWidgetModal = (editor, mjTextComponent, opts = {}) => {
    const modal = editor.Modal;
    const widgetApi = opts.widget_api || {};
    const contentTypes = opts.content_types || [];

    // Load initial state from attributes
    const initialAttrs = mjTextComponent.get('attributes') || {};
    let selectedContentType = initialAttrs['data-content-type'] || '';
    let selectedNodeId = initialAttrs['data-node-id'] || '';
    let selectedFields = initialAttrs['data-selected-fields'] ? initialAttrs['data-selected-fields'].split(',') : [];
    let availableFields = [];

    // Step 1: Content Type Selection
    const showContentTypeStep = () => {
      let html = '<div class="drupal-widget-modal">';
      html += '<div class="drupal-widget-step drupal-widget-step--content-type">';
      html += '<h3>' + Drupal.t('Step 1: Select Content Type') + '</h3>';
      html += '<div class="drupal-widget-form-group">';
      html += '<label for="widget-content-type label-color">' + Drupal.t('Content Type') + '</label>';
      html += '<select id="widget-content-type" class="drupal-widget-select">';
      html += '<option value="">' + Drupal.t('- Select Content Type -') + '</option>';

      contentTypes.forEach(type => {
        html += '<option value="' + type.id + '">' + type.label + '</option>';
      });

      html += '</select>';
      html += '</div>';
      html += '<div class="drupal-widget-actions">';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--primary" id="widget-next-to-node" disabled>' + Drupal.t('Next') + '</button>';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--secondary" id="widget-cancel">' + Drupal.t('Cancel') + '</button>';
      html += '</div>';
      html += '</div></div>';

      modal.setTitle(Drupal.t('Configure Widget'));
      modal.setContent(html);
      modal.open();

      // Event handlers
      $('#widget-content-type').on('change', function () {
        selectedContentType = $(this).val();
        $('#widget-next-to-node').prop('disabled', !selectedContentType);
      });

      $('#widget-next-to-node').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (selectedContentType) {
          showNodeSelectionStep();
        }
      });

      $('#widget-cancel').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        modal.close();
      });
    };

    // Step 2: Node Selection
    const showNodeSelectionStep = () => {
      let html = '<div class="drupal-widget-modal">';
      html += '<div class="drupal-widget-step drupal-widget-step--node">';
      html += '<h3>' + Drupal.t('Step 2: Select Node') + '</h3>';
      html += '<div class="drupal-widget-form-group label-color">';
      html += '<label>' + Drupal.t('Selected Content Type: @type', { '@type': selectedContentType }) + '</label>';
      html += '<input type="text" id="widget-node-search" class="drupal-widget-input" placeholder="' + Drupal.t('Search nodes...') + '">';
      html += '<div id="widget-node-list" class="drupal-widget-node-list" style="max-height: 300px; overflow-y: auto; margin-top: 10px;">';
      html += '<div class="drupal-widget-loading">' + Drupal.t('Loading nodes...') + '</div>';
      html += '</div>';
      html += '</div>';
      html += '<div class="drupal-widget-actions">';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--secondary" id="widget-back-to-type">' + Drupal.t('Back') + '</button>';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--primary" id="widget-next-to-fields" disabled>' + Drupal.t('Next') + '</button>';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--secondary" id="widget-cancel">' + Drupal.t('Cancel') + '</button>';
      html += '</div>';
      html += '</div></div>';

      modal.setContent(html);

      // Load nodes
      const loadNodes = (search = '') => {
        const nodesRoute = widgetApi.nodes_route || '/grapesjs-editor/widget/nodes-by-type';
        $.get(nodesRoute, { content_type: selectedContentType, search: search })
          .then(nodes => {
            let nodeHtml = '';
            if (nodes.length === 0) {
              nodeHtml = '<div class="drupal-widget-empty">' + Drupal.t('No nodes found.') + '</div>';
            } else {
              nodeHtml = '<div class="drupal-widget-grid">';
              nodes.forEach(node => {
                nodeHtml += '<div class="drupal-widget-node-item" data-node-id="' + node.id + '">';
                nodeHtml += '<strong>' + node.title + '</strong><br>';
                nodeHtml += '<small>ID: ' + node.id + '</small>';
                nodeHtml += '</div>';
              });
              nodeHtml += '</div>';
            }
            $('#widget-node-list').html(nodeHtml);

            // Attach click handlers
            $('.drupal-widget-node-item').on('click', function () {
              $('.drupal-widget-node-item').removeClass('selected');
              $(this).addClass('selected');
              selectedNodeId = $(this).data('node-id');
              $('#widget-next-to-fields').prop('disabled', false);
            });
          })
          .catch(() => {
            $('#widget-node-list').html('<div class="drupal-widget-error">' + Drupal.t('Error loading nodes.') + '</div>');
          });
      };

      loadNodes();

      // Search handler
      let searchTimeout;
      $('#widget-node-search').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          loadNodes($(this).val());
        }, 300);
      });

      // Navigation handlers
      $('#widget-back-to-type').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContentTypeStep();
      });
      $('#widget-next-to-fields').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedNodeId) {
          showFieldSelectionStep();
        }
      });
      $('#widget-cancel').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.close();
      });
    };

    // Step 3: Field Selection
    const showFieldSelectionStep = () => {
      let html = '<div class="drupal-widget-modal">';
      html += '<div class="drupal-widget-step drupal-widget-step--fields">';
      html += '<h3>' + Drupal.t('Step 3: Select Fields') + '</h3>';
      html += '<div class="drupal-widget-form-group label-color">';
      html += '<label>' + Drupal.t('Node ID: @id', { '@id': selectedNodeId }) + '</label>';
      html += '<div id="widget-available-fields" class="drupal-widget-field-list" style="max-height: 200px; overflow-y: auto;">';
      html += '<div class="drupal-widget-loading">' + Drupal.t('Loading fields...') + '</div>';
      html += '</div>';
      html += '<div class="drupal-widget-selected-fields" style="margin-top: 20px;">';
      html += '<h4>' + Drupal.t('Selected Fields') + '</h4>';
      html += '<div id="widget-selected-fields-list" class="drupal-widget-selected-list"></div>';
      html += '</div>';
      html += '</div>';
      html += '<div class="drupal-widget-actions">';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--secondary" id="widget-back-to-node">' + Drupal.t('Back') + '</button>';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--primary" id="widget-save">' + Drupal.t('Save Widget') + '</button>';
      html += '<button type="button" class="drupal-widget-btn drupal-widget-btn--secondary" id="widget-cancel">' + Drupal.t('Cancel') + '</button>';
      html += '</div>';
      html += '</div></div>';

      modal.setContent(html);

      // Load fields
      const fieldsRoute = widgetApi.fields_route || '/grapesjs-editor/widget/content-type-fields';
      $.get(fieldsRoute, { content_type: selectedContentType })
        .then(fields => {
          availableFields = fields;
          renderAvailableFields();
        })
        .catch(() => {
          $('#widget-available-fields').html('<div class="drupal-widget-error">' + Drupal.t('Error loading fields.') + '</div>');
        });

      const renderAvailableFields = () => {
        let fieldHtml = '<div class="drupal-widget-field-checkboxes">';
        availableFields.forEach(field => {
          const isSelected = selectedFields.includes(field.name);
          fieldHtml += '<label class="drupal-widget-field-checkbox">';
          fieldHtml += '<input type="checkbox" value="' + field.name + '" ' + (isSelected ? 'checked' : '') + '>';
          fieldHtml += '<span>' + field.label + ' <small>(' + field.name + ')</small></span>';
          fieldHtml += '</label>';
        });
        fieldHtml += '</div>';
        $('#widget-available-fields').html(fieldHtml);

        // Attach change handlers
        $('.drupal-widget-field-checkbox input').on('change', function () {
          const fieldName = $(this).val();
          if ($(this).is(':checked')) {
            if (!selectedFields.includes(fieldName)) {
              selectedFields.push(fieldName);
            }
          } else {
            selectedFields = selectedFields.filter(f => f !== fieldName);
          }
          renderSelectedFields();
        });
      };

      const renderSelectedFields = () => {
        if (selectedFields.length === 0) {
          $('#widget-selected-fields-list').html('<div class="drupal-widget-empty">' + Drupal.t('No fields selected.') + '</div>');
          return;
        }

        let selectedHtml = '<ul class="drupal-widget-selected-items">';
        selectedFields.forEach(fieldName => {
          const field = availableFields.find(f => f.name === fieldName);
          if (field) {
            selectedHtml += '<li>';
            selectedHtml += '<span>' + field.label + '</span>';
            selectedHtml += '<button class="drupal-widget-remove-field" data-field="' + fieldName + '">×</button>';
            selectedHtml += '</li>';
          }
        });
        selectedHtml += '</ul>';
        $('#widget-selected-fields-list').html(selectedHtml);

        // Attach remove handlers
        $('.drupal-widget-remove-field').on('click', function () {
          const fieldName = $(this).data('field');
          selectedFields = selectedFields.filter(f => f !== fieldName);
          renderAvailableFields();
          renderSelectedFields();
        });
      };

      renderSelectedFields();

      // Navigation handlers
      $('#widget-back-to-node').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showNodeSelectionStep();
      });
      $('#widget-save').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveWidget();
      });
      $('#widget-cancel').on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modal.close();
      });
    };

    // Save widget configuration
    const saveWidget = () => {
      if (!selectedContentType || !selectedNodeId || selectedFields.length === 0) {
        alert(Drupal.t('Please complete all steps before saving.'));
        return;
      }

      // Store configuration in component attributes
      const attrs = mjTextComponent.get('attributes') || {};
      attrs['data-block-plugin-id'] = 'grapesjs_widget_block';
      attrs['data-content-type'] = selectedContentType;
      attrs['data-node-id'] = selectedNodeId;
      attrs['data-selected-fields'] = selectedFields.join(',');
      mjTextComponent.set('attributes', Object.assign({}, attrs));

      // Fetch and render widget content
      const blockRoute = opts.block_route || '/grapesjs-editor/blocks/block';
      mjTextComponent.components('<div class="lds-dual-ring"></div> ' + Drupal.t('Loading widget...'));

      $.post({
        url: blockRoute,
        data: {
          'block-plugin-id': 'grapesjs_widget_block',
          'content-type': selectedContentType,
          'node-id': selectedNodeId,
          'selected-fields': selectedFields.join(',')
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      }).then(response => {
        let content = response;
        if (typeof response === 'string') {
          content = response;
        } else if (response && response.content) {
          content = response.content;
        } else if (response) {
          content = JSON.stringify(response);
        }

        
        // Find parent column to replace content at column level for MJML compatibility
        const parent = mjTextComponent.parent();
        if (parent && (parent.get('type') === 'mj-column' || parent.get('type') === 'mj-section')) {
          // Clear existing components first
          parent.components('');
          parent.components(content || Drupal.t('Widget loaded.'));

        } else {
          // Clear existing components first
          mjTextComponent.components('');
          // Then add the new content
          mjTextComponent.components(content || Drupal.t('Widget loaded.'));

        }
      }).catch(() => {
        mjTextComponent.components('<div class="gjs-drupal-block gjs-block-error">' + Drupal.t('Error loading widget') + '</div>');
      });

      modal.close();
    };

    // Start with content type selection
    showContentTypeStep();
  };

  /**
   * Find the widget component by attribute.
   */
  const findMjWidget = (comp) => {
    if (!comp) return null;
    
    const attrs = comp.get('attributes') || {};
    if (attrs['data-block-plugin-id'] === 'grapesjs_widget_block') return comp;

    const children = comp.components();
    if (!children || !children.length) return null;
    
    for (let i = 0; i < children.length; i++) {
      const found = findMjWidget(children.at(i));
      if (found) return found;
    }
    return null;
  };

  // Main Plugin
  window['drupal-widget'] = (editor, opts = {}) => {
    const config = $.extend(true, {
      category: {
        id: 'drupal-blocks',
        label: Drupal.t('Drupal Blocks'),
        open: false,
        order: 20,
      },
      componentLabel: Drupal.t('Drupal Content Widget'),
    }, opts);

    const blockManager = editor.Blocks || editor.BlockManager;

    // Add widget block to blocks panel
    blockManager.add('drupal-widget-block', {
      label: Drupal.t('Drupal Content Widget'),
      category: config.category,
      attributes: { class: 'fa fa-puzzle-piece' },
      content: '<mj-section><mj-column><mj-text data-block-plugin-id="grapesjs_widget_block">' + Drupal.t('Configure widget...') + '</mj-text></mj-column></mj-section>'
    });

    // Detect when widget is dropped
    editor.on('block:drag:stop', (component, block) => {
      if (!block) return;
      const blockId = block.get('id') || '';
      if (blockId !== 'drupal-widget-block') return;
      if (!component) return;

      const mjWidget = findMjWidget(component);
      if (!mjWidget) return;
      
      // Open widget configuration modal
      setTimeout(() => {
        openWidgetModal(editor, mjWidget, config);
      }, 200);
    });

    // Double-click to reconfigure widget
    editor.on('component:dblclick', (component) => {
      if (!component) return;
      
      // Try to find the widget attribute in the clicked component or its parents/children
      let target = component;
      while (target) {
        const attrs = target.get('attributes') || {};
        if (attrs['data-block-plugin-id'] === 'grapesjs_widget_block') {
          openWidgetModal(editor, target, config);
          return;
        }
        target = target.parent();
      }

      // If not found in parents, try children 
      const childWidget = findMjWidget(component);
      if (childWidget) {
        openWidgetModal(editor, childWidget, config);
      }
    });
  };

})(window, jQuery);
