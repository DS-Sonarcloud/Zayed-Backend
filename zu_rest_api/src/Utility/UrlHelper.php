<?php

namespace Drupal\zu_rest_api\Utility;

/**
 * Static URL normalization and transformation utilities for deploy operations.
 */
class UrlHelper {

  /**
   * Normalize a URL: strip domain, fix slashes, fix double language prefixes.
   */
  public static function normalizeUrl(string $url): string {
    $url = strtolower(trim($url));
    // Remove domain.
    $url = preg_replace('#^https?://[^/]+#', '', $url);
    // Collapse multiple slashes.
    $url = preg_replace('#/+#', '/', $url);
    // Fix double language prefixes like /en/en/ or /ar/ar/.
    $url = preg_replace('#^/(en|ar)/\1/#', '/$1/', $url);
    return $url;
  }

  /**
   * Detect langcode ('en' or 'ar') from a URL path.
   */
  public static function detectLangFromUrl(string $url): string {
    $url = self::normalizeUrl($url);
    if (preg_match('#^/ar(/|$)#', $url)) {
      return 'ar';
    }
    return 'en';
  }

  /**
   * Strip language prefix (/en/ or /ar/) from URL.
   */
  public static function stripLangPrefix(string $url): string {
    return preg_replace('#^/(en|ar)(/|$)#', '/', $url);
  }

  /**
   * Strip a specific path prefix (e.g. /blog/, /jobs/).
   */
  public static function stripPathPrefix(string $url, string $prefix): string {
    $prefix = '/' . trim($prefix, '/') . '/';
    return preg_replace('#^' . preg_quote($prefix, '#') . '#', '/', $url);
  }

  /**
   * Ensure a URL has a specific path prefix (e.g. /event-calendar/).
   */
  public static function ensurePathPrefix(string $url, string $prefix): string {
    $prefix = '/' . trim($prefix, '/') . '/';
    if (!preg_match('#^' . preg_quote($prefix, '#') . '#', $url)) {
      $url = rtrim($prefix, '/') . $url;
    }
    return $url;
  }

  /**
   * Fix inline <img> src attributes: prepend baseDomain to relative paths.
   */
  public static function fixInlineImageUrls(string $html, string $baseDomain): string {
    return preg_replace(
      '#(<img[^>]+src=["\'])(/sites/default/files/[^"\']+)#i',
      '$1' . $baseDomain . '$2',
      $html
    );
  }

  /**
   * Prepend baseDomain to a relative image/file URL if it doesn't start with http.
   */
  public static function absolutizeUrl(string $url, string $baseDomain): string {
    if (!empty($url) && strpos($url, 'http') !== 0) {
      return $baseDomain . $url;
    }
    return $url;
  }

}
