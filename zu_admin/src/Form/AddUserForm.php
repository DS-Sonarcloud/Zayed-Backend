<?php

namespace Drupal\zu_admin\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Password\PasswordInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\zu_admin\Service\AuditService;
use Drupal\zu_admin\Service\GroupManagerService;

/**
 * Form to add a new user (ZU Admin interface).
 */
class AddUserForm extends FormBase {

  protected PasswordInterface $passwordHasher;
  protected EntityTypeManagerInterface $entityTypeManager;
  protected Connection $database;
  protected AuditService $auditService;
  protected GroupManagerService $groupManager;

  public function __construct(
    PasswordInterface $passwordHasher,
    EntityTypeManagerInterface $entityTypeManager,
    Connection $database,
    AuditService $auditService,
    GroupManagerService $groupManager
  ) {
    $this->passwordHasher    = $passwordHasher;
    $this->entityTypeManager = $entityTypeManager;
    $this->database          = $database;
    $this->auditService      = $auditService;
    $this->groupManager      = $groupManager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('password'),
      $container->get('entity_type.manager'),
      $container->get('database'),
      $container->get('zu_admin.audit_service'),
      $container->get('zu_admin.group_manager')
    );
  }

  public function getFormId(): string {
    return 'zu_admin_add_user_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state): array {

    $form['#attached']['library'][] = 'zu_admin/zu_admin_ui';

    // ── Breadcrumb data ──────────────────────────────────────────────────────
    $form['#breadcrumbs'] = [
      ['label' => 'Home',           'url' => '/zu-admin/dashboard'],
      ['label' => 'Administration', 'url' => '/zu-admin/dashboard'],
      ['label' => 'People',         'url' => '/zu-admin/people'],
      ['label' => 'new_user',       'url' => ''],
    ];

    // ── Tabs ─────────────────────────────────────────────────────────────────
    $form['#tabs'] = [
      ['label' => 'View',          'key' => 'view',      'url' => '#'],
      ['label' => 'Create',        'key' => 'create',    'url' => '#', 'active' => TRUE],
      ['label' => 'Workflows',     'key' => 'workflows', 'url' => '#'],
      ['label' => 'Locked Assets', 'key' => 'locked',    'url' => '#'],
      ['label' => 'Audits',        'key' => 'audits',    'url' => '#'],
      ['label' => 'Delete',        'key' => 'delete',    'url' => '#'],
    ];

    // ── General Settings section ─────────────────────────────────────────────
    $form['general_settings'] = [
      '#type'       => 'fieldset',
      '#title'      => $this->t('General Settings'),
      '#attributes' => ['class' => ['zu-section-card']],
    ];

    $form['general_settings']['username'] = [
      '#type'       => 'textfield',
      '#title'      => $this->t('Username'),
      '#required'   => TRUE,
      '#maxlength'  => 60,
      '#attributes' => ['autocomplete' => 'off'],
    ];

    $form['general_settings']['full_name'] = [
      '#type'      => 'textfield',
      '#title'     => $this->t('Full Name'),
      '#maxlength' => 255,
    ];

    $form['general_settings']['email'] = [
      '#type'      => 'email',
      '#title'     => $this->t('Email'),
      '#maxlength' => 254,
    ];

    $form['general_settings']['authentication'] = [
      '#type'          => 'radios',
      '#title'         => $this->t('Authentication'),
      '#required'      => TRUE,
      '#options'       => [
        'normal' => $this->t('Normal'),
        'custom' => $this->t('Custom'),
      ],
      '#default_value' => 'normal',
    ];

    $form['general_settings']['password'] = [
      '#type'       => 'password',
      '#title'      => $this->t('Password'),
      '#required'   => TRUE,
      '#attributes' => ['autocomplete' => 'new-password'],
    ];

    $form['general_settings']['confirm_password'] = [
      '#type'       => 'password',
      '#title'      => $this->t('Confirm Password'),
      '#required'   => TRUE,
      '#attributes' => ['autocomplete' => 'new-password'],
    ];

    $form['general_settings']['enabled'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Enabled'),
      '#default_value' => TRUE,
    ];

    // ── User & Role Assignment section ───────────────────────────────────────
    $form['role_assignment'] = [
      '#type'       => 'fieldset',
      '#title'      => $this->t('User & Role Assignment'),
      '#attributes' => ['class' => ['zu-section-card']],
    ];

    // Available groups (left pane of dual list).
    $available_groups = $this->groupManager->getAllGroupNames();
    $form['role_assignment']['groups_available'] = [
      '#type'     => 'select',
      '#title'    => $this->t('Groups'),
      '#required' => TRUE,
      '#multiple' => TRUE,
      '#options'  => array_combine($available_groups, $available_groups),
      '#size'     => 6,
      '#attributes' => [
        'class' => ['zu-dual-list-available'],
        'id'    => 'groups-available',
      ],
    ];

    // Right pane — assigned groups.
    $form['role_assignment']['groups_assigned'] = [
      '#type'          => 'select',
      '#multiple'      => TRUE,
      '#options'       => [],
      '#size'          => 6,
      '#attributes'    => [
        'class' => ['zu-dual-list-assigned'],
        'id'    => 'groups-assigned',
      ],
      '#title'         => $this->t('Assigned Groups'),
      '#title_display' => 'invisible',
    ];

    // Hidden storage field (comma-separated assigned values).
    $form['role_assignment']['groups_value'] = [
      '#type'       => 'hidden',
      '#attributes' => ['id' => 'groups-value'],
    ];

    $form['role_assignment']['default_group'] = [
      '#type'    => 'select',
      '#title'   => $this->t('Default Group'),
      '#options' => ['' => $this->t('(No Default Group)')] + array_combine($available_groups, $available_groups),
    ];

    // Roles multi-select listbox.
    $roles = $this->getRoleOptions();
    $form['role_assignment']['roles'] = [
      '#type'        => 'select',
      '#title'       => $this->t('Roles'),
      '#required'    => TRUE,
      '#multiple'    => TRUE,
      '#options'     => $roles,
      '#size'        => 5,
      '#attributes'  => ['class' => ['zu-roles-list']],
      '#description' => $this->t('Note: Site Roles are assigned in the <a href="/admin/people/roles">Site Management area</a>.'),
    ];

    // ── Submit / Cancel ──────────────────────────────────────────────────────
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
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $username = $form_state->getValue('username');
    $password = $form_state->getValue('password');
    $confirm  = $form_state->getValue('confirm_password');

    // Username uniqueness check.
    $existing = $this->entityTypeManager
      ->getStorage('user')
      ->loadByProperties(['name' => $username]);
    if (!empty($existing)) {
      $form_state->setErrorByName('username', $this->t('Username @name is already taken.', ['@name' => $username]));
    }

    // Password match check.
    if ($password !== $confirm) {
      $form_state->setErrorByName('confirm_password', $this->t('Passwords do not match.'));
    }

    // Minimum password length.
    if (strlen($password) < 8) {
      $form_state->setErrorByName('password', $this->t('Password must be at least 8 characters.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $username      = $form_state->getValue('username');
    $email         = $form_state->getValue('email');
    $password      = $form_state->getValue('password');
    $enabled       = (bool) $form_state->getValue('enabled');
    $roles         = $form_state->getValue('roles') ?? [];
    $groups        = $form_state->getValue('groups_value');
    $default_group = $form_state->getValue('default_group');

    /** @var \Drupal\user\UserInterface $user */
    $user = $this->entityTypeManager->getStorage('user')->create([
      'name'   => $username,
      'mail'   => $email ?: $username . '@placeholder.invalid',
      'pass'   => $password,
      'status' => $enabled ? 1 : 0,
    ]);

    // Assign roles (skip 'authenticated' — auto-added by Drupal).
    foreach ((array) $roles as $role) {
      if ($role && $role !== 'authenticated') {
        $user->addRole($role);
      }
    }

    $user->save();

    // Assign groups via GroupManagerService.
    if ($groups) {
      foreach (array_filter(explode(',', $groups)) as $group_name) {
        $gid = $this->groupManager->getGroupIdByName(trim($group_name));
        if ($gid) {
          $this->groupManager->addUserToGroup($user->id(), $gid);
        }
      }
    }

    // Store default group preference.
    if ($default_group) {
      $this->database->merge('zu_admin_user_groups')
        ->keys(['uid' => $user->id(), 'group_name' => $default_group])
        ->execute();
    }

    $this->auditService->log(
      'user_created',
      'User @name created via ZU Admin.',
      ['@name' => $username],
      $user->id()
    );

    $this->messenger()->addStatus($this->t('User %name has been created.', ['%name' => $username]));
    $form_state->setRedirect('zu_admin.people.list');
  }

  /**
   * Cancel button handler.
   */
  public function cancelForm(array &$form, FormStateInterface $form_state): void {
    $form_state->setRedirect('zu_admin.people.list');
  }

  /**
   * Build role options from Drupal roles (excluding anonymous).
   */
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

}
