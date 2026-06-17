<?php

namespace Drupal\grapesjs_editor\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'News List' Block.
 *
 * @Block(
 *   id = "grapesjs_news_list_block",
 *   admin_label = @Translation("News List"),
 *   category = @Translation("GrapesJS Editor")
 * )
 */
class GrapesJSNewsListBlock extends BlockBase implements ContainerFactoryPluginInterface
{

    /**
     * The entity type manager.
     *
     * @var \Drupal\Core\Entity\EntityTypeManagerInterface
     */
    protected $entityTypeManager;

    /**
     * Constructs a new GrapesJSNewsListBlock.
     *
     * @param array $configuration
     *   A configuration array containing information about the plugin instance.
     * @param string $plugin_id
     *   The plugin_id for the plugin instance.
     * @param mixed $plugin_definition
     *   The plugin implementation definition.
     * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
     *   The entity type manager.
     */
    public function __construct(array $configuration, $plugin_id, $plugin_definition, EntityTypeManagerInterface $entity_type_manager)
    {
        parent::__construct($configuration, $plugin_id, $plugin_definition);
        $this->entityTypeManager = $entity_type_manager;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->get('entity_type.manager')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function defaultConfiguration()
    {
        return [
            'selected_nids' => [],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function build()
    {
        $config = $this->getConfiguration();
        $selected_nids = $config['selected_nids'] ?? [];

        if (empty($selected_nids)) {
            return [
                '#markup' => '<div class="grapesjs-news-list-placeholder" style="padding: 20px; border: 2px dashed #ccc; text-align: center; color: #999;">' . $this->t('Please select a news item from the popup.') . '</div>',
            ];
        }

        $query = $this->entityTypeManager->getStorage('node')->getQuery()
            ->condition('type', 'news')
            ->condition('status', 1)
            ->sort('created', 'DESC')
            ->accessCheck(TRUE);

        if (!empty($selected_nids)) {
            if (is_string($selected_nids)) {
                $selected_nids = array_filter(array_map('trim', explode(',', $selected_nids)));
            }
            if (!empty($selected_nids)) {
                $query->condition('nid', $selected_nids, 'IN');
            }
        }

        $nids = $query->execute();

        if (empty($nids)) {
            return [
                '#markup' => $this->t('No news items found.'),
            ];
        }

        $nodes = $this->entityTypeManager->getStorage('node')->loadMultiple($nids);

        $build = [
            '#prefix' => '<div class="grapesjs-news-list">',
            '#suffix' => '</div>',
        ];

        foreach ($nodes as $node) {
            $build[] = [
                '#type' => 'link',
                '#title' => $node->label(),
                '#url' => $node->toUrl(),
                '#attributes' => ['style' => 'display: block;'],
            ];
        }

        return $build;
    }

    /**
     * {@inheritdoc}
     */
    public function getCacheMaxAge()
    {
        return 0;
    }
}
