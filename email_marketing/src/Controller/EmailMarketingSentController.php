<?php

namespace Drupal\email_marketing\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Url;

class EmailMarketingSentController extends ControllerBase
{

  public function list()
  {
    $header = [
      'id' => $this->t('ID'),
      'subject' => $this->t('Subject'),
      'recipients' => $this->t('Recipients'),
      'status' => $this->t('Status'),
      'created' => $this->t('Created'),
    ];

    $rows = [];
    $results = \Drupal::database()->select('email_marketing_sent', 'e')
      ->fields('e')
      ->orderBy('id', 'DESC')
      ->execute()
      ->fetchAll();

    foreach ($results as $record) {
      $rows[] = [
        'id' => $record->id,
        'subject' => $record->subject,
        'recipients' => implode(', ', unserialize($record->recipients)),
        'status' => $record->status,
        'created' => date('Y-m-d H:i:s', $record->created),
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No emails have been sent yet.'),
    ];
  }
  public function listByCampaign($campaign)
  {
    $header = [
      'id' => $this->t('ID'),
      'recipients' => $this->t('Recipients'),
      'status' => $this->t('Status'),
      'created' => $this->t('Created'),
    ];

    $rows = [];
    $results = \Drupal::database()->select('email_marketing_sent', 's')
      ->fields('s')
      ->condition('campaign_id', $campaign)
      ->orderBy('id', 'DESC')
      ->execute()
      ->fetchAll();

    foreach ($results as $record) {
      $rows[] = [
        'id' => $record->id,
        'recipients' => implode(', ', unserialize($record->recipients)),
        'status' => $record->status,
        'created' => date('Y-m-d H:i:s', $record->created),
      ];
    }

    return [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No emails sent for this campaign yet.'),
    ];
  }
}
