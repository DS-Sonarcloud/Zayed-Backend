<?php

namespace Drupal\email_layout\Email;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Render\RendererInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\node\Entity\Node;
use Pelago\Emogrifier\CssInliner;

class EmailLayoutSender {

  protected $entityTypeManager;
  protected $renderer;
  protected $mailManager;

  public function __construct(EntityTypeManagerInterface $entityTypeManager, RendererInterface $renderer, MailManagerInterface $mailManager) {
    $this->entityTypeManager = $entityTypeManager;
    $this->renderer = $renderer;
    $this->mailManager = $mailManager;
  }

  public function sendEmailFromLayout($nid, $to, $subject, $langcode = 'en', $from = NULL) {
    $node = Node::load($nid);
    if (!$node || $node->getType() !== 'email_template') {
      throw new \Exception("Invalid node or not an email template.");
    }

    $view_builder = $this->entityTypeManager->getViewBuilder('node');
    $render_array = $view_builder->view($node, 'full');

    // Render the HTML.
    $html = $this->renderer->renderRoot($render_array);

    // Your custom CSS.
    $css = '
    .layout {
      width: 100%;
      margin: 0 auto;
    }

    .layout__region {
      display: inline-block;
      vertical-align: top;
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
    }

    .layout--twocol-section .layout__region {
      width: 49%;
    }

    .layout--threecol-section .layout__region {
      width: 32%;
    }

    .layout--twocol-section--33-67 .layout__region--first {
      width: 32%;
    }

    .layout--twocol-section--33-67 .layout__region--second {
      width: 66%;
    }

    .layout--twocol-section--67-33 .layout__region--first {
      width: 66%;
    }

    .layout--twocol-section--67-33 .layout__region--second {
      width: 32%;
    }

    .block {
      padding: 10px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
    }
    ';

    // Inline CSS.
    $cssInliner = CssInliner::fromHtml($html)->inlineCss($css);
    $inlinedHtml = $cssInliner->render();

    // Build mail params.
    $params = [
      'subject' => $subject,
      'body' => $inlinedHtml,
      'headers' => [
        'Content-Type' => 'text/html; charset=UTF-8',
      ],
    ];

    // Send email.
    $result = $this->mailManager->mail('email_layout', 'layout_email', $to, $langcode, $params, $from, TRUE);

    return $result['result'];
  }

}
