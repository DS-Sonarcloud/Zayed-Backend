<?php

namespace Drupal\zu_admin\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;

class SchemaViewerController extends ControllerBase {

  protected Connection $database;

  public function __construct(Connection $db) {
    $this->database = $db;
  }

  public static function create(ContainerInterface $container) {
    return new static($container->get('database'));
  }

  public function index(): array {
    $tables = [];
    try {
      $result = $this->database->query('SHOW TABLES')->fetchCol();
      foreach ($result as $table) {
        $tables[] = $table;
      }
    }
    catch (\Exception $e) {
      $tables = ['(Unable to list tables)'];
    }
    return ['#theme' => 'zu_schema_viewer', '#tables' => $tables];
  }

}
