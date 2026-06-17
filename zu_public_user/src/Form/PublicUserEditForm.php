<?php

namespace Drupal\zu_public_user\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

final class PublicUserEditForm extends ContentEntityForm
{

  public function buildForm(array $form, FormStateInterface $form_state): array
  {
    $entity = $this->getEntity();

    // Attach styles.
    $form['#attached']['library'][] = 'zu_public_user/flags';

    $form = parent::buildForm($form, $form_state);

    $public_user_id = $entity->id();
    $flag_service = \Drupal::service('flag');
    $storage = \Drupal::entityTypeManager()->getStorage('flagging');

    // Flags list
    $flag_config = [
      'blog_subscribe'       => ['type' => 'boolean', 'title' => 'Blog Subscribe'],
      'newsletter_subscribe' => ['type' => 'boolean', 'title' => 'Newsletter Subscribe'],
      'news_subscribe'       => ['type' => 'boolean', 'title' => 'News Subscribe'],
      'bookmark'             => ['type' => 'list', 'title' => 'Bookmarks'],
      'rating_blog'          => ['type' => 'rating', 'title' => 'Blog Ratings'],
      'subscribe_event'      => ['type' => 'list', 'title' => 'Subscribed Events'],
    ];

    $form['flag_summary'] = [
      '#type' => 'details',
      '#title' => $this->t('User Summary'),
      '#open' => TRUE,
      '#weight' => -25,
    ];

    foreach ($flag_config as $flag_id => $info) {

      $flag = $flag_service->getFlagById($flag_id);
      if (!$flag) {
        continue;
      }

      //---------------------------------------------------------
      // BOOLEAN FLAGS
      //---------------------------------------------------------
      if ($info['type'] === 'boolean') {

        $flaggings = $storage->loadByProperties([
          'flag_id'     => $flag_id,
          'entity_type' => 'public_user',
          'entity_id'   => $public_user_id,
        ]);

        $is_active = !empty($flaggings);

        $form['flag_summary'][$flag_id] = [
          '#type' => 'container',
          '#attributes' => ['class' => ['flag-card']],
          'info' => [
            '#markup' => "<div class='flag-title'>{$info['title']}</div>
                          <div class='flag-status'>Status: " . ($is_active ? 'Subscribed' : 'Not Subscribed') . "</div>",
          ]
        ];

        if ($is_active) {
          $flagging = reset($flaggings);
          $form['flag_summary'][$flag_id]['actions'] = [
            '#type' => 'submit',
            '#value' => $this->t('Remove'),
            '#submit' => ['::removeFlagSubmit'],
            '#flagging_id' => $flagging->id(),
            '#attributes' => ['class' => ['button', 'button--danger']],
          ];
        }
      }

      //---------------------------------------------------------
      // BOOKMARK LIST (blogs + events)
      //---------------------------------------------------------
      //---------------------------------------------------------
      // BOOKMARK LIST — split into Blogs & Events
      //---------------------------------------------------------
      if ($info['type'] === 'list' && $flag_id === 'bookmark') {

        $flaggings = $storage->loadByProperties([
          'flag_id' => 'bookmark',
          'uid'     => $public_user_id,
        ]);

        $form['flag_summary'][$flag_id] = [
          '#type' => 'details',
          '#title' => $info['title'],
          '#open' => FALSE,
        ];

        if (empty($flaggings)) {
          $form['flag_summary'][$flag_id]['empty'] = [
            '#markup' => "<em>No bookmarks.</em>"
          ];
          continue;
        }

        // Separate Blogs & Events
        $blogs = [];
        $events = [];

        foreach ($flaggings as $flagging) {
          $node = $flagging->getFlaggable();
          if (!$node) {
            continue;
          }

          // Get clean alias (last part only)
          $alias = \Drupal::service('path_alias.manager')
            ->getAliasByPath('/node/' . $node->id());
          $alias = preg_replace('#^/[a-zA-Z_]{2}(/|$)#', '/', $alias);
          $parts = explode('/', trim($alias, '/'));
          $clean_alias = '/' . end($parts);

          $item = [
            'node' => $node,
            'flagging' => $flagging,
            'clean_alias' => $clean_alias
          ];

          if ($node->bundle() === 'blogs') {
            $blogs[] = $item;
          } elseif ($node->bundle() === 'event') {
            $events[] = $item;
          }
        }

        //-------------------------------------------------------
        // BLOGS LIST
        //-------------------------------------------------------
        $form['flag_summary'][$flag_id]['blogs_title'] = [
          '#markup' => "<h4>Blog Bookmarks</h4>"
        ];

        if (empty($blogs)) {
          $form['flag_summary'][$flag_id]['blogs_empty'] = ['#markup' => "<em>No blog bookmarks.</em>"];
        } else {
          foreach ($blogs as $data) {
            $node = $data['node'];
            $flagging = $data['flagging'];

            $form['flag_summary'][$flag_id]['blog_' . $flagging->id()] = [
              '#type' => 'container',
              '#attributes' => ['class' => ['flag-list-item']],
              'label' => [
                '#markup' => "<strong>{$node->label()}</strong> (ID: {$node->id()})<br>
                        <small>URL: {$data['clean_alias']}</small>",
              ],
              'remove' => [
                '#type' => 'submit',
                '#value' => $this->t('Remove'),
                '#submit' => ['::removeFlagSubmit'],
                '#flagging_id' => $flagging->id(),
                '#attributes' => ['class' => ['button', 'button--danger']],
              ],
            ];
          }
        }

        //-------------------------------------------------------
        // EVENTS LIST
        //-------------------------------------------------------
        $form['flag_summary'][$flag_id]['events_title'] = [
          '#markup' => "<h4>Event Bookmarks</h4>"
        ];

        if (empty($events)) {
          $form['flag_summary'][$flag_id]['events_empty'] = ['#markup' => "<em>No event bookmarks.</em>"];
        } else {
          foreach ($events as $data) {
            $node = $data['node'];
            $flagging = $data['flagging'];

            $form['flag_summary'][$flag_id]['event_' . $flagging->id()] = [
              '#type' => 'container',
              '#attributes' => ['class' => ['flag-list-item']],
              'label' => [
                '#markup' => "<strong>{$node->label()}</strong> (ID: {$node->id()})<br>
                        <small>URL: {$data['clean_alias']}</small>",
              ],
              'remove' => [
                '#type' => 'submit',
                '#value' => $this->t('Remove'),
                '#submit' => ['::removeFlagSubmit'],
                '#flagging_id' => $flagging->id(),
                '#attributes' => ['class' => ['button', 'button--danger']],
              ],
            ];
          }
        }
      }


      //---------------------------------------------------------
      // BLOG RATINGS (rating_blog)
      //---------------------------------------------------------
      if ($info['type'] === 'rating') {

        $flaggings = $storage->loadByProperties([
          'flag_id' => 'rating_blog',
          'uid'     => $public_user_id,
        ]);

        $form['flag_summary'][$flag_id] = [
          '#type' => 'details',
          '#title' => "Blog Ratings",
          '#open' => FALSE,
        ];

        if (empty($flaggings)) {
          $form['flag_summary'][$flag_id]['empty'] = ['#markup' => "<em>No blog ratings.</em>"];
          continue;
        }

        foreach ($flaggings as $flagging) {
          $node = $flagging->getFlaggable();
          $rating = (int) $flagging->get('field_rating')->value;

          // Clean alias
          $alias = \Drupal::service('path_alias.manager')->getAliasByPath('/node/' . $node->id());
          $alias = preg_replace('#^/[a-zA-Z_]{2}(/|$)#', '/', $alias);
          $parts = explode('/', trim($alias, '/'));
          $clean_alias = '/' . end($parts);

          $form['flag_summary'][$flag_id]["rating_{$flagging->id()}"] = [
            '#type' => 'container',
            '#attributes' => ['class' => ['rating-item']],
            'label' => [
              '#markup' => "<strong>{$node->label()}</strong><br>
                          Rating: ★ {$rating}/5 <br>
                          <small>URL: {$clean_alias}</small>",
            ],
            'remove' => [
              '#type' => 'submit',
              '#value' => $this->t('Remove'),
              '#submit' => ['::removeFlagSubmit'],
              '#flagging_id' => $flagging->id(),
              '#attributes' => ['class' => ['button', 'button--danger']],
            ],
          ];
        }
      }

      //---------------------------------------------------------
      // EVENT SUBSCRIPTIONS (taxonomy)
      //---------------------------------------------------------
      if ($info['type'] === 'list' && $flag_id === 'subscribe_event') {

        $flaggings = $storage->loadByProperties([
          'flag_id' => 'subscribe_event',
          'uid'     => $public_user_id,
        ]);

        $form['flag_summary'][$flag_id] = [
          '#type' => 'details',
          '#title' => $info['title'],
          '#open' => FALSE,
        ];

        if (empty($flaggings)) {
          $form['flag_summary'][$flag_id]['empty'] = ['#markup' => "<em>No subscribed events.</em>"];
          continue;
        }

        foreach ($flaggings as $flagging) {
          $term = \Drupal\taxonomy\Entity\Term::load($flagging->get('entity_id')->value);

          $form['flag_summary'][$flag_id]["term_{$flagging->id()}"] = [
            '#type' => 'container',
            '#attributes' => ['class' => ['flag-list-item']],
            'label' => [
              '#markup' => "<strong>{$term->getName()}</strong>",
            ],
            'remove' => [
              '#type' => 'submit',
              '#value' => $this->t('Remove'),
              '#submit' => ['::removeFlagSubmit'],
              '#flagging_id' => $flagging->id(),
              '#attributes' => ['class' => ['button', 'button--danger']],
            ],
          ];
        }
      }
    }

    // Username display
    $form['name_display'] = [
      '#type' => 'item',
      '#title' => $this->t('Username'),
      '#markup' => $entity->get('name')->value,
      '#weight' => -20,
    ];

    // Email display
    $form['email_display'] = [
      '#type' => 'item',
      '#title' => $this->t('Email'),
      '#markup' => $entity->get('email')->value,
      '#weight' => -19,
    ];

    return $form;
  }

  public function removeFlagSubmit(array &$form, FormStateInterface $form_state)
  {
    $trigger = $form_state->getTriggeringElement();
    $flagging_id = $trigger['#flagging_id'];

    $flagging = \Drupal::entityTypeManager()->getStorage('flagging')->load($flagging_id);
    if ($flagging) {
      $flagging->delete();
      \Drupal::messenger()->addStatus("Flag removed successfully.");
    }

    $form_state->setRebuild(TRUE);
  }
}
