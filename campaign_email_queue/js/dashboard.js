(function ($, Drupal, once, drupalSettings) {
  'use strict';

  function formatStatus(status) {
    if (!status) {
      return '';
    }
    return status.replace(/_/g, ' ').replace(/\b\w/g, function (c) {
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

  Drupal.behaviors.campaignDashboard = {
    pollTimer: null,

    attach: function (context) {
      var self = this;
      var settings = drupalSettings.campaignEmailQueue || {};
      var campaignIds = settings.pageCampaignIds || [];
      var pollInterval = settings.pollIntervalMs || 2000;
      var liveStatusUrl = settings.liveStatusUrl;

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
        if (!window.campaignUnloadProtected) {
          window.campaignUnloadProtected = true;
          window.isCampaignProcessing = false;
          $(window).on('beforeunload', function () {
            if (window.isCampaignProcessing) {
              return Drupal.t('Campaign sending is active. Leave anyway?');
            }
          });
        }

        $(body).on('click', '.ajax-process-link', function (e) {
          e.preventDefault();
          var $link = $(this);
          if ($link.hasClass('processing') || $link.hasClass('is-disabled')) {
            return false;
          }
          var url = $link.attr('href');
          var nid = $link.data('nid');
          var $row = $('.campaign-row-' + nid);

          window.isCampaignProcessing = true;
          $link.addClass('processing').text(Drupal.t('Starting…'));
          $row.addClass('campaign-row--live');

          $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
              self.updateRow(nid, data);
              $link.removeClass('processing').text(Drupal.t('Sending…'));
              if (liveStatusUrl && campaignIds.length > 0) {
                self.pollLiveStatus(liveStatusUrl, campaignIds);
              }
              Drupal.announce(Drupal.t('Campaign sending started in the background.'));
            },
            error: function (xhr) {
              window.isCampaignProcessing = false;
              $link.removeClass('processing').text(Drupal.t('Process'));
              $row.removeClass('campaign-row--live');
              var msg = (xhr.responseJSON && xhr.responseJSON.error) ? xhr.responseJSON.error : Drupal.t('Could not start sending.');
              alert(msg);
            }
          });
          return false;
        });
      });

      once('ajax-rerun-delegate', 'body', context).forEach(function (body) {
        $(body).on('click', '.ajax-rerun-link', function (e) {
          e.preventDefault();
          var $link = $(this);
          if ($link.hasClass('loading') || $link.hasClass('is-disabled')) {
            return false;
          }
          if (!confirm(Drupal.t('Re-run this campaign? This creates a new run and rebuilds the queue.'))) {
            return false;
          }
          var url = $link.attr('href');
          var nid = $link.data('nid');
          $link.addClass('loading').text(Drupal.t('Initializing…'));
          $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
              $link.removeClass('loading').text(Drupal.t('Re-run'));
              Drupal.behaviors.campaignDashboard.updateRow(nid, data);
              Drupal.announce(Drupal.t('Campaign re-initialized.'));
            },
            error: function () {
              $link.removeClass('loading').text(Drupal.t('Re-run'));
              alert(Drupal.t('Failed to re-run campaign.'));
            }
          });
          return false;
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
      var self = this;
      $.ajax({
        url: url,
        type: 'GET',
        data: { ids: campaignIds.join(',') },
        dataType: 'json',
        success: function (response) {
          var campaigns = response.campaigns || {};
          var anyActive = false;
          Object.keys(campaigns).forEach(function (nid) {
            self.updateRow(nid, campaigns[nid]);
            if (campaigns[nid].background_active) {
              anyActive = true;
            }
          });
          self.updateSummary(response.summary);
          window.isCampaignProcessing = anyActive;
        }
      });
    },

    updateRow: function (nid, data) {
      var $row = $('.campaign-row-' + nid);
      if (!$row.length || !data) {
        return;
      }

      var statusHtml = formatStatus(data.status);
      if (data.background_active) {
        statusHtml += ' <span class="campaign-live-indicator" title="' + Drupal.t('Sending in background') + '">●</span>';
        $row.addClass('campaign-row--live');
      } else {
        $row.removeClass('campaign-row--live');
      }

      var progressText = (data.progress || 0) + '%';
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

      var $process = $row.find('.ajax-process-link');
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
