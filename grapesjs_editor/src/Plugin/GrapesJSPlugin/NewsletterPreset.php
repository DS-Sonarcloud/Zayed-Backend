<?php

namespace Drupal\grapesjs_editor\Plugin\GrapesJSPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\grapesjs_editor\GrapesJSPluginBase;

/**
 * Defines the "newsletter_preset" plugin.
 *
 * @GrapesJSPlugin(
 *   id = "newsletter_preset",
 *   label = @Translation("Newsletter Preset"),
 *   module = "grapesjs_editor"
 * )
 */
class NewsletterPreset extends GrapesJSPluginBase
{

  /**
   * {@inheritDoc}
   */
  public function getLibraries(Editor $editor)
  {
    return [
      'grapesjs_editor/newsletter_preset',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor)
  {
    return [
      'grapesSettings' => [
        'plugins' => [
          'grapesjs-preset-newsletter',
        ],
        'pluginsOpts' => [
          'grapesjs-preset-newsletter' => [
            'modalTitleImport' => 'Import template',
          ],
        ],
      ],
    ];
  }

}
