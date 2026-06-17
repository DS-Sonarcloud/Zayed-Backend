<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\webform\Entity\Webform;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Public API: returns a complete, React-consumable webform schema.
 *
 * Merges fields + AJAX conditions into one response so React can
 * render the form exactly as built in Drupal — without a developer.
 *
 * GET /api/webform/schema/{webform_id}
 * GET /api/webform/list
 */
class WebformSchemaController extends ControllerBase {

  public function getSchema(string $webform_id): JsonResponse {
    $webform = Webform::load($webform_id);

    if (!$webform) {
      return new JsonResponse(['status' => 'error', 'message' => 'Webform not found.'], 404);
    }

    $elements  = $webform->getElementsInitialized();
    $settings  = $webform->getSettings();
    $handlers  = [];

    foreach ($webform->getHandlers() as $handler_id => $handler) {
      $handlers[$handler_id] = [
        'id'       => $handler->getHandlerId(),
        'label'    => $handler->label(),
        'settings' => $handler->getConfiguration(),
      ];
    }

    $ajax_conditions = $this->loadAjaxConditions($webform_id);

    return new JsonResponse([
      'status'  => 'success',
      'webform' => [
        'id'             => $webform->id(),
        'title'          => $webform->label(),
        'description'    => $webform->get('description'),
        'settings'       => $settings,
        'elements'       => $this->normalizeElements($elements),
        'ajax_conditions' => $ajax_conditions,
        'handlers'       => $handlers,
      ],
    ]);
  }

  public function getList(): JsonResponse {
    $webforms = Webform::loadMultiple();
    $list = [];

    foreach ($webforms as $webform) {
      if ($webform->isOpen()) {
        $list[] = [
          'id'    => $webform->id(),
          'title' => $webform->label(),
          'url'   => "/api/webform/schema/{$webform->id()}",
        ];
      }
    }

    return new JsonResponse(['status' => 'success', 'webforms' => $list]);
  }

  /**
   * Normalizes Webform elements to a consistent React-friendly structure.
   *
   * Strips Drupal's '#' prefix from keys, maps types to React equivalents,
   * and recursively handles composite / container elements.
   */
  protected function normalizeElements(array $elements, int $depth = 0): array {
    $type_map = [
      'textfield'        => 'text',
      'textarea'         => 'textarea',
      'email'            => 'email',
      'tel'              => 'tel',
      'number'           => 'number',
      'select'           => 'select',
      'radios'           => 'radio',
      'checkboxes'       => 'checkbox',
      'date'             => 'date',
      'datetime'         => 'datetime',
      'file'             => 'file',
      'managed_file'     => 'file',
      'hidden'           => 'hidden',
      'processed_text'   => 'html',
      'webform_markup'   => 'html',
      'fieldset'         => 'fieldset',
      'container'        => 'container',
      'webform_section'  => 'section',
      'webform_wizard_page' => 'wizard_page',
    ];

    $output = [];

    foreach ($elements as $key => $element) {
      if (!is_array($element) || str_starts_with($key, '#')) {
        continue;
      }

      $raw_type  = $element['#type'] ?? 'textfield';
      $react_type = $type_map[$raw_type] ?? $raw_type;

      $normalized = [
        'key'          => $key,
        'type'         => $react_type,
        'drupal_type'  => $raw_type,
        'title'        => (string) ($element['#title'] ?? $key),
        'required'     => (bool) ($element['#required'] ?? FALSE),
        'default_value' => $element['#default_value'] ?? NULL,
        'description'  => $element['#description'] ?? NULL,
        'placeholder'  => $element['#placeholder'] ?? NULL,
        'options'      => $element['#options'] ?? NULL,
        'multiple'     => $element['#multiple'] ?? FALSE,
        'disabled'     => $element['#disabled'] ?? FALSE,
        'pattern'      => $element['#pattern'] ?? NULL,
        'min'          => $element['#min'] ?? NULL,
        'max'          => $element['#max'] ?? NULL,
        'maxlength'    => $element['#maxlength'] ?? NULL,
        'attributes'   => $element['#attributes'] ?? [],
        'states'       => $element['#states'] ?? NULL,
        'weight'       => (int) ($element['#weight'] ?? 0),
      ];

      // Recurse into composite / container elements.
      $children = $this->normalizeElements($element, $depth + 1);
      if (!empty($children)) {
        $normalized['children'] = $children;
      }

      $output[] = $normalized;
    }

    usort($output, static fn($a, $b) => $a['weight'] <=> $b['weight']);

    return $output;
  }

  /**
   * Loads AJAX conditions for the webform from webform_ajax_condition config.
   */
  protected function loadAjaxConditions(string $webform_id): array {
    $config = \Drupal::config('webform_ajax_condition.rules');
    $rules  = $config->get('rules') ?? [];
    $output = [];

    foreach ($rules as $rule) {
      if (($rule['webform_id'] ?? '') !== $webform_id) {
        continue;
      }

      $mapping_text = trim($rule['mapping'] ?? '');
      $states       = [];
      $current_value = '';

      foreach (preg_split('/\r\n|\r|\n/', $mapping_text) as $line) {
        if (preg_match('/^(\S+):$/', trim($line), $m)) {
          $current_value = $m[1];
        }
        elseif (preg_match('/^\s*-\s*(.+)$/', $line, $m) && $current_value) {
          $states[$current_value][] = trim($m[1]);
        }
      }

      $output[] = [
        'name'         => $rule['name'] ?? '',
        'parent_field' => $rule['parent_field'] ?? '',
        'child_field'  => $rule['child_field'] ?? '',
        'mapping'      => $states,
      ];
    }

    return $output;
  }

}
