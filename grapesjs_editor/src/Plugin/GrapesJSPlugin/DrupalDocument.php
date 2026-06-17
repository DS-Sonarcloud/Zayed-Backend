<?php

namespace Drupal\grapesjs_editor\Plugin\GrapesJSPlugin;

use Drupal\Core\Url;
use Drupal\editor\Entity\Editor;
use Drupal\grapesjs_editor\GrapesJSPluginBase;

/**
 * Defines the "drupal_document" plugin.
 *
 * @GrapesJSPlugin(
 *   id = "drupal_document",
 *   label = @Translation("Document"),
 *   module = "grapesjs_editor"
 * )
 */
class DrupalDocument extends GrapesJSPluginBase
{

  /**
   * {@inheritDoc}
   */
  public function getLibraries(Editor $editor)
  {
    return [
      'grapesjs_editor/drupal-document',
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
          'drupal-document',
        ],
        'pluginsOpts' => [
          'drupal-document' => [
            'list_url' => Url::fromRoute('grapesjs_editor.get_documents')->toString(),
            'upload_url' => Url::fromRoute('grapesjs_editor.upload_documents')->toString(),
          ],
        ],
      ],
    ];
  }
}
