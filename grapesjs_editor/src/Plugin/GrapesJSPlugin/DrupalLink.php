<?php

namespace Drupal\grapesjs_editor\Plugin\GrapesJSPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\grapesjs_editor\GrapesJSPluginBase;

/**
 * Defines the "drupal_link" plugin.
 *
 * @GrapesJSPlugin(
 *   id = "drupal_link",
 *   label = @Translation("Link"),
 *   module = "grapesjs_editor"
 * )
 */
class DrupalLink extends GrapesJSPluginBase
{

    /**
     * {@inheritDoc}
     */
    public function getLibraries(Editor $editor)
    {
        return [
            'grapesjs_editor/drupal-link',
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
                    'drupal-link',
                ],
            ],
        ];
    }
}
