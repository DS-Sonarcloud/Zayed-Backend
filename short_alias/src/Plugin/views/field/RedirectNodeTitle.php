<?php

namespace Drupal\short_alias\Plugin\views\field;

use Drupal\views\Plugin\views\field\FieldPluginBase;
use Drupal\views\ResultRow;
use Drupal\node\Entity\Node;

/**
 * Custom views field to display node title and language for redirects.
 *
 * @ViewsField("redirect_node_title")
 */
class RedirectNodeTitle extends FieldPluginBase
{

  /**
   * {@inheritdoc}
   */
  public function query() {}

  /**
   * {@inheritdoc}
   */
  public function render(ResultRow $values)
  {
    /** @var \Drupal\redirect\Entity\Redirect $redirect */
    $redirect = $values->_entity;

    if (!$redirect || !$redirect instanceof \Drupal\redirect\Entity\Redirect) {
      return '';
    }

    try {
      $redirect_url = $redirect->getRedirectUrl();
      // Use toUriString() instead of getUri() to avoid routed URL exceptions.
      $destination_uri = $redirect_url->toUriString();

      // Get the target language from redirect options (not redirect entity language)
      $language_option = $redirect_url->getOption('language');
      if ($language_option instanceof \Drupal\Core\Language\LanguageInterface) {
        $langcode = $language_option->getId();
      } elseif (is_string($language_option)) {
        $langcode = $language_option;
      } else {
        $langcode = 'und';
      }

      // Extract node ID from internal:/node/123, entity:/node/123, or entity:node/123
      if (preg_match('/node\/(\d+)/', $destination_uri, $matches)) {
        $node_id = $matches[1];
        $node = Node::load($node_id);

        if ($node) {
          // Get the title in the redirect's target language
          if ($langcode !== 'und' && $node->hasTranslation($langcode)) {
            $translated_node = $node->getTranslation($langcode);
            $title = $translated_node->getTitle();
          } else {
            $title = $node->getTitle();
          }

          $lang_map = ['en' => 'English', 'ar' => 'Arabic'];
          $language_name = $lang_map[$langcode] ?? $langcode;
          return $this->t('@title (@lang)', [
            '@title' => $title,
            '@lang' => $language_name,
          ]);
        }
      }

      // For non-node redirects, show the destination URI
      return $destination_uri;
    } catch (\Exception $e) {
      return '';
    }
  }

}
