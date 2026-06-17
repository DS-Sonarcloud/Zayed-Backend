(function ($, Drupal) {
  Drupal.behaviors.voiceToText = {
    attach: function (context) {
      const selectors = [
        { button: '#voice-search-btn', input: '#elastic-search-input' },
        { button: '#voice-search-btn-advance', input: '#srch_term' },
      ];

      selectors.forEach(({ button, input }) => {
        const $btn = $(button, context);
        const $input = $(input, context);

        if (!$btn.length || !$input.length || $btn.data('init')) return;
        $btn.data('init', true);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const supportsSpeechAPI = !!SpeechRecognition;

        if (!supportsSpeechAPI) {
          $btn.on('click', function () {
            alert('Voice input is not supported in this browser.\nPlease use Google Chrome, Edge, or Brave.');
          });
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function () {
          $btn.addClass('listening');
        };

        recognition.onresult = function (event) {
          const text = event.results[0][0].transcript || '';
          $input.val(text).trigger('input');

          const $form = $input.closest('form');
          if ($form.length) {
            $form.submit();
          } else {
            if ($('#sbmt').length) $('#sbmt').trigger('click');
          }
        };

        recognition.onspeechend = function () {
          recognition.stop();
          $btn.removeClass('listening');
        };

        recognition.onerror = function () {
          $btn.removeClass('listening');
        };

        $btn.on('click', function () {
          try {
            recognition.start();
          } catch (err) {
            console.error('SpeechRecognition error:', err);
          }
        });
      });
    },
  };
})(jQuery, Drupal);
