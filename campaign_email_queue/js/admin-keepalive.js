(function (Drupal, drupalSettings, once) {
  'use strict';

  Drupal.behaviors.campaignAdminKeepAlive = {
    attach: function (context) {
      const settings = drupalSettings.campaignEmailQueueKeepalive;
      if (!settings || !settings.url) {
        return;
      }

      once('campaign-admin-keepalive', 'body', context).forEach(function () {
        const interval = settings.intervalMs || 45000;

        const ping = function () {
          fetch(settings.url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
          }).catch(function () {
            // Silent — cron may still run on schedule.
          });
        };

        ping();
        setInterval(ping, interval);
      });
    }
  };

})(Drupal, drupalSettings, once);
