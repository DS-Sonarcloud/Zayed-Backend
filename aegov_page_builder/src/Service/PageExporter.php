<?php

namespace Drupal\aegov_page_builder\Service;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\File\FileSystemInterface;
use Twig\Environment as TwigEnvironment;

/**
 * Exports a built page to web/exported-pages/{slug}/.
 *
 * Output per export:
 *   index.html       — standalone static HTML
 *   page.html.twig   — Drupal Twig template
 *   page.json        — JSON config for re-import
 *   assets/aegov.min.css
 *   assets/aegov.bundle.js
 */
class PageExporter {

  protected FileSystemInterface $fileSystem;
  protected ModuleHandlerInterface $moduleHandler;

  public function __construct(FileSystemInterface $fileSystem, ModuleHandlerInterface $moduleHandler) {
    $this->fileSystem = $fileSystem;
    $this->moduleHandler = $moduleHandler;
  }

  /**
   * Export a page definition to web/exported-pages/{slug}/.
   *
   * Produces a fully self-contained folder:
   *   index.html          — opens offline, all paths relative
   *   assets/aegov.min.css
   *   assets/aegov.bundle.js
   *   assets/fonts.css    — Google Fonts CSS (downloaded)
   *   assets/fonts/       — actual .woff2 font files
   *   images/             — every image referenced in the page, downloaded/copied
   *   page.html.twig      — Drupal Twig template
   *   page.json           — JSON config for re-import
   */
  public function export(array $page): array {
    $slug = preg_replace('/[^a-z0-9\-_]/', '-', strtolower($page['slug']));
    $base_path   = DRUPAL_ROOT . '/exported-pages/' . $slug;
    $assets_path = $base_path . '/assets';
    $fonts_path  = $base_path . '/assets/fonts';
    $images_path = $base_path . '/images';

    try {
      foreach ([$base_path, $assets_path, $fonts_path, $images_path] as $dir) {
        $this->fileSystem->prepareDirectory($dir, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS);
      }

      // 1. Copy CSS and JS.
      $this->writeAssets($assets_path);

      // 2. Download Google Fonts → assets/fonts.css + assets/fonts/*.woff2
      $this->downloadFonts($assets_path, $fonts_path);

      // 3. Collect all image URLs from page data, download them, build a rewrite map.
      $image_map = $this->downloadImages($page, $images_path);

      // 4. Render HTML with relative asset paths, then rewrite image URLs.
      $html = $this->renderHtmlForExport($page, $image_map);
      file_put_contents($base_path . '/index.html', $html);

      // 5. Write Twig template and JSON config.
      file_put_contents($base_path . '/page.html.twig', $this->renderTwig($page));
      file_put_contents($base_path . '/page.json', json_encode($page, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

      return ['success' => TRUE, 'path' => 'web/exported-pages/' . $slug . '/'];
    }
    catch (\Exception $e) {
      return ['success' => FALSE, 'error' => $e->getMessage()];
    }
  }

  /**
   * Collect every image URL from all regions, download each one to images/,
   * return a map of original_url => relative_path (e.g. "images/hero.jpg").
   */
  protected function downloadImages(array $page, string $images_path): array {
    $map = [];
    $base_host = \Drupal::request()->getSchemeAndHttpHost();

    foreach ($page['regions'] ?? [] as $region) {
      $data = $region['data'] ?? [];
      // Also resolve dynamic data if preview_node_id set.
      if (($region['data_source'] ?? 'static') === 'dynamic' && !empty($region['preview_node_id'])) {
        $data = $this->resolveNodeData($data, $region['field_map'] ?? [], (int) $region['preview_node_id']);
      }
      $this->collectImageUrls($data, $map);
    }

    foreach (array_keys($map) as $url) {
      if (empty($url)) continue;
      $local = $this->fetchImage($url, $images_path, $base_host);
      if ($local) {
        $map[$url] = 'images/' . $local;
      }
      else {
        // Keep original URL if download failed.
        $map[$url] = $url;
      }
    }

    return $map;
  }

  /**
   * Recursively walk a data array and collect all image-looking values into $map keys.
   */
  protected function collectImageUrls(array $data, array &$map): void {
    foreach ($data as $key => $value) {
      if (is_array($value)) {
        $this->collectImageUrls($value, $map);
      }
      elseif (is_string($value) && $this->looksLikeImageUrl($value)) {
        $map[$value] = $value;
      }
    }
  }

  protected function looksLikeImageUrl(string $v): bool {
    if (strlen($v) < 5) return FALSE;
    $ext = strtolower(pathinfo(parse_url($v, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
    return in_array($ext, ['jpg','jpeg','png','gif','webp','svg','avif','bmp']);
  }

  /**
   * Download a single image to $images_path, return the filename or NULL on failure.
   */
  protected function fetchImage(string $url, string $images_path, string $base_host): ?string {
    // Build absolute URL if it's site-relative.
    if (str_starts_with($url, '/')) {
      $url = $base_host . $url;
    }
    if (!filter_var($url, FILTER_VALIDATE_URL)) return NULL;

    // Use the file path to derive a safe local filename.
    $path     = parse_url($url, PHP_URL_PATH) ?? '';
    $filename = preg_replace('/[^a-zA-Z0-9._\-]/', '_', basename($path));
    if (!$filename) $filename = md5($url) . '.jpg';
    $dest = $images_path . '/' . $filename;

    // If already downloaded this run, skip.
    if (file_exists($dest)) return $filename;

    // Try file_get_contents with a timeout.
    $ctx = stream_context_create(['http' => ['timeout' => 10]]);
    $data = @file_get_contents($url, FALSE, $ctx);
    if ($data !== FALSE) {
      file_put_contents($dest, $data);
      return $filename;
    }

    // Fallback: try to copy from local filesystem if it's a Drupal public file.
    $public_path = \Drupal::service('file_system')->realpath('public://');
    $relative = str_replace('/sites/default/files/', '', $path);
    $local_src = $public_path . '/' . ltrim($relative, '/');
    if (file_exists($local_src)) {
      copy($local_src, $dest);
      return $filename;
    }

    return NULL;
  }

  /**
   * Download Google Fonts CSS, rewrite font URLs to relative, download .woff2 files.
   */
  protected function downloadFonts(string $assets_path, string $fonts_path): void {
    $font_url = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
    $ctx = stream_context_create([
      'http' => [
        'timeout' => 10,
        'header'  => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n",
      ],
    ]);
    $css = @file_get_contents($font_url, FALSE, $ctx);
    if (!$css) {
      // Write empty placeholder so the link tag doesn't 404.
      file_put_contents($assets_path . '/fonts.css', '/* Google Fonts unavailable offline — fonts will use system fallbacks */');
      return;
    }

    // Find all src: url(...) woff2 references, download each, rewrite path.
    $css = preg_replace_callback(
      '/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/',
      function (array $m) use ($fonts_path): string {
        $woff_url  = $m[1];
        $woff_name = md5($woff_url) . '.woff2';
        $woff_dest = $fonts_path . '/' . $woff_name;
        if (!file_exists($woff_dest)) {
          $data = @file_get_contents($woff_url);
          if ($data) file_put_contents($woff_dest, $data);
        }
        return 'url(fonts/' . $woff_name . ')';
      },
      $css
    );

    file_put_contents($assets_path . '/fonts.css', $css);
  }

  /**
   * Render the full page HTML for export — relative asset paths, images rewritten.
   */
  public function renderHtmlForExport(array $page, array $image_map = []): string {
    $lang        = $page['lang'] ?? 'en';
    $dir         = $lang === 'ar' ? 'rtl' : 'ltr';
    $title       = htmlspecialchars($page['title']);
    $description = htmlspecialchars($page['page_description'] ?? '');

    $body = '';
    foreach ($page['regions'] ?? [] as $region) {
      $body .= $this->renderRegionHtml($region, $page);
    }

    // Rewrite all image URLs to local relative paths.
    if (!empty($image_map)) {
      foreach ($image_map as $original => $local) {
        if ($original !== $local) {
          $body = str_replace(
            [htmlspecialchars($original), $original],
            [$local, $local],
            $body
          );
        }
      }
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="{$lang}" dir="{$dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{$description}">
  <title>{$title}</title>
  <link rel="stylesheet" href="assets/fonts.css">
  <link rel="stylesheet" href="assets/aegov.min.css">
</head>
<body class="aegov-page" data-lang="{$lang}">
{$body}
  <script src="assets/aegov.bundle.js"></script>
</body>
</html>
HTML;
  }

  /**
   * Render the full page as a standalone HTML string (for export — uses relative asset paths).
   */
  public function renderHtml(array $page): string {
    return $this->renderHtmlForExport($page);
  }

  /**
   * Render the full page HTML with explicit CSS and JS URLs (for preview with absolute paths).
   */
  public function renderHtmlAbsolute(array $page, string $css_url, string $js_url): string {
    $lang = $page['lang'] ?? 'en';
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $title = htmlspecialchars($page['title']);
    $description = htmlspecialchars($page['page_description'] ?? '');
    $css_url = htmlspecialchars($css_url);
    $js_url  = htmlspecialchars($js_url);

    $body = '';
    foreach ($page['regions'] ?? [] as $region) {
      $body .= $this->renderRegionHtml($region, $page);
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="{$lang}" dir="{$dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{$description}">
  <title>{$title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{$css_url}">
</head>
<body class="aegov-page" data-lang="{$lang}">
{$body}
  <script src="{$js_url}"></script>
</body>
</html>
HTML;
  }

  /**
   * Render the full page as a Drupal Twig template string.
   */
  public function renderTwig(array $page): string {
    $lang = $page['lang'] ?? 'en';
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $title = $page['title'];

    $body = '';
    foreach ($page['regions'] ?? [] as $region) {
      $body .= $this->renderRegionTwig($region);
    }

    return <<<TWIG
{#
  Page: {$title}
  Generated by AEGov Page Builder
  UAE Government Design System v3.0
#}
<!DOCTYPE html>
<html lang="{{ page.lang|default('en') }}" dir="{$dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {{ head_tag }}
  {{ page.meta_tags }}
  <title>{{ page_title|default('{$title}') }}</title>
  {{ styles }}
</head>
<body{{ attributes.addClass('aegov-page') }}>
  {{ page.messages }}
{$body}
  {{ scripts }}
</body>
</html>
TWIG;
  }

  /**
   * Render a single region to HTML.
   */
  protected function renderRegionHtml(array $region, array $page): string {
    $comp_id = $region['component_id'] ?? '';
    if (!$comp_id) {
      return '';
    }

    $all = ComponentRegistry::getAll();
    $comp_def = $all[$comp_id] ?? NULL;
    if (!$comp_def) {
      return '<!-- Unknown component: ' . htmlspecialchars($comp_id) . ' -->';
    }

    $lang = $page['lang'] ?? 'en';
    $data = $region['data'] ?? [];

    // For dynamic regions with a selected preview node, resolve field values.
    if (($region['data_source'] ?? 'static') === 'dynamic' && !empty($region['preview_node_id'])) {
      $data = $this->resolveNodeData($data, $region['field_map'] ?? [], (int) $region['preview_node_id']);
    }

    return $this->renderComponentHtml($comp_id, $comp_def, $data, $lang);
  }

  /**
   * Load a node and map its field values onto the component data array.
   */
  protected function resolveNodeData(array $base_data, array $field_map, int $nid): array {
    if (!$nid || empty($field_map)) {
      return $base_data;
    }
    try {
      $node = \Drupal\node\Entity\Node::load($nid);
      if (!$node) {
        return $base_data;
      }
      $node_values = [];
      foreach ($node->getFields() as $name => $field) {
        $value = $field->getValue();
        if (empty($value)) {
          $node_values[$name] = '';
          continue;
        }
        $first = $value[0] ?? [];
        $ftype = $field->getFieldDefinition()->getType();

        if (in_array($ftype, ['image', 'file'])) {
          $fid = $first['target_id'] ?? NULL;
          if ($fid) {
            $file = \Drupal\file\Entity\File::load($fid);
            if ($file) {
              $node_values[$name] = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
              $node_values[$name . '__alt'] = $first['alt'] ?? '';
            }
            else {
              $node_values[$name] = '';
            }
          }
          else {
            $node_values[$name] = '';
          }
        }
        elseif (isset($first['uri'])) {
          $node_values[$name] = \Drupal::service('file_url_generator')->generateAbsoluteString($first['uri']);
          $node_values[$name . '__alt'] = $first['alt'] ?? '';
        }
        elseif (isset($first['target_id'])) {
          if ($name === 'uid') {
            $node_values[$name] = $node->getOwner()->label();
          }
          else {
            $target_type = $field->getFieldDefinition()->getSetting('target_type') ?: 'node';
            $ref = \Drupal::entityTypeManager()->getStorage($target_type)->load($first['target_id']);
            $node_values[$name] = $ref ? $ref->label() : (string) $first['target_id'];
          }
        }
        elseif (isset($first['value']) && isset($first['format'])) {
          $node_values[$name] = $first['processed'] ?? $first['value'];
        }
        elseif (isset($first['value'])) {
          $node_values[$name] = $first['value'];
        }
        else {
          $node_values[$name] = '';
        }
      }
      $resolved = $base_data;
      foreach ($field_map as $comp_field => $ct_field) {
        if ($ct_field !== '' && isset($node_values[$ct_field])) {
          $resolved[$comp_field] = $node_values[$ct_field];
        }
      }
      return $resolved;
    }
    catch (\Exception $e) {
      return $base_data;
    }
  }

  /**
   * Render a single region to Twig.
   */
  protected function renderRegionTwig(array $region): string {
    $comp_id = $region['component_id'] ?? '';
    if (!$comp_id) {
      return '';
    }

    $source = $region['data_source'] ?? 'static';
    $category = $region['category'] ?? 'component';

    if ($source === 'dynamic' && !empty($region['content_type'])) {
      $ct = $region['content_type'];
      $max = (int) ($region['max_items'] ?? 6);
      return "\n{# Dynamic region: {$comp_id} from {$ct} #}\n{% for node in drupal_view_result('aegov_content', 'default', '{$ct}') | slice(0, {$max}) %}\n  {% include 'aegov_{$category}_{$comp_id}' with {'data': node, 'settings': {}} %}\n{% endfor %}\n";
    }

    return "\n{% include 'aegov_{$category}_{$comp_id}' with {'data': regions.{$comp_id}.data, 'settings': {}} %}\n";
  }

  /**
   * Generate HTML for a component given its definition and data.
   */
  public function renderComponentHtml(string $id, array $def, array $data, string $lang = 'en'): string {
    $method = 'render' . str_replace('_', '', ucwords($id, '_'));
    if (method_exists($this, $method)) {
      return $this->$method($data, $lang);
    }
    return $this->renderGenericComponent($id, $def, $data, $lang);
  }

  /**
   * Generic fallback renderer — outputs a labeled section.
   */
  protected function renderGenericComponent(string $id, array $def, array $data, string $lang): string {
    $label = htmlspecialchars($def['label']);
    $fields_html = '';
    foreach ($data as $key => $value) {
      if (is_array($value)) {
        $value = json_encode($value);
      }
      $fields_html .= '<div class="aegov-field aegov-field--' . htmlspecialchars($key) . '">' . htmlspecialchars((string) $value) . '</div>';
    }
    return "<section class=\"aegov-{$id}\" data-component=\"{$id}\">\n{$fields_html}\n</section>\n";
  }

  // -------------------------------------------------------------------------
  // BLOCK RENDERERS
  // -------------------------------------------------------------------------

  protected function renderHero(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $variant = $d['variant'] ?? 'default';
    $bg = match($d['background_color'] ?? 'white') {
      'gold' => 'background-color:#F9F7ED',
      'dark' => 'background-color:#1a1a2e;color:#fff',
      'gradient' => 'background:linear-gradient(135deg,#B8860B 0%,#DAA520 100%)',
      default => 'background-color:#ffffff',
    };
    $eyebrow = htmlspecialchars($d['eyebrow'] ?? '');
    $title   = htmlspecialchars($d['title'] ?? '');
    // subtitle may contain mapped HTML body — strip tags to get plain text for the subtitle slot
    $subtitle_raw = $d['subtitle'] ?? '';
    $subtitle = strip_tags($subtitle_raw) !== $subtitle_raw
      ? strip_tags($subtitle_raw)          // was HTML — show plain text summary
      : htmlspecialchars($subtitle_raw);   // was plain text — escape normally
    $p1t = htmlspecialchars($d['primary_cta_text'] ?? '');
    $p1u = htmlspecialchars($d['primary_cta_url'] ?? '#');
    $p2t = htmlspecialchars($d['secondary_cta_text'] ?? '');
    $p2u = htmlspecialchars($d['secondary_cta_url'] ?? '#');
    $img     = htmlspecialchars($d['image'] ?? '');
    $img_alt = htmlspecialchars($d['image_alt'] ?? '');

    $image_html = $img ? "<div class=\"aegov-hero__image\"><img src=\"{$img}\" alt=\"{$img_alt}\" loading=\"eager\"></div>" : '';
    $layout_class = $variant === 'split' ? 'aegov-hero--split' : ($variant === 'centered' ? 'aegov-hero--centered' : '');
    $eyebrow_html = $eyebrow ? "<span class=\"aegov-hero__eyebrow\">{$eyebrow}</span>" : '';
    $subtitle_html = $subtitle ? "<p class=\"aegov-hero__subtitle\">{$subtitle}</p>" : '';
    $p1_html = $p1t ? "<a href=\"{$p1u}\" class=\"aegov-btn aegov-btn--primary\">{$p1t}</a>" : '';
    $p2_html = $p2t ? "<a href=\"{$p2u}\" class=\"aegov-btn aegov-btn--outline\">{$p2t}</a>" : '';

    return <<<HTML

<section class="aegov-hero {$layout_class}" style="{$bg}" dir="{$dir}">
  <div class="aegov-hero__container">
    <div class="aegov-hero__content">
      {$eyebrow_html}
      <h1 class="aegov-hero__title">{$title}</h1>
      {$subtitle_html}
      <div class="aegov-hero__actions">
        {$p1_html}
        {$p2_html}
      </div>
    </div>
    {$image_html}
  </div>
</section>

HTML;
  }

  protected function renderHeader(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $logo = htmlspecialchars($d['logo_url'] ?? '');
    $logo_alt = htmlspecialchars($d['logo_alt'] ?? 'UAE Government');
    $site_name = htmlspecialchars($d['site_name'] ?? '');
    $sticky = !empty($d['sticky']) ? 'aegov-header--sticky' : '';
    $show_search = !empty($d['show_search']);
    $show_lang = !empty($d['show_language_switcher']);
    $nav_items = is_array($d['nav_items'] ?? null) ? $d['nav_items'] : [];
    $nav_html = '';
    foreach ($nav_items as $item) {
      $active = !empty($item['active']) ? ' aria-current="page"' : '';
      $nav_html .= '<li><a href="' . htmlspecialchars($item['url'] ?? '#') . '"' . $active . '>' . htmlspecialchars($item['label'] ?? '') . '</a></li>';
    }
    $logo_tag = $logo ? "<img src=\"{$logo}\" alt=\"{$logo_alt}\" class=\"aegov-header__logo-img\">" : "<span class=\"aegov-header__logo-text\">{$logo_alt}</span>";
    $search_html = $show_search ? '<button class="aegov-header__search-btn" aria-label="Search"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg></button>' : '';
    $lang_html = $show_lang ? '<button class="aegov-header__lang-btn">' . ($lang === 'ar' ? 'EN' : 'عربي') . '</button>' : '';

    $site_name_html = $site_name ? "<span class=\"aegov-header__site-name\">{$site_name}</span>" : '';

    return <<<HTML

<header class="aegov-header {$sticky}" dir="{$dir}" role="banner">
  <div class="aegov-header__container">
    <a href="/" class="aegov-header__logo">{$logo_tag}</a>
    {$site_name_html}
    <nav class="aegov-header__nav" aria-label="Main navigation">
      <ul class="aegov-header__nav-list">{$nav_html}</ul>
    </nav>
    <div class="aegov-header__utils">
      {$search_html}
      {$lang_html}
    </div>
    <button class="aegov-header__mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

HTML;
  }

  protected function renderFooter(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $logo = htmlspecialchars($d['logo_url'] ?? '');
    $logo_alt = htmlspecialchars($d['logo_alt'] ?? 'UAE Government');
    $desc = htmlspecialchars($d['description'] ?? '');
    $copy = htmlspecialchars($d['copyright_text'] ?? '');
    $logo_tag = $logo ? "<img src=\"{$logo}\" alt=\"{$logo_alt}\">" : "<span>{$logo_alt}</span>";
    $cols_html = '';
    $columns = is_array($d['columns'] ?? null) ? $d['columns'] : [];
    foreach ($columns as $col) {
      $links = json_decode($col['links'] ?? '[]', TRUE) ?: [];
      $links_html = implode('', array_map(fn($l) => '<li><a href="' . htmlspecialchars($l['url'] ?? '#') . '">' . htmlspecialchars($l['label'] ?? '') . '</a></li>', $links));
      $cols_html .= '<div class="aegov-footer__col"><h3 class="aegov-footer__col-title">' . htmlspecialchars($col['title'] ?? '') . '</h3><ul>' . $links_html . '</ul></div>';
    }

    $desc_html = $desc ? "<p class=\"aegov-footer__desc\">{$desc}</p>" : '';

    return <<<HTML

<footer class="aegov-footer" dir="{$dir}" role="contentinfo">
  <div class="aegov-footer__container">
    <div class="aegov-footer__top">
      <div class="aegov-footer__brand">
        <a href="/" class="aegov-footer__logo">{$logo_tag}</a>
        {$desc_html}
      </div>
      <div class="aegov-footer__cols">{$cols_html}</div>
    </div>
    <div class="aegov-footer__bottom">
      <p class="aegov-footer__copy">{$copy}</p>
    </div>
  </div>
</footer>

HTML;
  }

  protected function renderColumns(array $d, string $lang): string {
    $dir    = $lang === 'ar' ? 'rtl' : 'ltr';
    $cols   = (int) ($d['columns'] ?? 2);
    $align  = htmlspecialchars($d['align'] ?? 'start');
    $items  = is_array($d['items'] ?? null) ? $d['items'] : [];
    $bg     = match($d['background'] ?? 'white') {
      'light' => 'background:#f8f9fa;',
      'gold'  => 'background:#fdf8e7;',
      'dark'  => 'background:#1a1a2e;color:#fff;',
      default => '',
    };
    $gap_px = match($d['gap'] ?? 'md') {
      'sm'    => '16px',
      'lg'    => '40px',
      default => '24px',
    };

    $all        = ComponentRegistry::getAll();
    $cells_html = '';

    foreach ($items as $item) {
      $span       = max(1, min((int) ($item['span'] ?? 1), $cols));
      $span_style = "grid-column:span {$span};min-width:0;overflow:hidden;";
      $cell_html  = '';

      $comp_id = $item['component_id'] ?? '';
      if ($comp_id && isset($all[$comp_id])) {
        // Nested component — decode data and render.
        $comp_data = $item['component_data'] ?? [];
        if (is_string($comp_data)) {
          $comp_data = json_decode($comp_data, TRUE) ?: [];
        }
        $comp_def  = $all[$comp_id];
        $defaults  = [];
        foreach ($comp_def['fields'] ?? [] as $fk => $fdef) {
          $defaults[$fk] = $fdef['default'] ?? '';
        }
        $comp_data = array_merge($defaults, $comp_data);
        $cell_html = $this->renderComponentHtml($comp_id, $comp_def, $comp_data, $lang);
      }
      else {
        // Backward-compat: plain HTML / image / link fallback.
        $title     = htmlspecialchars($item['title'] ?? '');
        $content   = $item['content'] ?? '';
        $img       = htmlspecialchars($item['image'] ?? '');
        $img_alt   = htmlspecialchars($item['image_alt'] ?? '');
        $link_text = htmlspecialchars($item['link_text'] ?? '');
        $link_url  = htmlspecialchars($item['link_url'] ?? '#');
        $title_h   = $title     ? "<h3 class=\"aegov-col__title\">{$title}</h3>" : '';
        $img_h     = $img       ? "<figure class=\"aegov-col__image\"><img src=\"{$img}\" alt=\"{$img_alt}\" loading=\"lazy\"></figure>" : '';
        $link_h    = $link_text ? "<a href=\"{$link_url}\" class=\"aegov-hyperlink aegov-col__link\">{$link_text} &rarr;</a>" : '';
        $cell_html = $img_h . "<div class=\"aegov-col__body\">{$title_h}{$content}{$link_h}</div>";
      }

      $cells_html .= "<div class=\"aegov-col__item\" style=\"{$span_style}\">{$cell_html}</div>\n";
    }

    $grid_style = "display:grid !important;grid-template-columns:repeat({$cols},minmax(0,1fr));gap:{$gap_px};align-items:{$align};width:100%;box-sizing:border-box;";

    return <<<HTML

<section class="aegov-columns" dir="{$dir}" style="{$bg}padding:32px 0;width:100%;box-sizing:border-box;">
  <div class="aegov-columns__container" style="max-width:1200px;margin:0 auto;padding:0 24px;box-sizing:border-box;">
    <div class="aegov-columns__grid" style="{$grid_style}">
{$cells_html}    </div>
  </div>
</section>

HTML;
  }

  protected function renderContent(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $title = htmlspecialchars($d['title'] ?? '');
    $subtitle = htmlspecialchars($d['subtitle'] ?? '');
    $body = $d['body'] ?? '';
    $img = htmlspecialchars($d['image'] ?? '');
    $img_alt = htmlspecialchars($d['image_alt'] ?? '');
    $bg = match($d['background'] ?? 'white') {
      'light' => 'background-color:#f8f9fa',
      'gold' => 'background-color:#fdf8e7',
      'dark' => 'background-color:#1a1a2e;color:#fff',
      default => '',
    };
    $img_html = $img ? "<figure class=\"aegov-content__image\"><img src=\"{$img}\" alt=\"{$img_alt}\" loading=\"lazy\"></figure>" : '';
    $title_html = $title ? "<h2 class=\"aegov-content__title\">{$title}</h2>" : '';
    $subtitle_html = $subtitle ? "<p class=\"aegov-content__subtitle\">{$subtitle}</p>" : '';

    return <<<HTML

<section class="aegov-content" style="{$bg}" dir="{$dir}">
  <div class="aegov-content__container">
    {$title_html}
    {$subtitle_html}
    {$img_html}
    <div class="aegov-content__body">{$body}</div>
  </div>
</section>

HTML;
  }

  protected function renderNewsletter(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $title = htmlspecialchars($d['title'] ?? 'Stay Updated');
    $desc = htmlspecialchars($d['description'] ?? '');
    $placeholder = htmlspecialchars($d['placeholder'] ?? 'Enter your email');
    $btn = htmlspecialchars($d['button_text'] ?? 'Subscribe');
    $privacy = htmlspecialchars($d['privacy_text'] ?? '');
    $bg = match($d['background'] ?? 'gold') {
      'dark' => 'background-color:#1a1a2e;color:#fff',
      'light' => 'background-color:#f8f9fa',
      'gold' => 'background-color:#fdf8e7',
      default => '',
    };

    $desc_html = $desc ? "<p class=\"aegov-newsletter__desc\">{$desc}</p>" : '';
    $privacy_html = $privacy ? "<p class=\"aegov-newsletter__privacy\">{$privacy}</p>" : '';

    return <<<HTML

<section class="aegov-newsletter" style="{$bg}" dir="{$dir}">
  <div class="aegov-newsletter__container">
    <h2 class="aegov-newsletter__title">{$title}</h2>
    {$desc_html}
    <form class="aegov-newsletter__form" onsubmit="return false;">
      <div class="aegov-newsletter__input-group">
        <input type="email" placeholder="{$placeholder}" class="aegov-input aegov-newsletter__email" required aria-label="{$placeholder}">
        <button type="submit" class="aegov-btn aegov-btn--primary">{$btn}</button>
      </div>
      {$privacy_html}
    </form>
  </div>
</section>

HTML;
  }

  protected function renderPageRating(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $question = htmlspecialchars($d['title'] ?? 'Was this page helpful?');
    $yes = htmlspecialchars($d['yes_text'] ?? 'Yes');
    $no = htmlspecialchars($d['no_text'] ?? 'No');
    $placeholder = htmlspecialchars($d['feedback_placeholder'] ?? '');
    $submit = htmlspecialchars($d['submit_text'] ?? 'Submit');
    $thanks = htmlspecialchars($d['success_message'] ?? 'Thank you!');

    return <<<HTML

<section class="aegov-page-rating" dir="{$dir}">
  <div class="aegov-page-rating__container">
    <p class="aegov-page-rating__question">{$question}</p>
    <div class="aegov-page-rating__buttons">
      <button class="aegov-btn aegov-btn--outline aegov-page-rating__btn" data-value="yes">{$yes}</button>
      <button class="aegov-btn aegov-btn--outline aegov-page-rating__btn" data-value="no">{$no}</button>
    </div>
    <form class="aegov-page-rating__feedback" style="display:none;" onsubmit="return false;">
      <textarea class="aegov-textarea" placeholder="{$placeholder}" rows="3"></textarea>
      <button type="submit" class="aegov-btn aegov-btn--primary">{$submit}</button>
    </form>
    <p class="aegov-page-rating__thanks" style="display:none;">{$thanks}</p>
  </div>
</section>

HTML;
  }

  protected function renderLogin(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $title = htmlspecialchars($d['title'] ?? 'Sign In');
    $desc = htmlspecialchars($d['description'] ?? '');
    $url = htmlspecialchars($d['uaepass_url'] ?? '#');
    $show_register = !empty($d['show_register']);

    $desc_html = $desc ? "<p class=\"aegov-login__desc\">{$desc}</p>" : '';
    $register_html = $show_register ? "<p class=\"aegov-login__register\">Don't have a UAE Pass? <a href=\"https://www.uaepass.ae\">Register now</a></p>" : '';

    return <<<HTML

<section class="aegov-login" dir="{$dir}">
  <div class="aegov-login__container">
    <h2 class="aegov-login__title">{$title}</h2>
    {$desc_html}
    <a href="{$url}" class="aegov-btn aegov-btn--uaepass">
      <img src="assets/uaepass-logo.svg" alt="UAE Pass" width="24" height="24">
      Sign in with UAE Pass
    </a>
    {$register_html}
  </div>
</section>

HTML;
  }

  protected function renderTeam(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $title = htmlspecialchars($d['title'] ?? 'Our Team');
    $cols = (int) ($d['columns'] ?? 3);
    $members = is_array($d['members'] ?? null) ? $d['members'] : [];
    $cards = '';
    foreach ($members as $m) {
      $img = htmlspecialchars($m['image'] ?? '');
      $name = htmlspecialchars($m['name'] ?? '');
      $job = htmlspecialchars($m['title'] ?? '');
      $bio = htmlspecialchars($m['bio'] ?? '');
      $img_tag = $img ? "<img src=\"{$img}\" alt=\"{$name}\" loading=\"lazy\">" : "<div class=\"aegov-team__avatar-placeholder\">" . mb_substr($name, 0, 1) . "</div>";
      $bio_html = $bio ? "<p class=\"aegov-team__bio\">{$bio}</p>" : '';
      $cards .= "<div class=\"aegov-team__card\"><div class=\"aegov-team__photo\">{$img_tag}</div><div class=\"aegov-team__info\"><h3 class=\"aegov-team__name\">{$name}</h3><p class=\"aegov-team__title\">{$job}</p>{$bio_html}</div></div>";
    }

    return <<<HTML

<section class="aegov-team" dir="{$dir}">
  <div class="aegov-team__container">
    <h2 class="aegov-team__title">{$title}</h2>
    <div class="aegov-team__grid aegov-team__grid--{$cols}col">{$cards}</div>
  </div>
</section>

HTML;
  }

  protected function renderFilter(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $title = htmlspecialchars($d['title'] ?? '');
    $show_search = !empty($d['show_search']);
    $groups = is_array($d['filter_groups'] ?? null) ? $d['filter_groups'] : [];
    $filters_html = '';
    foreach ($groups as $group) {
      $options = json_decode($group['options'] ?? '[]', TRUE) ?: [];
      $opts_html = '<option value="">' . htmlspecialchars($group['label'] ?? '') . '</option>';
      foreach ($options as $opt) {
        $opts_html .= '<option value="' . htmlspecialchars($opt['value'] ?? '') . '">' . htmlspecialchars($opt['label'] ?? '') . '</option>';
      }
      $filters_html .= '<div class="aegov-filter__group"><select class="aegov-select" name="' . htmlspecialchars($group['name'] ?? '') . '">' . $opts_html . '</select></div>';
    }
    $search_html = $show_search ? '<div class="aegov-filter__search"><input type="search" class="aegov-input" placeholder="Search..." aria-label="Search"></div>' : '';

    $title_html = $title ? "<h2 class=\"aegov-filter__title\">{$title}</h2>" : '';

    return <<<HTML

<section class="aegov-filter" dir="{$dir}">
  <div class="aegov-filter__container">
    {$title_html}
    <form class="aegov-filter__form" onsubmit="return false;">
      {$search_html}
      <div class="aegov-filter__groups">{$filters_html}</div>
      <button type="submit" class="aegov-btn aegov-btn--primary">Apply Filters</button>
      <button type="reset" class="aegov-btn aegov-btn--outline">Reset</button>
    </form>
  </div>
</section>

HTML;
  }

  // -------------------------------------------------------------------------
  // COMPONENT RENDERERS
  // -------------------------------------------------------------------------

  protected function renderAccordion(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $items = is_array($d['items'] ?? null) ? $d['items'] : [];
    $html = '';
    foreach ($items as $i => $item) {
      $open = !empty($item['open']) ? ' open' : '';
      $title = htmlspecialchars($item['title'] ?? '');
      $content = htmlspecialchars($item['content'] ?? '');
      $html .= "<div class=\"aegov-accordion__item\"><button class=\"aegov-accordion__trigger\" aria-expanded=\"" . (!empty($item['open']) ? 'true' : 'false') . "\" aria-controls=\"accordion-panel-{$i}\">{$title}<svg class=\"aegov-accordion__icon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg></button><div class=\"aegov-accordion__panel\" id=\"accordion-panel-{$i}\" role=\"region\"{$open}><div class=\"aegov-accordion__content\">{$content}</div></div></div>";
    }

    return "<div class=\"aegov-accordion\" dir=\"{$dir}\">{$html}</div>\n";
  }

  protected function renderAlert(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $type = htmlspecialchars($d['type'] ?? 'info');
    $title = htmlspecialchars($d['title'] ?? '');
    $message = htmlspecialchars($d['message'] ?? '');
    $dismissible = !empty($d['dismissible']);
    $dismiss_btn = $dismissible ? '<button class="aegov-alert__dismiss" aria-label="Dismiss">&times;</button>' : '';
    $icons = ['info' => 'ℹ', 'success' => '✓', 'warning' => '⚠', 'danger' => '✕'];
    $icon = $icons[$type] ?? 'ℹ';

    return "<div class=\"aegov-alert aegov-alert--{$type}\" role=\"alert\" dir=\"{$dir}\">" .
      "<span class=\"aegov-alert__icon\" aria-hidden=\"true\">{$icon}</span>" .
      "<div class=\"aegov-alert__body\">" .
      ($title ? "<strong class=\"aegov-alert__title\">{$title}</strong>" : '') .
      "<p class=\"aegov-alert__message\">{$message}</p></div>{$dismiss_btn}</div>\n";
  }

  protected function renderAvatar(array $d, string $lang): string {
    $size = htmlspecialchars($d['size'] ?? 'md');
    $img = htmlspecialchars($d['image'] ?? '');
    $initials = htmlspecialchars($d['initials'] ?? 'AE');
    $alt = htmlspecialchars($d['alt'] ?? '');
    $status = htmlspecialchars($d['status'] ?? '');
    $inner = $img ? "<img src=\"{$img}\" alt=\"{$alt}\">" : "<span class=\"aegov-avatar__initials\">{$initials}</span>";
    $status_html = $status ? "<span class=\"aegov-avatar__status aegov-avatar__status--{$status}\"></span>" : '';

    return "<div class=\"aegov-avatar aegov-avatar--{$size}\">{$inner}{$status_html}</div>\n";
  }

  protected function renderBadge(array $d, string $lang): string {
    $text = htmlspecialchars($d['text'] ?? 'Badge');
    $variant = htmlspecialchars($d['variant'] ?? 'primary');
    $size = htmlspecialchars($d['size'] ?? 'md');
    $pill = !empty($d['pill']) ? ' aegov-badge--pill' : '';

    return "<span class=\"aegov-badge aegov-badge--{$variant} aegov-badge--{$size}{$pill}\">{$text}</span>\n";
  }

  protected function renderBanner(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $type = htmlspecialchars($d['type'] ?? 'info');
    $message = htmlspecialchars($d['message'] ?? '');
    $link_text = htmlspecialchars($d['link_text'] ?? '');
    $link_url = htmlspecialchars($d['link_url'] ?? '#');
    $dismissible = !empty($d['dismissible']);
    $link_html = $link_text ? " <a href=\"{$link_url}\" class=\"aegov-banner__link\">{$link_text}</a>" : '';
    $dismiss = $dismissible ? '<button class="aegov-banner__dismiss" aria-label="Close">&times;</button>' : '';

    return "<div class=\"aegov-banner aegov-banner--{$type}\" role=\"banner\" dir=\"{$dir}\"><div class=\"aegov-banner__content\">{$message}{$link_html}</div>{$dismiss}</div>\n";
  }

  protected function renderBlockquote(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $quote = htmlspecialchars($d['quote'] ?? '');
    $author = htmlspecialchars($d['author'] ?? '');
    $author_title = htmlspecialchars($d['author_title'] ?? '');
    $img = htmlspecialchars($d['author_image'] ?? '');
    $img_html = $img ? "<img src=\"{$img}\" alt=\"{$author}\" class=\"aegov-blockquote__author-img\">" : '';

    $author_title_html = $author_title ? "<span class=\"aegov-blockquote__author-title\">{$author_title}</span>" : '';

    return "<blockquote class=\"aegov-blockquote\" dir=\"{$dir}\"><p class=\"aegov-blockquote__text\">{$quote}</p><footer class=\"aegov-blockquote__attribution\">{$img_html}<div><cite class=\"aegov-blockquote__author\">{$author}</cite>{$author_title_html}</div></footer></blockquote>\n";
  }

  protected function renderBreadcrumbs(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $items = is_array($d['items'] ?? null) ? $d['items'] : [];
    $current = htmlspecialchars($d['current_page'] ?? '');
    $html = '';
    foreach ($items as $item) {
      $html .= '<li class="aegov-breadcrumbs__item"><a href="' . htmlspecialchars($item['url'] ?? '#') . '">' . htmlspecialchars($item['label'] ?? '') . '</a></li>';
    }
    $html .= "<li class=\"aegov-breadcrumbs__item aegov-breadcrumbs__item--current\" aria-current=\"page\">{$current}</li>";

    return "<nav aria-label=\"Breadcrumb\" dir=\"{$dir}\"><ol class=\"aegov-breadcrumbs\">{$html}</ol></nav>\n";
  }

  protected function renderButton(array $d, string $lang): string {
    $text = htmlspecialchars($d['text'] ?? 'Button');
    $url = htmlspecialchars($d['url'] ?? '#');
    $variant = htmlspecialchars($d['variant'] ?? 'primary');
    $size = htmlspecialchars($d['size'] ?? 'md');
    $full = !empty($d['full_width']) ? ' aegov-btn--full' : '';
    $disabled = !empty($d['disabled']) ? ' disabled aria-disabled="true"' : '';
    $type = htmlspecialchars($d['type'] ?? 'button');
    $tag = ($url && $url !== '#' && $type === 'button') ? 'a' : 'button';
    $href = $tag === 'a' ? " href=\"{$url}\"" : " type=\"{$type}\"";

    return "<{$tag}{$href} class=\"aegov-btn aegov-btn--{$variant} aegov-btn--{$size}{$full}\"{$disabled}>{$text}</{$tag}>\n";
  }

  protected function renderCard(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $variant = htmlspecialchars($d['variant'] ?? 'default');
    $img = htmlspecialchars($d['image'] ?? '');
    $img_alt = htmlspecialchars($d['image_alt'] ?? '');
    $badge = htmlspecialchars($d['badge'] ?? '');
    $title = htmlspecialchars($d['title'] ?? '');
    $desc = htmlspecialchars($d['description'] ?? '');
    $date = htmlspecialchars($d['date'] ?? '');
    $link_text = htmlspecialchars($d['link_text'] ?? 'Read more');
    $link_url = htmlspecialchars($d['link_url'] ?? '#');
    $img_html = $img ? "<figure class=\"aegov-card__image\"><img src=\"{$img}\" alt=\"{$img_alt}\" loading=\"lazy\"></figure>" : '';
    $badge_html = $badge ? "<span class=\"aegov-badge aegov-badge--primary\">{$badge}</span>" : '';
    $date_html = $date ? "<time class=\"aegov-card__date\">{$date}</time>" : '';

    return <<<HTML
<article class="aegov-card aegov-card--{$variant}" dir="{$dir}">
  {$img_html}
  <div class="aegov-card__body">
    {$badge_html}
    <h3 class="aegov-card__title"><a href="{$link_url}">{$title}</a></h3>
    {$date_html}
    <p class="aegov-card__desc">{$desc}</p>
    <a href="{$link_url}" class="aegov-card__link aegov-hyperlink">{$link_text} &rarr;</a>
  </div>
</article>
HTML;
  }

  protected function renderCheckbox(array $d, string $lang): string {
    $label = htmlspecialchars($d['label'] ?? '');
    $name = htmlspecialchars($d['name'] ?? 'checkbox');
    $checked = !empty($d['checked']) ? ' checked' : '';
    $disabled = !empty($d['disabled']) ? ' disabled' : '';
    $required = !empty($d['required']) ? ' required' : '';
    $helper = htmlspecialchars($d['helper_text'] ?? '');
    $id = 'checkbox-' . $name;

    return "<div class=\"aegov-checkbox\"><input type=\"checkbox\" id=\"{$id}\" name=\"{$name}\"{$checked}{$disabled}{$required}><label for=\"{$id}\">{$label}</label>" . ($helper ? "<span class=\"aegov-field-helper\">{$helper}</span>" : '') . "</div>\n";
  }

  protected function renderInput(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $label = htmlspecialchars($d['label'] ?? '');
    $name = htmlspecialchars($d['name'] ?? 'field');
    $type = htmlspecialchars($d['type'] ?? 'text');
    $placeholder = htmlspecialchars($d['placeholder'] ?? '');
    $helper = htmlspecialchars($d['helper_text'] ?? '');
    $required = !empty($d['required']) ? ' required' : '';
    $disabled = !empty($d['disabled']) ? ' disabled' : '';
    $id = 'input-' . $name;

    $required_html = $required ? ' <span class="aegov-required" aria-hidden="true">*</span>' : '';

    return "<div class=\"aegov-form-group\" dir=\"{$dir}\"><label for=\"{$id}\" class=\"aegov-label\">{$label}{$required_html}</label><input type=\"{$type}\" id=\"{$id}\" name=\"{$name}\" class=\"aegov-input\" placeholder=\"{$placeholder}\"{$required}{$disabled}>" . ($helper ? "<span class=\"aegov-field-helper\">{$helper}</span>" : '') . "</div>\n";
  }

  protected function renderTextarea(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $label = htmlspecialchars($d['label'] ?? '');
    $name = htmlspecialchars($d['name'] ?? 'message');
    $placeholder = htmlspecialchars($d['placeholder'] ?? '');
    $rows = (int) ($d['rows'] ?? 4);
    $helper = htmlspecialchars($d['helper_text'] ?? '');
    $required = !empty($d['required']) ? ' required' : '';
    $disabled = !empty($d['disabled']) ? ' disabled' : '';
    $maxlength = !empty($d['max_length']) ? ' maxlength="' . (int) $d['max_length'] . '"' : '';
    $id = 'textarea-' . $name;

    return "<div class=\"aegov-form-group\" dir=\"{$dir}\"><label for=\"{$id}\" class=\"aegov-label\">{$label}</label><textarea id=\"{$id}\" name=\"{$name}\" class=\"aegov-textarea\" rows=\"{$rows}\" placeholder=\"{$placeholder}\"{$required}{$disabled}{$maxlength}></textarea>" . ($helper ? "<span class=\"aegov-field-helper\">{$helper}</span>" : '') . "</div>\n";
  }

  protected function renderSelect(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $label = htmlspecialchars($d['label'] ?? '');
    $name = htmlspecialchars($d['name'] ?? 'select_field');
    $placeholder = htmlspecialchars($d['placeholder'] ?? 'Choose...');
    $options = is_array($d['options'] ?? null) ? $d['options'] : [];
    $required = !empty($d['required']) ? ' required' : '';
    $multiple = !empty($d['multiple']) ? ' multiple' : '';
    $helper = htmlspecialchars($d['helper_text'] ?? '');
    $id = 'select-' . $name;
    $opts_html = "<option value=\"\">{$placeholder}</option>";
    foreach ($options as $opt) {
      $opts_html .= '<option value="' . htmlspecialchars($opt['value'] ?? '') . '">' . htmlspecialchars($opt['label'] ?? '') . '</option>';
    }

    return "<div class=\"aegov-form-group\" dir=\"{$dir}\"><label for=\"{$id}\" class=\"aegov-label\">{$label}</label><select id=\"{$id}\" name=\"{$name}\" class=\"aegov-select\"{$required}{$multiple}>{$opts_html}</select>" . ($helper ? "<span class=\"aegov-field-helper\">{$helper}</span>" : '') . "</div>\n";
  }

  protected function renderRadio(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $legend = htmlspecialchars($d['legend'] ?? '');
    $name = htmlspecialchars($d['name'] ?? 'radio_group');
    $options = is_array($d['options'] ?? null) ? $d['options'] : [];
    $layout = $d['layout'] ?? 'vertical';
    $required = !empty($d['required']) ? ' required' : '';
    $opts_html = '';
    foreach ($options as $i => $opt) {
      $id = 'radio-' . $name . '-' . $i;
      $checked = !empty($opt['checked']) ? ' checked' : '';
      $opts_html .= "<div class=\"aegov-radio\"><input type=\"radio\" id=\"{$id}\" name=\"{$name}\" value=\"" . htmlspecialchars($opt['value'] ?? '') . "\"{$checked}{$required}><label for=\"{$id}\">" . htmlspecialchars($opt['label'] ?? '') . "</label></div>";
    }

    return "<fieldset class=\"aegov-radio-group aegov-radio-group--{$layout}\" dir=\"{$dir}\"><legend class=\"aegov-label\">{$legend}</legend>{$opts_html}</fieldset>\n";
  }

  protected function renderToggle(array $d, string $lang): string {
    $label = htmlspecialchars($d['label'] ?? '');
    $name = htmlspecialchars($d['name'] ?? 'toggle');
    $checked = !empty($d['checked']) ? ' checked' : '';
    $disabled = !empty($d['disabled']) ? ' disabled' : '';
    $size = htmlspecialchars($d['size'] ?? 'md');
    $helper = htmlspecialchars($d['helper_text'] ?? '');
    $id = 'toggle-' . $name;

    return "<div class=\"aegov-toggle aegov-toggle--{$size}\"><input type=\"checkbox\" id=\"{$id}\" name=\"{$name}\" role=\"switch\"{$checked}{$disabled}><label for=\"{$id}\">{$label}</label>" . ($helper ? "<span class=\"aegov-field-helper\">{$helper}</span>" : '') . "</div>\n";
  }

  protected function renderFileInput(array $d, string $lang): string {
    $label = htmlspecialchars($d['label'] ?? 'Upload File');
    $name = htmlspecialchars($d['name'] ?? 'file');
    $accept = htmlspecialchars($d['accept'] ?? '');
    $multiple = !empty($d['multiple']) ? ' multiple' : '';
    $required = !empty($d['required']) ? ' required' : '';
    $helper = htmlspecialchars($d['helper_text'] ?? '');
    $id = 'file-' . $name;

    $accept_attr = $accept ? " accept=\"{$accept}\"" : '';

    return "<div class=\"aegov-form-group\"><label for=\"{$id}\" class=\"aegov-label\">{$label}</label><input type=\"file\" id=\"{$id}\" name=\"{$name}\" class=\"aegov-file-input\"{$accept_attr}{$multiple}{$required}>" . ($helper ? "<span class=\"aegov-field-helper\">{$helper}</span>" : '') . "</div>\n";
  }

  protected function renderRangeSlider(array $d, string $lang): string {
    $label = htmlspecialchars($d['label'] ?? '');
    $name = htmlspecialchars($d['name'] ?? 'range');
    $min = (int) ($d['min'] ?? 0);
    $max = (int) ($d['max'] ?? 100);
    $step = (int) ($d['step'] ?? 1);
    $value = (int) ($d['value'] ?? 50);
    $show = !empty($d['show_value']);
    $id = 'range-' . $name;

    return "<div class=\"aegov-form-group\"><label for=\"{$id}\" class=\"aegov-label\">{$label}" . ($show ? " <output id=\"{$id}-output\">{$value}</output>" : '') . "</label><input type=\"range\" id=\"{$id}\" name=\"{$name}\" class=\"aegov-range\" min=\"{$min}\" max=\"{$max}\" step=\"{$step}\" value=\"{$value}\"" . ($show ? " oninput=\"document.getElementById('{$id}-output').value=this.value\"" : '') . "></div>\n";
  }

  protected function renderSlider(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $items = is_array($d['items'] ?? null) ? $d['items'] : [];
    $autoplay = !empty($d['autoplay']);
    $interval = (int) ($d['interval'] ?? 4000);
    $show_indicators = !empty($d['show_indicators']);
    $show_controls = !empty($d['show_controls']);
    $slides_html = '';
    $indicators_html = '';
    foreach ($items as $i => $item) {
      $active = $i === 0 ? ' aegov-slider__slide--active' : '';
      $img = htmlspecialchars($item['image'] ?? '');
      $title = htmlspecialchars($item['title'] ?? '');
      $desc = htmlspecialchars($item['description'] ?? '');
      $img_tag = $img ? "<img src=\"{$img}\" alt=\"{$title}\" loading=\"lazy\">" : '';
      $slides_html .= "<div class=\"aegov-slider__slide{$active}\">{$img_tag}" . ($title ? "<div class=\"aegov-slider__caption\"><h3>{$title}</h3>{$desc}</div>" : '') . "</div>";
      if ($show_indicators) {
        $indicators_html .= "<button class=\"aegov-slider__dot" . ($i === 0 ? ' aegov-slider__dot--active' : '') . "\" aria-label=\"Go to slide " . ($i + 1) . "\"></button>";
      }
    }
    $controls_html = $show_controls ? '<button class="aegov-slider__prev" aria-label="Previous">&#8249;</button><button class="aegov-slider__next" aria-label="Next">&#8250;</button>' : '';

    return "<div class=\"aegov-slider\" dir=\"{$dir}\" data-autoplay=\"" . ($autoplay ? 'true' : 'false') . "\" data-interval=\"{$interval}\"><div class=\"aegov-slider__track\">{$slides_html}</div>{$controls_html}" . ($show_indicators ? "<div class=\"aegov-slider__indicators\">{$indicators_html}</div>" : '') . "</div>\n";
  }

  protected function renderModal(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $modal_id = htmlspecialchars($d['modal_id'] ?? 'modal-1');
    $title = htmlspecialchars($d['title'] ?? 'Modal Title');
    $content = htmlspecialchars($d['content'] ?? '');
    $size = htmlspecialchars($d['size'] ?? 'md');
    $trigger = htmlspecialchars($d['trigger_text'] ?? 'Open Modal');
    $show_footer = !empty($d['footer_actions']);
    $confirm = htmlspecialchars($d['confirm_text'] ?? 'Confirm');
    $cancel = htmlspecialchars($d['cancel_text'] ?? 'Cancel');
    $footer = $show_footer ? "<footer class=\"aegov-modal__footer\"><button class=\"aegov-btn aegov-btn--primary\">{$confirm}</button><button class=\"aegov-btn aegov-btn--outline aegov-modal__close\">{$cancel}</button></footer>" : '';

    return "<button class=\"aegov-btn aegov-btn--primary\" data-modal-target=\"{$modal_id}\">{$trigger}</button>\n<div class=\"aegov-modal aegov-modal--{$size}\" id=\"{$modal_id}\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"{$modal_id}-title\" dir=\"{$dir}\" hidden><div class=\"aegov-modal__backdrop aegov-modal__close\"></div><div class=\"aegov-modal__dialog\"><header class=\"aegov-modal__header\"><h2 id=\"{$modal_id}-title\" class=\"aegov-modal__title\">{$title}</h2><button class=\"aegov-modal__close-btn aegov-modal__close\" aria-label=\"Close\">&times;</button></header><div class=\"aegov-modal__body\">{$content}</div>{$footer}</div></div>\n";
  }

  protected function renderNavigation(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $variant = htmlspecialchars($d['variant'] ?? 'horizontal');
    $items = is_array($d['items'] ?? null) ? $d['items'] : [];
    $items_html = '';
    foreach ($items as $item) {
      $active = !empty($item['active']) ? ' aria-current="page"' : '';
      $items_html .= '<li class="aegov-nav__item"><a href="' . htmlspecialchars($item['url'] ?? '#') . '" class="aegov-nav__link"' . $active . '>' . htmlspecialchars($item['label'] ?? '') . '</a></li>';
    }

    return "<nav class=\"aegov-nav aegov-nav--{$variant}\" dir=\"{$dir}\" aria-label=\"Navigation\"><ul class=\"aegov-nav__list\">{$items_html}</ul></nav>\n";
  }

  protected function renderPagination(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $total = max(1, (int) ($d['total_pages'] ?? 10));
    $current = max(1, min($total, (int) ($d['current_page'] ?? 1)));
    $base = htmlspecialchars($d['base_url'] ?? '/page/');
    $show_pn = !empty($d['show_prev_next']);
    $html = $show_pn ? "<li class=\"aegov-pagination__item\"><a href=\"{$base}" . max(1, $current - 1) . "\" class=\"aegov-pagination__link" . ($current === 1 ? ' aegov-pagination__link--disabled' : '') . "\" aria-label=\"Previous\">&laquo;</a></li>" : '';
    for ($i = max(1, $current - 2); $i <= min($total, $current + 2); $i++) {
      $active = $i === $current ? ' aegov-pagination__link--active" aria-current="page' : '';
      $html .= "<li class=\"aegov-pagination__item\"><a href=\"{$base}{$i}\" class=\"aegov-pagination__link{$active}\">{$i}</a></li>";
    }
    if ($show_pn) {
      $html .= "<li class=\"aegov-pagination__item\"><a href=\"{$base}" . min($total, $current + 1) . "\" class=\"aegov-pagination__link" . ($current === $total ? ' aegov-pagination__link--disabled' : '') . "\" aria-label=\"Next\">&raquo;</a></li>";
    }

    return "<nav aria-label=\"Pagination\" dir=\"{$dir}\"><ul class=\"aegov-pagination\">{$html}</ul></nav>\n";
  }

  protected function renderTabs(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $variant = htmlspecialchars($d['variant'] ?? 'default');
    $tabs = is_array($d['tabs'] ?? null) ? $d['tabs'] : [];
    $tab_list = '';
    $panels = '';
    foreach ($tabs as $i => $tab) {
      $active = !empty($tab['active']) || $i === 0;
      $id = 'tab-' . $i;
      $tab_list .= "<button class=\"aegov-tabs__tab" . ($active ? ' aegov-tabs__tab--active' : '') . "\" role=\"tab\" aria-selected=\"" . ($active ? 'true' : 'false') . "\" aria-controls=\"panel-{$id}\" id=\"{$id}\">" . htmlspecialchars($tab['label'] ?? '') . "</button>";
      $panels .= "<div class=\"aegov-tabs__panel" . ($active ? ' aegov-tabs__panel--active' : '') . "\" role=\"tabpanel\" id=\"panel-{$id}\" aria-labelledby=\"{$id}\">" . htmlspecialchars($tab['content'] ?? '') . "</div>";
    }

    return "<div class=\"aegov-tabs aegov-tabs--{$variant}\" dir=\"{$dir}\"><div class=\"aegov-tabs__list\" role=\"tablist\">{$tab_list}</div><div class=\"aegov-tabs__panels\">{$panels}</div></div>\n";
  }

  protected function renderSteps(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $orientation = htmlspecialchars($d['orientation'] ?? 'horizontal');
    $steps = is_array($d['steps'] ?? null) ? $d['steps'] : [];
    $html = '';
    foreach ($steps as $i => $step) {
      $status = htmlspecialchars($step['status'] ?? 'pending');
      $label = htmlspecialchars($step['label'] ?? '');
      $desc = htmlspecialchars($step['description'] ?? '');
      $icon = $status === 'completed' ? '&#10003;' : ($i + 1);
      $desc_html = $desc ? "<span class=\"aegov-steps__desc\">{$desc}</span>" : '';
      $html .= "<li class=\"aegov-steps__item aegov-steps__item--{$status}\"><div class=\"aegov-steps__indicator\"><span class=\"aegov-steps__icon\">{$icon}</span></div><div class=\"aegov-steps__content\"><span class=\"aegov-steps__label\">{$label}</span>{$desc_html}</div></li>";
    }

    return "<ol class=\"aegov-steps aegov-steps--{$orientation}\" dir=\"{$dir}\">{$html}</ol>\n";
  }

  protected function renderDropdown(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $trigger = htmlspecialchars($d['trigger_text'] ?? 'Options');
    $placement = htmlspecialchars($d['placement'] ?? 'bottom');
    $items = is_array($d['items'] ?? null) ? $d['items'] : [];
    $items_html = '';
    foreach ($items as $item) {
      $items_html .= '<li role="none"><a href="' . htmlspecialchars($item['url'] ?? '#') . '" class="aegov-dropdown__item" role="menuitem">' . htmlspecialchars($item['label'] ?? '') . '</a></li>';
      if (!empty($item['divider'])) {
        $items_html .= '<li role="separator" class="aegov-dropdown__divider"></li>';
      }
    }

    return "<div class=\"aegov-dropdown\" data-placement=\"{$placement}\" dir=\"{$dir}\"><button class=\"aegov-btn aegov-btn--outline aegov-dropdown__trigger\" aria-haspopup=\"true\" aria-expanded=\"false\">{$trigger} <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg></button><ul class=\"aegov-dropdown__menu\" role=\"menu\" hidden>{$items_html}</ul></div>\n";
  }

  protected function renderPopover(array $d, string $lang): string {
    $trigger = htmlspecialchars($d['trigger_text'] ?? 'More info');
    $title = htmlspecialchars($d['title'] ?? '');
    $content = htmlspecialchars($d['content'] ?? '');
    $placement = htmlspecialchars($d['placement'] ?? 'top');

    return "<div class=\"aegov-popover-wrapper\"><button class=\"aegov-btn aegov-btn--outline\" data-popover-target=\"popover-1\" data-placement=\"{$placement}\">{$trigger}</button><div id=\"popover-1\" class=\"aegov-popover\" role=\"tooltip\" hidden>" . ($title ? "<div class=\"aegov-popover__title\">{$title}</div>" : '') . "<div class=\"aegov-popover__content\">{$content}</div></div></div>\n";
  }

  protected function renderTooltip(array $d, string $lang): string {
    $trigger = htmlspecialchars($d['trigger_text'] ?? 'Hover me');
    $content = htmlspecialchars($d['content'] ?? '');
    $placement = htmlspecialchars($d['placement'] ?? 'top');

    return "<span class=\"aegov-tooltip-wrapper\"><span class=\"aegov-tooltip-trigger\" data-tooltip=\"{$content}\" data-placement=\"{$placement}\">{$trigger}</span><span class=\"aegov-tooltip\" role=\"tooltip\">{$content}</span></span>\n";
  }

  protected function renderToast(array $d, string $lang): string {
    $message = htmlspecialchars($d['message'] ?? '');
    $type = htmlspecialchars($d['type'] ?? 'success');
    $position = htmlspecialchars($d['position'] ?? 'top-right');
    $duration = (int) ($d['duration'] ?? 3000);

    return "<div class=\"aegov-toast-container aegov-toast-container--{$position}\"><div class=\"aegov-toast aegov-toast--{$type}\" role=\"alert\" data-duration=\"{$duration}\"><span class=\"aegov-toast__message\">{$message}</span><button class=\"aegov-toast__close\" aria-label=\"Close\">&times;</button></div></div>\n";
  }

  protected function renderHyperlink(array $d, string $lang): string {
    $text = htmlspecialchars($d['text'] ?? 'Link');
    $url = htmlspecialchars($d['url'] ?? '#');
    $target = htmlspecialchars($d['target'] ?? '_self');
    $variant = htmlspecialchars($d['variant'] ?? 'default');
    $external = !empty($d['icon']) && $target === '_blank';
    $rel = $target === '_blank' ? ' rel="noopener noreferrer"' : '';
    $ext_icon = $external ? ' <svg class="aegov-hyperlink__ext-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' : '';

    return "<a href=\"{$url}\" class=\"aegov-hyperlink aegov-hyperlink--{$variant}\" target=\"{$target}\"{$rel}>{$text}{$ext_icon}</a>\n";
  }

  protected function renderNewsCardSlider(array $d, string $lang): string {
    $dir        = $lang === 'ar' ? 'rtl' : 'ltr';
    $items      = is_array($d['items'] ?? null) ? $d['items'] : [];
    $autoplay   = !empty($d['autoplay']) ? 'true' : 'false';
    $to_show    = (int) ($d['slides_to_show'] ?? 3);
    $show_dots  = !empty($d['show_dots']);
    $show_arr   = !empty($d['show_arrows']);
    $show_title = !empty($d['show_title']);
    $section_title = htmlspecialchars($d['title'] ?? 'Latest News');
    $bg = match($d['background'] ?? 'white') {
      'light' => 'background:#f8f9fa',
      'gold'  => 'background:#fdf8e7',
      default => '',
    };

    $arrow_icon = '<svg class="link-icon rtl:-scale-x-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><polyline points="144 56 216 128 144 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg>';

    $cards_html = '';
    foreach ($items as $item) {
      $img     = htmlspecialchars($item['image'] ?? '');
      $alt     = htmlspecialchars($item['image_alt'] ?? '');
      $date    = htmlspecialchars($item['date'] ?? '');
      $cat     = htmlspecialchars($item['category'] ?? '');
      $cat_url = htmlspecialchars($item['category_url'] ?? '#');
      $title   = htmlspecialchars($item['title'] ?? '');
      $excerpt = htmlspecialchars($item['excerpt'] ?? '');
      $url     = htmlspecialchars($item['link_url'] ?? '#');
      $lt      = htmlspecialchars($item['link_text'] ?? 'View details');
      $img_tag = $img ? "<a href=\"{$url}\"><img src=\"{$img}\" alt=\"{$alt}\" loading=\"lazy\"></a>" : '';
      $date_html = $date ? "<div class=\"text-aeblack-600 text-sm font-normal\">{$date}</div>" : '';
      $cat_html  = $cat  ? "<a href=\"{$cat_url}\" class=\"text-sm font-normal\">{$cat}</a>" : '';
      $sep_html  = ($date && $cat) ? '<span class="custom-divide-sep" aria-hidden="true"></span>' : '';

      $cards_html .= <<<CARD
<div>
  <div class="aegov-card card-news">
    {$img_tag}
    <div class="card-content">
      <div class="custom-divide custom-divide-sm flex flex-wrap">
        {$date_html}{$sep_html}{$cat_html}
      </div>
      <h5 class="max-md:text-lg line-clamp-3">{$title}</h5>
      <p class="line-clamp-3">{$excerpt}</p>
      <a href="{$url}" class="aegov-link">{$lt} {$arrow_icon}</a>
    </div>
  </div>
</div>
CARD;
    }

    // Navigation arrows
    $prev_btn = $show_arr ? '<button class="aegov-news-slider__prev" aria-label="Previous slide">&#8249;</button>' : '';
    $next_btn = $show_arr ? '<button class="aegov-news-slider__next" aria-label="Next slide">&#8250;</button>' : '';
    $title_html = $show_title ? "<h2 class=\"aegov-news-slider__title\">{$section_title}</h2>" : '';

    $dots_attr  = $show_dots ? 'true' : 'false';
    $arrow_attr = $show_arr  ? 'true' : 'false';

    return <<<HTML

<section class="aegov-news-slider" dir="{$dir}" style="{$bg}"
  data-slider-autoplay="{$autoplay}"
  data-slider-count="{$to_show}"
  data-slider-dots="{$dots_attr}"
  data-slider-arrows="{$arrow_attr}">
  <div class="aegov-news-slider__inner">
    {$title_html}
    <div class="aegov-news-slider__controls">
      {$prev_btn}
      {$next_btn}
    </div>
    <div class="news-card-slider aegovs-slider-style [&_.slick-slide]:mx-2.5 [&_.slick-list]:-mx-2.5 sm:[&_.slick-slide]:mx-3.5 sm:[&_.slick-list]:-mx-3.5">
      {$cards_html}
    </div>
  </div>
</section>

HTML;
  }

  // -------------------------------------------------------------------------
  // PATTERN RENDERERS
  // -------------------------------------------------------------------------

  protected function renderAddress(array $d, string $lang): string {
    $dir      = $lang === 'ar' ? 'rtl' : 'ltr';
    $mode     = $d['mode'] ?? 'within_country';
    $label    = htmlspecialchars($d['label'] ?? 'Address');
    $required = !empty($d['required']) ? ' required' : '';
    $req_star = !empty($d['required']) ? '<span style="color:#c0392b;margin-left:2px">*</span>' : '';

    // Shared input/select base styles (Tailwind-compatible + fallback)
    $input_style  = 'width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;color:#1f2937;background:#fff;box-sizing:border-box;outline:none;';
    $select_style = $input_style . 'appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b7280\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;cursor:pointer;';
    $label_style  = 'display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;';
    $group_style  = 'display:flex;flex-direction:column;';
    $row_style    = 'display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;';
    $row1_style   = 'display:grid;grid-template-columns:1fr;gap:16px;margin-bottom:16px;';
    $fieldset_style = 'border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;background:#fff;';

    $emirates_options = '';
    foreach (['Dubai','Abu Dhabi','Sharjah','Ajman','Umm Al Quwain','Fujairah','Ras Al Khaimah'] as $em) {
      $sel = ($d['emirate'] ?? 'Dubai') === $em ? ' selected' : '';
      $emirates_options .= "<option value=\"{$em}\"{$sel}>{$em}</option>";
    }

    // ── Display Card ──────────────────────────────────────────────────────────
    if ($mode === 'display_card') {
      $apartment    = htmlspecialchars($d['apartment']      ?? '706, The Metropolitan Tower B');
      $street_disp  = htmlspecialchars($d['street_display'] ?? 'Marasi Dr, Business Bay');
      $po_box       = htmlspecialchars($d['po_box']         ?? '123456');
      $city_disp    = htmlspecialchars($d['city_display']   ?? 'Dubai, Dubai');
      return <<<HTML
<div class="aegov-address-card" dir="{$dir}" style="display:inline-flex;align-items:flex-start;gap:14px;padding:20px 24px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:14px;color:#1f2937;line-height:1.8;">
  <span style="font-size:22px;color:#9A7A18;margin-top:2px;flex-shrink:0;">📍</span>
  <address style="font-style:normal;">
    <div style="font-weight:600;">{$apartment}</div>
    <div>{$street_disp}</div>
    <div>P.O. Box · {$po_box}</div>
    <div>{$city_disp}</div>
  </address>
</div>
HTML;
    }

    // ── Outside Country ───────────────────────────────────────────────────────
    if ($mode === 'outside_country') {
      return <<<HTML
<fieldset style="{$fieldset_style}" dir="{$dir}">
  <legend style="font-size:16px;font-weight:700;color:#1f2937;padding:0 6px;">{$label}</legend>
  <div style="{$row1_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">Address Details</label>
      <input type="text" name="address_details" style="{$input_style}" placeholder="Complete address, including apartment, street address … etc"{$required}>
    </div>
  </div>
  <div style="{$row_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">P.O. Box / ZIP Code</label>
      <input type="text" name="po_box" style="{$input_style}" placeholder="Your P.O. Box number (optional)">
    </div>
    <div style="{$group_style}">
      <label style="{$label_style}">Additional Landmarks</label>
      <input type="text" name="landmark" style="{$input_style}" placeholder="Any additional landmark details (optional)">
    </div>
  </div>
  <div style="{$row_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">City</label>
      <input type="text" name="city" style="{$input_style}" placeholder="Your city of residence"{$required}>
    </div>
    <div style="{$group_style}">
      <label style="{$label_style}">State</label>
      <input type="text" name="state" style="{$input_style}" placeholder="Enter the state (optional)">
    </div>
  </div>
  <div style="{$row1_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">Country</label>
      <select name="country" style="{$select_style}"{$required}>
        <option value="">— select your country —</option>
        <option>United Arab Emirates</option>
        <option>United Kingdom</option>
        <option>United States</option>
        <option>India</option>
        <option>Pakistan</option>
        <option>Philippines</option>
        <option>Egypt</option>
        <option>Other</option>
      </select>
    </div>
  </div>
</fieldset>
HTML;
    }

    // ── Within Country (default) ──────────────────────────────────────────────
    $show_landmark = ($d['show_landmark'] ?? TRUE) !== FALSE && ($d['show_landmark'] ?? '1') !== '0';
    $landmark_row = $show_landmark ? <<<HTML
  <div style="{$row_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">P.O. Box</label>
      <input type="text" name="po_box" style="{$input_style}" placeholder="Your P.O. Box number (optional)">
    </div>
    <div style="{$group_style}">
      <label style="{$label_style}">Additional Landmarks</label>
      <input type="text" name="landmark" style="{$input_style}" placeholder="Any additional landmark details (optional)">
    </div>
  </div>
HTML : '';

    return <<<HTML
<fieldset style="{$fieldset_style}" dir="{$dir}">
  <legend style="font-size:16px;font-weight:700;color:#1f2937;padding:0 6px;">{$label}{$req_star}</legend>
  <div style="{$row_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">Emirate</label>
      <select name="emirate" style="{$select_style}"{$required}>
        {$emirates_options}
      </select>
    </div>
    <div style="{$group_style}">
      <label style="{$label_style}">City</label>
      <select name="city" style="{$select_style}"{$required}>
        <option value="Dubai">Dubai</option>
        <option value="Abu Dhabi">Abu Dhabi</option>
        <option value="Sharjah">Sharjah</option>
      </select>
    </div>
  </div>
  <div style="{$row_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">Apartment / Villa Number</label>
      <input type="text" name="apartment" style="{$input_style}" placeholder="Your apartment or villa number"{$required}>
    </div>
    <div style="{$group_style}">
      <label style="{$label_style}">Building / Community Name</label>
      <input type="text" name="building" style="{$input_style}" placeholder="Your building or community name">
    </div>
  </div>
  <div style="{$row_style}">
    <div style="{$group_style}">
      <label style="{$label_style}">Street Address</label>
      <input type="text" name="street" style="{$input_style}" placeholder="Your street name or number"{$required}>
    </div>
    <div style="{$group_style}">
      <label style="{$label_style}">Area</label>
      <select name="area" style="{$select_style}">
        <option value="">— select your area —</option>
        <option>Business Bay</option>
        <option>Downtown Dubai</option>
        <option>Deira</option>
        <option>Jumeirah</option>
        <option>Al Barsha</option>
        <option>Marina</option>
        <option>Other</option>
      </select>
    </div>
  </div>
  {$landmark_row}
</fieldset>
HTML;
  }

  protected function renderContactNumber(array $d, string $lang): string {
    $label = htmlspecialchars($d['label'] ?? 'Contact Number');
    $mode = $d['mode'] ?? 'input';
    $value = htmlspecialchars($d['value'] ?? '');
    if ($mode === 'display') {
      return "<div class=\"aegov-contact-number\"><a href=\"tel:" . preg_replace('/\s+/', '', $value) . "\">{$value}</a></div>\n";
    }
    $code = htmlspecialchars($d['country_code'] ?? '+971');
    $id = 'phone-' . uniqid();
    return "<div class=\"aegov-form-group\"><label for=\"{$id}\" class=\"aegov-label\">{$label}</label><div class=\"aegov-phone-input\"><span class=\"aegov-phone-input__code\">{$code}</span><input type=\"tel\" id=\"{$id}\" name=\"phone\" class=\"aegov-input\" placeholder=\"XX XXX XXXX\" pattern=\"[0-9]{2}\s[0-9]{3}\s[0-9]{4}\"></div></div>\n";
  }

  protected function renderCurrencySymbol(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $label = htmlspecialchars($d['label'] ?? 'Amount');
    $mode = $d['mode'] ?? 'display';
    $value = htmlspecialchars($d['value'] ?? '0.00');
    $currency = htmlspecialchars($d['currency'] ?? 'AED');
    if ($mode === 'display') {
      return "<div class=\"aegov-currency\" dir=\"{$dir}\"><span class=\"aegov-currency__label\">{$label}:</span> <strong class=\"aegov-currency__value\">{$currency} {$value}</strong></div>\n";
    }
    $placeholder = htmlspecialchars($d['placeholder'] ?? '0.00');
    $id = 'currency-' . uniqid();
    return "<div class=\"aegov-form-group\" dir=\"{$dir}\"><label for=\"{$id}\" class=\"aegov-label\">{$label}</label><div class=\"aegov-currency-input\"><span class=\"aegov-currency-input__symbol\">{$currency}</span><input type=\"number\" id=\"{$id}\" name=\"amount\" class=\"aegov-input\" placeholder=\"{$placeholder}\" step=\"0.01\" min=\"0\"></div></div>\n";
  }

  protected function renderDate(array $d, string $lang): string {
    $label = htmlspecialchars($d['label'] ?? 'Date');
    $mode = $d['mode'] ?? 'input';
    $value = htmlspecialchars($d['value'] ?? '');
    if ($mode === 'display') {
      return "<time class=\"aegov-date\" datetime=\"{$value}\">{$value}</time>\n";
    }
    $required = !empty($d['required']) ? ' required' : '';
    $min = !empty($d['min_date']) ? ' min="' . htmlspecialchars($d['min_date']) . '"' : '';
    $max = !empty($d['max_date']) ? ' max="' . htmlspecialchars($d['max_date']) . '"' : '';
    $id = 'date-' . uniqid();
    return "<div class=\"aegov-form-group\"><label for=\"{$id}\" class=\"aegov-label\">{$label}</label><input type=\"date\" id=\"{$id}\" name=\"date\" class=\"aegov-input\"{$required}{$min}{$max}></div>\n";
  }

  protected function renderEmiratesId(array $d, string $lang): string {
    $label = htmlspecialchars($d['label'] ?? 'Emirates ID');
    $mode = $d['mode'] ?? 'input';
    $value = htmlspecialchars($d['value'] ?? '');
    if ($mode === 'display') {
      return "<div class=\"aegov-emirates-id\"><span class=\"aegov-label\">{$label}:</span> <strong>{$value}</strong></div>\n";
    }
    $required = !empty($d['required']) ? ' required' : '';
    $placeholder = htmlspecialchars($d['placeholder'] ?? '784-XXXX-XXXXXXX-X');
    $helper = htmlspecialchars($d['helper_text'] ?? '');
    $id = 'eid-' . uniqid();
    return "<div class=\"aegov-form-group\"><label for=\"{$id}\" class=\"aegov-label\">{$label}</label><input type=\"text\" id=\"{$id}\" name=\"emirates_id\" class=\"aegov-input\" placeholder=\"{$placeholder}\" pattern=\"784-[0-9]{4}-[0-9]{7}-[0-9]{1}\" inputmode=\"numeric\" maxlength=\"18\"{$required}>" . ($helper ? "<span class=\"aegov-field-helper\">{$helper}</span>" : '') . "</div>\n";
  }

  protected function renderName(array $d, string $lang): string {
    $dir = $lang === 'ar' ? 'rtl' : 'ltr';
    $label = htmlspecialchars($d['label'] ?? 'Full Name');
    $mode = $d['mode'] ?? 'input';
    $value = htmlspecialchars($d['value'] ?? '');
    if ($mode === 'display') {
      return "<div class=\"aegov-name\" dir=\"{$dir}\">{$value}</div>\n";
    }
    $show_title = !empty($d['show_title']);
    $show_middle = !empty($d['show_middle_name']);
    $bilingual = !empty($d['bilingual']);
    $required = !empty($d['required']) ? ' required' : '';
    $title_html = $show_title ? '<div class="aegov-form-group"><label class="aegov-label">Title</label><select class="aegov-select" name="name_title"><option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option><option>Eng.</option></select></div>' : '';
    $middle_html = $show_middle ? '<div class="aegov-form-group"><label class="aegov-label">Middle Name</label><input type="text" name="middle_name" class="aegov-input" placeholder="Middle name"></div>' : '';
    $ar_html = $bilingual ? '<div class="aegov-name__arabic" dir="rtl"><div class="aegov-form-group"><label class="aegov-label">الاسم الأول</label><input type="text" name="first_name_ar" class="aegov-input" placeholder="الاسم الأول" lang="ar"></div><div class="aegov-form-group"><label class="aegov-label">اسم العائلة</label><input type="text" name="last_name_ar" class="aegov-input" placeholder="اسم العائلة" lang="ar"></div></div>' : '';

    return "<fieldset class=\"aegov-pattern-name\" dir=\"{$dir}\"><legend class=\"aegov-label\">{$label}</legend><div class=\"aegov-pattern-name__fields\">{$title_html}<div class=\"aegov-form-group\"><label class=\"aegov-label\">First Name</label><input type=\"text\" name=\"first_name\" class=\"aegov-input\" placeholder=\"First name\"{$required}></div>{$middle_html}<div class=\"aegov-form-group\"><label class=\"aegov-label\">Last Name</label><input type=\"text\" name=\"last_name\" class=\"aegov-input\" placeholder=\"Last name\"{$required}></div></div>{$ar_html}</fieldset>\n";
  }

  /**
   * Copy CSS and JS assets to the export folder.
   */
  protected function writeAssets(string $assets_dir): void {
    $module_path = \Drupal::service('extension.list.module')->getPath('aegov_page_builder');
    $css_src = DRUPAL_ROOT . '/' . $module_path . '/css/aegov.min.css';
    $js_src = DRUPAL_ROOT . '/' . $module_path . '/js/aegov.bundle.js';

    if (file_exists($css_src)) {
      copy($css_src, $assets_dir . '/aegov.min.css');
    }
    else {
      file_put_contents($assets_dir . '/aegov.min.css', $this->getFallbackCss());
    }

    if (file_exists($js_src)) {
      copy($js_src, $assets_dir . '/aegov.bundle.js');
    }
    else {
      file_put_contents($assets_dir . '/aegov.bundle.js', $this->getFallbackJs());
    }
  }

  /**
   * Fallback CSS if the compiled file isn't present yet.
   * Contains the core AEGov Design System styles.
   */
  protected function getFallbackCss(): string {
    return file_get_contents(DRUPAL_ROOT . '/' . \Drupal::service('extension.list.module')->getPath('aegov_page_builder') . '/css/aegov.min.css') ?: '/* AEGov CSS — run npm install to compile */';
  }

  protected function getFallbackJs(): string {
    return file_get_contents(DRUPAL_ROOT . '/' . \Drupal::service('extension.list.module')->getPath('aegov_page_builder') . '/js/aegov.bundle.js') ?: '/* AEGov JS — run npm install to compile */';
  }

}
