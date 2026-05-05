<?php

namespace Drupal\elementor\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\Controller\ControllerBase;

/**
 * Returns AJAX condition mappings for a webform.
 */
class WebformAjaxController extends ControllerBase
{

    public function getAjaxConditions($webform_id)
    {
        $config = \Drupal::config('webform_ajax_condition.rules');
        $rules = $config->get('rules') ?? [];

        $output = [];

        foreach ($rules as $rule) {
            if (!empty($rule['webform_id']) && $rule['webform_id'] === $webform_id) {
                $states = [];
                $mapping_text = trim($rule['mapping'] ?? '');
                if (!empty($mapping_text)) {
                    $lines = preg_split('/\r\n|\r|\n/', $mapping_text);
                    $current_value = '';
                    foreach ($lines as $line) {
                        if (preg_match('/^(\S+):$/', trim($line), $matches)) {
                            $current_value = $matches[1];
                        } elseif (preg_match('/^\s*-\s*(.+)$/', $line, $matches) && $current_value) {
                            $child_option = trim($matches[1]);
                            $states[$child_option] = [
                                ":input[name=\"{$rule['parent_field']}\"]" => [
                                    "value" => $current_value,
                                ],
                            ];
                        }
                    }
                }

                $output[] = [
                    'name' => $rule['name'] ?? '',
                    'parent_field' => $rule['parent_field'] ?? '',
                    'child_field' => $rule['child_field'] ?? '',
                    'states' => $states,
                ];
            }
        }

        return new \Symfony\Component\HttpFoundation\JsonResponse([
            'webform_id' => $webform_id,
            'conditions' => $output,
        ]);
    }
}
