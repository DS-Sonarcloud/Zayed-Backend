<?php

namespace Drupal\aegov_page_builder\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\aegov_page_builder\Service\ComponentRegistry;
use Drupal\aegov_page_builder\Service\PageExporter;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Page builder admin controller.
 */
class PageBuilderController extends ControllerBase {

  protected PageExporter $exporter;

  public function __construct(PageExporter $exporter) {
    $this->exporter = $exporter;
  }

  public static function create(ContainerInterface $container): static {
    return new static($container->get('aegov_page_builder.page_exporter'));
  }

  /**
   * Admin listing page.
   */
  public function index(): array {
    $pages = $this->loadAllPages();
    $rows = [];
    foreach ($pages as $page) {
      $rows[] = [
        'data' => [
          $page['title'],
          $page['slug'],
          count($page['regions'] ?? []) . ' region(s)',
          $page['updated'] ?? '—',
          [
            'data' => [
              '#type' => 'operations',
              '#links' => [
                'edit' => ['title' => $this->t('Edit'), 'url' => \Drupal\Core\Url::fromRoute('aegov_page_builder.edit', ['page_id' => $page['id']])],
                'preview' => ['title' => $this->t('Preview'), 'url' => \Drupal\Core\Url::fromRoute('aegov_page_builder.preview', ['page_id' => $page['id']])],
                'export' => ['title' => $this->t('Export'), 'url' => \Drupal\Core\Url::fromRoute('aegov_page_builder.export', ['page_id' => $page['id']])],
                'delete' => ['title' => $this->t('Delete'), 'url' => \Drupal\Core\Url::fromRoute('aegov_page_builder.delete', ['page_id' => $page['id']])],
              ],
            ],
          ],
        ],
      ];
    }

    return [
      '#type' => 'container',
      '#attributes' => ['class' => ['aegov-page-builder-admin']],
      'create_link' => [
        '#type' => 'link',
        '#title' => $this->t('+ Create New Page'),
        '#url' => \Drupal\Core\Url::fromRoute('aegov_page_builder.create'),
        '#attributes' => ['class' => ['button', 'button--primary', 'aegov-create-btn']],
      ],
      'table' => [
        '#type' => 'table',
        '#header' => [$this->t('Title'), $this->t('Slug'), $this->t('Components'), $this->t('Last Updated'), $this->t('Actions')],
        '#rows' => $rows,
        '#empty' => $this->t('No pages yet. <a href=":url">Create your first page</a>.', [':url' => \Drupal\Core\Url::fromRoute('aegov_page_builder.create')->toString()]),
        '#attributes' => ['class' => ['aegov-pages-table']],
      ],
      '#attached' => ['library' => ['aegov_page_builder/page_builder_admin']],
    ];
  }

  /**
   * Export a page and redirect to admin.
   */
  public function export(string $page_id) {
    $page = $this->loadPage($page_id);
    if (!$page) {
      $this->messenger()->addError($this->t('Page not found.'));
      return $this->redirect('aegov_page_builder.admin');
    }
    $result = $this->exporter->export($page);
    if ($result['success']) {
      $this->messenger()->addStatus($this->t('Page exported to <code>@path</code>', ['@path' => $result['path']]));
    }
    else {
      $this->messenger()->addError($this->t('Export failed: @error', ['@error' => $result['error']]));
    }
    return $this->redirect('aegov_page_builder.admin');
  }

  /**
   * Preview a page inline — renders full HTML with absolute asset URLs.
   */
  public function preview(string $page_id): array {
    $page = $this->loadPage($page_id);
    if (!$page) {
      return ['#markup' => $this->t('Page not found.')];
    }

    // Build absolute URLs for assets so the iframe srcdoc can load them.
    $base   = \Drupal::request()->getSchemeAndHttpHost();
    $module_path = '/' . \Drupal::service('extension.list.module')->getPath('aegov_page_builder');
    $css_url = $base . $module_path . '/css/aegov.min.css';
    $js_url  = $base . $module_path . '/js/aegov.bundle.js';

    $html = $this->exporter->renderHtmlAbsolute($page, $css_url, $js_url);

    return [
      '#type' => 'inline_template',
      '#template' => '<div class="aegov-preview-wrapper"><div class="aegov-preview-toolbar"><span>Preview: {{ title }}</span><a href="{{ edit_url }}" class="button">Edit</a></div><iframe srcdoc="{{ html|e }}" class="aegov-preview-frame"></iframe></div>',
      '#context' => [
        'title' => $page['title'],
        'html'  => $html,
        'edit_url' => \Drupal\Core\Url::fromRoute('aegov_page_builder.edit', ['page_id' => $page_id])->toString(),
      ],
      '#attached' => ['library' => ['aegov_page_builder/page_builder_admin']],
    ];
  }

  public static function loadAllPages(): array {
    $state = \Drupal::state()->get('aegov_page_builder.pages', []);
    return array_values($state);
  }

  public static function loadPage(string $page_id): ?array {
    $pages = \Drupal::state()->get('aegov_page_builder.pages', []);
    return $pages[$page_id] ?? NULL;
  }

  public static function savePage(array $page): void {
    $pages = \Drupal::state()->get('aegov_page_builder.pages', []);
    $page['updated'] = date('Y-m-d H:i');
    $pages[$page['id']] = $page;
    \Drupal::state()->set('aegov_page_builder.pages', $pages);
  }

  public static function deletePage(string $page_id): void {
    $pages = \Drupal::state()->get('aegov_page_builder.pages', []);
    unset($pages[$page_id]);
    \Drupal::state()->set('aegov_page_builder.pages', $pages);
  }

