<?php

namespace Drupal\zu_admin\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\zu_admin\Service\AuditService;
use Drupal\zu_admin\Service\GroupManagerService;

/**
 * Form to edit a ZU Admin group.
 */
class EditGroupForm extends FormBase {

  protected EntityTypeManagerInterface $entityTypeManager;
  protected Connection $database;
  protected AuditService $auditService;
  protected GroupManagerService $groupManager;

  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    Connection $database,
    AuditService $auditService,
    GroupManagerService $groupManager
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->database          = $database;
    $this->auditService      = $auditService;
    $this->groupManager      = $groupManager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('database'),
      $container->get('zu_admin.audit_service'),
      $container->get('zu_admin.group_manager')
    );
  }

  public function getFormId(): string {
    return 'zu_admin_edit_group_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, string $group_name = ''): array {

    $form['#attached']['library'][] = 'zu_admin/zu_admin_ui';

    // Load existing group data.
    $group = $this->groupManager->loadGroupByName($group_name);
    if (!$group) {
      $this->messenger()->addError($this->t('Group @name not found.', ['@name' => $group_name]));
      return $form;
    }

    $form['#group_name'] = $group_name;

    $form['#tabs'] = [
      ['label' => 'View',          'key' => 'view',      'url' => '/zu-admin/people/' . $group_name . '/view'],
      ['label' => 'Edit',          'key' => 'edit',      'url' => '/zu-admin/people/' . $group_name . '/edit', 'active' => TRUE],
      ['label' => 'Workflows',     'key' => 'workflows', 'url' => '/zu-admin/people/' . $group_name . '/workflows'],
      ['label' => 'Locked Assets', 'key' => 'locked',    'url' => '#'],
      ['label' => 'Audits',        'key' => 'audits',    'url' => '#'],
      ['label' => 'Delete',        'key' => 'delete',    'url' => '#'],
    ];

    $wysiwyg_options = !empty($group['wysiwyg_options'])
      ? unserialize($group['wysiwyg_options'], ['allowed_classes' => FALSE])
      : [];

    // ── General Settings ─────────────────────────────────────────────────────
    $form['general_settings'] = [
      '#type'       => 'fieldset',
      '#title'      => $this->t('General Settings'),
      '#attributes' => ['class' => ['zu-section-card']],
    ];

    $form['general_settings']['group_name_display'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Group Name'),
      '#required'      => TRUE,
      '#default_value' => $group['group_name'],
      '#maxlength'     => 255,
    ];

    $form['general_settings']['starting_page'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Starting Page'),
      '#default_value' => $group['starting_page'] ?? '',
      '#attributes'    => ['placeholder' => $this->t('[ Search ]')],
      '#field_prefix'  => '<span class="zu-field-icon zu-icon-page"></span>',
    ];

    $form['general_settings']['base_folder'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Base Folder'),
      '#default_value' => $group['base_folder'] ?? '',
      '#attributes'    => ['placeholder' => $this->t('[ Search ]')],
      '#field_prefix'  => '<span class="zu-field-icon zu-icon-folder"></span>',
    ];

    $form['general_settings']['asset_factory_container'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Asset Factory Container'),
      '#default_value' => $group['asset_factory_container'] ?? '',
      '#attributes'    => ['placeholder' => $this->t('[ Search ]')],
      '#field_prefix'  => '<span class="zu-field-icon zu-icon-folder"></span>',
    ];

    $form['general_settings']['css_classes'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('CSS Classes'),
      '#default_value' => $group['css_classes'] ?? '',
      '#maxlength'     => 255,
    ];

    // WYSIWYG toolbar checkboxes.
    $form['general_settings']['wysiwyg_options'] = [
      '#type'          => 'checkboxes',
      '#title'         => $this->t('WYSIWYG Toolbar Options'),
      '#options'       => [
        'font_assignment'    => $this->t('Font Assignment'),
        'content_formatting' => $this->t('Content Formatting'),
        'text_formatting'    => $this->t('Text Formatting'),
        'view_html_source'   => $this->t('View HTML Source'),
        'image_insertion'    => $this->t('Image Insertion'),
        'table_insertion'    => $this->t('Table Insertion'),
      ],
      '#default_value' => $wysiwyg_options ?: [
        'content_formatting',
        'text_formatting',
        'view_html_source',
        'image_insertion',
        'table_insertion',
      ],
      '#attributes'    => ['class' => ['zu-wysiwyg-checkboxes']],
    ];

    // Hidden field for group id.
    $form['gid'] = [
      '#type'  => 'hidden',
      '#value' => $group['gid'],
    ];

    // ── User & Role Assignment ────────────────────────────────────────────────
    $form['role_assignment'] = [
      '#type'       => 'fieldset',
      '#title'      => $this->t('User & Role Assignment'),
      '#attributes' => ['class' => ['zu-section-card']],
    ];

    // Build available vs assigned user lists.
    $all_users       = $this->getSystemUsers();
    $assigned_users  = $this->groupManager->getGroupUsers($group['gid']);
    $assigned_unames = array_column($assigned_users, 'name');
    $available_users = array_values(array_diff($all_users, $assigned_unames));

    $form['role_assignment']['users_available'] = [
      '#type'     => 'select',
      '#title'    => $this->t('Users'),
      '#multiple' => TRUE,
      '#options'  => array_combine($available_users, $available_users),
      '#size'     => 7,
      '#attributes' => [
        'class' => ['zu-dual-list-available'],
        'id'    => 'users-available',
      ],
    ];

    $form['role_assignment']['users_assigned'] = [
      '#type'          => 'select',
      '#multiple'      => TRUE,
      '#options'       => array_combine($assigned_unames, $assigned_unames),
      '#size'          => 7,
      '#title'         => $this->t('Assigned Users'),
      '#title_display' => 'invisible',
      '#attributes'    => [
        'class' => ['zu-dual-list-assigned'],
        'id'    => 'users-assigned',
      ],
    ];

    $form['role_assignment']['users_value'] = [
      '#type'       => 'hidden',
      '#attributes' => ['id' => 'users-value'],
    ];

    // Roles.
    $roles          = $this->getRoleOptions();
    $assigned_roles = $this->groupManager->getGroupRoles($group['gid']);
    $form['role_assignment']['roles'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Roles'),
      '#required'      => TRUE,
      '#multiple'      => TRUE,
      '#options'       => $roles,
      '#default_value' => $assigned_roles,
      '#size'          => 5,
      '#attributes'    => ['class' => ['zu-roles-list']],
      '#description'   => $this->t('Note: Site Roles are assigned in the <a href="/admin/people/roles">Site Management area</a>.'),
    ];

    // ── Actions ──────────────────────────────────────────────────────────────
    $form['actions'] = [
      '#type'       => 'actions',
      '#attributes' => ['class' => ['zu-form-actions']],
    ];
    $form['actions']['submit'] = [
      '#type'        => 'submit',
      '#value'       => $this->t('Submit'),
      '#button_type' => 'primary',
      '#attributes'  => ['class' => ['zu-btn-submit']],
    ];
    $form['actions']['cancel'] = [
      '#type'                    => 'button',
      '#value'                   => $this->t('Cancel'),
      '#attributes'              => ['class' => ['zu-btn-cancel']],
      '#limit_validation_errors' => [],
      '#submit'                  => ['::cancelForm'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $gid         = $form_state->getValue('gid');
    $group_name  = $form_state->getValue('group_name_display');
    $users_value = $form_state->getValue('users_value');
    $roles       = (array) ($form_state->getValue('roles') ?? []);
    $wysiwyg     = array_keys(array_filter($form_state->getValue('wysiwyg_options') ?? []));

    $this->database->update('zu_admin_groups')
      ->fields([
        'group_name'              => $group_name,
        'starting_page'           => $form_state->getValue('starting_page') ?? '',
        'base_folder'             => $form_state->getValue('base_folder') ?? '',
        'asset_factory_container' => $form_state->getValue('asset_factory_container') ?? '',
        'css_classes'             => $form_state->getValue('css_classes') ?? '',
        'wysiwyg_options'         => serialize($wysiwyg),
        'changed'                 => \Drupal::time()->getRequestTime(),
      ])
      ->condition('gid', $gid)
      ->execute();

    // Sync users: clear then re-insert.
    $this->database->delete('zu_admin_group_users')->condition('gid', $gid)->execute();
    if ($users_value) {
      foreach (array_filter(explode(',', $users_value)) as $uname) {
        $users = $this->entityTypeManager->getStorage('user')->loadByProperties(['name' => trim($uname)]);
        if ($user = reset($users)) {
          $this->database->insert('zu_admin_group_users')
            ->fields(['gid' => $gid, 'uid' => $user->id()])
            ->execute();
        }
      }
    }

    // Sync roles: clear then re-insert.
    $this->database->delete('zu_admin_group_roles')->condition('gid', $gid)->execute();
    foreach ($roles as $role) {
      if ($role) {
        $this->database->insert('zu_admin_group_roles')
          ->fields(['gid' => $gid, 'role' => $role])
          ->execute();
      }
    }

    $this->auditService->log(
      'group_updated',
      'Group @name was updated.',
      ['@name' => $group_name],
      \Drupal::currentUser()->id()
    );

    $this->messenger()->addStatus($this->t('Group %name has been updated.', ['%name' => $group_name]));
    $form_state->setRedirect('zu_admin.people.list');
  }

  public function cancelForm(array &$form, FormStateInterface $form_state): void {
    $form_state->setRedirect('zu_admin.people.list');
  }

  protected function getRoleOptions(): array {
    $roles   = $this->entityTypeManager->getStorage('user_role')->loadMultiple();
    $options = [];
    foreach ($roles as $role) {
      if ($role->id() !== 'anonymous') {
        $options[$role->id()] = $role->label();
      }
    }
    return $options;
  }

  protected function getSystemUsers(): array {
    return $this->database->select('users_field_data', 'u')
      ->fields('u', ['name'])
      ->condition('uid', 0, '>')
      ->execute()
      ->fetchCol();
  }

}
