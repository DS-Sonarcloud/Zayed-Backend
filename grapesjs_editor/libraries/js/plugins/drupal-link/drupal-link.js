/**
 * @file
 * Contains drupal-link.js - Plugin for GrapesJS to handle links (RTE + Canvas).
 */
(function (window, $, Drupal) {
  console.log('Drupal Link Plugin: File loaded');

  window['drupal-link'] = (editor, opts = {}) => {
    console.log('Drupal Link Plugin: Initializing...');

    const modal = editor.Modal;
    const config = $.extend(true, {
      btnLabel: (Drupal && Drupal.t) ? Drupal.t('Save') : 'Save',
    }, opts);

    const t = (str) => (Drupal && Drupal.t) ? Drupal.t(str) : str;

    /**
     * Open the Link Modal.
     */
    const openLinkModal = (options = {}) => {
      console.log('Drupal Link Plugin: Opening modal...', options);
      const { target, isRte } = options;
      let initialUrl = '#';
      let initialText = '';
      let currentTarget = target;
      let isImage = false;

      if (isRte) {
        // Try to get current selection text
        const selection = editor.RichTextEditor.getSelection();
        initialText = selection ? selection.toString() : '';

        // Check if we are inside a link already
        try {
          const doc = editor.Canvas.getDocument();
          const sel = doc.getSelection();
          if (sel && sel.rangeCount > 0) {
            let container = sel.getRangeAt(0).commonAncestorContainer;
            if (container.nodeType === 3) container = container.parentNode;
            
            // Check for link or image inside link
            const aLink = container.closest('a');
            const img = container.closest('img');

            if (aLink) {
              initialUrl = aLink.getAttribute('href') || '#';
              initialText = aLink.innerHTML;
              currentTarget = aLink;
              console.log('Drupal Link Plugin: Found existing link inside RTE', initialUrl);
            } else if (img) {
              isImage = true;
              currentTarget = img;
              const parentLink = img.closest('a');
              if (parentLink) {
                initialUrl = parentLink.getAttribute('href') || '#';
                currentTarget = parentLink;
              }
            }
          }
        } catch (e) {
          console.warn('Drupal Link Plugin: Error detecting link in selection', e);
        }
      } else if (target) {
        // For component or DOM element
        if (typeof target.getAttributes === 'function') {
          initialUrl = target.getAttributes().href || '#';
          initialText = target.getInnerHTML ? target.getInnerHTML() : (target.get('content') || '');
          if (target.is('image')) isImage = true;
        } else {
          initialUrl = target.getAttribute('href') || '#';
          initialText = target.innerHTML;
          if (target.tagName === 'IMG') {
             isImage = true;
             const parentLink = target.closest('a');
             if (parentLink) {
               initialUrl = parentLink.getAttribute('href') || '#';
               currentTarget = parentLink;
             }
          }
        }
      }

      const container = document.createElement('div');
      container.className = 'drupal-link-modal-container';
      container.innerHTML = `
        <div class="gjs-sm-property" id="drupal-link-text-row" style="margin-bottom: 10px; ${isImage ? 'display:none;' : ''}">
          <div class="gjs-sm-label">${t('Link Text')}</div>
          <div class="gjs-sm-field gjs-sm-field-text">
            <input type="text" id="drupal-link-input-text" value="${initialText.replace(/"/g, '&quot;')}" style="width: 100%; box-sizing: border-box; color: #fff; background: #333; border: 1px solid #000; padding: 5px;" />
          </div>
        </div>
        <div class="gjs-sm-property" style="margin-bottom: 10px;">
          <div class="gjs-sm-label">${t('Link URL')}</div>
          <div class="gjs-sm-field gjs-sm-field-text">
            <input type="text" id="drupal-link-input-url" value="${initialUrl.replace(/"/g, '&quot;')}" style="width: 100%; box-sizing: border-box; color: #fff; background: #333; border: 1px solid #000; padding: 5px;" />
          </div>
        </div>
        <div style="margin-top: 15px; text-align: right;">
          <button class="gjs-btn-prim" id="drupal-link-btn-save" style="width: 100%;">${config.btnLabel}</button>
        </div>
      `;

      modal.setTitle(isImage ? t('Edit Image Link') : t('Link Settings'));
      modal.setContent(container);
      modal.open();

      const saveBtn = container.querySelector('#drupal-link-btn-save');
      const textInput = container.querySelector('#drupal-link-input-text');
      const urlInput = container.querySelector('#drupal-link-input-url');

      saveBtn.onclick = (e) => {
        e.preventDefault();
        const textValue = textInput.value;
        const urlValue = urlInput.value;
        console.log('Drupal Link Plugin: Saving link...', { textValue, urlValue, isImage });

        if (isRte) {
          if (isImage && currentTarget) {
            // If it's an image, we should wrap it or update the parent <a>
            const parentLink = currentTarget.closest('a');
            if (parentLink) {
              parentLink.setAttribute('href', urlValue);
            } else {
              const linkNode = document.createElement('a');
              linkNode.setAttribute('href', urlValue);
              linkNode.className = 'drupal-link';
              currentTarget.parentNode.insertBefore(linkNode, currentTarget);
              linkNode.appendChild(currentTarget);
            }
          } else {
            editor.RichTextEditor.exec('insertHTML', `<a href="${urlValue}" class="drupal-link">${textValue}</a>`);
          }
        } else if (currentTarget) {
          if (typeof currentTarget.setAttributes === 'function') {
            currentTarget.setAttributes({ href: urlValue });
            if (!isImage) currentTarget.components(textValue);
          } else {
            currentTarget.setAttribute('href', urlValue);
            if (!isImage) currentTarget.innerHTML = textValue;
          }
        }
        modal.close();
        editor.UndoManager.add();
      };
    };

    // Define Command
    editor.Commands.add('drupal-link:open-modal', {
      run(editor, sender, options = {}) {
        openLinkModal(options);
      }
    });

    // Aggressive button interception
    editor.on('load', () => {
      console.log('Drupal Link Plugin: Editor loaded, attaching UI listeners');
      
      const editorEl = editor.getEl();
      if (editorEl) {
        // We use jQuery delegated events on the editor element to capture clicks on the toolbar
        $(editorEl).on('click', '.gjs-rte-action[title="Link"]', function (e) {
          console.log('Drupal Link Plugin: RTE Link toolbar icon intercepted by DOM click');
          
          // Stop GrapesJS from opening its own prompt
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          // Get the active RTE if possible
          const activeRte = editor.RichTextEditor.activeRte;
          if (activeRte) {
            editor.runCommand('drupal-link:open-modal', { isRte: true });
          } else {
            // Check if a component is selected
            const selected = editor.getSelected();
            if (selected) {
               editor.runCommand('drupal-link:open-modal', { target: selected });
            } else {
               editor.runCommand('drupal-link:open-modal', { isRte: true });
            }
          }
        });
      }

      // Canvas click detection for easy editing
      const doc = editor.Canvas.getDocument();
      if (doc) {
        doc.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (link) {
            console.log('Drupal Link Plugin: Canvas link clicked');
            e.preventDefault();
            e.stopPropagation();
            editor.runCommand('drupal-link:open-modal', { target: link });
          }
        }, true);
      }
    });

    // Double click fallback
    editor.on('component:dblclick', (component) => {
      if (component && (component.get('tagName') === 'a' || component.is('image'))) {
        console.log('Drupal Link Plugin: Component double-clicked');
        editor.runCommand('drupal-link:open-modal', { target: component });
      }
    });

    // Keep the RTE button override as well for cleaner UI integration
    const rte = editor.RichTextEditor;
    if (rte) {
      rte.add('link', {
        icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"></path></svg>',
        attributes: { title: t('Link') },
        result: (rteEditor) => {
          console.log('Drupal Link Plugin: RTE Button result called');
          editor.runCommand('drupal-link:open-modal', { isRte: true });
        }
      });
    }
  };
})(window, jQuery, Drupal);