  /**
   * AJAX: render a single component and return its HTML snippet.
   * POST body JSON: { component_id, data, lang }
   */
  public function previewComponent(Request $request): JsonResponse {
    $body = json_decode($request->getContent(), TRUE);
    if (!$body) {
      return new JsonResponse(['error' => 'Invalid JSON'], 400);
    }
    $comp_id = $body['component_id'] ?? '';
    $data    = $body['data'] ?? [];
    $lang    = $body['lang'] ?? 'en';

    $all = ComponentRegistry::getAll();
    $comp_def = $all[$comp_id] ?? NULL;
    if (!$comp_def) {
      return new JsonResponse(['error' => 'Unknown component: ' . $comp_id], 404);
    }

    // Merge defaults so missing fields don't cause errors in renderers.
    $defaults = [];
    foreach ($comp_def['fields'] as $fk => $fdef) {
      $defaults[$fk] = $fdef['default'] ?? '';
    }
    $data = array_merge($defaults, $data);

    $html = $this->exporter->renderComponentHtml($comp_id, $comp_def, $data, $lang);
    return new JsonResponse(['html' => $html, 'component_id' => $comp_id]);
  }

  /**
   * AJAX: return field list for a content type.
   * GET ?content_type=article
   */
  public function getContentTypeFields(Request $request): JsonResponse {
    $ct = $request->query->get('content_type', '');
    if (!$ct) {
      return new JsonResponse(['fields' => []]);
    }

    $fields = [];
    try {
      /** @var \Drupal\Core\Entity\EntityFieldManagerInterface $efm */
      $efm = \Drupal::service('entity_field.manager');
      $field_defs = $efm->getFieldDefinitions('node', $ct);
      foreach ($field_defs as $name => $def) {
        // Skip internal Drupal fields.
        if (in_array($name, ['nid','vid','uuid','langcode','revision_uid','revision_timestamp','revision_log','revision_default','changed','promote','sticky','status','default_langcode','content_translation_source','content_translation_outdated'])) {
          continue;
        }
        $fields[] = [
          'name'  => $name,
          'label' => (string) $def->getLabel(),
          'type'  => $def->getType(),
        ];
      }
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => $e->getMessage()], 500);
    }

    return new JsonResponse(['fields' => $fields]);
  }

  /**
   * AJAX: return all field values for a specific node (for dynamic preview).
   * GET ?nid=123
   */
  public function getNodeFields(Request $request): JsonResponse {
    $nid = (int) $request->query->get('nid', 0);
    if (!$nid) {
      return new JsonResponse(['error' => 'Missing nid'], 400);
    }

    $node = \Drupal\node\Entity\Node::load($nid);
    if (!$node) {
      return new JsonResponse(['error' => 'Node not found'], 404);
    }

    $fields = [];
    foreach ($node->getFields() as $name => $field) {
      try {
        $value = $field->getValue();
        if (empty($value)) {
          $fields[$name] = '';
          continue;
        }
        $first   = $value[0] ?? [];
        $ftype   = $field->getFieldDefinition()->getType();

        if (in_array($ftype, ['image', 'file'])) {
          // Image/file fields: load the file entity to get the URI.
          $fid = $first['target_id'] ?? NULL;
          if ($fid) {
            $file = \Drupal\file\Entity\File::load($fid);
            if ($file) {
              $fields[$name] = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
              $fields[$name . '__alt'] = $first['alt'] ?? '';
            }
            else {
              $fields[$name] = '';
            }
          }
          else {
            $fields[$name] = '';
          }
        }
        elseif (isset($first['uri'])) {
          // Computed URI fields (e.g. path alias).
          $fields[$name] = \Drupal::service('file_url_generator')->generateAbsoluteString($first['uri']);
          $fields[$name . '__alt'] = $first['alt'] ?? '';
        }
        elseif (isset($first['target_id'])) {
          // Other entity references — return label.
          if ($name === 'uid') {
            $fields[$name] = $node->getOwner()->label();
          }
          else {
            $target_type = $field->getFieldDefinition()->getSetting('target_type') ?: 'node';
            $ref = \Drupal::entityTypeManager()->getStorage($target_type)->load($first['target_id']);
            $fields[$name] = $ref ? $ref->label() : (string) $first['target_id'];
          }
        }
        elseif (isset($first['value']) && isset($first['format'])) {
          // Formatted text — use processed (rendered) HTML.
          $fields[$name] = $first['processed'] ?? $first['value'];
        }
        elseif (isset($first['value'])) {
          $fields[$name] = $first['value'];
        }
        elseif (isset($first['alias'])) {
          $fields[$name] = $first['alias'];
        }
        else {
          $fields[$name] = json_encode($first);
        }
      }
      catch (\Exception $e) {
        $fields[$name] = '';
      }
    }

    return new JsonResponse(['fields' => $fields, 'title' => $node->label()]);
  }

  /**
   * AJAX: return list of nodes for a content type.
   * GET ?content_type=article&limit=30
   */
  public function getNodes(Request $request): JsonResponse {
    $ct    = $request->query->get('content_type', '');
    $limit = min((int) $request->query->get('limit', 30), 100);
    if (!$ct) {
      return new JsonResponse(['nodes' => []]);
    }

    try {
      $nids = \Drupal::entityQuery('node')
        ->condition('type', $ct)
        ->condition('status', 1)
        ->sort('changed', 'DESC')
        ->range(0, $limit)
        ->accessCheck(TRUE)
        ->execute();

      $nodes = [];
      foreach (\Drupal\node\Entity\Node::loadMultiple($nids) as $node) {
        $nodes[] = ['nid' => $node->id(), 'title' => $node->label()];
      }
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => $e->getMessage()], 500);
    }

    return new JsonResponse(['nodes' => $nodes]);
  }

}
