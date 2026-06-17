<?php

namespace Drupal\email_layout\Batch;

use Drupal\user\Entity\User;
use Drupal\email_layout\Email\EmailLayoutSender;

class EmailLayoutBatch {

  public static function sendEmailOperation($uid, $template_nid, &$context) {
    $user = User::load($uid);
    if (!$user || !$user->getEmail()) {
      return;
    }

    /** @var \Drupal\email_layout\Email\EmailLayoutSender $sender */
    $sender = \Drupal::service('email_layout.sender');

    $result = $sender->sendEmailFromLayout($template_nid, $user->getEmail(), 'Newsletter from ' . \Drupal::config('system.site')->get('name'));

    $context['message'] = t('Sent email to @email', ['@email' => $user->getEmail()]);
  }

  public static function batchFinished($success, $results, $operations) {
    if ($success) {
      \Drupal::messenger()->addMessage(t('All emails have been sent.'));
    } else {
      \Drupal::messenger()->addError(t('There was a problem sending the emails.'));
    }
  }

}
