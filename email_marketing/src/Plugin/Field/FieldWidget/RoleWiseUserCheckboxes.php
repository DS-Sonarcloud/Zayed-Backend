<?php

namespace Drupal\email_marketing\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\Entity\User;

/**
 * Plugin implementation of the 'role_wise_user_checkboxes' widget.
 *
 * @FieldWidget(
 *   id = "role_wise_user_checkboxes",
 *   label = @Translation("Role-wise User Checkboxes"),
 *   field_types = {
 *     "entity_reference"
 *   },
 *   multiple_values = TRUE
 * )
 */
class RoleWiseUserCheckboxes extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $selected_uids = [];
    foreach ($items as $item) {
      if ($item->target_id) {
        $selected_uids[] = $item->target_id;
      }
    }

    $roles = \Drupal::entityTypeManager()
    	->getStorage('user_role')
    	->loadMultiple();
    krsort($roles);
    $element['users'] = [
      '#type' => 'container',
      '#tree' => TRUE,
			'#markup' => '<h3>' . $this->t('User Groups') . '</h3>',
    ];
    $processed_uids = [];
    foreach ($roles as $rid => $role) {
      // Load users for this role.
      $uids = \Drupal::entityQuery('user')
        ->condition('status', 1)
        ->condition('roles', $rid)
				->accessCheck(FALSE)
        ->execute();
      if (empty($uids)) {
        if ($rid == 'authenticated') {
          $uids = \Drupal::entityQuery('user')
            ->condition('status', 1)
            ->condition('uid', 0, '>')
            ->accessCheck(FALSE)
            ->execute();
        }
        else {
          continue;
        }
      }

      $uids = array_diff($uids, $processed_uids);
      if (empty($uids)) {
        continue; // All users already included in previous roles.
      }
      $processed_uids = array_merge($processed_uids, $uids);
      $users = User::loadMultiple($uids);
      $options = [];
      foreach ($users as $user) {
        $options[$user->id()] = $user->getDisplayName();
      }

      $default_values = array_intersect($selected_uids, array_keys($options));
			$all_selected = !empty($options) && empty(array_diff(array_keys($options), $default_values));

      // Add role group with "select all".
      $element['users'][$rid] = [
        '#type' => 'fieldset',
        '#title' => $role->label(),
      ];

      $element['users'][$rid]['select_all'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Select all'),
        '#attributes' => ['class' => ['role-select-all']],
      ];

      $element['users'][$rid]['list'] = [
        '#type' => 'checkboxes',
        '#options' => $options,
        '#default_value' => $default_values,
        '#attributes' => ['class' => ['role-user-list']],
      ];
    }

    // Small JS to toggle select all.
    $element['#attached']['library'][] = 'email_marketing/select_all';

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
		$uids = [];

		if (!empty($values['users'])) {
			foreach ($values['users'] as $rid => $group) {
				if (!empty($group['list'])) {
					foreach (array_filter($group['list']) as $uid) {
						$uids[] = ['target_id' => $uid];
					}
				}
			}
		}

		return $uids;
	}




}
