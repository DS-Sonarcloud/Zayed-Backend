<?php

/**
 * @file
 * Contains \Drupal\elementor\Controller\ElementorController.
 */

namespace Drupal\elementor\Controller;

use Drupal;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Template\TwigEnvironment;
use Drupal\elementor\ElementorPlugin;
use Drupal\file\Entity\File;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Drupal\elementor\ElementorPageExporter;
use Drupal\node\Entity\Node;
use Drupal\elementor\ElementorTemplateController;
use Drupal\image\Entity\ImageStyle;
use Drupal\views\Views;
use Drupal\webform\Entity\Webform;
use Drupal\webform\Utility\WebformOptionsHelper;

class ElementorController extends ControllerBase implements ContainerInjectionInterface
{

    /**
     * @var Drupal\Core\Template\TwigEnvironment
     */
    protected $twig;

    public function __construct(TwigEnvironment $twig)
    {
        $this->twig = $twig;
    }

    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('twig')
        );
    }

    public function autosave(Request $request)
    {
        $return_data = $request->request->get('action');
        return new JsonResponse($return_data);
        // return new Response('', Response::HTTP_NOT_FOUND);
    }

    public function update(Request $request)
    {
        $actions = json_decode($request->request->get('actions'), true);

        // Handle save_builder action
        if (isset($actions['save_builder'])) {
            $this->processSaveBuilder($actions['save_builder']);
        }

        // Handle get_style_image_url action
        if (isset($_GET['action']) && $_GET['action'] == "get_style_image_url") {
            return $this->processGetStyleImageUrl($_GET);
        }

        // Handle render_widget actions
        if (!empty($actions) && is_array($actions)) {
            foreach ($actions as $action_id => $action_data) {
                if (
                    isset($action_data['action']) &&
                    $action_data['action'] === 'render_widget' &&
                    isset($action_data['data']['data']['settings']['blocks'])
                ) {
                    $blocks = $action_data['data']['data']['settings']['blocks'];
                    foreach ($blocks as $block) {
                        if (!empty($block['block_id']) && str_starts_with($block['block_id'], 'views_block:')) {
                            $this->updateViewBlock($block);
                        }
                    }
                }
            }
        }

        $elementor_page_data = [];
        $exporter = null;
        $nid = $request->request->get('editor_post_id');
        $actions_obj = json_decode($request->request->get('actions'));
        $return_data = ElementorPlugin::$instance->update($nid, $request);

        // Track webform usage when saving
        if (isset($actions_obj->save_builder->data->elements) && $nid) {
            $this->trackWebformUsage($nid, $actions_obj->save_builder->data->elements);
        }

        if (isset($actions_obj->save_builder->data->settings->deploy) && $actions_obj->save_builder->data->settings->deploy === 'yes') {
            $node = $nid ? Node::load($nid) : null;
            if ($node && !$node->isPublished()) {
                $return_data['export_result'] = [
                    'success' => false,
                    'message' => 'Unable to deploy: page is not published.',
                ];
            } else {
                $elementor_page_data = $actions_obj->save_builder->data ?? [];
                $exporter = ElementorPageExporter::export($nid, $elementor_page_data);
                $return_data['export_result'] = $exporter;
            }
        }

        return new JsonResponse($return_data);
    }

    /**
     * Track webform usage for a node.
     *
     */
    private function trackWebformUsage($nid, $elements)
    {
        try {
            $connection = \Drupal::database();

            // Check if table exists
            if (!$connection->schema()->tableExists('webform_usage')) {
                return;
            }

            $connection->delete('webform_usage')
                ->condition('node_id', $nid)
                ->execute();

            $webform_ids = $this->extractWebformIds($elements);

            $timestamp = time();
            $user_id = \Drupal::currentUser()->id();

            foreach ($webform_ids as $webform_id) {
                $connection->merge('webform_usage')
                    ->keys(['webform_id' => $webform_id])
                    ->fields([
                        'node_id' => $nid,
                        'used' => 1,
                        'used_at' => $timestamp,
                        'updated_at' => $timestamp,
                        'user_id' => $user_id,
                    ])
                    ->execute();
            }
        } catch (\Exception $e) {
            \Drupal::logger('elementor')->error('Error tracking webform usage: @msg', ['@msg' => $e->getMessage()]);
        }
    }

    /**
     * Extract webform IDs from Elementor elements recursively.
     *
     */
    private function extractWebformIds($elements)
    {
        $webform_ids = [];

        if (is_object($elements)) {
            $elements = (array) $elements;
        }

        if (!is_array($elements)) {
            return $webform_ids;
        }

        foreach ($elements as $element) {
            if (is_object($element)) {
                $element = (array) $element;
            }

            if (!is_array($element)) {
                continue;
            }

            if (isset($element['widgetType']) && $element['widgetType'] === 'drupal-webform') {
                if (isset($element['settings']) && isset($element['settings']->webform_id)) {
                    $webform_id = $element['settings']->webform_id;
                    if (!empty($webform_id)) {
                        $webform_ids[] = $webform_id;
                    }
                } elseif (isset($element['settings']['webform_id'])) {
                    $webform_id = $element['settings']['webform_id'];
                    if (!empty($webform_id)) {
                        $webform_ids[] = $webform_id;
                    }
                }
            }

            if (isset($element['elements'])) {
                $webform_ids = array_merge($webform_ids, $this->extractWebformIds($element['elements']));
            }
        }

        return array_unique($webform_ids);
    }

    private function processSaveBuilder($save_builder_data)
    {
        if (!isset($save_builder_data['data']['elements'])) {
            return;
        }

        $this->processElements($save_builder_data['data']['elements']);
    }

    private function processGetStyleImageUrl($request_data)
    {
        $action = $request_data['action'];
        $image_id = $request_data['image_id'];
        $image_size = $request_data['image_size'];

        $styles = ImageStyle::loadMultiple();

        foreach ($styles as $style) {
            $style_id = $style->id();
            if ($style_id == $image_size) {

                // Load the file entity using image_id
                $file = File::load($image_id);
                if ($file) {
                    $file_uri = $file->getFileUri();

                    // Styled file path
                    $styled_path = $style->buildUri($file_uri);

                    // Generate derivative if it doesn't exist
                    if (!file_exists($styled_path)) {
                        $style->createDerivative($file_uri, $styled_path);
                    }

                    // Styled image URL
                    $styled_url = $style->buildUrl($file_uri);

                    // Optionally width/height check
                    if (file_exists($styled_path)) {
                        $info = getimagesize($styled_path);
                        $width = $info[0];
                        $height = $info[1];
                    }

                    // $image_url = $styled_url;
                    return new JsonResponse($styled_url);
                }
            }
        }


        // Return the image URL as a JSON response
        return new JsonResponse(['image_url' => "null"]);
    }

    private function processElements($elements)
    {
        foreach ($elements as $element) {
            if ($element['elType'] === 'widget' && $element['widgetType'] === 'drupal-block') {
                if (isset($element['settings']['blocks'])) {
                    foreach ($element['settings']['blocks'] as $block) {
                        if (!empty($block['block_id']) && str_starts_with($block['block_id'], 'views_block:')) {
                            $this->updateViewBlock($block);
                        }
                    }
                }
            }

            // Recursively process nested elements
            if (!empty($element['elements'])) {
                $this->processElements($element['elements']);
            }
        }
    }

    public function updateViewBlock($block)
    {
        if (strpos($block['block_id'], 'views_block:') !== 0) {
            return 'Not a views block';
        }

        [, $view_display] = explode(':', $block['block_id']);
        [$view_id, $display_id] = explode('-', $view_display, 2);

        $view = \Drupal\views\Entity\View::load($view_id);
        if (!$view) {
            return 'View not found';
        }

        $displays = $view->get('display');
        if (empty($displays[$display_id])) {
            return 'Display not found';
        }

        if (!empty($block['layout_type'])) {
            if (!isset($displays[$display_id]['display_options'])) {
                $displays[$display_id]['display_options'] = [];
            }

            // Style settings
            $displays[$display_id]['display_options']['defaults']['style'] = FALSE;
            $style_options = $this->buildStyleOptions($block);
            $displays[$display_id]['display_options']['style'] = [
                'type' => $block['layout_type'],
                'options' => $style_options,
            ];

            // Row settings
            if (!empty($block['row_type'])) {
                $displays[$display_id]['display_options']['defaults']['row'] = FALSE;
                $row_options = $this->buildRowOptions($block);
                $displays[$display_id]['display_options']['row'] = [
                    'type' => $block['row_type'],
                    'options' => $row_options,
                ];
            }

            $view->set('display', $displays);
            $view->save();
            \Drupal::service('cache_tags.invalidator')->invalidateTags(['views', 'config:view.view.' . $view_id]);

            return 'View updated successfully';
        }

        return 'No layout type provided';
    }

    private function buildStyleOptions($block)
    {
        $layout_type = $block['layout_type'];
        $options = [];

        switch ($layout_type) {
            case 'grid':
            case 'grid_responsive':
                $options = [
                    'columns' => $block['grid_columns'] ?? 3,
                    'alignment' => $block['grid_alignment'] ?? 'horizontal',
                    'row_class' => $block['grid_row_class'] ?? '',
                    'default_row_class' => TRUE,
                    'automatic_width' => TRUE,
                ];
                break;

            case 'table':
                $options = [
                    'override' => ($block['table_override'] ?? 'yes') === 'yes',
                    'sticky' => ($block['table_sticky'] ?? '') === 'yes',
                    'responsive' => ($block['table_responsive'] ?? 'yes') === 'yes',
                    'caption' => $block['table_caption'] ?? '',
                    'summary' => $block['table_summary'] ?? '',
                    'columns' => [],
                    'default' => $block['table_default_sort'] ?? '',
                    'info' => [],
                    'empty_column' => ($block['table_empty_column'] ?? '') === 'yes',
                ];

                // Grouping settings
                if (!empty($block['table_grouping_field'])) {
                    $options['grouping'] = [
                        [
                            'field' => $block['table_grouping_field'],
                            'rendered' => ($block['table_group_rendered'] ?? '') === 'yes',
                            'rendered_strip' => false,
                        ],
                    ];
                }
                break;

            case 'unformatted':
            case 'html_list':
                $options = [
                    'row_class' => $block['list_item_class'] ?? '',
                    'default_row_class' => TRUE,
                    'wrapper_class' => $block['list_wrapper_class'] ?? '',
                    'class' => $block['list_item_class'] ?? '',
                ];
                break;

            default:
                $options = [
                    'row_class' => '',
                    'default_row_class' => TRUE,
                ];
        }

        return $options;
    }

    private function buildRowOptions($block)
    {
        $row_type = $block['row_type'];
        $options = [];

        switch ($row_type) {
            case 'fields':
                $options = [
                    'inline' => [
                        'first_field' => ($block['inline_fields'] ?? '') === 'yes',
                    ],
                    'separator' => $block['separator'] ?? ' | ',
                    'hide_empty' => true,
                ];
                break;

            case 'entity:node':
            case 'entity:user':
                $options = [
                    'view_mode' => $block['view_mode'] ?? 'teaser',
                ];
                break;

            default:
                $options = [];
        }

        return $options;
    }

    public function editor(Request $request)
    {
        $id = \Drupal::routeMatch()->getParameter('node');
        $editor_data = ElementorPlugin::$instance->editor($id);

        // $template = $this->twig->loadTemplate(\Drupal::service('extension.list.module')->getPath('elementor') . '/templates/elementor-editor.html.twig');
        $template = $this->twig->load(\Drupal::service('extension.list.module')->getPath('elementor') . '/templates/elementor-editor.html.twig');


        $dir = \Drupal::languageManager()->getCurrentLanguage()->getDirection();

        $html = $template->render([
            'is_rtl' => $dir == 'rtl',
            'elementor_data' => $editor_data,
            'base_path' => base_path() . \Drupal::service('extension.list.module')->getPath('elementor'),
        ]);

        $response = new Response();
        $response->setContent($html);

        return $response;
    }

    public function upload(Request $request)
    {
        $files = [];
        foreach ($request->files->all() as $key => $file) {
            $files[] = ElementorPlugin::$instance->sdk->upload_file($file->getPathName(), $file->getClientOriginalName());
        }
        return new JsonResponse($files);
    }

    public function delete_upload(Request $request)
    {
        $newFile = ElementorPlugin::$instance->sdk->delete_file($request->get('fid'));
        return new JsonResponse();
    }

    /**
     * AJAX endpoint that returns fields for given content type (bundle).
     */
    public function getFields($content_type)
    {
        $fields = [];

        if ($content_type) {
            $entityFieldManager = \Drupal::service('entity_field.manager');
            $formDisplayRepo = \Drupal::service('entity_display.repository');

            $field_definitions = $entityFieldManager->getFieldDefinitions('node', $content_type);
            $form_display = $formDisplayRepo->getFormDisplay('node', $content_type, 'default');

            foreach ($field_definitions as $field_name => $definition) {
                if ($definition->getFieldStorageDefinition()->isBaseField() && $field_name !== 'title') {
                    continue;
                }
                if ($definition->isComputed()) {
                    continue;
                }

                $type = $definition->getType();
                if (in_array($type, ['boolean', 'list_string', 'list_integer', 'list_float'])) {
                    continue;
                }
                $component = $form_display->getComponent($field_name);
                if (!$component) {
                    continue;
                }
                if ($field_name === 'title' || $field_name === 'body' || str_starts_with($field_name, 'field_')) {
                    $fields[$field_name] = $definition->getLabel();
                }
            }
        }
        return new JsonResponse($fields);
    }

    public function data($content_type, Request $request)
    {
        $title_field  = $request->query->get('title_field');
        $body_field   = $request->query->get('body_field');
        $image_field  = $request->query->get('image_field');
        $node_columns = (int) $request->query->get('node_columns');
        $node_offset  = (int) $request->query->get('node_offset');
        $node_search  = $request->query->get('node_search');

        $service = \Drupal::service('elementor.drupal_block_service');
        $data = $service->getNodeData(
            $content_type,
            $title_field,
            $body_field,
            $image_field,
            $node_columns,
            $node_offset,
            $node_search
        );

        return new JsonResponse($data);
    }

  public function getWebformFields($webform_id)
  {
    $webform = Webform::load($webform_id);

    if (!$webform) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Webform not found.'
      ], 404);
    }

    // Base data
    $config = [
      'id' => $webform->id(),
      'title' => $webform->label(),
      'description' => $webform->get('description'),
    ];

    // Get webform settings (includes confirmation, submission limits, etc.)
    $settings = $webform->getSettings();

    // Example: get confirmation URL directly
    $confirmationUrl = $settings['confirmation_url'] ?? '';

    // Get all elements (fields)
    $elements = $webform->getElementsInitialized();
    $cleanElements = $this->cleanElements($elements);

    // Get handlers (like email handlers, redirects, etc.)
    $handlers = [];
    foreach ($webform->getHandlers() as $handler_id => $handler) {
      $handlers[$handler_id] = [
        'id' => $handler->getHandlerId(),
        'label' => $handler->label(),
        'settings' => $handler->getConfiguration(),
      ];
    }

    $response = [
      'status' => 'success',
      'webform' => [
        'meta' => $config,
        'settings' => $settings,
        'confirmation_url' => $confirmationUrl,
        'elements' => $cleanElements,
        'handlers' => $handlers,
      ],
    ];

    return new JsonResponse($response);
  }

    protected function cleanElements(array $elements)
    {
        $output = [];
        foreach ($elements as $key => $element) {
            if (is_array($element)) {
                $newElement = [];
                foreach ($element as $subKey => $subValue) {
                    //$cleanKey = ltrim($subKey, '#');
                    if (is_array($subValue)) {
                        $newElement[$subKey] = $this->cleanElements($subValue);
                    } else {
                        $newElement[$subKey] = $subValue;
                    }
                }
                $output[$key] = $newElement;
            } else {
                $output[$key] = $element;
            }
        }
        return $output;
    }
}
