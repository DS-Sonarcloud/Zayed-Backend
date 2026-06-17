/**
 * @file
 * Contains drupal-unsubscribe.js
 */
(function(window, $, Drupal) {

  // --- Components ---
  const loadComponents = (editor, opts = {}) => {
  };

  // --- Blocks ---
  const loadBlocks = (editor, opts = {}) => {
    const blockManager = editor.Blocks || editor.BlockManager;
    
    blockManager.add('unsubscribe-link', {
      label: opts.label,
      category: opts.category,
      attributes: { class: 'fa fa-sign-out' },
      content: '<mj-section><mj-column><mj-button href="{{unsubscribe_url}}" font-size="13px" background-color="transparent" color="#888888" font-weight="normal" text-decoration="underline" padding="10px 25px" inner-padding="5px 10px">' + (opts.defaultText || 'Unsubscribe') + '</mj-button></mj-column></mj-section>'
    });
  };

  // --- Main Plugin ---
  window['drupal-unsubscribe'] = (editor, opts = {}) => {
    const config = $.extend(true, {
      label: Drupal.t('Unsubscribe'),
      category: Drupal.t('Basic'),
      defaultText: Drupal.t('Unsubscribe'),
    }, opts);

    loadComponents(editor, config);
    loadBlocks(editor, config);
  };

})(window, jQuery, Drupal);
