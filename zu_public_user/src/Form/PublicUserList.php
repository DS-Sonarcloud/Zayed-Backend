<?php

namespace Drupal\zu_public_user\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\Core\Link;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Pager\PagerManagerInterface;
use Drupal\Core\Pager\PagerParametersInterface;
use Drupal\zu_public_user\Entity\PublicUser;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Administrative listing form for Public Users.
 *
 * Displays all registered public users with filters and pagination.
 */
final class PublicUserList extends FormBase {

  protected int $limit = 20;
  protected PagerManagerInterface $pagerManager;
  protected PagerParametersInterface $pagerParameters;
  protected DateFormatterInterface $dateFormatter;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): static {
    $instance = parent::create($container);
    $instance->pagerManager = $container->get('pager.manager');
    $instance->pagerParameters = $container->get('pager.parameters');
    $instance->dateFormatter = $container->get('date.formatter');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'zu_public_user_list_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    // --- Filters ---
    $form['filters'] = [
      '#type' => 'details',
      '#title' => $this->t('Filter users'),
      '#open' => TRUE,
    ];

    $form['filters']['search'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Name or email contains'),
      '#size' => 30,
      '#default_value' => $form_state->getValue('search') ?? '',
    ];

    $form['filters']['status'] = [
      '#type' => 'select',
      '#title' => $this->t('Status'),
      '#options' => [
        '' => $this->t('- Any -'),
        1 => $this->t('Active'),
        0 => $this->t('Blocked'),
      ],
      '#default_value' => $form_state->getValue('status') ?? '',
    ];

    $form['filters']['actions'] = [
      '#type' => 'actions',
      'submit' => [
        '#type' => 'submit',
        '#value' => $this->t('Apply filters'),
      ],
    ];

    // --- Table Header ---
    $header = [
      //'id' => $this->t('ID'),
      'name' => $this->t('Username'),
      'email' => $this->t('Email'),
      'status' => $this->t('Status'),
      'created' => $this->t('Created'),
      'operations' => $this->t('Operations'),
    ];

    // --- Query ---
    $query = \Drupal::entityTypeManager()->getStorage('public_user')->getQuery()
      ->accessCheck(FALSE)
      ->tableSort($header);

    $search = trim($form_state->getValue('search') ?? '');
    $status = $form_state->getValue('status');

    if ($search) {
      $group = $query->orConditionGroup()
        ->condition('name', '%' . $search . '%', 'LIKE')
        ->condition('email', '%' . $search . '%', 'LIKE');
      $query->condition($group);
    }

    if ($status !== '' && $status !== NULL) {
      $query->condition('status', (int) $status);
    }
    $query->sort('created', 'DESC');
    // Pagination setup
    $count_query = clone $query;
    $total = $count_query->count()->execute();
    $current_page = $this->pagerParameters->findPage();
    $this->pagerManager->createPager($total, $this->limit);
    $query->range($current_page * $this->limit, $this->limit);

    $uids = $query->execute();
    $rows = [];

    if ($uids) {
      $users = PublicUser::loadMultiple($uids);

      foreach ($users as $user) {
        $edit_url = Url::fromRoute('entity.public_user.edit_form', ['public_user' => $user->id()]);
        $status_value = (bool) $user->get('status')->value;
        $status_markup = $status_value
          ? '<span class="badge badge-success" style="background-color:#28a745;color:#fff;padding:3px 8px;border-radius:4px;">Active</span>'
          : '<span class="badge badge-danger" style="background-color:#dc3545;color:#fff;padding:3px 8px;border-radius:4px;">Blocked</span>';

        $edit_button = Link::fromTextAndUrl($this->t('Edit'), $edit_url)
          ->toRenderable();
        $edit_button['#attributes'] = [
          'class' => ['button', 'button--primary'],
          'style' => 'background:#dbe0e3;color:#000;padding:3px 10px;border-radius:4px;text-decoration:none;font-weight:bold;',
        ];
        $edit_button_markup = \Drupal::service('renderer')->renderPlain($edit_button);

        $rows[] = [
          //'id' => $user->id(),
          'name' => $user->get('name')->value,
          'email' => $user->get('email')->value,
          'status' => [
            'data' => ['#markup' => $status_markup],
          ],
          'created' => $this->dateFormatter->format($user->get('created')->value, 'short'),
          'operations' => [
            'data' => ['#markup' => $edit_button_markup],
          ],
        ];
      }
    }

    // --- Table ---
    $form['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#rows' => $rows,
      '#empty' => $this->t('No public users found.'),
      '#attributes' => ['class' => ['public-user-table']],
    ];

    // --- Pager ---
    $form['pager'] = ['#type' => 'pager'];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $form_state->setRebuild(TRUE);
  }

}
