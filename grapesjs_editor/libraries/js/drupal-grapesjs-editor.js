(function ($, Drupal, grapesjs) {
  Drupal.editors.grapesjs_editor = {
    editors: {},
    getFieldName(element) {
      return $(element).attr('name').split('[')[0];
    },
    attach(element, format) {
      const fieldName = this.getFieldName(element);
      const $element = $(element);

      // Prevent duplicate initialization
      if ($(`#gjs-container-${fieldName}`).length > 0) {
        $(`#gjs-container-${fieldName}`).remove();
      }

      // Create container
      const gjsContainer = $('<div/>', {
        id: `gjs-container-${fieldName}`,
        class: 'gjs',
        'data-field-name': $element.attr('name')
      });

      $element.parent().prepend(gjsContainer);
      $element.hide();

      // Initialize screenshot field immediately
      const $form = $element.closest('form');
      if ($('#field-template-screenshot-data').length === 0) {
        $form.append('<input type="hidden" id="field-template-screenshot-data" name="field_template_screenshot_data">');
      }

      gjsContainer.css({
        'height': '600px',
        'border': '1px solid #444'
      });

      const initEditor = () => {
        const activePlugins = [];

        const pluginMap = {
          'grapesjs-mjml': 'grapesjs-mjml',
          // 'drupal-storage': 'drupal-storage',
          'drupal-asset': 'drupal-asset',
          'drupal-unsubscribe': 'drupal-unsubscribe',
          //'drupal-blocks': 'drupal-blocks',
          'drupal-widget': 'drupal-widget',
          // 'drupal-basic-blocks': 'drupal-basic-blocks',
          // 'drupal-fields': 'drupal-fields',
          'drupal-document': 'drupal-document',
          'drupal-link': 'drupal-link'
        };

        Object.keys(pluginMap).forEach(pluginName => {
          const globalName = pluginMap[pluginName];
          let pluginFn = window[globalName];

          if (pluginFn && pluginFn.default) {
            pluginFn = pluginFn.default;
          }

          if (pluginFn) {
            if (!grapesjs.plugins.get(pluginName)) {
              grapesjs.plugins.add(pluginName, pluginFn);
            }
            activePlugins.push(pluginName);
          } else {
            if (grapesjs.plugins.get(pluginName)) {
              activePlugins.push(pluginName);
            }
          }
        });

        let drupalConfig = {};
        let formatId = format;
        if (typeof format === 'object' && format.format) {
          formatId = format.format;
        }

        if (drupalSettings.editor && drupalSettings.editor.formats && drupalSettings.editor.formats[formatId]) {
          drupalConfig = drupalSettings.editor.formats[formatId].editorSettings || {};
        }

        // Load MJML source from body field
        let initialContent = $element.val() || '';

        // If no MJML content found, provide a default MJML template
        if (initialContent.indexOf('<mjml') === -1 && initialContent.indexOf('<mj-') === -1) {
          if (!initialContent.trim()) {
            initialContent = '<mjml>\n  <mj-body>\n    <mj-section>\n      <mj-column>\n        <mj-text font-size="20px" color="#333333" font-family="Helvetica, Arial, sans-serif">\n          Your Email Title\n        </mj-text>\n        <mj-text font-size="14px" color="#555555" font-family="Helvetica, Arial, sans-serif">\n          Start editing your email template here. Drag and drop components from the left panel.\n        </mj-text>\n      </mj-column>\n    </mj-section>\n  </mj-body>\n</mjml>';
          } else {
            // Existing non-MJML content: wrap it in MJML structure so the editor can display it
            initialContent = '<mjml>\n  <mj-body>\n    <mj-section>\n      <mj-column>\n        <mj-text>\n' + initialContent + '\n        </mj-text>\n      </mj-column>\n    </mj-section>\n  </mj-body>\n</mjml>';
          }
        }

        const defaults = {
          container: gjsContainer.get(0),
          components: initialContent,
          height: '600px',
          width: 'auto',
          fromElement: false,
          storageManager: { type: 'none' },
          plugins: activePlugins,
          pluginsOpts: {
            'grapesjs-mjml': {
              resetStyleManager: true,
              columnsPadding: '10px 0',
            },
            'drupal-storage': { storeHtml: true },
            'drupal-asset': {},
            'drupal-unsubscribe': {}
          },
          assetManager: {
            autoAdd: true,
            urlDefaultProtocol: 'https',
          },
          canvas: {
            styles: [
              'https://unpkg.com/grapesjs@0.22.14/dist/css/grapes.min.css'
            ],
          }
        };

        let settingsFromDrupal = drupalConfig;
        if (drupalConfig.grapesSettings) {
          settingsFromDrupal = drupalConfig.grapesSettings;
        }

        const grapesSettings = $.extend(true, {}, defaults, settingsFromDrupal);
        grapesSettings.container = gjsContainer.get(0);
        grapesSettings.plugins = activePlugins;
        grapesSettings.storageManager = { type: 'none' };

        if (!grapesSettings.canvas.styles || grapesSettings.canvas.styles.length === 0) {
          grapesSettings.canvas.styles = defaults.canvas.styles;
        }

        const fullscreenHost = gjsContainer.get(0);

        // Ensure overlays render inside the fullscreen element
        grapesSettings.modal = grapesSettings.modal || {};
        if (!grapesSettings.modal.appendTo) {
          grapesSettings.modal.appendTo = fullscreenHost;
        }

        grapesSettings.assetManager = grapesSettings.assetManager || {};
        if (!grapesSettings.assetManager.appendTo) {
          grapesSettings.assetManager.appendTo = fullscreenHost;
        }

        grapesSettings.colorPicker = grapesSettings.colorPicker || {};
        if (!grapesSettings.colorPicker.appendTo) {
          grapesSettings.colorPicker.appendTo = fullscreenHost;
        }

        const editor = grapesjs.init(grapesSettings);
        this.editors[fieldName] = editor;

        editor.on('load', () => {

          // Screenshot capture logic
          const captureScreenshot = Drupal.debounce(() => {
            const body = editor.Canvas.getBody();

            if (body && window.html2canvas) {
              const options = {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scale: 1,
              };

              window.html2canvas(body, options).then(canvas => {
                const baseData = canvas.toDataURL('image/png');

                let $screenshotField = $('#field-template-screenshot-data');
                if ($screenshotField.length === 0) {
                  const $innerForm = $element.closest('form');
                  $screenshotField = $('<input type="hidden" id="field-template-screenshot-data" name="field_template_screenshot_data">');
                  $innerForm.append($screenshotField);
                }
                $screenshotField.val(baseData);
              }).catch(err => {
                console.error('Screenshot capture failed:', err);
              });
            }
          }, 100);

          // Ensure field_json hidden field exists on the form
          let $jsonField = $form.find('[name*="field_json"][name*="[value]"]');
          if ($jsonField.length === 0) {
            // field_json is hidden in form display, so create it dynamically
            $jsonField = $('<input type="hidden" name="field_json[0][value]">');
            $form.append($jsonField);
          }

          // Compile MJML to HTML and store in field_json
          const compileToFieldJson = Drupal.debounce(() => {
            try {
              const codeResult = editor.runCommand('mjml-code-to-html');
              if (codeResult && codeResult.html && $jsonField.length) {
                $jsonField.val(codeResult.html);
              }
            } catch (e) {
              console.warn('Failed to compile MJML to HTML', e);
            }
          }, 500);

          // On every change: save MJML source to body field + compiled HTML to field_json
          editor.on('change:changesCount', () => {
            try {
              const mjmlSource = editor.getHtml();
              $element.val(mjmlSource);
            } catch (e) {
              console.warn('Failed to get MJML source', e);
            }
            compileToFieldJson();
            captureScreenshot();
          });

          setTimeout(compileToFieldJson, 500);

          // Initial screenshot after load
          setTimeout(captureScreenshot, 100);

          $('input', gjsContainer).on('keydown', function (e) {
            if (e.keyCode === 13) e.preventDefault();
          });

          const updateBackgroundPreview = () => {
            const selected = editor.getSelected();
            if (!selected) return;

            const container = editor.getContainer();
            if (!container) return;

            const previewEl = container.querySelector('#gjs-sm-preview-file');
            if (!previewEl) return;

            let bg = '';
            const style = selected.getStyle ? selected.getStyle() : {};
            if (style && style['background-image']) {
              bg = style['background-image'];
            }

            if (!bg || bg === 'none') {
              const attrs = selected.getAttributes ? selected.getAttributes() : {};
              const attrUrl = attrs['background-url'] || attrs['background-image'] || attrs['background'] || '';
              if (attrUrl) {
                bg = attrUrl;
              }
            }

            if (bg && !/^url\(/i.test(bg)) {
              bg = `url("${bg}")`;
            }

            if (bg) {
              previewEl.style.backgroundImage = bg;
              previewEl.style.backgroundSize = 'cover';
              previewEl.style.backgroundPosition = 'center';
              previewEl.style.backgroundRepeat = 'no-repeat';
            } else {
              previewEl.style.backgroundImage = '';
            }
          };

          editor.on('component:selected', updateBackgroundPreview);
          editor.on('component:update:style', updateBackgroundPreview);
          editor.on('component:update:attributes', updateBackgroundPreview);
          editor.on('styleManager:change', updateBackgroundPreview);

          setTimeout(updateBackgroundPreview, 0);

          editor.on('modal:open', () => {
            const $modal = $(editor.Modal.getContentEl());
            const $uploadMsg = $modal.find('.gjs-am-add-asset');

            if ($uploadMsg.length > 0 && $uploadMsg.find('.drupal-am-formats').length === 0) {
              let allowed = grapesSettings.assetManager.allowedExtensions || 'gif png jpg jpeg webp';
              const formats = allowed.replace(/,/g, ' ').split(/\s+/).filter(Boolean).join(', ').toUpperCase();

              const formatsHtml = `<div class="drupal-am-formats" style="margin-top: 15px; color: #aaa; font-size: 0.8rem; font-weight: normal; opacity: 0.8;">
                (${Drupal.t('Supported formats')}: ${formats})
              </div>`;

              $uploadMsg.append(formatsHtml);
            }
          });
        });
      };

      initEditor();
    },

    detach(element, format, trigger) {
      const fieldName = this.getFieldName(element);
      const gjsContainer = $(`#gjs-container-${fieldName}`);
      const editor = this.editors[fieldName];

      if (editor) {
        // Compile MJML to HTML while the editor is still alive.
        if (trigger === 'serialize') {
          // Save MJML source to body field
          try {
            $(element).val(editor.getHtml());
          } catch (e) {
            console.warn('Failed to get MJML source on detach', e);
          }

          // Compile MJML to full HTML for email sending
          try {
            const codeResult = editor.runCommand('mjml-code-to-html');
            if (codeResult && codeResult.html) {
              const $form = $(element).closest('form');
              const $jsonField = $form.find('[name*="field_json"][name*="[value]"]');
              if ($jsonField.length) {
                $jsonField.val(codeResult.html);
              }
            }
          } catch (e) {
            console.warn('MJML compilation failed on detach', e);
          }

          return;
        }

        try {
          editor.destroy();
        } catch (e) {
          console.warn('Error destroying GrapesJS instance', e);
        }
        delete this.editors[fieldName];
      }
      $(element).show();
      gjsContainer.remove();
    },

    onChange() {
    }
  };

})(jQuery, Drupal, grapesjs);
