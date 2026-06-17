<?php

namespace Drupal\grapesjs_editor\Plugin\GrapesJSPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\grapesjs_editor\GrapesJSPluginBase;

/**
 * Defines the "drupal_unsubscribe" plugin.
 *
 * @GrapesJSPlugin(
 *   id = "drupal_unsubscribe",
 *   label = @Translation("Unsubscribe"),
 *   module = "grapesjs_editor"
 * )
 */
class DrupalUnsubscribe extends GrapesJSPluginBase
{

    /**
     * {@inheritDoc}
     */
    public function getLibraries(Editor $editor)
    {
        return [
            'grapesjs_editor/drupal-unsubscribe',
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
                    'drupal-unsubscribe',
                ],
                'pluginsOpts' => [
                    'drupal-unsubscribe' => [],
                ],
            ],
        ];
    }

}
