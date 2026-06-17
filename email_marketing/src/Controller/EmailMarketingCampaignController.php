<?php

namespace Drupal\email_marketing\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\Core\Link;

class EmailMarketingCampaignController extends ControllerBase
{

  public function list()
  {
    $header = [
      'id' => $this->t('ID'),
      'subject' => $this->t('Subject'),
      'created' => $this->t('Created'),
      'operations' => $this->t('Operations'),
    ];

    $rows = [];
    $results = \Drupal::database()->select('email_marketing_campaigns', 'c')
      ->fields('c')
      ->orderBy('id', 'DESC')
      ->execute()
      ->fetchAll();

    foreach ($results as $record) {
      $operations = [
        Link::fromTextAndUrl(
          $this->t('Resend'),
          Url::fromRoute('email_marketing.campaign_send', ['campaign' => $record->id])
        )->toRenderable(),
        ['#markup' => ' | '],
        Link::fromTextAndUrl(
          $this->t('Show'),
          Url::fromRoute('email_marketing.campaign_show', ['campaign' => $record->id])
        )->toRenderable(),
      ];

      $rows[] = [
        'id' => $record->id,
        'subject' => $record->subject,
        'created' => date('Y-m-d H:i:s', $record->created),
        'operations' => [
          'data' => [
            '#type' => 'container',
            '#attributes' => ['class' => ['operations-links']],
            'links' => $operations,
          ],
        ],
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No campaigns yet.'),
    ];
  }

  public function send($campaign)
  {
    /** @var \Drupal\email_marketing\Service\EmailMarketingService $svc */
    $svc = \Drupal::service('email_marketing.service');
    list($new_campaign_id, $sent, $failed) = $svc->resendCampaign((int) $campaign);
    if (!$new_campaign_id) {
      $this->messenger()->addError($this->t('Campaign not found.'));
    } else {
      $this->messenger()->addStatus($this->t('Resent campaign @id: @sent sent, @failed failed.', ['@id' => $new_campaign_id, '@sent' => $sent, '@failed' => $failed]));
    }
    return $this->redirect('email_marketing.campaigns');
  }
}
