<?php

namespace Drupal\email_marketing\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\Response;

/**
 * Controller for email template preview.
 */
class EmailTemplatePreviewController extends ControllerBase
{
    public function preview(NodeInterface $node)
    {
        if ($node->bundle() !== 'email_template') {
            return new Response('Invalid node type.', 400);
        }
        if (strpos($content, '<html') === FALSE) {
            $grapesjs_css = 'https://unpkg.com/grapesjs@0.22.14/dist/css/grapes.min.css';
            
            $head_tags = [
                '<meta charset="UTF-8">',
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                '<link rel="stylesheet" href="' . $grapesjs_css . '">',
                '<style>body { margin: 0; padding: 0; font-family: sans-serif; }</style>'
            ];

            $content = '<!DOCTYPE html><html><head>' . implode('', $head_tags) . '</head><body>' . $content . '</body></html>';
        }
        return new Response($content);
    }

}
