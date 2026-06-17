<?php

namespace Drupal\jobs_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Database\Database;

class PublicUserAutocompleteController extends ControllerBase {

  public function autocomplete(Request $request) {

    $string = $request->query->get('q');
    $matches = [];

    if (!$string) {
      return new JsonResponse($matches);
    }

    $db = Database::getConnection();

    // Base query
    $query = $db->select('public_user', 'pu')
      ->fields('pu', ['id', 'name', 'email'])
      ->range(0, 10);

    // Build OR conditions USING QUERY OBJECT
    $or = $query->orConditionGroup()
      ->condition('pu.id', $string)
      ->condition('pu.name', '%' . $string . '%', 'LIKE')
      ->condition('pu.email', '%' . $string . '%', 'LIKE');

    // Apply condition group
    $query->condition($or);

    $results = $query->execute()->fetchAll();

    foreach ($results as $row) {
      $matches[] = [
        'value' => "{$row->name} <{$row->email}> (ID: {$row->id})",
        'label' => "{$row->name} <{$row->email}> (ID: {$row->id})",
      ];
    }

    return new JsonResponse($matches);
  }
}
