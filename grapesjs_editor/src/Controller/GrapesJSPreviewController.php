<?php

namespace Drupal\grapesjs_editor\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\TempStore\PrivateTempStoreFactory;
use Drupal\node\Entity\Node;
use Drupal\Component\Utility\Crypt;

/**
 * Controller for GrapesJS preview.
 */
class GrapesJSPreviewController extends ControllerBase
{

  /**
   * The tempstore factory.
   *
   * @var \Drupal\Core\TempStore\PrivateTempStoreFactory
   */
  protected $tempStoreFactory;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a new GrapesJSPreviewController.
   */
  public function __construct(PrivateTempStoreFactory $temp_store_factory, $entity_type_manager)
  {
    $this->tempStoreFactory = $temp_store_factory;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('tempstore.private'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * Saves node data to tempstore for preview and returns the UUID.
   */
  public function savePreview(Request $request)
  {
    $title = $request->request->get('title');
    $body = $request->request->get('body');
    $nid = $request->request->get('nid');

    // Create a dummy node or load existing to hold preview data
    if ($nid && is_numeric($nid)) {
      $node = $this->entityTypeManager->getStorage('node')->load($nid);
      if ($node) {
        $node = clone $node;
      }
    }

    if (empty($node)) {
      $node = Node::create(['type' => 'email_template']);
    }

    if ($node instanceof \Drupal\node\NodeInterface) {
      $node->set('title', $title ?: 'Preview');
      if ($node->hasField('body')) {
        $node->set('body', [
          'value' => $body,
          'format' => 'grapesjs_editor',
        ]);
      }
    }

    $node->in_preview = TRUE;
    $uuid = Crypt::randomBytesBase64(12); // Short unique ID for tempstore key

    $store = $this->tempStoreFactory->get('node_preview');
    $store->set($uuid, $node);

    return new JsonResponse(['uuid' => $uuid]);
  }

  /**
   * Renders the node body as a raw HTML preview from tempstore.
   *
   * @param string $node_preview
   *   The UUID of the node preview in tempstore.
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   The raw HTML response.
   */
  public function preview($node_preview)
  {
    $store = $this->tempStoreFactory->get('node_preview');
    $node = $store->get($node_preview);

    // If not in tempstore, try loading from database if it's numeric/NID
    if (!$node instanceof \Drupal\node\NodeInterface && is_numeric($node_preview)) {
      $node = $this->entityTypeManager->getStorage('node')->load($node_preview);
    }

    if (!$node instanceof \Drupal\node\NodeInterface) {
      return new Response($this->t('Preview not found or expired. Please go back and click Preview again.'), 404);
    }

    $body = '';
    if ($node->hasField('body')) {
      $body = $node->get('body')->value;

      // If the body is already a full HTML document
      if (preg_match('/<!doctype\s+html|<html[\s>]/i', $body)) {
        $response = new Response($body);
        $response->headers->set('Content-Type', 'text/html');
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return $response;
      }

      // For content fragments, run through Drupal text filters.
      $build = [
        '#type' => 'processed_text',
        '#text' => $body,
        '#format' => 'grapesjs_editor',
        '#cache' => ['max-age' => 0],
      ];
      $body = (string) \Drupal::service('renderer')->renderPlain($build);

      if (function_exists('_grapesjs_editor_clean_content')) {
        $body = _grapesjs_editor_clean_content($body);
      }
    }

    // Wrap content fragments in a basic HTML structure.
    $html = '<!DOCTYPE html><html><head><meta charset="utf-8">';
    $html .= '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    $html .= '<style>body { margin: 0; padding: 0; }</style>';
    $html .= '</head><body>';
    $html .= $body;
    $html .= '<!-- Preview generated at ' . time() . ' -->';
    $html .= '</body></html>';

    $response = new Response($html);
    $response->headers->set('Content-Type', 'text/html');
    return $response;
  }
}
