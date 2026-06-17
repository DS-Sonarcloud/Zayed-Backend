<?php

namespace Drupal\grapesjs_editor\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\grapesjs_editor\Services\BlockManager;
use Drupal\grapesjs_editor\Services\FieldManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Returns responses for Block routes.
 */
class BlockController extends ControllerBase
{

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * The block manager.
   *
   * @var \Drupal\grapesjs_editor\Services\BlockManager
   */
  protected $blockManager;

  /**
   * The field manager.
   *
   * @var \Drupal\grapesjs_editor\Services\FieldManager
   */
  protected $fieldManager;

  /**
   * BlockController constructor.
   *
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   * @param \Drupal\grapesjs_editor\Services\BlockManager $block_manager
   *   The block manager.
   * @param \Drupal\grapesjs_editor\Services\FieldManager $field_manager
   *   The field manager.
   */
  public function __construct(RendererInterface $renderer, BlockManager $block_manager, FieldManager $field_manager)
  {
    $this->renderer = $renderer;
    $this->blockManager = $block_manager;
    $this->fieldManager = $field_manager;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('renderer'),
      $container->get('grapesjs_editor.block_manager'),
      $container->get('grapesjs_editor.field_manager')
    );
  }

  /**
   * Returns a Json response with the block render.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The Json response.
   *
   * @throws \Drupal\Component\Plugin\Exception\PluginException
   *   Thrown if the plugin is invalid.
   */
  public function block(Request $request)
  {
    if ($plugin_id = $request->get('block-plugin-id')) {
      $configuration = [];
      $nids = [];

      // Handle widget-specific configuration
      if ($plugin_id === 'grapesjs_widget_block') {
        $content_type = $request->get('content-type');
        $node_id = $request->get('node-id');
        $selected_fields = $request->get('selected-fields');

        if ($content_type) {
          $configuration['content_type'] = $content_type;
        }
        if ($node_id) {
          $configuration['node_id'] = $node_id;
        }
        if ($selected_fields) {
          $configuration['selected_fields'] = is_array($selected_fields)
            ? $selected_fields
            : explode(',', $selected_fields);
        }
      }

      // Handle standard block configuration 
      if ($val = $request->get('selected-nids')) {
        $nids[] = $val;
      }
      if ($text = $request->get('selected-nids-text')) {
        $nids = array_merge($nids, explode(',', $text));
      }

      if (!empty($nids)) {
        $configuration['selected_nids'] = array_filter(array_map('trim', $nids));
      }

      if ($block = $this->blockManager->getBlock($plugin_id)) {
        return new JsonResponse($this->blockManager->renderBlock($block, $configuration));
      }

      return new JsonResponse($this->t('Block access is forbidden'), Response::HTTP_FORBIDDEN);
    }

    return new JsonResponse($this->t('Block not found'), Response::HTTP_NOT_FOUND);
  }

  /**
   * Returns a Json response with the field render.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The Json response.
   *
   * @throws \Exception
   *   Thrown if renderer failed.
   */
  public function field(Request $request)
  {
    if ($name = $request->query->get('field-name')) {
      if ($field = $this->fieldManager->getField($name)) {
        if ($render = $this->fieldManager->renderField($field)) {
          return new JsonResponse($render);
        } else {
          return new JsonResponse($this->t('Entity must be saved for the preview to be visible.'));
        }
      }

      return new JsonResponse($this->t('Field access is forbidden'), Response::HTTP_FORBIDDEN);
    }

    return new JsonResponse($this->t('Field not found'), Response::HTTP_NOT_FOUND);
  }

  /**
   * Returns field definitions for a content type.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The Json response with field definitions.
   */
  public function getContentTypeFields(Request $request)
  {
    $content_type = $request->query->get('content_type');

    if (empty($content_type)) {
      return new JsonResponse($this->t('Content type is required'), Response::HTTP_BAD_REQUEST);
    }

    try {
      $entity_field_manager = \Drupal::service('entity_field.manager');
      $field_definitions = $entity_field_manager->getFieldDefinitions('node', $content_type);

      $fields = [];
      foreach ($field_definitions as $field_name => $field_definition) {
        // Skip base fields that are not useful for display
        if (in_array($field_name, ['nid', 'uuid', 'vid', 'langcode', 'type', 'revision_timestamp', 'revision_uid', 'revision_log', 'status', 'uid', 'created', 'changed', 'promote', 'sticky', 'default_langcode', 'revision_default', 'revision_translation_affected', 'content_translation_source', 'content_translation_outdated'])) {
          continue;
        }

        $fields[] = [
          'name' => $field_name,
          'label' => $field_definition->getLabel(),
          'type' => $field_definition->getType(),
          'required' => $field_definition->isRequired(),
        ];
      }

      return new JsonResponse($fields);
    } catch (\Exception $e) {
      \Drupal::logger('grapesjs_editor')->error('Error fetching content type fields: @message', ['@message' => $e->getMessage()]);
      return new JsonResponse($this->t('Error fetching fields'), Response::HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Returns nodes by content type.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request object.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The Json response with nodes.
   */
  public function getNodesByType(Request $request)
{
  $content_type = $request->query->get('content_type');
  $search = $request->query->get('search', '');

  if (empty($content_type)) {
    return new JsonResponse($this->t('Content type is required'), Response::HTTP_BAD_REQUEST);
  }

  try {
    $query = \Drupal::entityQuery('node')
      ->condition('type', $content_type)
      ->condition('status', 1)
      ->sort('nid', 'DESC')
      ->accessCheck(TRUE)
      ->range(0, 100);

    if (!empty($search)) {
      $query->condition('title', '%' . $search . '%', 'LIKE');
    }

    $nids = $query->execute();

    if (empty($nids)) {
      return new JsonResponse([]);
    }

    $storage = \Drupal::entityTypeManager()->getStorage('node');
    $nodes = $storage->loadMultiple($nids);

    $result = [];

    foreach ($nids as $nid) {
      if (isset($nodes[$nid])) {
        $result[] = [
          'id' => $nid,
          'title' => $nodes[$nid]->label(),
        ];
      }
    }

    return new JsonResponse($result);
  }
  catch (\Exception $e) {
    \Drupal::logger('grapesjs_editor')->error(
      'Error fetching nodes: @message',
      ['@message' => $e->getMessage()]
    );
    return new JsonResponse(
      $this->t('Error fetching nodes'),
      Response::HTTP_INTERNAL_SERVER_ERROR
    );
  }
}
}
