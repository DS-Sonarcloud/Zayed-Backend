<?php

namespace Drupal\event_calendar\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Url;
use Drupal\taxonomy\Entity\Term;

/**
 * Displays a table of public users subscribed to a specific event type.
 */
class EventSubscribersForm extends FormBase
{

  public function getFormId()
  {
    return 'event_subscribers_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, $tid = NULL)
  {
    $current_user = \Drupal::currentUser();

    if (!$current_user->hasPermission('view event subscribers')) {
      $form['access_denied'] = [
        '#markup' => '<div class="messages messages--error">Access denied.</div>',
      ];
      return $form;
    }

    // Load taxonomy term.
    if (empty($tid) || !$term = Term::load($tid)) {
      $form['error'] = [
        '#markup' => '<div class="messages messages--error">Invalid event type ID.</div>',
      ];
      return $form;
    }

    // Load flaggings for this event type term.
    $connection = \Drupal::database();
    $flagging_results = $connection->select('flagging', 'f')
      ->fields('f', ['uid', 'created'])
      ->condition('f.flag_id', 'subscribe_event')
      ->condition('f.entity_type', 'taxonomy_term')
      ->condition('f.entity_id', $tid)
      ->execute()
      ->fetchAll();

    if (empty($flagging_results)) {
      $form['empty'] = [
        '#markup' => '<div class="messages messages--warning">No users have subscribed to this event type yet.</div>',
      ];
      return $form;
    }

    // Sorting values from URL.
    $request = \Drupal::request();
    $sort_key = $request->query->get('sort_key', 'serial');
    $sort_dir = $request->query->get('sort_dir', 'asc');

    // Sortable header.
    $header = [
      'serial' => $this->sortableHeader('S.No.', 'serial', $sort_key, $sort_dir),
      'uid' => $this->sortableHeader('User ID', 'uid', $sort_key, $sort_dir),
      'username' => $this->sortableHeader('Username', 'username', $sort_key, $sort_dir),
      'mail' => $this->sortableHeader('Email', 'mail', $sort_key, $sort_dir),
      'subscribed_on' => $this->sortableHeader('Subscribed on', 'subscribed_on', $sort_key, $sort_dir),
      'status' => $this->sortableHeader('Status', 'status', $sort_key, $sort_dir),
    ];

    // Build rows.
    $rows = [];
    $counter = 1;
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');

    foreach ($flagging_results as $flagging) {
      $uid = $flagging->uid;
      $user = $storage->load($uid);
      if (!$user) {
        continue;
      }

      $status = $user->hasField('status') ? (int) $user->get('status')->value : 0;

      $rows[] = [
        'serial' => $counter,
        'uid' => $uid,
        'username' => $user->getDisplayName(),
        'mail' => method_exists($user, 'getEmail') ? ($user->getEmail() ?: 'N/A') : 'N/A',
        'subscribed_on' => date('Y-m-d', $flagging->created),
        'status' => $status ? 'Active' : 'Inactive',
      ];

      $counter++;
    }

    // Apply sorting.
    usort($rows, function ($a, $b) use ($sort_key, $sort_dir) {
      $aVal = strtolower((string) $a[$sort_key]);
      $bVal = strtolower((string) $b[$sort_key]);

      if ($sort_dir === 'asc') {
        return $aVal <=> $bVal;
      }
      return $bVal <=> $aVal;
    });

    // Convert sorted rows to table format.
    $table_rows = [];
    foreach ($rows as $row) {
      $table_rows[] = [
        'serial' => ['data' => ['#markup' => $row['serial']]],
        'uid' => ['data' => ['#markup' => $row['uid']]],
        'username' => ['data' => ['#markup' => $row['username']]],
        'mail' => ['data' => ['#markup' => $row['mail']]],
        'subscribed_on' => ['data' => ['#markup' => $row['subscribed_on']]],
        'status' => ['data' => ['#markup' => $row['status']]],
      ];
    }

    // Build table.
    $form['subscribers_table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $table_rows,
      '#empty' => $this->t('No users have subscribed to this event type.'),
      '#caption' => $this->t('Users subscribed to: @title (TID: @tid)', [
        '@title' => $term->label(),
        '@tid' => $tid,
      ]),
      '#attributes' => [
        'class' => [
          'views-table',
          'views-view-table',
          'responsive-enabled',
          'sticky-enabled',
          'table',
          'admin-list',
        ],
      ],
    ];

    // Summary.
    $form['summary'] = [
      '#markup' => "<div class='messages messages--status'>" .
        count($rows) . " users have subscribed to this event type.</div>",
      '#weight' => -10,
    ];

    // Download CSV button.
    if ($current_user->hasPermission('export event subscribers csv')) {
      $form['download_csv'] = [
        '#type' => 'link',
        '#title' => $this->t('Download as CSV'),
        '#url' => Url::fromRoute('event_calendar.event_subscribers_csv', ['tid' => $tid]),
        '#attributes' => [
          'class' => ['button', 'button--primary'],
        ],
        '#weight' => -9,
      ];
    }

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
  }

  /**
   * Helper to build sortable header.
   */
  private function sortableHeader($label, $key, $active, $dir)
  {
    $next = ($active === $key && $dir === 'asc') ? 'desc' : 'asc';
    $arrow = ($active === $key) ? ($dir === 'asc' ? ' ↑' : ' ↓') : '';

    return [
      'data' => Markup::create(
        "<a href='?sort_key=$key&sort_dir=$next'>$label$arrow</a>"
      ),
    ];
  }
}
