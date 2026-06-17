<?php

namespace Drupal\student_verification\Form;

use Drupal\Core\Database\Database;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\webform\Entity\Webform;

class CustomWebformSettingsForm extends ConfigFormBase
{

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'student_verification_form';
    }

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames()
    {
        return ['student_verification.settings'];
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state, $webform = NULL)
    {

        $webform_entity = Webform::load($webform);
        $data = $webform_entity->getThirdPartySettings('student_verification');
        $datasource = $data['datasource'] ?? NULL;
        $field_mapping = $data['field_mapping'] ?? NULL;

        $connection = Database::getConnection();
        $results = $connection->select('student_verification_datasource', 's')
            ->fields('s')
            ->execute()
            ->fetchAll();

        // Build DB options from datasource table.
        $db_options = [];
        foreach ($results as $row) {
            $db_options[$row->table_name] = $row->name;
        }

        $form['datasource'] = [
            '#type' => 'select',
            '#title' => 'Data Source',
            '#options' => $db_options,
            '#default_value' => $datasource ?? NULL,
            '#empty_option' => $this->t('- Select -'),
        ];

        if ($datasource) {
            $results_datasource = $connection->select($datasource, 's')
                ->fields('s')
                ->execute()
                ->fetchObject();
            $header = array_keys((array) $results_datasource);
            $option_datasource = array_combine($header, $header);

            // Load all fields (elements) from the current webform and expose them as rows.
            $webform_fields = [];
            if ($webform_entity) {
                $elements = $webform_entity->getElementsDecoded();

                $flatten = function (array $elements) use (&$flatten, &$webform_fields) {
                    foreach ($elements as $key => $element) {
                        if (!is_array($element)) {
                            continue;
                        }
                        $title = $element['#title'] ?? $key;
                        $webform_fields[$key] = $title;

                        // Recurse into explicitly nested children structures.
                        if (!empty($element['#children']) && is_array($element['#children'])) {
                            $flatten($element['#children']);
                        }

                        // Some nested elements are stored as sub-arrays (non-# keys).
                        foreach ($element as $k => $v) {
                            if (is_array($v) && (isset($v['#type']) || isset($v['#title']))) {
                                $flatten([$k => $v]);
                            }
                        }
                    }
                };

                $flatten($elements);
            }
            // Create table form element with Webform Field as the first column (row label)
            // and Database Field as a select in the second column.
            $form['field_mapping'] = [
                '#type' => 'table',
                '#header' => [
                    $this->t('Webform Field'),
                    $this->t('Database Field'),
                    $this->t('Condition'),
                ],
                '#empty' => $this->t('No fields found'),
            ];

            // Add a row for each webform field
            foreach ($webform_fields as $field_key => $title) {
                $form['field_mapping'][$field_key]['webform_field'] = [
                    '#plain_text' => $title,
                ];

                $form['field_mapping'][$field_key]['db_field'] = [
                    '#type' => 'select',
                    '#options' => $option_datasource,
                    '#empty_option' => $this->t('- Select -'),
                    // Store mapping by webform field key.
                    '#default_value' => $field_mapping[$field_key] ?? NULL,
                ];

                $form['field_mapping'][$field_key]['condition'] = [
                    '#type' => 'select',
                    '#options' => [
                        "equals" => "Equals",
                        "not_equals" => "Not Equals",
                    ],
                    '#empty_option' => $this->t('- Select -'),
                    '#default_value' => $field_mapping[$field_key] ?? NULL,
                ];
            }
        }

        return parent::buildForm($form, $form_state);
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $build_info = $form_state->getBuildInfo();
        $webform_id = $build_info['args'][0] ?? NULL;
        $datasource = $form_state->getValue("datasource");
        $field_mapping = $form_state->getValue("field_mapping");

        if ($webform_id) {
            $webform_entity = Webform::load($webform_id);
            if ($webform_entity) {
                $webform_entity->setThirdPartySetting('student_verification', 'datasource', $datasource);
                $webform_entity->setThirdPartySetting('student_verification', 'field_mapping', $field_mapping);
                $webform_entity->save();
            }
        }
    }
}
