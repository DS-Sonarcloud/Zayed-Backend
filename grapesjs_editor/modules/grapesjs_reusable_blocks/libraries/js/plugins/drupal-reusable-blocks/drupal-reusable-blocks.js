/**
 * @file
 * Contains drupal-reusable-blocks.js
 */
(function(window, $, Drupal) {

  // --- Utils from GrapesJsEditor/utils/component (inlined) ---
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

  // --- Commands ---
  const loadCommands = (editor, opts = {}) => {
    const blockManager = editor.BlockManager;
    const commands = editor.Commands;
    const modal = editor.Modal;

    const pfx = editor.getConfig().stylePrefix || 'gjs-';
    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.innerHTML = opts.modalSaveButtonLabel;
    btnEdit.className = pfx + 'btn-prim ' + pfx + 'btn-import';
    btnEdit.onclick = (e) => {
      const $parent = $(e.target).parent('.create-block-form');
      const $statusMessage = $('.status-message', $parent);
      const selected = editor.getSelected();
      const css = editor.CodeManager.getCode(selected, 'css', {cssc: editor.CssComposer});
      const style = css && `<style>${css}</style>`;
      const blockTitle = $('[name="block-title"]', $parent).val();
      // Ensure we have a selected component
      if (!selected) {
          $statusMessage.text('No component selected');
          return;
      }
      const blockBody = style + selected.toHTML();

      $statusMessage.empty();
      // FIX: Ensure block_create_route is defined
      if (opts.block_create_route) {
          $.post(opts.block_create_route, {
            title: blockTitle,
            body: blockBody
          }).then((response) => {
            const blockId = `drupal-reusable-block-${response.id}`;
            blockManager.add(blockId, {
              label: response.label,
              category: opts.category,
              attributes: {class: 'fa fa-drupal'},
              content: {
                type: 'drupal-reusable-block',
                attributes: {
                  'block-plugin-id': response.id,
                }
              }
            });

            modal.close();
          })
            .catch((response) => {
              $statusMessage.append(
                $('<div/>', {html: response.responseJSON || 'Error processing request', class: pfx + 'alert-error'})
              );
            });
      } else {
         console.warn('block_create_route not defined');
      }
    };
    
    const $form = $('<div/>', {class: 'create-block-form'}).append(
      $('<div/>', {class: 'status-message'}),
      $('<div/>', {class: pfx + 'form-item form-item'}).append(
        $('<label/>', {
          class: pfx + 'form-required form-required',
          for: 'block-title',
          text: opts.modalNameInputLabel,
        }),
        $('<input />', {
          class: pfx + 'form-text form-text required',
          id: 'block-title',
          name: 'block-title',
          type: 'text',
          required: 'required'
        })
      ),
      btnEdit
    );

    /* Commands : add reusable command */
    commands.add(opts.commandId, {
      run() {
        modal.open({
          title: opts.modalTitle,
          content: $form,
        }).onceClose(() => this.stopCommand());
      },
      stop() {
        modal.close();
      },
    });
  };

  // --- Components ---
  const loadComponents = (editor, opts = {}) => {
    const domComponents = editor.DomComponents;

    /* Component type : Drupal Reusable Block */
    domComponents.addType('drupal-reusable-block', {
      isComponent: () => {
        return false;
      },
      view: {
        // FIX: Use init() and this.model instead of init(component) argument
        init() {
          const component = this.model;
          if (component.components().length === 0) {
            addLoadingBlock(component);

            if (opts.block_route) {
                // FIX: Use component.get() instead of component.model.get()
                $.get(opts.block_route, component.get('attributes')).then((response) => {
                    // FIX: component is the model, so call empty() on it directly
                    component.empty().replaceWith(response);
                }).catch((response) => {
                    renderComponentContent(editor, component, {
                    tagName: `div`,
                    attributes: {
                        class: 'gjs-drupal-block gjs-block-error',
                    },
                    content: response.responseJSON || 'Error loading reusable block',
                    });
                });
            } else {
                console.warn('block_route not defined for reusable blocks');
            }
          }
        }
      }
    });

    /* Toolbar : add reusable action */
    editor.on('component:selected', (component) => {
      const toolbar = component.get('toolbar');

      if (toolbar) {
        const commandExists = toolbar.some(item => item.command === opts.commandId);

        if (!commandExists) {
          toolbar.unshift({
            command: opts.commandId,
            label: '<i class="fa fa-recycle"/>',
          });

          component.set('toolbar', toolbar);
        }
      }
    });
  };

  // --- Blocks ---
  const loadBlocks = (editor, opts = {}) => {
    const blockManager = editor.BlockManager;

    /* Blocks : Drupal Reusable Block */
    if (opts.blocks) {
        opts.blocks.forEach((block) => {
            const {plugin_id, label} = block;
            const blockId = `drupal-reusable-block-${plugin_id}`;

            blockManager.add(blockId, {
            label: label,
            category: opts.category,
            attributes: {class: 'fa fa-drupal'},
            content: {
                type: 'drupal-reusable-block',
                attributes: {
                'block-plugin-id': plugin_id,
                }
            }
            });
        });
    }
  };

  // --- Main Plugin ---
  window['drupal-reusable-blocks'] = (editor, opts = {}) => {
    const config = $.extend(true, {
      category: {
        id: 'drupal-reusable-blocks',
        label: Drupal.t('Drupal Reusable Blocks'),
        open: false,
        order: 40,
      },
      commandId: 'tb-reusable-block-modal',
      modalTitle: Drupal.t('Reusable block'),
      modalNameInputLabel: Drupal.t('Reusable block name'),
      modalSaveButtonLabel: Drupal.t('Save'),
    }, opts);

    loadCommands(editor, config);
    loadComponents(editor, config);
    loadBlocks(editor, config);
  };

})(window, jQuery, Drupal);
