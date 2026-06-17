/**
 * @file
 * Contains drupal-document.js (MJML compatible)
 */
(function (window, $) {
  window['drupal-document'] = (editor, opts = {}) => {
    const pm = editor.Panels;
    const modal = editor.Modal;
    const config = opts;

    // Track the last mj-text component that was added via document block drop
    let _pendingDocTextComponent = null;

    // Add Document Button to Options Panel (Top Toolbar)
    pm.addButton('options', {
      id: 'open-documents',
      className: 'fa fa-file-text',
      command: 'open-documents',
      attributes: { title: Drupal.t('Manage Documents') }
    });

    // Add Document Block to Sidebar (Basic Category)
    const bm = editor.BlockManager;
    if (bm) {
      bm.add('drupal-document', {
        label: Drupal.t('Document'),
        category: Drupal.t('Basic'),
        attributes: { class: 'fa fa-file-text-o' },
        content: '<mj-section><mj-column><mj-text><a href="#" class="document-link">' + Drupal.t('Select document') + '</a></mj-text></mj-column></mj-section>'
      });
    }

    // Detect when a document block is dropped and auto-open selector
    editor.on('block:drag:stop', (component, block) => {
      if (!block || block.get('id') !== 'drupal-document') return;
      if (!component) return;

      // Find the mj-text component inside the dropped structure
      const mjText = findMjText(component);
      if (mjText) {
        _pendingDocTextComponent = mjText;
        setTimeout(() => {
          editor.runCommand('select-document', { component: mjText });
        }, 200);
      }
    });

    // Double-click on mj-text with document-link to re-open selector
    editor.on('component:dblclick', (component) => {
      if (!component) return;
      const type = component.get('type');
      // Check if this is an mj-text containing a document-link
      if (type === 'mj-text' || type === 'text') {
        // Check inner HTML via toHTML or content
        const innerHtml = component.getInnerHTML ? component.getInnerHTML() : (component.get('content') || '');
        if (innerHtml.indexOf('document-link') !== -1) {
          editor.runCommand('select-document', { component: component });
        }
      }
    });

    /**
     * Walk component tree to find the first mj-text child.
     */
    function findMjText(comp) {
      if (!comp) return null;
      if (comp.get('type') === 'mj-text') return comp;
      const children = comp.components();
      if (!children || !children.length) return null;
      for (let i = 0; i < children.length; i++) {
        const found = findMjText(children.at(i));
        if (found) return found;
      }
      return null;
    }

    // Command to select a document
    editor.Commands.add('select-document', {
      run(editor, sender, opts = {}) {
        const component = opts.component;
        this.openModal(component);
      },

      openModal(component) {
        const container = document.createElement('div');
        container.className = 'drupal-document-manager';

        const loader = document.createElement('div');
        loader.innerHTML = Drupal.t('Loading documents...');
        container.appendChild(loader);

        modal.setTitle(Drupal.t('Select Document'));
        modal.setContent(container);
        modal.open();

        this.fetchDocuments(container, component);
      },

      fetchDocuments(container, component) {
        $.ajax({
          url: config.list_url || '/grapesjs-editor/documents/list',
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          dataType: 'json',
          success: (response) => {
            this.renderDocuments(container, response.data || [], component);
          },
          error: (xhr, status, error) => {
            console.error('Document list error:', xhr, status, error);
            container.innerHTML = Drupal.t('Failed to load documents.');
          }
        });
      },

      renderDocuments(container, documents, component) {
        container.innerHTML = '';

        // Upload section
        const uploadBox = document.createElement('div');
        uploadBox.style.marginBottom = '20px';
        uploadBox.style.padding = '15px';
        uploadBox.style.border = '2px dashed #444';
        uploadBox.style.textAlign = 'center';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip';
        fileInput.style.display = 'none';

        const uploadBtn = document.createElement('button');
        uploadBtn.type = 'button';
        uploadBtn.className = 'gjs-btn-prim';
        uploadBtn.innerHTML = Drupal.t('Upload New Document');
        uploadBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          fileInput.click();
        };

        fileInput.onchange = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const files = fileInput.files;
          if (files.length > 0) {
            this.uploadFiles(container, files, component);
          }
          fileInput.value = '';
        };

        uploadBox.appendChild(fileInput);
        uploadBox.appendChild(uploadBtn);
        container.appendChild(uploadBox);

        // Search box
        if (documents.length > 0) {
          const searchBox = document.createElement('div');
          searchBox.style.marginBottom = '15px';

          const searchInput = document.createElement('input');
          searchInput.type = 'text';
          searchInput.placeholder = Drupal.t('Search documents...');
          searchInput.style.width = '100%';
          searchInput.style.padding = '8px';
          searchInput.style.border = '1px solid #444';
          searchInput.style.borderRadius = '3px';
          searchInput.style.backgroundColor = '#222';
          searchInput.style.color = '#fff';
          searchInput.style.fontSize = '14px';

          searchInput.oninput = (e) => {
            const query = e.target.value.toLowerCase();
            const items = list.querySelectorAll('.document-item');
            items.forEach(item => {
              const name = item.querySelector('div').textContent.toLowerCase();
              item.style.display = name.includes(query) ? 'block' : 'none';
            });
          };

          searchBox.appendChild(searchInput);
          container.appendChild(searchBox);
        }

        // List section
        if (documents.length === 0) {
          const empty = document.createElement('div');
          empty.innerHTML = Drupal.t('No documents found. Upload one above.');
          empty.style.padding = '20px';
          empty.style.textAlign = 'center';
          container.appendChild(empty);
          return;
        }

        const list = document.createElement('div');
        list.className = 'document-list';
        list.style.display = 'grid';
        list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        list.style.gap = '10px';
        list.style.maxHeight = '400px';
        list.style.overflowY = 'auto';

        documents.forEach(doc => {
          const item = document.createElement('div');
          item.className = 'document-item';
          item.style.padding = '10px';
          item.style.border = '1px solid #333';
          item.style.borderRadius = '3px';
          item.style.cursor = 'pointer';
          item.style.textAlign = 'center';
          item.style.backgroundColor = '#222';
          item.style.transition = 'all 0.2s';
          item.style.position = 'relative';

          const icon = document.createElement('i');
          icon.className = 'fa fa-file-o';
          icon.style.fontSize = '24px';
          icon.style.display = 'block';
          icon.style.marginBottom = '5px';

          if (doc.extension === 'pdf') icon.className = 'fa fa-file-pdf-o';
          if (['doc', 'docx'].includes(doc.extension)) icon.className = 'fa fa-file-word-o';
          if (['xls', 'xlsx'].includes(doc.extension)) icon.className = 'fa fa-file-excel-o';
          if (doc.extension === 'zip') icon.className = 'fa fa-file-archive-o';

          const name = document.createElement('div');
          name.innerHTML = doc.name;
          name.style.fontSize = '12px';
          name.style.overflow = 'hidden';
          name.style.textOverflow = 'ellipsis';
          name.style.whiteSpace = 'nowrap';
          name.style.marginTop = '5px';

          // Delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = '&times;';
          deleteBtn.className = 'document-delete-btn';
          deleteBtn.style.position = 'absolute';
          deleteBtn.style.top = '5px';
          deleteBtn.style.right = '5px';
          deleteBtn.style.background = '#f44';
          deleteBtn.style.color = '#fff';
          deleteBtn.style.border = 'none';
          deleteBtn.style.borderRadius = '50%';
          deleteBtn.style.width = '20px';
          deleteBtn.style.height = '20px';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.style.fontSize = '16px';
          deleteBtn.style.lineHeight = '1';
          deleteBtn.style.display = 'none';
          deleteBtn.title = 'Delete document';

          deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Delete "' + doc.name + '"?')) {
              this.deleteDocument(doc.data['entity-uuid'], container, component);
            }
          };

          item.onmouseenter = () => {
            item.style.backgroundColor = '#333';
            item.style.borderColor = '#4a90e2';
            deleteBtn.style.display = 'block';
          };
          item.onmouseleave = () => {
            item.style.backgroundColor = '#222';
            item.style.borderColor = '#333';
            deleteBtn.style.display = 'none';
          };

          item.appendChild(icon);
          item.appendChild(name);
          item.appendChild(deleteBtn);

          item.onclick = () => {
            this.selectDocument(doc, component);
            modal.close();
          };

          list.appendChild(item);
        });

        container.appendChild(list);
      },

      uploadFiles(container, files, component) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append('files[]', files[i], files[i].name);
        }

        container.innerHTML = '<div style="padding: 20px; text-align: center;">' + Drupal.t('Uploading...') + '</div>';

        $.ajax({
          url: config.upload_url || '/grapesjs-editor/documents/upload',
          method: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: (response) => {
            if (response.data && response.data.length > 0) {
              this.fetchDocuments(container, component);
            } else if (response.errors && response.errors.length > 0) {
              container.innerHTML = '<div style="padding: 20px; color: #f44;">' + response.errors.join('<br>') + '</div>';
              setTimeout(() => {
                this.fetchDocuments(container, component);
              }, 2000);
            } else {
              this.fetchDocuments(container, component);
            }
          },
          error: (xhr, status, error) => {
            console.error('Upload AJAX failed:', status, error);
            container.innerHTML = '<div style="padding: 20px; color: #f44;">' + Drupal.t('Upload failed.') + '</div>';
            setTimeout(() => {
              this.fetchDocuments(container, component);
            }, 2000);
          }
        });
      },

      deleteDocument(uuid, container, component) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;">' + Drupal.t('Deleting...') + '</div>';

        $.ajax({
          url: '/grapesjs-editor/documents/delete/' + uuid,
          method: 'POST',
          success: (response) => {
            if (response.success) {
              this.fetchDocuments(container, component);
            } else {
              alert('Delete failed: ' + (response.error || 'Unknown error'));
              this.fetchDocuments(container, component);
            }
          },
          error: () => {
            alert('Delete failed.');
            this.fetchDocuments(container, component);
          }
        });
      },

      selectDocument(doc, component) {
        if (component) {
          const linkHtml = '<a href="' + doc.src + '" title="' + doc.name + '" class="document-link">' + doc.name + '</a>';
          // For mj-text: replace child components with new HTML content
          component.components(linkHtml);
          editor.select(component);
        }
      }
    });

    // Command for opening document manager (for toolbar button)
    editor.Commands.add('open-documents', {
      run(editor, sender) {
        sender && sender.set('active', 0);
        this.openModal();
      },

      openModal() {
        const container = document.createElement('div');
        container.className = 'drupal-document-manager';

        const loader = document.createElement('div');
        loader.innerHTML = Drupal.t('Loading documents...');
        container.appendChild(loader);

        modal.setTitle(Drupal.t('Manage Documents'));
        modal.setContent(container);
        modal.open();

        this.fetchDocuments(container);
      },

      fetchDocuments(container) {
        $.ajax({
          url: config.list_url || '/grapesjs-editor/documents/list',
          method: 'GET',
          success: (response) => {
            this.renderDocuments(container, response.data || []);
          },
          error: () => {
            container.innerHTML = Drupal.t('Failed to load documents.');
          }
        });
      },

      renderDocuments(container, documents) {
        container.innerHTML = '';

        const uploadBox = document.createElement('div');
        uploadBox.style.marginBottom = '20px';
        uploadBox.style.padding = '15px';
        uploadBox.style.border = '2px dashed #444';
        uploadBox.style.textAlign = 'center';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip';
        fileInput.style.display = 'none';

        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'gjs-btn-prim';
        uploadBtn.innerHTML = Drupal.t('Upload Documents');
        uploadBtn.onclick = () => fileInput.click();

        fileInput.onchange = () => {
          const files = fileInput.files;
          if (files.length > 0) {
            this.uploadFiles(container, files);
          }
        };

        uploadBox.appendChild(fileInput);
        uploadBox.appendChild(uploadBtn);
        container.appendChild(uploadBox);

        if (documents.length === 0) {
          const empty = document.createElement('div');
          empty.innerHTML = Drupal.t('No documents found.');
          container.appendChild(empty);
          return;
        }

        const list = document.createElement('div');
        list.className = 'document-list';
        list.style.display = 'grid';
        list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        list.style.gap = '10px';

        documents.forEach(doc => {
          const item = document.createElement('div');
          item.className = 'document-item';
          item.style.padding = '10px';
          item.style.border = '1px solid #333';
          item.style.borderRadius = '3px';
          item.style.cursor = 'pointer';
          item.style.textAlign = 'center';
          item.style.backgroundColor = '#222';

          const icon = document.createElement('i');
          icon.className = 'fa fa-file-o';
          icon.style.fontSize = '24px';
          icon.style.display = 'block';
          icon.style.marginBottom = '5px';

          if (doc.extension === 'pdf') icon.className = 'fa fa-file-pdf-o';
          if (['doc', 'docx'].includes(doc.extension)) icon.className = 'fa fa-file-word-o';
          if (['xls', 'xlsx'].includes(doc.extension)) icon.className = 'fa fa-file-excel-o';
          if (doc.extension === 'zip') icon.className = 'fa fa-file-archive-o';

          const name = document.createElement('div');
          name.innerHTML = doc.name;
          name.style.fontSize = '12px';
          name.style.overflow = 'hidden';
          name.style.textOverflow = 'ellipsis';
          name.style.whiteSpace = 'nowrap';

          item.appendChild(icon);
          item.appendChild(name);

          item.onclick = () => {
            this.insertDocument(doc);
            modal.close();
          };

          list.appendChild(item);
        });

        container.appendChild(list);
      },

      uploadFiles(container, files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append('files[]', files[i]);
        }

        container.innerHTML = Drupal.t('Uploading...');

        $.ajax({
          url: config.upload_url || '/grapesjs-editor/documents/upload',
          method: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: (response) => {
            this.fetchDocuments(container);
          },
          error: () => {
            alert(Drupal.t('Upload failed.'));
            this.fetchDocuments(container);
          }
        });
      },

      insertDocument(doc) {
        editor.addComponents('<mj-section><mj-column><mj-text><a href="' + doc.src + '" title="' + doc.name + '" class="document-link">' + doc.name + '</a></mj-text></mj-column></mj-section>');
      }
    });
  };
})(window, jQuery);
