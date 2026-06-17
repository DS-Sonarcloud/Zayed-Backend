<?php

namespace Drupal\student_verification\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Database;
use Drupal\Core\Url;

class StudentCrudForm extends FormBase
{

    public function getFormId()
    {
        return 'student_crud_form';
    }

    public function buildForm(array $form, FormStateInterface $form_state, $id = NULL)
    {
        $record = NULL;
        $table = $_GET['datasource'];
        $connection = \Drupal::database();
        $table_exists = $connection->schema()->tableExists($table);

        if (empty($table) || !$table_exists) {
            header("Location: " . Url::fromRoute('student_verification.datasource_list')->toString());
            exit();
        } else {
            $record_temp = $connection->select($table, 's')
                ->fields('s')
                ->execute()
                ->fetchObject();
            $header = array_keys((array) $record_temp);

            if (count($header) < 2) {
                $this->messenger()->addMessage($this->t('Please upload csv first to define fields.'));
                header("Location: " . Url::fromRoute('student_verification.list', ['datasource' => $table])->toString());
                exit();
            }
        }

        if ($id) {
            $record = $connection->select($table, 's')
                ->fields('s')
                ->condition('id', $id)
                ->execute()
                ->fetchObject();
        }



        foreach ($header as $field) {
            $form[$field] = [
                '#type' => 'textfield',
                '#title' => $this->t(ucfirst($field)),
                '#default_value' => isset($record->$field)  ? $record->$field : '',
                '#required' => TRUE,
            ];
        }

        $form['id'] = [
            '#type' => 'hidden',
            '#value' => $id,
        ];

        $form['header'] = [
            '#type' => 'hidden',
            '#value' => $header,
        ];

        // --- Action Buttons ---
        $form['actions'] = [
            '#type' => 'actions',
        ];

        $form['actions']['submit'] = [
            '#type' => 'submit',
            '#value' => $id ? $this->t('Update') : $this->t('Save'),
            '#button_type' => 'primary',
        ];

        // Add Back/Cancel button
        $form['actions']['cancel'] = [
            '#type' => 'link',
            '#title' => $this->t('Cancel'),
            '#url' => Url::fromRoute('student_verification.list', ['datasource' => $table]),
            '#attributes' => ['class' => ['button']],
        ];

        return $form;
    }

    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $table = $_GET['datasource'];
        $header = $form_state->getValue('header');
        $data = $form_state->getValues();

        $fields = array_intersect_key($data, array_flip($header));


        $conn = Database::getConnection();
        if ($id = $form_state->getValue('id')) {
            $conn->update($table)
                ->fields($fields)
                ->condition('id', $id)
                ->execute();
            $this->messenger()->addMessage($this->t('Record updated successfully.'));
        } else {
            $conn->insert($table)->fields($fields)->execute();
            $this->messenger()->addMessage($this->t('Record added successfully.'));
        }

        $form_state->setRedirect('student_verification.list', ['datasource' => $table]);
    }
}
