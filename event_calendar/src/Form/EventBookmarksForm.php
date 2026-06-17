<?php

namespace Drupal\event_calendar\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;

/**
 * Displays a table of users who bookmarked a specific event node.
 */
class EventBookmarksForm extends FormBase
{

  public function getFormId()
  {
    return 'event_bookmarks_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, $nid = NULL)
  {
    $current_user = \Drupal::currentUser();

    if (!$current_user->hasPermission('view event bookmarks')) {
      $form['access_denied'] = [
        '#markup' => '<div class="messages messages--error">Access denied.</div>',
      ];
      return $form;
    }

    // Load node.
    if (empty($nid) || !$node = Node::load($nid)) {
      $form['error'] = [
        '#markup' => '<div class="messages messages--error">Invalid node ID.</div>',
      ];
      return $form;
    }

    // Load flaggings.
    $flaggings = \Drupal::entityTypeManager()
      ->getStorage('flagging')
      ->loadByProperties(['flag_id' => 'bookmark', 'entity_id' => $nid]);

    if (empty($flaggings)) {
      $form['empty'] = [
        '#markup' => '<div class="messages messages--warning">No users have bookmarked this content yet.</div>',
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
      'bookmarked_on' => $this->sortableHeader('Bookmarked on', 'bookmarked_on', $sort_key, $sort_dir),
    ];

    // Build rows.
    $rows = [];
    $counter = 1;
    $storage = \Drupal::entityTypeManager()->getStorage('public_user');

    foreach ($flaggings as $flagging) {
      $uid = $flagging->getOwnerId();
      $user = $storage->load($uid);
      if (!$user) {
        continue;
      }

      $rows[] = [
        'serial' => $counter,
        'uid' => $uid,
        'username' => $user->getDisplayName(),
        'mail' => $user->getEmail() ?: 'N/A',
        'bookmarked_on' => date('Y-m-d', $flagging->getCreatedTime()),
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
        'bookmarked_on' => ['data' => ['#markup' => $row['bookmarked_on']]],
      ];
    }

    // Build table.
    $form['bookmarked_users_table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $table_rows,
      '#empty' => $this->t('No users have bookmarked this node.'),
      '#caption' => $this->t('Users who bookmarked: @title (NID: @nid)', [
        '@title' => $node->label(),
        '@nid' => $nid,
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
        count($rows) . " users have bookmarked this content.</div>",
      '#weight' => -10,
    ];

    // Download CSV button.
    if ($current_user->hasPermission('export event bookmarks csv')) {
      $form['download_csv'] = [
        '#type' => 'link',
        '#title' => $this->t('Download as CSV'),
        '#url' => Url::fromRoute('event_calendar.event_bookmarks_csv', ['nid' => $nid]),
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
