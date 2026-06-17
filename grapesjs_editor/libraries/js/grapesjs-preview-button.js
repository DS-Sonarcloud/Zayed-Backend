(function ($, Drupal, drupalSettings, once) {
  Drupal.behaviors.grapesjsPreviewButton = {
    attach: function (context) {
      if (!drupalSettings.grapesjs_preview) {
        return;
      }

      $(once('grapesjs-preview-init', '.grapesjs-preview-button', context)).on('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var $btn = $(this);
        var oldText = $btn.text();
        var config = drupalSettings.grapesjs_preview;

        $btn.text(config.preparing_msg).css("pointer-events", "none").css("opacity", "0.6");

        var title = $("input[name=\"title[0][value]\"]").val();
        var body = "";
        var captureMethod = "fallback";

        if (window.Drupal && Drupal.editors && Drupal.editors.grapesjs_editor && Drupal.editors.grapesjs_editor.editors) {
          var editors = Drupal.editors.grapesjs_editor.editors;
          var fieldNames = Object.keys(editors);
          if (fieldNames.length > 0) {
            var editor = editors[fieldNames[0]];

            try {
              // Try MJML compilation — returns full responsive HTML document
              var mjmlResult = editor.runCommand("mjml-code-to-html");
              if (mjmlResult && mjmlResult.html) {
                body = mjmlResult.html;
                captureMethod = "mjml-compiled";
              }
            } catch (err) {
              console.warn("mjml-code-to-html failed:", err);
            }
          }
        }

        // If MJML compilation didn't produce output, read from the body textarea
        // which already contains compiled HTML (set by the editor's change handler).
        if (!body || body.indexOf("<html") === -1) {
          var textareaVal = $("textarea[name=\"body[0][value]\"]").val();
          if (textareaVal && textareaVal.indexOf("<html") !== -1) {
            body = textareaVal;
            captureMethod = "textarea-compiled";
          } else if (textareaVal) {
            body = textareaVal;
            captureMethod = "textarea-raw";
          }
        }

        if (!body) {
          alert(config.error_msg);
          $btn.text(oldText).css("pointer-events", "auto").css("opacity", "1");
          return false;
        }

        console.log("Preview capture method:", captureMethod, "Body length:", body.length);

        $.post(config.save_url, {
          title: title,
          body: body,
          nid: config.nid
        }, function (response) {
          if (response && response.uuid) {
            var url = config.preview_url_base.replace("UUID", response.uuid);
            var win = window.open(url, "_blank");
            if (!win || win.closed || typeof win.closed === "undefined") {
              alert(config.popup_msg);
            }
          }
          $btn.text(oldText).css("pointer-events", "auto").css("opacity", "1");
        }).fail(function (xhr) {
          console.error("AJAX preview save failed:", xhr.responseText);
          alert(config.error_msg);
          $btn.text(oldText).css("pointer-events", "auto").css("opacity", "1");
        });

        return false;
      });
    }
  };
})(jQuery, Drupal, drupalSettings, once);
