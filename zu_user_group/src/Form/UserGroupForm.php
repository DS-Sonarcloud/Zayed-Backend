<?php

namespace Drupal\zu_user_group\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\OpenModalDialogCommand;

/**
 * Form controller for User Group entity edit forms.
 */
class UserGroupForm extends ContentEntityForm
{

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state)
  {
    $form = parent::form($form, $form_state);

    $form['#attached']['library'][] = 'zu_user_group/user-group-form';
    $initial_count = $this->calculateTotalUsers($form_state);
    $stats_class = ($initial_count > 0) ? 'count-active' : 'count-zero';

    $form['user_group_stats'] = [
      '#type' => 'container',
      '#attributes' => [
        'id' => 'user-group-live-stats',
        'class' => [$stats_class],
      ],
      '#weight' => -100,
    ];

    $form['user_group_stats']['count_display'] = [
      '#type' => 'markup',
      '#markup' => '<h3>' . $this->t('Total Targeted Users') . '</h3><span id="user-group-total-count" class="total-users-badge">' . $initial_count . '</span>',
      '#prefix' => '<div id="live-user-count-wrapper">',
      '#suffix' => '</div>',
    ];

    $persistent_selections = $form_state->get('persistent_webform_submissions');
    $user_table_selection = $form_state->getValue('submissions_table');

    if ($user_table_selection !== null) {
      if ($persistent_selections === null)
        $persistent_selections = [];
      foreach ($user_table_selection as $sid => $selected) {
        if ($selected) {
          $persistent_selections[$sid] = (string) $sid;
        } else {
          unset($persistent_selections[$sid]);
        }
      }
      $form_state->set('persistent_webform_submissions', $persistent_selections);
    }

    $ajax_settings_change = [
      'callback' => [$this, 'ajaxTotalCountCallback'],
      'wrapper' => 'user-group-live-stats',
      'event' => 'change',
      'progress' => [
        'type' => 'none',
      ],
    ];

    $ajax_settings_autocomplete = [
      'callback' => [$this, 'ajaxTotalCountCallback'],
      'wrapper' => 'user-group-live-stats',
      'event' => 'autocompleteclose',
      'progress' => [
        'type' => 'none',
      ],
    ];

    $ajax_settings_webform = [
      'callback' => [$this, 'ajaxWebformValidationCallback'],
      'wrapper' => 'user-group-live-stats',
      'event' => 'change',
      'progress' => [
        'type' => 'throbber',
        'message' => $this->t('Validating Webform...'),
      ],
    ];

    if (isset($form['target_roles'])) {
      $form['target_roles']['widget']['#ajax'] = $ajax_settings_change;
    }
    if (isset($form['target_public_segments'])) {
      $form['target_public_segments']['widget']['#ajax'] = $ajax_settings_change;
    }
    if (isset($form['target_event_types'])) {
      $form['target_event_types']['widget']['#ajax'] = $ajax_settings_change;
    }



    // 4. Target Bookmarked Events
    // if (isset($form['target_bookmarked_nodes'])) {
    //     $form['target_bookmarked_nodes']['widget']['#ajax'] = $ajax_settings_autocomplete;
    // }

    // // 5. Manual Internal Users
    // $form['users_fieldset'] = [
    //     '#type' => 'fieldset',
    //     '#title' => $this->t('Manual Internal Users'),
    //     '#attributes' => ['class' => ['user-group-card']],
    //     '#weight' => 90,
    // ];

    // if (isset($form['users'])) {
    //     $form['users']['#group'] = 'users_fieldset';
    //     $form['users']['#title_display'] = 'invisible';
    //     $form['users']['widget']['#ajax'] = $ajax_settings_autocomplete;
    // }

    // // 6. Manual Public Users 
    // $form['public_users_fieldset'] = [
    //     '#type' => 'fieldset',
    //     '#title' => $this->t('Manual Public Users'),
    //     '#attributes' => ['class' => ['user-group-card']],
    //     '#weight' => 100,
    // ];

    // if (isset($form['public_users'])) {
    //     $form['public_users']['#group'] = 'public_users_fieldset';
    //     $form['public_users']['#title_display'] = 'invisible';
    //     $form['public_users']['widget']['#ajax'] = $ajax_settings_autocomplete;
    // }

    $form['#attached']['library'][] = 'zu_user_group/user-group-form';

    if (isset($form['target_all_public_users'])) {
      $form['target_all_public_users']['widget']['value']['#ajax'] = $ajax_settings_change;
      $form['target_all_public_users']['#weight'] = 50;
    }

    if (isset($form['target_webforms'])) {
      $form['target_webforms']['#weight'] = 60;
    }

    if (isset($form['target_webforms'])) {
      $form['target_webforms']['widget']['#ajax'] = $ajax_settings_webform;

      $form['target_webforms']['widget']['#multiple'] = FALSE;

      if (empty($form['target_webforms']['widget']['#default_value']) && !$this->entity->isNew()) {
        $default_val = $this->entity->get('target_webforms')->getValue();
        if (!empty($default_val)) {
          $first_item = reset($default_val);
          $form['target_webforms']['widget']['#default_value'] = $first_item['target_id'] ?? $first_item;
        }
      }
    }

    $form['current_page'] = [
      '#type' => 'hidden',
      '#default_value' => \Drupal::request()->query->get('page', 0),
    ];

    $webform_ids = [];
    $target_webforms = $form_state->getValue('target_webforms');

    if (empty($target_webforms) && $this->entity->id()) {
      $target_webforms = $this->entity->get('target_webforms')->getValue();
    }

    if (!empty($target_webforms)) {
      foreach ($target_webforms as $item) {
        $webform_ids[] = is_array($item) ? ($item['target_id'] ?? null) : $item;
      }
      $webform_ids = array_filter($webform_ids);
    }

    $form['webform_submissions_wrapper'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'webform-submissions-wrapper'],
      '#weight' => 50,
    ];

    if (!empty($webform_ids)) {
      $webform_id = reset($webform_ids);

      if ($this->isWebformValid($webform_id)) {
        $options = $this->getWebformSubmissions($webform_ids, true, $form_state);

        if (!empty($options)) {
          $header = [
            'sid' => $this->t('Submission ID'),
            'name' => $this->t('User Name'),
            'email' => $this->t('Email Address'),
            'created' => $this->t('Submitted At'),
          ];

          $rows = [];
          foreach ($options as $sid => $opt) {
            $rows[] = [
              'sid' => $opt['sid'],
              'name' => $opt['name'],
              'email' => $opt['email'],
              'created' => $opt['created'],
            ];
          }

          $form['webform_submissions_wrapper']['submissions_table'] = [
            '#type' => 'table',
            '#header' => $header,
            '#rows' => $rows,
            '#empty' => $this->t('No submissions found.'),
          ];

          $form['webform_submissions_wrapper']['pager'] = [
            '#type' => 'pager',
            '#element' => 0,
          ];
        }
      } else {
        $form['webform_submissions_wrapper']['invalid_fields'] = [
          '#markup' => '<div class="messages messages--warning">' . $this->t('The selected webform is missing an "email" field.') . '</div>',
        ];
      }
    }

    return $form;
  }

  /**
   * AJAX Callback: Returns the updated Total User count.
   */
  public function ajaxTotalCountCallback(array &$form, FormStateInterface $form_state)
  {
    $total_users = $this->calculateTotalUsers($form_state);
    $css_class = ($total_users > 0) ? 'count-active' : 'count-zero';

    $response = new \Drupal\Core\Ajax\AjaxResponse();
    $response->addCommand(new \Drupal\Core\Ajax\HtmlCommand('#user-group-total-count', $total_users));
    $response->addCommand(new \Drupal\Core\Ajax\InvokeCommand('#user-group-live-stats', 'removeClass', ['count-zero', 'count-active']));
    $response->addCommand(new \Drupal\Core\Ajax\InvokeCommand('#user-group-live-stats', 'addClass', [$css_class]));

    return $response;
  }

  /**
   * AJAX Callback: Validates Webform and returns Total User count.
   */
  public function ajaxWebformValidationCallback(array &$form, FormStateInterface $form_state)
  {
    \Drupal::logger('zu_debug')->info('AJAX Callback Triggered. Values: <pre>@vals</pre>', [
      '@vals' => print_r($form_state->getValue('target_webforms'), TRUE)
    ]);

    $response = $this->ajaxTotalCountCallback($form, $form_state);

    $triggering_element = $form_state->getTriggeringElement();
    $selected_webforms = $form_state->getValue('target_webforms');

    \Drupal::logger('zu_debug')->info('Selected Webforms: <pre>@vals</pre>', [
      '@vals' => print_r($selected_webforms, TRUE)
    ]);

    if (!empty($selected_webforms)) {
      $warnings = [];
      foreach ($selected_webforms as $item) {
        $webform_id = is_array($item) ? ($item['target_id'] ?? null) : $item;
        if ($webform_id && !$this->isWebformValid($webform_id)) {
          $webform = \Drupal::entityTypeManager()->getStorage('webform')->load($webform_id);
          $warnings[] = $this->t('Webform "@name" is missing an "email" field. It will not be included in targeting.', [
            '@name' => $webform ? $webform->label() : $webform_id,
          ]);
        }
      }

      if (!empty($warnings)) {
        $response->addCommand(new \Drupal\Core\Ajax\OpenModalDialogCommand(
          $this->t('Webform Field Required'),
          ['#markup' => implode('<br>', $warnings)],
          ['width' => 450]
        ));
      }

      $response->addCommand(new \Drupal\Core\Ajax\ReplaceCommand('#webform-submissions-wrapper', $form['webform_submissions_wrapper']));
    }

    return $response;
  }

  /**
   * Helper: Calculates unique EMAILS based on current form state.
   */
  protected function calculateTotalUsers(FormStateInterface $form_state)
  {
    $emails = [];
    $connection = \Drupal::database();

    $roles = $form_state->getValue('target_roles');
    if ($roles === null && $this->entity->id() && $this->entity->hasField('target_roles')) {
      $roles = $this->entity->get('target_roles')->getValue();
    }
    if (!empty($roles) && is_array($roles)) {
      $rids = [];
      foreach ($roles as $item) {
        $rids[] = is_array($item) ? ($item['target_id'] ?? null) : $item;
      }
      $rids = array_filter($rids);
      if (!empty($rids)) {
        $query = $connection->select('users_field_data', 'u');
        $query->join('user__roles', 'ur', 'u.uid = ur.entity_id');
        $query->fields('u', ['mail']);
        $query->condition('u.status', 1);
        $query->condition('ur.roles_target_id', $rids, 'IN');
        $emails = array_merge($emails, $query->execute()->fetchCol());
      }
    }

    $target_all = $form_state->getValue('target_all_public_users');

    if ($target_all === null && $this->entity->id() && $this->entity->hasField('target_all_public_users')) {
      $target_all = $this->entity->get('target_all_public_users')->value;
    }

    $is_target_all = FALSE;
    if (is_array($target_all) && !empty($target_all['value'])) {
      $is_target_all = (bool) $target_all['value'];
    } elseif (!is_array($target_all) && !empty($target_all)) {
      $is_target_all = (bool) $target_all;
    }

    if ($is_target_all) {
      $query = $connection->select('public_user', 'pu');
      $query->fields('pu', ['email']);
      $query->condition('pu.status', 1);
      $emails = array_merge($emails, $query->execute()->fetchCol());
    } else {
      $segments = $form_state->getValue('target_public_segments');
      if ($segments === null && $this->entity->id() && $this->entity->hasField('target_public_segments')) {
        $segments = $this->entity->get('target_public_segments')->getValue();
      }
      if (!empty($segments)) {
        $flag_ids = [];
        foreach ($segments as $item) {
          $flag_ids[] = is_array($item) ? ($item['value'] ?? null) : $item;
        }
        $flag_ids = array_filter($flag_ids);
        if (!empty($flag_ids)) {
          $query = $connection->select('flagging', 'f');
          $query->join('public_user', 'pu', 'f.entity_id = pu.id');
          $query->fields('pu', ['email']);
          $query->condition('f.flag_id', $flag_ids, 'IN');
          $query->condition('f.entity_type', 'public_user');
          $query->condition('pu.status', 1);
          $emails = array_merge($emails, $query->execute()->fetchCol());
        }
      }

      $events = $form_state->getValue('target_event_types');
      if ($events === null && $this->entity->id() && $this->entity->hasField('target_event_types')) {
        $events = $this->entity->get('target_event_types')->getValue();
      }
      if (!empty($events)) {
        $tids = [];
        foreach ($events as $item) {
          $tids[] = is_array($item) ? ($item['target_id'] ?? null) : $item;
        }
        $tids = array_filter($tids);
        if (!empty($tids)) {
          $query = $connection->select('flagging', 'f');
          $query->fields('f', ['uid']);
          $query->condition('f.flag_id', 'subscribe_event');
          $query->condition('f.entity_type', 'taxonomy_term');
          $query->condition('f.entity_id', $tids, 'IN');
          $uids = $query->execute()->fetchCol();
          if (!empty($uids)) {
            $query = $connection->select('public_user', 'pu');
            $query->fields('pu', ['email']);
            $query->condition('pu.id', $uids, 'IN');
            $query->condition('pu.status', 1);
            $emails = array_merge($emails, $query->execute()->fetchCol());
          }
        }
      }
    }

    $target_webforms = $form_state->getValue('target_webforms');
    if ($target_webforms === null && $this->entity->id()) {
      $target_webforms = $this->entity->get('target_webforms')->getValue();
    }

    if (!empty($target_webforms)) {
      $webform_ids = [];
      foreach ($target_webforms as $item) {
        $webform_ids[] = is_array($item) ? ($item['target_id'] ?? null) : $item;
      }
      $webform_ids = array_filter($webform_ids);

      if (!empty($webform_ids)) {
        foreach ($webform_ids as $webform_id) {
          if ($this->isWebformValid($webform_id)) {
            $email_field_name = $this->getEmailFieldName($webform_id);
            if ($email_field_name) {
              $query = $connection->select('webform_submission', 'ws');
              $query->join('webform_submission_data', 'wsd_mail', "ws.sid = wsd_mail.sid AND wsd_mail.name = :email_field", [':email_field' => $email_field_name]);
              $query->fields('wsd_mail', ['value']);
              $query->condition('ws.webform_id', $webform_id);
              $wf_emails = $query->execute()->fetchCol();
              $emails = array_merge($emails, $wf_emails);
            }
          }
        }
      }
    }

    $emails = array_filter(array_unique($emails));
    return count($emails);
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state)
  {
    $entity = $this->entity;
    $status = parent::save($form, $form_state);

    switch ($status) {
      case SAVED_NEW:
        $this->messenger()->addMessage($this->t('Created the %label User Group.', [
          '%label' => $entity->label(),
        ]));
        break;

      default:
        $this->messenger()->addMessage($this->t('Saved the %label User Group.', [
          '%label' => $entity->label(),
        ]));
    }

    $form_state->setRedirect('entity.user_group.collection');
  }

  protected function getWebformSubmissions($selected_webforms, $paginate = true, ?FormStateInterface $form_state = null)
  {
    if (empty($selected_webforms)) {
      return [];
    }

    // Get the email field name from the first webform
    $first_webform_id = is_array($selected_webforms) ? reset($selected_webforms) : $selected_webforms;
    $email_field_name = $this->getEmailFieldName($first_webform_id);

    if (!$email_field_name) {
      return [];
    }

    $current_page = 0;
    if ($form_state && $form_state->getValue('current_page') !== null) {
      $current_page = $form_state->getValue('current_page');
      \Drupal::request()->query->set('page', $current_page);
    } else {
      $current_page = \Drupal::request()->query->get('page', 0);
    }

    $query = \Drupal::database()->select('webform_submission', 'ws');
    $query->join('webform_submission_data', 'wsd_mail', "ws.sid = wsd_mail.sid AND wsd_mail.name = :email_field", [':email_field' => $email_field_name]);
    $query->leftJoin('webform_submission_data', 'wsd_name', 'ws.sid = wsd_name.sid AND wsd_name.name = \'name\'');

    $query->fields('ws', ['sid', 'created']);
    $query->addField('wsd_mail', 'value', 'wsd_mail_value');
    $query->addField('wsd_name', 'value', 'wsd_name_value');

    $query->condition('ws.webform_id', $selected_webforms, 'IN');
    $query->orderBy('ws.created', 'DESC');

    if ($paginate) {
      $query = $query->extend('Drupal\Core\Database\Query\PagerSelectExtender')->limit(30);
    }

    $result = $query->execute();
    $options = [];
    foreach ($result as $row) {
      $options[$row->sid] = [
        'sid' => $row->sid,
        'email' => $row->wsd_mail_value,
        'name' => $row->wsd_name_value ?: 'N/A',
        'created' => \Drupal::service('date.formatter')->format($row->created, 'short'),
      ];
    }

    return $options;
  }

  /**
   * Helper: Validates if a webform has an "email" field.
   */
  protected function isWebformValid($webform_id)
  {
    $webform = \Drupal::entityTypeManager()->getStorage('webform')->load($webform_id);
    if (!$webform) {
      return FALSE;
    }

    $elements = $webform->getElementsDecodedAndFlattened();
    $has_email = FALSE;

    foreach ($elements as $key => $element) {
      if (stripos($key, 'email') !== FALSE || stripos($key, 'mail') !== FALSE) {
        $has_email = TRUE;
        break;
      }
      if (isset($element['#type']) && $element['#type'] === 'email') {
        $has_email = TRUE;
        break;
      }
    }

    return $has_email;
  }

  /**
   * Helper: Gets the actual email field name from a webform.
   */
  protected function getEmailFieldName($webform_id)
  {
    $webform = \Drupal::entityTypeManager()->getStorage('webform')->load($webform_id);
    if (!$webform) {
      return NULL;
    }

    $elements = $webform->getElementsDecodedAndFlattened();

    foreach ($elements as $key => $element) {
      if (stripos($key, 'email') !== FALSE || stripos($key, 'mail') !== FALSE) {
        return $key;
      }
      if (isset($element['#type']) && $element['#type'] === 'email') {
        return $key;
      }
    }

    return NULL;
  }
}
