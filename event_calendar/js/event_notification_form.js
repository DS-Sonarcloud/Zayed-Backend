(function ($, Drupal, once) {
  Drupal.behaviors.eventNotificationForm = {
    attach: function (context, settings) {
      const $wrappers = $(once('eventNotificationFormCheck', '#event-notification-form-wrapper', context));

      if ($wrappers.length) {
        $wrappers.each(function () {
          const $wrapper = $(this);
          const $msgs = $wrapper.find('.messages, .messages--status, div[role="contentinfo"]');

          if ($msgs.length > 0 && !$wrapper.find('.notification-processing').length) {
            $wrapper.find('input[name="event_id"]').val('');
            $wrapper.find('textarea[name="message"]').val('Your bookmarked event has been updated!');
          }

          // Check for active batch in drupalSettings to resume progress
          if (settings.eventNotification && settings.eventNotification.activeBatch) {
            $(this).startNotificationPolling(settings.eventNotification.activeBatch);
          }
        });
      }
    }
  };

  /**
   * Polling based notification status checker.
   */
  $.fn.startNotificationPolling = function (data) {
    const $wrapper = $('#event-notification-form-wrapper');
    const $progress = $('#notification-progress-bar');
    const $bar = $progress.find('.progress-bar-inner');
    const $status = $progress.find('.progress-status');
    const $submit = $wrapper.find('input[type="submit"]');

    $progress.show();
    $submit.prop('disabled', true).addClass('is-disabled');
    $wrapper.addClass('notification-processing');

    const batchId = data.batch_id;
    const total = data.total;
    let pollInterval;

    function pollStatus() {
      $.ajax({
        url: Drupal.url('admin/event-notification/process/' + batchId),
        type: 'GET',
        success: function (response) {
          const percent = response.progress_percent || 0;
          $bar.css('width', percent + '%');
          
          const statusText = Drupal.t('Processing: @sent sent, @failed failed, @pending pending', {
            '@sent': response.sent,
            '@failed': response.failed,
            '@pending': response.pending
          });
          $status.text(statusText);

          // Check if completed
          if (response.status === 'completed' || response.pending === 0) {
            clearInterval(pollInterval);
            $bar.css('width', '100%').css('background', '#28a745');
            $status.text(Drupal.t('Completed! Sent @sent emails/notifications, @failed failed.', {
              '@sent': response.sent,
              '@failed': response.failed
            }));
            $submit.prop('disabled', false).removeClass('is-disabled');
            $wrapper.removeClass('notification-processing');
            
            // Clear form
            setTimeout(function() {
              $wrapper.find('input[name="event_id"]').val('');
              $wrapper.find('textarea[name="message"]').val('Your bookmarked event has been updated!');
              $progress.fadeOut();
            }, 3000);
          }
        },
        error: function () {
          console.error('Processing chunk failed for batch ' + batchId);
        }
      });
    }

    pollStatus(); 
    pollInterval = setInterval(pollStatus, 1000);
  };

})(jQuery, Drupal, once);
