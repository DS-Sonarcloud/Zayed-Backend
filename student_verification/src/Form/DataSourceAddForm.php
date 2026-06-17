<?php

namespace Drupal\student_verification\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Database;

class DataSourceAddForm extends FormBase
{

    public function getFormId()
    {
        return 'student_verification_datasource_add_form';
    }

    public function buildForm(array $form, FormStateInterface $form_state)
    {

        $form['name'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Data Source Name'),
            '#required' => TRUE,
        ];

        // $form['table_name'] = [
        //     '#type' => 'textfield',
        //     '#title' => $this->t('Table Name'),
        //     '#description' => $this->t('Only lowercase letters, numbers and underscores are allowed.'),
        //     '#required' => TRUE,
        // ];

        $form['actions']['#type'] = 'actions';
        $form['actions']['submit'] = [
            '#type' => 'submit',
            '#value' => $this->t('Create Data Source'),
            '#button_type' => 'primary',
        ];

        $form['actions']['cancel'] = [
            '#type' => 'link',
            '#title' => $this->t('Cancel'),
            '#url' => \Drupal\Core\Url::fromRoute('student_verification.datasource_list'),
            '#attributes' => ['class' => ['button']],
        ];

        return $form;
    }

    public function validateForm(array &$form, FormStateInterface $form_state)
    {

        // Validate name format.
        $name = $form_state->getValue('name');

        // Check duplicates.
        $exists = Database::getConnection()
            ->select('student_verification_datasource', 's')
            ->fields('s', ['id'])
            ->condition('name', $name)
            ->execute()
            ->fetchField();

        if ($exists) {
            $form_state->setErrorByName('name', $this->t('This name already exists.'));
        }
    }

    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $connection = \Drupal::database();

        // Base table prefix.
        $prefix = 'student_ds_' . uniqid() . '_';

        // Get last index.
        $max = $connection->select('student_verification_datasource', 's')
            ->fields('s', ['id'])
            ->orderBy('id', 'DESC')
            ->range(0, 1)
            ->execute()
            ->fetchField();

        $next_id = ($max) ? $max + 1 : 1;

        $table_name = $prefix . $next_id;

        Database::getConnection()
            ->insert('student_verification_datasource')
            ->fields([
                'name' => $form_state->getValue('name'),
                'table_name' => $table_name,
            ])
            ->execute();

        $this->messenger()->addMessage('Data source created successfully.');

        $form_state->setRedirect('student_verification.datasource_list');
    }
}
