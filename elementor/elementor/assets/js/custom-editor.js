(function($) {
    Drupal.behaviors.elementorCustomCSS = {
        attach: function(context, settings) {

            $('.elementor-code-editor', context).once('cm-init').each(function() {

                var cm = CodeMirror.fromTextArea(this, {
                    lineNumbers: true,
                    mode: 'css',
                    theme: 'material',
                    extraKeys: { 'Ctrl-Space': 'autocomplete' },
                });

                // Save to textarea on change
                cm.on('change', function(instance) {
                    instance.save();
                });

                // Trigger autocomplete automatically
                cm.on('inputRead', function(cmInstance, changeObj) {
                    if (changeObj.text[0].match(/[a-zA-Z0-9_\-]/)) {
                        cmInstance.showHint({ completeSingle: false });
                    }
                });

            });

        }
    }
})(jQuery);