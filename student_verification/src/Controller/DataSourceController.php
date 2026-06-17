<?php

namespace Drupal\student_verification\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Database;
use Drupal\Core\Link;
use Drupal\Core\Url;

class DataSourceController extends ControllerBase
{

    public function list()
    {
        // Create 'Add Student' button link.
        $add_link = Link::fromTextAndUrl(
            $this->t('Add data source'),
            Url::fromRoute('student_verification.datasource_add')
        )->toRenderable();
        $add_link['#attributes'] = [
            'class' => ['button', 'button--primary'],
        ];

        $build['actions'] = [
            '#type' => 'container',
            '#attributes' => ['class' => ['student-list-actions']],
            'add' => $add_link,
        ];


        $connection = Database::getConnection();
        $results = $connection->select('student_verification_datasource', 's')
            ->fields('s')
            ->execute()
            ->fetchAll();

        $rows = [];
        foreach ($results as $record) {

            // Define operations array for action links
            $operations = [];

            // If you want EDIT also (optional)
            $operations['edit'] = [
                'title' => $this->t('List'),
                'url' => Url::fromRoute('student_verification.list', ['datasource' => $record->table_name]),
                'weight' => 10,
            ];

            $operations['delete'] = [
                'title' => $this->t('Delete'),
                'url' => Url::fromRoute('student_verification.datasource_delete', ['id' => $record->table_name]),
                'weight' => 0,
            ];

            $rows[] = [
                $record->id,
                $record->name,
                'operations' => [
                    'data' => [
                        '#type' => 'operations',
                        '#links' => $operations,
                    ],
                ],
            ];
        }

        $header = [
            $this->t('ID'),
            $this->t('Name'),
            $this->t('Actions'),
        ];

        $build['table'] = [
            '#type' => 'table',
            '#header' => $header,
            '#rows' => $rows,
            '#empty' => $this->t('No data sources found.'),
        ];

        return $build;
    }
}
