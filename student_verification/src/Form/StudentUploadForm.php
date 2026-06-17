<?php

namespace Drupal\student_verification\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Database;
use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;
use Drupal\redirect\Entity\Redirect;

class StudentUploadForm extends FormBase
{

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'student_upload_form';
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $form['csv_file'] = [
            '#type' => 'managed_file',
            '#title' => $this->t('Upload CSV file'),
            '#upload_location' => 'public://student_csv/',
            '#upload_validators' => [
                // ✅ Correct Drupal-style validator.
                'FileExtension' => ['csv'],
            ],
            '#required' => TRUE,
            '#description' => $this->t('Upload a CSV file with columns: name, email, zu_id.'),
        ];

        $form['actions'] = ['#type' => 'actions'];
        $form['actions']['submit'] = [
            '#type' => 'submit',
            '#value' => $this->t('Upload'),
            '#button_type' => 'primary',
        ];

        // Optional: Add a cancel/back button.
        $form['actions']['cancel'] = [
            '#type' => 'link',
            '#title' => $this->t('Cancel'),
            '#url' => \Drupal\Core\Url::fromRoute('student_verification.list', ['datasource' => "rrrrrrrrrrrrrrrr"]), // adjust route
            '#attributes' => ['class' => ['button']],
        ];

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $table = $_GET['datasource'];
        $connection = \Drupal::database();
        $table_exists = $connection->schema()->tableExists($table);
        if($table_exists){
            $connection->schema()->dropTable($table);
            $table_exists = FALSE;
        }
        $fid = $form_state->getValue('csv_file')[0] ?? NULL;


        if ($fid) {
            $file = File::load($fid);
            if ($file) {
                // Mark file as permanent.
                $file->setPermanent();
                $file->save();

                // Get real path.
                $file_system = \Drupal::service('file_system');
                $file_path = $file_system->realpath($file->getFileUri());
                $data = file_get_contents($file_path);

                $rows = array_map('str_getcsv', explode("\n", $data));
                $header = array_shift($rows);

                if (!$table_exists) {
                    $schema = [
                        'fields' => [
                            'id' => [
                                'type' => 'serial',
                                'unsigned' => TRUE,
                                'not null' => TRUE,
                            ],
                        ],
                        'primary key' => ['id'],
                    ];

                    // Add columns from CSV header
                    foreach ($header as $column) {
                        $schema['fields'][strtolower($column)] = [
                            'type' => 'varchar',
                            'length' => 255,
                            'not null' => FALSE,
                        ];
                    }

                    $connection->schema()->createTable($table, $schema);
                }


                if (($handle = fopen($file_path, 'r')) !== FALSE) {
                    // Skip header.
                    fgetcsv($handle);



                    while (($row = fgetcsv($handle)) !== FALSE) {
                        // Expected order: name, email, zu_id
                        if (count($row) >= 3) {

                            $fields = array_combine($header, $row);

                            if (!empty($row)) {
                                $connection->insert($table)
                                    ->fields($fields)
                                    ->execute();
                            }
                        }
                    }

                    fclose($handle);

                    $this->messenger()->addMessage($this->t('CSV uploaded and processed successfully.'));
                    // $url = Url::fromRoute('student_verification.datasource.list', ['datasource' => $record->table_name])
                    $form_state->setRedirect('student_verification.list', ['datasource' => $table]);
                } else {
                    $this->messenger()->addError($this->t('Unable to read uploaded CSV file.'));
                }
            }
        } else {
            $this->messenger()->addError($this->t('Please upload a CSV file.'));
        }
    }
}
