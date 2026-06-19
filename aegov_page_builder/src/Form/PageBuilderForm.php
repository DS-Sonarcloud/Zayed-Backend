<?php

namespace Drupal\aegov_page_builder\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\aegov_page_builder\Service\ComponentRegistry;
use Drupal\aegov_page_builder\Controller\PageBuilderController;

/**
 * Visual page builder form.
 *
 * The canvas is entirely JS-driven. PHP only provides:
 *  - Page metadata fields (title, slug, lang, description)
 *  - The component palette markup (read by JS for drag/drop)
 *  - drupalSettings with all component definitions + content types
 *  - A hidden canvas_data field that JS keeps up to date
 *  - Save / Save & Export submit buttons
 */
class PageBuilderForm extends FormBase {

  public function getFormId(): string {
    return 'aegov_page_builder_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state, ?string $page_id = NULL): array {
    $page = $page_id ? PageBuilderController::loadPage($page_id) : [];
    $all  = ComponentRegistry::getAll();

    $form['#tree'] = TRUE;
    $form['#attached']['library'][] = 'aegov_page_builder/page_builder_admin';

    // ── Page metadata ──────────────────────────────────────────────────────
    $form['meta'] = [
      '#type'       => 'details',
      '#title'      => $this->t('Page Settings'),
      '#open'       => TRUE,
      '#attributes' => ['class' => ['aegov-meta-section']],
    ];
    $form['meta']['page_id'] = [
      '#type'  => 'hidden',
      '#value' => $page['id'] ?? \Drupal\Component\Utility\Crypt::randomBytesBase64(8),
    ];
    $form['meta']['title'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Page Title'),
      '#default_value' => $page['title'] ?? '',
      '#required'      => TRUE,
      '#placeholder'   => 'e.g. Home Page',
    ];
    $form['meta']['slug'] = [
      '#type'         => 'machine_name',
      '#title'        => $this->t('Page Slug'),
      '#default_value'=> $page['slug'] ?? '',
      '#machine_name' => [
        'exists' => '\Drupal\aegov_page_builder\Form\PageBuilderForm::slugExistsStatic',
        'source' => ['meta', 'title'],
      ],
      '#description'  => $this->t('Folder name for export. e.g. <code>home-page</code>'),
    ];
    $form['meta']['lang'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Language'),
      '#options'       => ['en' => 'English (LTR)', 'ar' => 'Arabic (RTL)'],
      '#default_value' => $page['lang'] ?? 'en',
    ];
    $form['meta']['page_description'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Meta Description'),
      '#default_value' => $page['page_description'] ?? '',
      '#placeholder'   => 'Page meta description for SEO',
    ];

    // ── Builder top toolbar ────────────────────────────────────────────────
    $page_title_label = htmlspecialchars($page['title'] ?? 'New Page');
    $form['builder_toolbar'] = [
      '#markup' => '
<div class="aegov-builder-toolbar">
  <div class="aegov-builder-toolbar__left">
    <span class="aegov-builder-toolbar__icon">&#9783;</span>
    <span class="aegov-builder-toolbar__page-name">' . $page_title_label . '</span>
    <span class="aegov-builder-toolbar__breadcrumb">&#8250;</span>
    <span class="aegov-builder-toolbar__label">Visual Builder</span>
  </div>
  <div class="aegov-builder-toolbar__center">
    <button type="button" class="abt-device-btn abt-device-btn--active" data-device="desktop" title="Desktop view">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
    </button>
    <button type="button" class="abt-device-btn" data-device="tablet" title="Tablet view">
      <svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
    </button>
    <button type="button" class="abt-device-btn" data-device="mobile" title="Mobile view">
      <svg width="10" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>
    </button>
  </div>
  <div class="aegov-builder-toolbar__right">
    <span class="aegov-builder-toolbar__component-count" id="abt-component-count">0 components</span>
    <a href="/admin/aegov-page-builder" class="abt-btn abt-btn--ghost">&#8592; Back</a>
  </div>
</div>',
    ];

    // ── Builder layout ─────────────────────────────────────────────────────
    $form['builder'] = [
      '#type'       => 'container',
      '#attributes' => ['class' => ['aegov-builder-layout']],
    ];

    // ── Left: widget panel with header + search + categories ──────────────
    $total_count = count($all);
    $form['builder']['palette'] = [
      '#type'       => 'container',
      '#attributes' => ['class' => ['aegov-palette']],
    ];
    $form['builder']['palette']['panel_header'] = [
      '#markup' => '
<div class="aegov-palette__header">
  <span class="aegov-palette__header-icon">&#9707;</span>
  <span class="aegov-palette__header-title">Widgets</span>
  <span class="aegov-palette__header-count">' . $total_count . '</span>
</div>
<div class="aegov-palette__search-wrap">
  <span class="aegov-palette__search-icon">&#128269;</span>
  <input type="text" id="aegov-palette-search" class="aegov-palette__search" placeholder="Search widgets…" autocomplete="off">
</div>',
    ];

    $categories = [
      'block'     => ['label' => $this->t('Blocks'),     'icon' => '&#9723;'],
      'component' => ['label' => $this->t('Components'), 'icon' => '&#10070;'],
      'pattern'   => ['label' => $this->t('Patterns'),   'icon' => '&#9670;'],
    ];
    foreach ($categories as $cat_id => $cat_info) {
      $items = array_filter($all, fn($c) => $c['category'] === $cat_id);
      $cat_count = count($items);
      $form['builder']['palette'][$cat_id] = [
        '#type'       => 'details',
        '#title'      => $cat_info['label'],
        '#open'       => $cat_id === 'block',
        '#attributes' => ['class' => ['aegov-palette__group'], 'data-category' => $cat_id],
      ];
      // Category badge injected via JS; add count as data attribute on the details element
      $form['builder']['palette'][$cat_id]['#attributes']['data-count'] = $cat_count;
      foreach ($items as $cid => $comp) {
        $icon_map = [
          'header' => '&#9783;', 'hero' => '&#10022;', 'footer' => '&#9781;',
          'card' => '&#9635;', 'accordion' => '&#9663;', 'breadcrumbs' => '&#9002;',
          'slider' => '&#9654;', 'banner' => '&#9644;', 'team' => '&#9786;',
          'news_card_slider' => '&#9654;', 'columns' => '&#10010;',
          'contact_number' => '&#9742;', 'address' => '&#9873;',
          'currency_symbol' => '&#9654;', 'date' => '&#9783;',
          'emirates_id' => '&#9646;', 'name' => '&#9654;',
          'newsletter' => '&#9993;', 'content' => '&#9999;',
          'stats' => '&#9650;', 'cta' => '&#9654;',
        ];
        $icon = $icon_map[$cid] ?? '&#9635;';
        $form['builder']['palette'][$cat_id][$cid] = [
          '#type'       => 'container',
          '#attributes' => [
            'class'                   => ['aegov-palette__item'],
            'data-component-id'       => $cid,
            'data-component-category' => $cat_id,
            'data-component-label'    => strtolower($comp['label']),
            'draggable'               => 'true',
            'title'                   => 'Double-click or drag to add',
          ],
          'inner' => [
            '#markup' => '<span class="aegov-palette__icon">' . $icon . '</span>'
              . '<div class="aegov-palette__info">'
              . '<span class="aegov-palette__label">' . $comp['label'] . '</span>'
              . '<small class="aegov-palette__desc">' . $comp['description'] . '</small>'
              . '</div>'
              . '<span class="aegov-palette__add-btn" title="Add to canvas">+</span>',
          ],
        ];
      }
    }

    // ── Right: canvas with toolbar ────────────────────────────────────────
    $form['builder']['canvas'] = [
      '#type'       => 'container',
      '#attributes' => ['class' => ['aegov-canvas'], 'id' => 'aegov-canvas'],
    ];
    $form['builder']['canvas']['canvas_toolbar'] = [
      '#markup' => '
<div class="aegov-canvas__toolbar">
  <div class="aegov-canvas__toolbar-left">
    <span class="aegov-canvas__toolbar-title">&#9783; PAGE CANVAS</span>
    <span class="aegov-canvas__toolbar-hint">Drag from the left panel or double-click a widget</span>
  </div>
  <div class="aegov-canvas__toolbar-right">
    <button type="button" id="aegov-canvas-clear" class="act-btn act-btn--danger" title="Clear all components">
      &#128465; Clear All
    </button>
  </div>
</div>',
    ];
    // Drop zone + cards container — JS renders cards here
    $form['builder']['canvas']['regions'] = [
      '#type'       => 'container',
      '#attributes' => ['id' => 'aegov-canvas-regions', 'class' => ['aegov-canvas__regions']],
      'hint'        => ['#markup' => '<div class="aegov-canvas__drop-hint"><span>&#8595; Drop a component here or double-click in the palette</span></div>'],
    ];

    // Hidden field — JS keeps this in sync; PHP reads it on Save
    $form['builder']['canvas']['canvas_data'] = [
      '#type'          => 'hidden',
      '#default_value' => json_encode($page['regions'] ?? []),
      '#attributes'    => ['id' => 'aegov-canvas-data'],
    ];

    // ── Actions ────────────────────────────────────────────────────────────
    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['save'] = [
      '#type'       => 'submit',
      '#value'      => $this->t('Save Page'),
      '#attributes' => ['class' => ['button--primary']],
    ];
    $form['actions']['save_export'] = [
      '#type'       => 'submit',
      '#value'      => $this->t('Save & Export'),
      '#submit'     => ['::submitSaveExport'],
      '#attributes' => ['class' => ['button--secondary']],
    ];
    $form['actions']['cancel'] = [
      '#type'       => 'link',
      '#title'      => $this->t('Cancel'),
      '#url'        => \Drupal\Core\Url::fromRoute('aegov_page_builder.admin'),
      '#attributes' => ['class' => ['button']],
    ];

    // ── drupalSettings — gives JS everything it needs without extra fetches ─
    $content_types = $this->getContentTypeOptions();
    // Build component definitions for JS (fields + defaults)
    $js_components = [];
    foreach ($all as $cid => $comp) {
      $js_components[$cid] = [
        'id'          => $cid,
        'label'       => $comp['label'],
        'category'    => $comp['category'],
        'description' => $comp['description'],
        'fields'      => $comp['fields'],
      ];
    }

    $request     = \Drupal::request();
    $base_url    = $request->getSchemeAndHttpHost();
    $module_path = '/' . \Drupal::service('extension.list.module')->getPath('aegov_page_builder');

    $form['#attached']['drupalSettings']['aegovPageBuilder'] = [
      'components'         => $js_components,
      'contentTypes'       => $content_types,
      'existingRegions'    => $page['regions'] ?? [],
      'lang'               => $page['lang'] ?? 'en',
      'previewUrl'         => \Drupal\Core\Url::fromRoute('aegov_page_builder.preview_component')->toString(),
      'ctFieldsUrl'        => \Drupal\Core\Url::fromRoute('aegov_page_builder.content_type_fields')->toString(),
      'nodesUrl'           => \Drupal\Core\Url::fromRoute('aegov_page_builder.nodes')->toString(),
      'nodeFieldsUrl'      => \Drupal\Core\Url::fromRoute('aegov_page_builder.node_fields')->toString(),
      'csrfToken'          => \Drupal::csrfToken()->get('aegov-page-builder'),
      'cssUrl'             => $base_url . $module_path . '/css/aegov.min.css',
      'jsUrl'              => $base_url . $module_path . '/js/aegov.bundle.js',
      'fontUrl'            => 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
    ];

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $page = $this->buildPageData($form_state);
    PageBuilderController::savePage($page);
    $this->messenger()->addStatus($this->t('Page "@title" saved.', ['@title' => $page['title']]));
    $form_state->setRedirect('aegov_page_builder.admin');
  }

