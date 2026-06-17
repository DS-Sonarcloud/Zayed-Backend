<?php

namespace Drupal\grapesjs_editor\Plugin\GrapesJSPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\grapesjs_editor\GrapesJSPluginBase;

/**
 * Defines the "mjml_preset" plugin.
 *
 * @GrapesJSPlugin(
 *   id = "mjml_preset",
 *   label = @Translation("MJML Preset"),
 *   module = "grapesjs_editor"
 * )
 */
class MjmlPreset extends GrapesJSPluginBase {

  /**
   * {@inheritDoc}
   */
  public function getLibraries(Editor $editor) {
    return [
      'grapesjs_editor/mjml_preset',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor) {
    return [
      'grapesSettings' => [
        'plugins' => [
          'grapesjs-mjml',
        ],
        'pluginsOpts' => [
          'grapesjs-mjml' => [
            'resetStyleManager' => TRUE,
            'columnsPadding' => '10px 0',
          ],
        ],
      ],
    ];
  }

}
