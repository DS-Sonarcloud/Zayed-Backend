(function ($, Drupal, once, drupalSettings) {
  'use strict';

  function formatStatus(status) {
    if (!status) {
      return '';
    }
    return status.replaceAll('_', ' ').replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function formatNumber(n) {
    return Number(n || 0).toLocaleString();
  }

  function failedTotal(data) {
    if (typeof data.failed_display === 'number') {
      return data.failed_display;
    }
    return (data.failed || 0) + (data.error || 0);
  }

  function onProcessSuccess(data, self, nid, $link, liveStatusUrl, campaignIds) {
    self.updateRow(nid, data);
    $link.removeClass('processing').text(Drupal.t('Sending…'));
    if (liveStatusUrl && campaignIds.length > 0) {
      self.pollLiveStatus(liveStatusUrl, campaignIds);
    }
    Drupal.announce(Drupal.t('Campaign sending started in the background.'));
  }

  function onProcessError(xhr, $link, $row) {
    globalThis.isCampaignProcessing = false;
    $link.removeClass('processing').text(Drupal.t('Process'));
    $row.removeClass('campaign-row--live');
    const msg = (xhr.responseJSON?.error) ?? Drupal.t('Could not start sending.');
    alert(msg);
  }

  function onRerunSuccess(data, nid, $link) {
    $link.removeClass('loading').text(Drupal.t('Re-run'));
    Drupal.behaviors.campaignDashboard.updateRow(nid, data);
    Drupal.announce(Drupal.t('Campaign re-initialized.'));
  }

  Drupal.behaviors.campaignDashboard = {
    pollTimer: null,

    attach: function (context) {
      const self = this;
      const settings = drupalSettings.campaignEmailQueue || {};
      const campaignIds = settings.pageCampaignIds || [];
      const pollInterval = settings.pollIntervalMs || 2000;
      const liveStatusUrl = settings.liveStatusUrl;

      if (liveStatusUrl && campaignIds.length > 0) {
        once('campaign-live-poll', 'body', context).forEach(function () {
          self.pollLiveStatus(liveStatusUrl, campaignIds);
          if (self.pollTimer) {
            clearInterval(self.pollTimer);
          }
          self.pollTimer = setInterval(function () {
            self.pollLiveStatus(liveStatusUrl, campaignIds);
          }, pollInterval);
        });
      }

      once('ajax-process-delegate', 'body', context).forEach(function (body) {
        if (!globalThis.campaignUnloadProtected) {
          globalThis.campaignUnloadProtected = true;
          globalThis.isCampaignProcessing = false;
          $(globalThis).on('beforeunload', function () {
            if (globalThis.isCampaignProcessing) {
              return Drupal.t('Campaign sending is active. Leave anyway?');
            }
          });
        }

        $(body).on('click', '.ajax-process-link', function (e) {
          e.preventDefault();
          const $link = $(this);
          if ($link.hasClass('processing') || $link.hasClass('is-disabled')) {
            return;
          }
          const url = $link.attr('href');
          const nid = $link.data('nid');
          const $row = $('.campaign-row-' + nid);

          globalThis.isCampaignProcessing = true;
          $link.addClass('processing').text(Drupal.t('Starting…'));
          $row.addClass('campaign-row--live');

          $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) { onProcessSuccess(data, self, nid, $link, liveStatusUrl, campaignIds); },
            error: function (xhr) { onProcessError(xhr, $link, $row); }
          });
        });
      });

      once('ajax-rerun-delegate', 'body', context).forEach(function (body) {
        $(body).on('click', '.ajax-rerun-link', function (e) {
          e.preventDefault();
          const $link = $(this);
          if ($link.hasClass('loading') || $link.hasClass('is-disabled')) {
            return;
          }
          if (!confirm(Drupal.t('Re-run this campaign? This creates a new run and rebuilds the queue.'))) {
            return;
          }
          const url = $link.attr('href');
          const nid = $link.data('nid');
          $link.addClass('loading').text(Drupal.t('Initializing…'));
          $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) { onRerunSuccess(data, nid, $link); },
            error: function () {
              $link.removeClass('loading').text(Drupal.t('Re-run'));
              alert(Drupal.t('Failed to re-run campaign.'));
            }
          });
        });
      });
    },

    updateSummary: function (summary) {
      if (!summary) {
        return;
      }
      $('.summary-card.sent .summary-card-value').text(formatNumber(summary.sent));
      $('.summary-card.pending .summary-card-value').text(formatNumber(summary.pending));
      $('.summary-card.failed .summary-card-value').text(formatNumber(summary.failed));
    },

    pollLiveStatus: function (url, campaignIds) {
      const pollSelf = this;
      $.ajax({
        url: url,
        type: 'GET',
        data: { ids: campaignIds.join(',') },
        dataType: 'json',
        success: function (response) {
          const campaigns = response.campaigns || {};
          let anyActive = false;
          Object.keys(campaigns).forEach(function (nid) {
            pollSelf.updateRow(nid, campaigns[nid]);
            if (campaigns[nid].background_active) {
              anyActive = true;
            }
          });
          pollSelf.updateSummary(response.summary);
          globalThis.isCampaignProcessing = anyActive;
        }
      });
    },

    updateRow: function (nid, data) {
      const $row = $('.campaign-row-' + nid);
      if (!$row.length || !data) {
        return;
      }

      let statusHtml = formatStatus(data.status);
      if (data.background_active) {
        statusHtml += ' <span class="campaign-live-indicator" title="' + Drupal.t('Sending in background') + '">●</span>';
        $row.addClass('campaign-row--live');
      } else {
        $row.removeClass('campaign-row--live');
      }

      let progressText = (data.progress || 0) + '%';
      if (data.sent > 0) {
        progressText += ' (' + formatNumber(data.sent) + ' ' + Drupal.t('sent') + ')';
      }

      $row.find('.campaign-field-status').html(statusHtml);
      $row.find('.campaign-field-progress').html(progressText);
      $row.find('.campaign-field-total').text(formatNumber(data.total));
      $row.find('.campaign-field-sent').text(formatNumber(data.sent));
      $row.find('.campaign-field-failed').text(formatNumber(failedTotal(data)));
      $row.find('.campaign-field-pending').text(formatNumber(data.pending));
      $row.find('.campaign-field-queue').text(formatNumber(data.queue_count));

      const $process = $row.find('.ajax-process-link');
      if (data.status === 'completed') {
        $process.removeClass('processing').text(Drupal.t('Process'));
      } else if (data.background_active) {
        $process.addClass('processing').text(Drupal.t('Sending…'));
      } else if (!$process.hasClass('processing')) {
        $process.text(Drupal.t('Process'));
      }
    }
  };

})(jQuery, Drupal, once, drupalSettings);