  public function submitSaveExport(array &$form, FormStateInterface $form_state): void {
    $page = $this->buildPageData($form_state);
    PageBuilderController::savePage($page);
    $form_state->setRedirect('aegov_page_builder.export', ['page_id' => $page['id']]);
  }

  protected function buildPageData(FormStateInterface $form_state): array {
    $meta        = $form_state->getValue('meta');
    $canvas_json = $form_state->getValue(['builder', 'canvas', 'canvas_data']) ?? '[]';
    $regions_raw = json_decode($canvas_json, TRUE) ?: [];

    $all     = ComponentRegistry::getAll();
    $regions = [];
    foreach ($regions_raw as $r) {
      $comp_id  = $r['component_id'] ?? '';
      $comp_def = $all[$comp_id] ?? NULL;
      $regions[] = [
        'component_id'    => $comp_id,
        'label'           => $comp_def['label'] ?? 'Region',
        'category'        => $comp_def['category'] ?? 'component',
        'data'            => $r['data'] ?? [],
        'data_source'     => $r['data_source'] ?? 'static',
        'content_type'    => $r['content_type'] ?? '',
        'view_mode'       => $r['view_mode'] ?? 'teaser',
        'max_items'       => $r['max_items'] ?? 6,
        'field_map'       => $r['field_map'] ?? [],
        'preview_node_id' => $r['preview_node_id'] ?? '',
      ];
    }

    return [
      'id'               => $meta['page_id'],
      'title'            => $meta['title'],
      'slug'             => $meta['slug'],
      'lang'             => $meta['lang'] ?? 'en',
      'page_description' => $meta['page_description'] ?? '',
      'regions'          => $regions,
    ];
  }

  public function slugExists(string $value, array $element, FormStateInterface $form_state): bool {
    return static::slugExistsStatic($value, $element, $form_state);
  }

  public static function slugExistsStatic(string $value, array $element, FormStateInterface $form_state): bool {
    $pages      = PageBuilderController::loadAllPages();
    $current_id = $form_state->getValue(['meta', 'page_id']);
    foreach ($pages as $page) {
      if ($page['slug'] === $value && $page['id'] !== $current_id) {
        return TRUE;
      }
    }
    return FALSE;
  }

  protected function getContentTypeOptions(): array {
    $types   = \Drupal::entityTypeManager()->getStorage('node_type')->loadMultiple();
    $options = [];
    foreach ($types as $type) {
      $options[$type->id()] = $type->label();
    }
    return $options;
  }

}
