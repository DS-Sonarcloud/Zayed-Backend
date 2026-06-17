<?php

namespace Drupal\zu_permission_matrix\Form;

use Drupal\Core\Entity\EntityForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\PermissionHandlerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Form for creating and editing Permission Groups.
 */
class PermissionGroupForm extends EntityForm {

  /**
   * The permission handler.
   *
   * @var \Drupal\user\PermissionHandlerInterface
   */
  protected $permissionHandler;

  /**
   * Constructs a PermissionGroupForm.
   */
  public function __construct(PermissionHandlerInterface $permission_handler) {
    $this->permissionHandler = $permission_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('user.permissions')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);
    /** @var \Drupal\zu_permission_matrix\Entity\PermissionGroup $entity */
    $entity = $this->entity;

    $form['label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Group Name'),
      '#maxlength' => 255,
      '#default_value' => $entity->label(),
      '#description' => $this->t('A descriptive name for this permission group (e.g., "Event Dashboard Access", "Content Editor Permissions").'),
      '#required' => TRUE,
    ];

    $form['id'] = [
      '#type' => 'machine_name',
      '#default_value' => $entity->id(),
      '#machine_name' => [
        'exists' => '\Drupal\zu_permission_matrix\Entity\PermissionGroup::load',
      ],
      '#disabled' => !$entity->isNew(),
    ];

    $form['description'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Description'),
      '#default_value' => $entity->getDescription(),
      '#description' => $this->t('Describe what this permission group is for.'),
      '#rows' => 2,
    ];

    // Build the permissions checkboxes grouped by provider.
    $form['permissions_wrapper'] = [
      '#type' => 'container',
      '#prefix' => '<div id="permissions-wrapper">',
      '#suffix' => '</div>',
    ];

    // Search/filter field.
    $form['permissions_wrapper']['filter'] = [
      '#type' => 'search',
      '#title' => $this->t('Filter Permissions'),
      '#size' => 60,
      '#placeholder' => $this->t('Type to filter permissions...'),
      '#attributes' => [
        'class' => ['permission-filter'],
      ],
    ];

    // Quick stats.
    $selected_permissions = $entity->getPermissions();
    $form['permissions_wrapper']['stats'] = [
      '#markup' => '<div class="permission-stats"><strong>' . count($selected_permissions) . '</strong> permissions currently selected</div>',
    ];

    $all_permissions = $this->permissionHandler->getPermissions();
    $permissions_by_provider = [];
    foreach ($all_permissions as $perm_name => $perm_info) {
      $provider = $perm_info['provider'];
      $permissions_by_provider[$provider][$perm_name] = $perm_info;
    }

    // Sort providers, putting custom modules first.
    $custom_modules = $this->getCustomModuleOrder();
    uksort($permissions_by_provider, function ($a, $b) use ($custom_modules) {
      $a_custom = in_array($a, $custom_modules);
      $b_custom = in_array($b, $custom_modules);
      if ($a_custom && !$b_custom) {
        return -1;
      }
      if (!$a_custom && $b_custom) {
        return 1;
      }
      return strcmp($a, $b);
    });

    $form['permissions_wrapper']['permissions'] = [
      '#type' => 'container',
      '#tree' => TRUE,
    ];

    foreach ($permissions_by_provider as $provider => $perms) {
      $provider_label = $this->getModuleLabel($provider);
      $is_custom = in_array($provider, $custom_modules);

      $form['permissions_wrapper']['permissions'][$provider] = [
        '#type' => 'details',
        '#title' => $provider_label . ' (' . count($perms) . ')',
        '#open' => $is_custom && $this->hasSelectedPermissions($perms, $selected_permissions),
        '#attributes' => [
          'class' => ['permission-provider-group'],
          'data-provider' => $provider,
        ],
      ];

      // Select all / deselect all for this group.
      $form['permissions_wrapper']['permissions'][$provider]['select_all'] = [
        '#markup' => '<div class="provider-actions"><a href="#" class="select-all-provider" data-provider="' . $provider . '">' . $this->t('Select all') . '</a> | <a href="#" class="deselect-all-provider" data-provider="' . $provider . '">' . $this->t('Deselect all') . '</a></div>',
      ];

      foreach ($perms as $perm_name => $perm_info) {
        $form['permissions_wrapper']['permissions'][$provider][$perm_name] = [
          '#type' => 'checkbox',
          '#title' => $perm_info['title'],
          '#description' => isset($perm_info['description']) ? $perm_info['description'] : '',
          '#default_value' => in_array($perm_name, $selected_permissions),
          '#attributes' => [
            'class' => ['permission-checkbox'],
            'data-permission' => $perm_name,
            'data-provider' => $provider,
          ],
          '#wrapper_attributes' => [
            'class' => ['permission-item'],
          ],
        ];

        // Mark restricted permissions.
        if (!empty($perm_info['restrict access'])) {
          $form['permissions_wrapper']['permissions'][$provider][$perm_name]['#title'] .= ' <em class="permission-warning">(' . $this->t('restricted') . ')</em>';
        }
      }
    }

    // Attach library for filter/select-all JS.
    $form['#attached']['library'][] = 'zu_permission_matrix/permission_form';

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    /** @var \Drupal\zu_permission_matrix\Entity\PermissionGroup $entity */
    $entity = $this->entity;

    // Extract selected permissions from the nested form structure.
    $permissions_values = $form_state->getValue('permissions') ?: [];
    $selected = [];
    foreach ($permissions_values as $provider => $perms) {
      if (!is_array($perms)) {
        continue;
      }
      foreach ($perms as $perm_name => $value) {
        if ($perm_name === 'select_all') {
          continue;
        }
        if ($value) {
          $selected[] = $perm_name;
        }
      }
    }

    $entity->setPermissions($selected);
    $status = $entity->save();

    if ($status === SAVED_NEW) {
      $this->messenger()->addStatus($this->t('Permission group %label created with %count permissions.', [
        '%label' => $entity->label(),
        '%count' => count($selected),
      ]));
    }
    else {
      $this->messenger()->addStatus($this->t('Permission group %label updated with %count permissions.', [
        '%label' => $entity->label(),
        '%count' => count($selected),
      ]));
    }

    // Sync permissions to assigned roles.
    $this->syncRolePermissions();

    $form_state->setRedirectUrl($entity->toUrl('collection'));
  }

  /**
   * Sync all permission groups to their assigned roles.
   */
  protected function syncRolePermissions() {
    \Drupal::service('zu_permission_matrix.sync')->syncAll();
  }

  /**
   * Returns custom module names in preferred display order.
   */
  protected function getCustomModuleOrder() {
    return [
      'zu_content_access',
      'zu_permission_matrix',
      'zu_rest_api',
      'zu_user_group',
      'campaign_email_queue',
      'custom_event_form',
      'email_marketing',
      'event_bulk_upload',
      'event_calendar',
      'event_responsive_config',
      'front_translation',
      'grapesjs_editor',
      'jobs_module',
      'seo_toolkit',
      'student_verification',
    ];
  }

  /**
   * Gets a human-readable module label.
   */
  protected function getModuleLabel($provider) {
    $labels = [
      'zu_content_access' => 'ZU Content Access (Department)',
      'zu_rest_api' => 'ZU REST API',
      'zu_user_group' => 'ZU User Groups',
      'zu_permission_matrix' => 'ZU Permission Matrix',
      'campaign_email_queue' => 'Campaign Email Queue',
      'custom_event_form' => 'Custom Event Form',
      'email_marketing' => 'Email Marketing',
      'event_bulk_upload' => 'Event Bulk Upload',
      'event_calendar' => 'Event Calendar & Dashboard',
      'event_responsive_config' => 'Event Responsive Config',
      'front_translation' => 'Front Translation',
      'grapesjs_editor' => 'GrapeJS Editor',
      'jobs_module' => 'Jobs Module',
      'seo_toolkit' => 'SEO Toolkit',
      'student_verification' => 'Student Verification',
      'node' => 'Content (Node)',
      'media' => 'Media',
      'system' => 'System',
      'user' => 'User',
      'webform' => 'Webform',
      'content_moderation' => 'Content Moderation / Workflow',
      'content_translation' => 'Content Translation',
      'field_permissions' => 'Field Permissions',
      'filter' => 'Text Formats',
      'toolbar' => 'Toolbar',
      'quick_node_clone' => 'Quick Node Clone',
      'path' => 'URL Aliases',
      'view_unpublished' => 'View Unpublished',
    ];

    if (isset($labels[$provider])) {
      return $labels[$provider];
    }

    // Fallback: capitalize and replace underscores.
    return ucwords(str_replace('_', ' ', $provider));
  }

  /**
   * Checks if any permissions in a provider are selected.
   */
  protected function hasSelectedPermissions(array $perms, array $selected) {
    foreach (array_keys($perms) as $perm_name) {
      if (in_array($perm_name, $selected)) {
        return TRUE;
      }
    }
    return FALSE;
  }

}
