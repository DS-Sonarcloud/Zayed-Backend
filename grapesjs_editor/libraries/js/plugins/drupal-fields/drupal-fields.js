/**
 * @file
 * Contains drupal-fields.js
 */
(function(window, $) {
  // --- Utils ---
  const addLoadingBlock = (component) => {
    component.components('<div class="lds-dual-ring"></div> ' + Drupal.t('Loading...'));
  };

  const renderComponentContent = (editor, component, response) => {
    const components = component.components();
    components.reset();
    
    if (response) {
      if (typeof response === 'string') {
         component.components(response);
      } else if (response.content) {
         component.components(response.content);
      } else {
         component.components(JSON.stringify(response));
      }
    }
  };

  // --- Components ---
  const loadComponents = (editor, opts = {}) => {
    const domComponents = editor.DomComponents;
    const defaultType = domComponents.getType('default');

    /* Component type : Drupal Field */
    domComponents.addType('drupal-field', {
      isComponent: (el) => {
        return el && el.tagName && el.tagName === 'DRUPAL-FIELD';
      },
      model: {
        defaults: {
          name: opts.componentLabel,
          tagName: `drupal-field`,
          editable: false,
          droppable: false,
          stylable: false,
          propagate: ['editable', 'droppable', 'stylable'],
          traits: [],
        },
        toHTML: function () {
          const defaultHTML = defaultType.model.prototype.toHTML.call(this);
          const $element = $(defaultHTML);
          $element.empty();
          return $element.get(0).outerHTML;
        },
      },
      view: {
        init() {
          const component = this.model;
          if (component.components().length === 0) {
            addLoadingBlock(component);
            
            if (opts.field_route) {
                console.log('DEBUG: Fetching field content from:', opts.field_route);
                $.get(opts.field_route, component.get('attributes')).then((response) => {
                  renderComponentContent(editor, component, response);
                }).catch((response) => {
                  renderComponentContent(editor, component, {
                    tagName: `div`,
                    attributes: {
                      class: 'gjs-drupal-block gjs-block-error',
                    },
                    content: response.responseJSON || 'Error loading field',
                  });
                });
            } else {
                 console.warn('Field route not defined');
            }
          }
        }
      }
    });
  };

  // --- Blocks ---
  const loadBlocks = (editor, opts = {}) => {
    const blockManager = editor.Blocks || editor.BlockManager;
    const fields = opts.fields || [];

    /* Blocks : Drupal Field */
    fields.forEach((field) => {
      const fieldId = `drupal-field-${field.name}`;

      blockManager.add(fieldId, {
        label: field.label,
        category: opts.category,
        attributes: {class: 'fa fa-drupal'},
        content: {
          type: 'drupal-field',
          attributes: {
            'field-name': field.name,
          }
        }
      });
    });
  };

  // --- Main Plugin ---
  window['drupal-fields'] = (editor, opts = {}) => {
    const config = $.extend(true, {
      category: {
        id: 'drupal-fields',
        label: Drupal.t('Drupal Fields'),
        open: false,
        order: 10,
      },
      componentLabel: Drupal.t('Drupal Field'),
    }, opts);

    loadComponents(editor, config);
    loadBlocks(editor, config);
  };

})(window, jQuery);
