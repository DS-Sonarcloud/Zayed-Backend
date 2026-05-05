<?php

namespace Drupal\elementor\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\node\Entity\Node;

class ElementorTemplateController {
  /**
   * Get all templates for Elementor Library modal.
   */
  public function getLibraryData() {
    $results = \Drupal::database()->select('elementor_template', 'et')
      ->fields('et', ['id', 'type', 'name', 'author', 'data', 'timestamp'])
      ->orderBy('timestamp', 'DESC')
      ->execute()
      ->fetchAll();

    $templates = [];
    $categories = [];

    foreach ($results as $row) {
      $data = json_decode($row->data, true);

      if (isset($data[0])) {
          $data = [
              'elements' => $data,
              'settings' => new \stdClass(), // always object
          ];
      }

      // Normalize settings
      if (!isset($data['settings']) || !is_array($data['settings'])) {
          $data['settings'] = [];
      }

      // Convert [] to {}
      if ($data['settings'] === [] || array_keys($data['settings']) === range(0, count($data['settings'])-1)) {
          $data['settings'] = new \stdClass();
      }

      $templates[] = [
        'template_id' => $row->id,
        'type' => $row->type,
        'title' => $row->name,
        'author' => $row->author,
        'source' => 'local',
        'date' => date('Y-m-d H:i:s', $row->timestamp),
        'data' => $data,
      ];

      $categories[] = $row->type;
    }

    return [
      'templates' => $templates,
      'config' => [
        'categories' => array_values(array_unique($categories)), // Elementor expects array of strings
      ],
    ];
  }
}
