<?php

namespace Drupal\event_bulk_upload\Service;

use Drupal\node\Entity\Node;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Component\Datetime\TimeInterface;

class EventBulkUploadService
{
  protected $entityTypeManager;
  protected $time;

  public function __construct(EntityTypeManagerInterface $entityTypeManager, TimeInterface $time)
  {
    $this->entityTypeManager = $entityTypeManager;
    $this->time = $time;
  }

  public function processCsv($uri, $mapping = [])
  {
    $messages = [];
    $handle = fopen($uri, 'r');
    $header = fgetcsv($handle);

    $created_count = 0;
    $updated_count = 0;

    $row_count = 0;
    while (($row = fgetcsv($handle)) !== FALSE) {
      $row_count++;

      if (count($row) != count($header)) {
        continue;
      }

      $row_data = array_combine($header, $row);

      $node_data = [
        'type' => 'event',
      ];

      $external_id = NULL;
      if (!empty($mapping)) {
        foreach ($mapping as $node_field => $csv_header) {
          if ($node_field == 'dummy_none' || empty($csv_header)) {
            continue;
          }

          if (isset($row_data[$csv_header])) {
            $value = $row_data[$csv_header];

            if ($node_field == 'field_description' || $node_field == 'body') {
              $node_data[$node_field] = [
                'value' => $value,
                'format' => 'full_html',
              ];
            } elseif ($node_field == 'field_external_id') {
              $external_id = $value;
              $node_data[$node_field] = $value;
            } else {
              $node_data[$node_field] = $value;
            }
          }
        }
      }

      // --- DEDUPLICATION LOGIC ---
      $node = $this->findExistingEvent($external_id, $node_data['title'] ?? '');

      $is_update = FALSE;
      if ($node) {
        $is_update = TRUE;
        // Update existing node
        foreach ($node_data as $field => $val) {
          if ($field != 'type') {
            $node->set($field, $val);
          }
        }
      } else {
        // Create new node
        $node = Node::create($node_data);
      }
      // --- END DEDUPLICATION LOGIC ---

      // Validation check
      $node->validate();

      try {
        $node->save();
        if ($is_update) {
          $updated_count++;
        } else {
          $created_count++;
        }
      } catch (\Exception $e) {
        $messages[] = "Row $row_count: Failed to save node. " . $e->getMessage();
      }
    }

    fclose($handle);

    $summary = "Import Summary: $created_count new events created, $updated_count existing events updated.";
    array_unshift($messages, $summary);

    return $messages;
  }

  public function processJson($eventsData)
  {
    $messages = [];
    $created_count = 0;
    $updated_count = 0;

    $mapping = \Drupal::state()->get('event_bulk_upload.api_mapping') ?: [];

    foreach ($eventsData as $data) {
      $node_data = [
        'type' => 'event',
      ];

      $external_id = NULL;
      foreach ($mapping as $node_field => $api_path) {
        $value = $this->getNestedValue($data, $api_path);

        if ($value !== NULL) {
          if ($node_field == 'field_description' || $node_field == 'body') {
            $node_data[$node_field] = [
              'value' => $value,
              'format' => 'full_html',
            ];
          } elseif ($node_field == 'field_external_id') {
            $external_id = $value;
            $node_data[$node_field] = $value;
          } else {
            $node_data[$node_field] = $value;
          }
        }
      }

      if (empty($node_data['title'])) {
        $node_data['title'] = 'Untitled API Import ' . (isset($data['id']) ? $data['id'] : '');
      }

      $node = $this->findExistingEvent($external_id, $node_data['title'] ?? '');

      $is_update = FALSE;
      if ($node) {
        $is_update = TRUE;
        foreach ($node_data as $field => $val) {
          if ($field != 'type') {
            $node->set($field, $val);
          }
        }
      } else {
        $node = Node::create($node_data);
      }

      try {
        $node->save();
        if ($is_update) {
          $updated_count++;
        } else {
          $created_count++;
        }
      } catch (\Exception $e) {
        $messages[] = "Failed to save event: " . $e->getMessage();
      }
    }

    $summary = "API Import Summary: $created_count new events created, $updated_count existing events updated.";
    array_unshift($messages, $summary);

    return $messages;
  }

  private function findExistingEvent($external_id, $title)
  {
    if ($external_id) {
      $nids = $this->entityTypeManager->getStorage('node')->getQuery()
        ->accessCheck(FALSE)
        ->condition('type', 'event')
        ->condition('field_external_id', $external_id)
        ->execute();
      if (!empty($nids)) {
        return Node::load(reset($nids));
      }
    }

    return NULL;
  }

  private function getNestedValue($data, $path)
  {
    if (!$path)
      return NULL;
    $keys = explode('.', $path);
    foreach ($keys as $key) {
      if (is_array($data) && isset($data[$key])) {
        $data = $data[$key];
      } else {
        return NULL;
      }
    }
    return is_array($data) ? json_encode($data) : $data;
  }
}
