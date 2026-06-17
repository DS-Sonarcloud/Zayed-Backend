<?php

namespace Drupal\zu_permission_matrix\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\Entity\Role;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Matrix form for assigning permission groups to roles.
 */
class RoleAssignmentForm extends ConfigFormBase {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a RoleAssignmentForm.
   */
  public function __construct($config_factory, $typed_config_manager, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($config_factory, $typed_config_manager);
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('config.typed'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['zu_permission_matrix.role_assignments'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'zu_permission_matrix_role_assignment';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Load all permission groups.
    $groups = $this->entityTypeManager->getStorage('permission_group')->loadMultiple();
    // Load all roles except anonymous.
    $roles = Role::loadMultiple();
    unset($roles['anonymous']);

    if (empty($groups)) {
      $form['empty'] = [
        '#markup' => '<p>' . $this->t('No permission groups have been created yet. <a href=":url">Create a permission group</a> first.', [
          ':url' => '/admin/config/people/permission-groups/add',
        ]) . '</p>',
      ];
      return $form;
    }

    $config = $this->config('zu_permission_matrix.role_assignments');
    $assignments = $config->get('assignments') ?: [];

    $form['description'] = [
      '#markup' => '<p>' . $this->t('Assign permission groups to roles. When you save, the selected permissions will be synced to each role.') . '</p>',
    ];

    // Build the matrix table.
    $form['matrix'] = [
      '#type' => 'table',
      '#header' => $this->buildHeader($roles),
      '#attributes' => [
        'class' => ['permission-matrix-table'],
      ],
    ];

    foreach ($groups as $group_id => $group) {
      $form['matrix'][$group_id]['group_info'] = [
        '#markup' => '<strong>' . $group->label() . '</strong><br><small>' . $group->getDescription() . '</small><br><em>' . count($group->getPermissions()) . ' permissions</em>',
      ];

      foreach ($roles as $role_id => $role) {
        if ($role->isAdmin()) {
          // Admin role has all permissions; show as disabled checked.
          $form['matrix'][$group_id][$role_id] = [
            '#type' => 'checkbox',
            '#default_value' => TRUE,
            '#disabled' => TRUE,
            '#title' => $this->t('Assign @group to @role', [
              '@group' => $group->label(),
              '@role' => $role->label(),
            ]),
            '#title_display' => 'invisible',
          ];
        }
        else {
          $role_assignments = $assignments[$role_id] ?? [];
          $form['matrix'][$group_id][$role_id] = [
            '#type' => 'checkbox',
            '#default_value' => in_array($group_id, $role_assignments),
            '#title' => $this->t('Assign @group to @role', [
              '@group' => $group->label(),
              '@role' => $role->label(),
            ]),
            '#title_display' => 'invisible',
          ];
        }
      }
    }

    // Show current permission details per group (collapsible).
    $form['group_details'] = [
      '#type' => 'details',
      '#title' => $this->t('Permission Group Details'),
      '#open' => FALSE,
    ];

    foreach ($groups as $group_id => $group) {
      $perms = $group->getPermissions();
      if (!empty($perms)) {
        $items = [];
        foreach ($perms as $perm) {
          $items[] = $perm;
        }
        $form['group_details'][$group_id] = [
          '#type' => 'details',
          '#title' => $group->label() . ' (' . count($perms) . ' permissions)',
          '#open' => FALSE,
        ];
        $form['group_details'][$group_id]['list'] = [
          '#theme' => 'item_list',
          '#items' => $items,
        ];
      }
    }

    $form['#attached']['library'][] = 'zu_permission_matrix/role_matrix';

    return parent::buildForm($form, $form_state);
  }

  /**
   * Builds the table header with role names.
   */
  protected function buildHeader(array $roles) {
    $header = [
      'group_info' => $this->t('Permission Group'),
    ];
    foreach ($roles as $role_id => $role) {
      $header[$role_id] = [
        'data' => $role->label(),
        'class' => ['role-header'],
      ];
    }
    return $header;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $matrix = $form_state->getValue('matrix') ?: [];
    $roles = Role::loadMultiple();
    unset($roles['anonymous']);

    $assignments = [];

    foreach ($matrix as $group_id => $role_values) {
      // Skip the group_info column.
      unset($role_values['group_info']);
      foreach ($role_values as $role_id => $checked) {
        if (isset($roles[$role_id]) && $roles[$role_id]->isAdmin()) {
          continue;
        }
        if ($checked) {
          $assignments[$role_id][] = $group_id;
        }
      }
    }

    $this->config('zu_permission_matrix.role_assignments')
      ->set('assignments', $assignments)
      ->save();

    // Sync permissions to roles.
    \Drupal::service('zu_permission_matrix.sync')->syncAll();

    $this->messenger()->addStatus($this->t('Permission group assignments have been saved and synced to roles.'));

    parent::submitForm($form, $form_state);
  }

}
