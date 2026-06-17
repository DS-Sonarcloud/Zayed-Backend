<?php

namespace Drupal\student_verification\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Drupal\Core\Pager\PagerManagerInterface;
use Drupal\Core\Pager\PagerParametersInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class StudentListController extends ControllerBase
{

    protected $pagerManager;
    protected $pagerParameters;

    public function __construct(PagerManagerInterface $pager_manager, PagerParametersInterface $pager_parameters)
    {
        $this->pagerManager = $pager_manager;
        $this->pagerParameters = $pager_parameters;
    }

    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('pager.manager'),
            $container->get('pager.parameters')
        );
    }

    public function list()
    {
        $table = $_GET['datasource'];
        $connection = \Drupal::database();
        $table_exists = $connection->schema()->tableExists($table);

        if ($table_exists) {
            // Create 'Add Student' button link.
            $add_link = Link::fromTextAndUrl(
                $this->t('Add Student'),
                Url::fromRoute('student_verification.add', ['datasource' => $table]),
            )->toRenderable();
            $add_link['#attributes'] = [
                'class' => ['button', 'button--primary'],
            ];

            $build['actions'] = [
                '#type' => 'container',
                '#attributes' => ['class' => ['student-list-actions']],
                'add' => $add_link,
            ];

            // Table header.
            $header = NULL;
            $rows = [];

            $limit = 20;

            // Count total records
            $total = $connection->select($table)->countQuery()->execute()->fetchField();

            // Initialize pager
            $current_page = $this->pagerParameters->findPage();
            $this->pagerManager->createPager($total, $limit);

            // Fetch records.
            $results = \Drupal::database()->select($table, 's')
                ->fields('s')
                ->range($current_page * $limit, $limit)
                ->execute()
                ->fetchAll();


            if ($results) {
                foreach ($results as $record) {
                    $edit = Link::fromTextAndUrl('Edit', Url::fromRoute('student_verification.edit', ['id' => $record->id, 'datasource' => $table]))->toString();
                    $delete = Link::fromTextAndUrl('Delete', Url::fromRoute('student_verification.delete', ['id' => $record->id, 'datasource' => $table]))->toString();

                    $record_array = (array) $record;
                    if ($header === null) {
                        $header = array_keys($record_array);
                        $header[] = $this->t('Actions');
                    }

                    $record_array[] = ['data' => ['#markup' => "$edit | $delete"]];

                    $rows[] = $record_array;
                }
                $build['table'] = [
                    '#type' => 'table',
                    '#header' => $header,
                    '#rows' => $rows,
                    '#empty' => $this->t('No students found.'),
                ];
            }
        }

        $build['actions']['upload'] = Link::fromTextAndUrl(
            $this->t('Upload CSV'),
            Url::fromRoute('student_verification.upload', ['datasource' => $table]),
        )->toRenderable();

        $build['actions']['upload']['#attributes'] = [
            'class' => ['button', 'button--primary'],
            'style' => ['float: right'],
        ];

        $build['actions']['back'] = Link::fromTextAndUrl(
            $this->t('Back to data source'),
            Url::fromRoute('student_verification.datasource_list'),
        )->toRenderable();

        $build['actions']['back']['#attributes'] = [
            'class' => ['button'],
            'style' => ['float: right', 'margin-right: 10px'],
        ];

        // Add pager
        $build['pager'] = [
            '#type' => 'pager',
        ];

        return $build;
    }
}
