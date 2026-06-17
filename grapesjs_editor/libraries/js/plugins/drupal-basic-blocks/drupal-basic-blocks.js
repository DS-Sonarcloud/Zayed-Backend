/**
 * @file
 * Contains drupal-basic-blocks.js
 */
(function(window, $, Drupal) {

  // --- Components ---
  const loadComponents = (editor, opts = {}) => {
    // This plugin reuses standard GrapesJS components or defines some basic ones if needed.
  };

  // --- Blocks ---
  const loadBlocks = (editor, opts = {}) => {
    const blockManager = editor.Blocks || editor.BlockManager;
    
    // Helper to add blocks if they don't exist
    const addBlock = (id, def) => {
        if (!blockManager.get(id)) {
            blockManager.add(id, def);
        }
    }

    // Heading
    addBlock('drupal-heading', {
        label: opts.headingLabel,
        category: opts.basicCategory,
        attributes: {class: 'fa fa-header'},
        content: `<${opts.headingDefaultTagName}>${opts.headingDefaultContent}</${opts.headingDefaultTagName}>`
    });

    // Paragraph
    addBlock('drupal-paragraph', {
        label: opts.paragraphLabel,
        category: opts.basicCategory,
        attributes: {class: 'fa fa-paragraph'},
        content: `<p>${opts.paragraphDefaultContent}</p>`
    });

    // Link
    addBlock('drupal-link', {
        label: opts.linkLabel,
        category: opts.basicCategory,
        attributes: {class: 'fa fa-link'},
        content: {
            type: 'link',
            content: opts.linkDefaultContent,
            attributes: {href: '#'}
        }
    });

    // Image
    addBlock('drupal-image', {
        label: opts.imageLabel,
        category: opts.basicCategory,
        attributes: {class: 'fa fa-picture-o'},
        content: { type: 'image' }
    });

    // List
    addBlock('drupal-list', {
        label: opts.listLabel,
        category: opts.basicCategory,
        attributes: {class: 'fa fa-list'},
        content: `<ul><li>Option 1</li><li>Option 2</li><li>Option 3</li></ul>`
    });
    
    // Section (Layout)
    addBlock('drupal-section', {
      label: opts.sectionLabel,
      category: opts.layoutCategory,
      attributes: {class: 'fa fa-columns'},
      content: `<section class="gjs-section"><div></div></section>`
    });

    
    // Add any specific "Reusable" blocks passed via config
     if (opts.blocks) {
        opts.blocks.forEach((block) => {
             // Logic to add custom blocks 
             // blockManager.add(...)
        });
     }
  };

  // --- Main Plugin ---
  window['drupal-basic-blocks'] = (editor, opts = {}) => {
    const config = $.extend(true, {
      blocks: [],
      basicCategory: {
        id: 'basic',
        label: Drupal.t('Basic'),
        order: 0,
        open: false,
      },
      layoutCategory: {
        id: 'layout',
        label: Drupal.t('Layout'),
        order: 5,
        open: false,
      },
      headingLabel: Drupal.t('Heading'),
      headingDefaultTagName: 'h2',
      headingDefaultContent: Drupal.t('Insert your text here'),
      paragraphLabel: Drupal.t('Paragraph'),
      paragraphDefaultContent: Drupal.t('Insert your text here'),
      linkLabel: Drupal.t('Link'),
      linkDefaultContent: Drupal.t('Link'),
      imageLabel: Drupal.t('Image'),
      listLabel: Drupal.t('List'),
      sectionLabel: Drupal.t('Section'),
    }, opts);

    loadComponents(editor, config);
    loadBlocks(editor, config);
  };

})(window, jQuery, Drupal);
