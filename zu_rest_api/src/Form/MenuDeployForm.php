<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Menu\MenuTreeParameters;

/**
 * Provides a form for deploying header and footer menus with logos and weights.
 */
class MenuDeployForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'menu_theme_deploy_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['description'] = [
      '#markup' => $this->t('<p>Click the button below to deploy the menus to the frontend.</p>'),
    ];

    $form['deploy'] = [
      '#type' => 'submit',
      '#value' => $this->t('Deploy Menus'),
      '#button_type' => 'primary',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    $deploy_api_service = \Drupal::service('zu_rest_api.deploy_api_service');
    $constant_service = \Drupal::service('zu_rest_api.constant');
    $current_user = \Drupal::currentUser();
    $roles = $current_user->getRoles();

    // Get backend URL from .env and extract hostname
    // $backend_url = $constant_service->getConstant('BACKEND_API_BASE_URL');
    // $domain_name = parse_url($backend_url, PHP_URL_HOST);
        $domain_name = \Drupal::request()->getHost();
    try {
      $records = \Drupal::database()
        ->select('zu_multidomain', 'z')
        ->fields('z', ['folder_name', 'roles'])
        ->execute()
        ->fetchAll();

      foreach ($records as $record) {
        $record_roles = array_map('trim', explode(',', $record->roles));
        if (array_intersect($roles, $record_roles)) {
          $domain_name = trim($record->folder_name);
          break;
        }
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error('Domain mapping lookup failed.');
    }

    /** @var \Drupal\zu_rest_api\Service\DeploymentLogService $log_service */
    $log_service = \Drupal::service('zu_rest_api.deployment_log');

    $all_success = TRUE;
    $total_items = 0;

    $theme_settings = $this->getThemeSettings();
    foreach (['en', 'ar'] as $langcode) {

      $header_menu = $this->getMenuTree('frontend-header', $langcode);
      $footer_menu = $this->getMenuTree('frontend-footer', $langcode);

      $content = [
        'header' => [
          'logo' => $theme_settings['header_logo'],
          'navigation' => $header_menu,
        ],
        'footer' => [
          'logo' => $theme_settings['footer_logo'],
          'navigation' => $footer_menu,
        ],
      ];

      $payload = [
        'pathName' => "{$domain_name}/{$langcode}/",
        'fileName' => 'common-settings',
        'content' => $content,
      ];

      $items_count = count($header_menu) + count($footer_menu);

      try {
        $response = $deploy_api_service->sendDeployRequest($payload);
        if ($response) {
          $total_items += $items_count;
        } else {
          $all_success = FALSE;
        }
      }
      catch (\Exception $e) {
        $all_success = FALSE;
      }
    }

    if ($total_items > 0) {
      if ($all_success) {
        $log_service->logSuccess('menu', 'MenuDeployForm', 'all', $total_items, 'Menu deployment completed successfully.');
        $this->messenger()->addStatus($this->t('Menu deployed successfully.'));
      } else {
        $log_service->logFailure('menu', 'MenuDeployForm', 'all', 'Failed to deploy menus.');
        $this->messenger()->addError($this->t('Menu deployment failed.'));
      }
    }
  }

  /**
   * Fetch logo URLs from theme settings.
   */
  protected function getThemeSettings() {

    $default_theme = \Drupal::config('system.theme')->get('default');
    $theme_config = \Drupal::config($default_theme . '.settings');

    $logo_path = $theme_config->get('logo.path');
    $use_default = $theme_config->get('logo.use_default');

    if (!$use_default && !empty($logo_path)) {
      if (str_starts_with($logo_path, 'public://')) {
        $logo_url = \Drupal::service('file_url_generator')->generateString($logo_path);
      }
      else {
        $logo_url = '/' . ltrim($logo_path, '/');
      }
    }
    else {
      $theme_path = \Drupal::service('theme_handler')->getTheme($default_theme)->getPath();
      $logo_url = '/' . $theme_path . '/logo.svg';
    }

    return [
      'header_logo' => ['src' => $logo_url],
      'footer_logo' => ['src' => $logo_url],
    ];
  }

  /**
   * Build menu tree per language.
   */
  protected function getMenuTree(string $menu_name, string $langcode): array {

    $menu_tree = \Drupal::menuTree();
    $language_manager = \Drupal::languageManager();

    $original_language = $language_manager->getConfigOverrideLanguage();

    $language_manager->setConfigOverrideLanguage(
      $language_manager->getLanguage($langcode)
    );

    $parameters = new MenuTreeParameters();
    $parameters
      ->excludeRoot()
      ->setMinDepth(1)
      ->setMaxDepth(10);

    $tree = $menu_tree->load($menu_name, $parameters);

    $tree = $menu_tree->transform($tree, [
      ['callable' => 'menu.default_tree_manipulators:checkAccess'],
      ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
    ]);

    $items = $this->buildRecursiveTree($tree, $langcode);
    $language_manager->setConfigOverrideLanguage($original_language);

    return $items;
  }

  /**
   * Recursive menu formatter.
   */
  protected function buildRecursiveTree(array $tree, string $langcode): array {

    $items = [];
    $language = \Drupal::languageManager()->getLanguage($langcode);

    foreach ($tree as $element) {

      if (!$element->access) {
        continue;
      }

      $title = $element->link->getTitle();
      if ($element->link->getEntity()) {
        $entity = $element->link->getEntity();
        if ($entity->hasTranslation($langcode)) {
          $title = $entity->getTranslation($langcode)->label();
        }
      }

      $url = $element->link
        ->getUrlObject()
        ->setOption('language', $language)
        ->toString();

      $item = [
        'label' => $title,
        'href' => $this->cleanUrl($url, $langcode),
        'weight' => $element->link->getWeight(),
      ];

      if ($element->hasChildren) {
        $item['children'] = $this->buildRecursiveTree($element->subtree, $langcode);
      }

      $items[] = $item;
    }

    return $items;
  }

  /**
   * Remove language prefix from URLs.
   */
  protected function cleanUrl(string $url, string $langcode): string {
    return preg_replace('#^/' . $langcode . '/#', '/', $url);
  }

}
