<?php

namespace Drupal\elementor;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Border;
use Elementor\Widget_Base;
use Elementor\Repeater;
use Elementor\Group_Control_Typography;
use Elementor\Group_Control_Background;
use Drupal\views\Views;
use Drupal\views\Plugin\views\style\StylePluginBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Render\Markup;

if (!defined('ABSPATH')) {
    exit;
}

class Widget_Drupal_Block extends Widget_Base
{
    use StringTranslationTrait;
    public function get_name()
    {
        return 'drupal-block';
    }

    public function get_title()
    {
        return ___elementor_adapter('Drupal block', 'elementor');
    }

    public function get_categories()
    {
        return ['theme-elements'];
    }

    public function get_icon()
    {
        return 'eicon-accordion';
    }

    public function get_keywords()
    {
        return ['drupal', 'block', 'code'];
    }

    public function is_reload_preview_required()
    {
        return false;
    }

    protected function _register_controls()
    {
        // --- Content Tab ---
        $this->start_controls_section(
            'section_content',
            [
                'label' => ___elementor_adapter('Content', 'elementor'),
            ]
        );

        $this->add_control(
            'drupal_block_data',
            [
                'type' => Controls_Manager::HIDDEN,
                'default' => '',
            ]
        );

        // Select content type
        $this->add_control(
            'content_type',
            [
                'label' => ___elementor_adapter('Select Content Type', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => $this->get_content_types(),
                'default' => '',
            ]
        );

        //$content_type = isset($_GET['elementor_preview']) ? $_GET['elementor_preview'] : 'colleges';
        //$fields = $this->get_fields_for_content_type($content_type);

        $this->add_control(
            'field_title',
            [
                'label' => ___elementor_adapter('Select Title Field', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => ['none' => 'None'], // default empty
                'default' => 'none',
            ]
        );

        $this->add_control(
            'field_body',
            [
                'label' => ___elementor_adapter('Select Body Field', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => ['none' => 'None'], // default empty
                'default' => 'none',
            ]
        );

        $this->add_control(
            'field_image',
            [
                'label' => ___elementor_adapter('Select Image Field', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => ['none' => 'None'], // default empty
                'default' => 'none',

            ]
        );


        $node_columns = range(1, 15);
        $node_columns = array_combine($node_columns, $node_columns);

        $this->add_control(
            'node_columns',
            [
                'label' => ___elementor_adapter('Number of Items', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'default' => 5,
                'options' => $node_columns,
            ]
        );

        $this->add_control(
            'node_search',
            [
                'label' => ___elementor_adapter('Filter by Title', 'elementor'),
                'type' => Controls_Manager::TEXT,
                'placeholder' => ___elementor_adapter('Enter keyword', 'elementor'),
                'default' => '',
            ]
        );

        $node_offset = range(0, 15);
        $node_offset = array_combine($node_offset, $node_offset);

        $this->add_control(
            'node_offset',
            [
                'label' => ___elementor_adapter('Number of Items to Skip', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'default' => 0,
                'options' => $node_offset,
            ]
        );

        $this->add_control(
            'node_columns_items',
            [
                'label' => ___elementor_adapter('Number of Items in row', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'default' => 5,
                'options' => $node_columns,
            ]
        );

        $this->add_control(
            'style',
            [
                'label' => ___elementor_adapter('Style', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    'list' => ___elementor_adapter('List', 'elementor'),
                    'grid' => ___elementor_adapter('Grid', 'elementor'),
                ],
                'default' => 'grid',
            ]
        );
        $this->end_controls_section();

        // --- Style Tab ---
        $this->start_controls_section(
            'section_title_block',
            [
                'label' => ___elementor_adapter('Title Style', 'elementor'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );
        $this->add_control(
            'block_text_color',
            [
                'label' => ___elementor_adapter('Text Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-item .elementor-item-title,
                    {{WRAPPER}} .elementor-item .para-heading,
                    {{WRAPPER}} .elementor-item .para-description' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'block_typography',
                'selector' => '{{WRAPPER}} .elementor-item > h3.para-heading:nth-of-type(n+2),
               {{WRAPPER}} .elementor-item > .para-description,
               {{WRAPPER}} .elementor-item > .elementor-item-title',
            ]
        );



        $this->end_controls_section();

        $this->start_controls_section(
            'section_body_block',
            [
                'label' => ___elementor_adapter('Body Style', 'elementor'),
                'tab' => Controls_Manager::TAB_STYLE,
            ]
        );
        $this->add_control(
            'block_body_text_color',
            [
                'label' => ___elementor_adapter('Text Color', 'elementor'),
                'type' => Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .elementor-item .elementor-item-body,
                    {{WRAPPER}} .elementor-item .elementor-item-body h3,
                    {{WRAPPER}} .elementor-item .elementor-item-body .para-description' => 'color: {{VALUE}};',
                ],
            ]
        );

        $this->add_group_control(
            Group_Control_Typography::get_type(),
            [
                'name' => 'body_block_typography',
                'selector' => '{{WRAPPER}} .elementor-item .elementor-item-body,
                        {{WRAPPER}} .elementor-item .elementor-item-body h3.para-heading,
                       {{WRAPPER}} .elementor-item .elementor-item-body .para-description',
            ]
        );


        $this->end_controls_section();

        // Image.
        $this->start_controls_section(
            'section_style_block_image',
            [
                'label' => ___elementor_adapter('Image', 'elementor'),
                'tab' => Controls_Manager::TAB_STYLE,
                'condition' => [
                    'field_image[url]!' => '',
                ],
            ]
        );

        $this->add_control(
            'image_size_height',
            [
                'label' => ___elementor_adapter('Image Size Height', 'elementor'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 20,
                        'max' => 500,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .elementor-item .elementor-item-image img' => 'height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'image_size_width',
            [
                'label' => ___elementor_adapter('Image Size Width', 'elementor'),
                'type' => Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 20,
                        'max' => 500,
                    ],
                ],
                'selectors' => [
                    '{{WRAPPER}} .elementor-item .elementor-item-image img' => 'width: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_control(
            'image_position',
            [
                'label' => ___elementor_adapter('Image Position', 'elementor'),
                'type' => Controls_Manager::SELECT,
                'options' => [
                    'above_title' => 'Above Title',
                    'below_title' => 'Below Title',
                    'left_title'  => 'Left of Title',
                    'right_title' => 'Right of Title',
                    'above_body'  => 'Above Body',
                    'below_body'  => 'Below Body',
                    'left_body'   => 'Left of Body',
                    'right_body'  => 'Right of Body',
                ],
                'default' => 'above_title',
            ]
        );

        $this->add_group_control(
            Group_Control_Border::get_type(),
            [
                'name' => 'image_border',
                'selector' => '{{WRAPPER}} .elementor-item .elementor-item-image img',
                'separator' => 'before',
            ]
        );

        $this->add_control(
            'image_border_radius',
            [
                'label' => ___elementor_adapter('Border Radius', 'elementor'),
                'type' => Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%'],
                'selectors' => [
                    '{{WRAPPER}} .elementor-item .elementor-item-image img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function get_fields_options($content_type)
    {
        $fields = ['none' => $this->t('- None -')];

        if (!$content_type) return $fields;

        $definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('node', $content_type);

        foreach ($definitions as $name => $def) {
            if ($def->isComputed()) continue;
            if ($def->getFieldStorageDefinition()->isBaseField() && $name !== 'title') continue;
            if ($name === 'body' || str_starts_with($name, 'field_') || $name === 'title') {
                $fields[$name] = $def->getLabel();
            }
        }

        return $fields;
    }

    protected function render()
    {
        $settings = $this->get_settings_for_display();
        $content_type = $settings['content_type'] ?? null;
        $style        = $settings['style'] ?? 'grid';

        if (!$content_type) {
            echo "<div class='elementor-alert'>Please select a content type.</div>";
            return;
        }

        $fields = $this->get_fields_for_content_type($content_type);

        $field_title = $settings['field_title'] ?? null;
        $field_body  = $settings['field_body'] ?? null;
        $field_image = $settings['field_image'] ?? null;
        $node_rows_items = (int) ($settings['node_rows_items'] ?? 2);
        $node_columns_items = (int) ($settings['node_columns_items'] ?? 2);
        $node_offset = (int) ($settings['node_offset'] ?? 0);
        $node_columns = (int) ($settings['node_columns'] ?? 5);
        $node_search = $settings['node_search'] ?? '';
        $image_position = $settings['image_position'] ?? 'above_title';

        if (!$field_title || !isset($fields[$field_title])) $field_title = null;
        if (!$field_body || !isset($fields[$field_body])) $field_body = null;
        if (!$field_image || !isset($fields[$field_image])) $field_image = null;

        $query = \Drupal::entityQuery('node')
            ->condition('type', $content_type)
            ->condition('status', 1)
            ->range($node_offset, $node_columns)
            ->sort('created', 'DESC')
            ->accessCheck(FALSE);

        if (!empty($node_search)) {
            $query->condition('title', '%' . $node_search . '%', 'LIKE');
        }

        $nids = $query->execute();

        if (empty($nids)) {
            echo "<div class='elementor-alert'>No content found.</div>";
            return;
        }

        $nodes = \Drupal\node\Entity\Node::loadMultiple($nids);

        // Wrapper
        if ($style === 'list') {
            echo '<ul class="elementor-drupal-content elementor-style-list">';
        } else {
            echo '<div class="elementor-drupal-content elementor-style-grid" style="display: grid; grid-template-columns: repeat(' . $node_columns_items . ', 1fr); gap: 20px;">';
        }

        foreach ($nodes as $node) {
            echo $style === 'list' ? '<li class="elementor-item">' : '<div class="elementor-item">';

            // --- IMAGE ABOVE/BELOW TITLE ---
            if ($image_position === 'above_title') {
                echo $this->renderImageWrapper($node, $field_image);
            }

            if (in_array($image_position, ['left_title', 'right_title'])) {
                echo '<div class="elementor-flex elementor-flex-title">';
                if ($image_position === 'left_title') {
                    echo $this->renderImageWrapper($node, $field_image);
                }
                if ($field_title && $node->hasField($field_title)) {
                    echo '<h3 class="elementor-item-title">' . $this->renderFieldValue($node->get($field_title)) . '</h3>';
                }
                if ($image_position === 'right_title') {
                    echo $this->renderImageWrapper($node, $field_image);
                }
                echo '</div>'; // close flex wrapper
            } else {
                if ($field_title && $node->hasField($field_title)) {
                    echo '<h3 class="elementor-item-title">' . $this->renderFieldValue($node->get($field_title)) . '</h3>';
                }
                if ($image_position === 'below_title') {
                    echo $this->renderImageWrapper($node, $field_image);
                }
            }

            // --- IMAGE ABOVE/BELOW BODY ---
            if ($field_body && $node->hasField($field_body)) {
                if ($image_position === 'above_body') {
                    echo $this->renderImageWrapper($node, $field_image);
                }

                if (in_array($image_position, ['left_body', 'right_body'])) {
                    echo '<div class="elementor-flex elementor-flex-body">';
                    if ($image_position === 'left_body') {
                        echo $this->renderImageWrapper($node, $field_image);
                    }
                    echo '<div class="elementor-item-body">' . $this->renderFieldValue($node->get($field_body)) . '</div>';
                    if ($image_position === 'right_body') {
                        echo $this->renderImageWrapper($node, $field_image);
                    }
                    echo '</div>'; // close flex wrapper
                } else {
                    echo '<div class="elementor-item-body">' . $this->renderFieldValue($node->get($field_body)) . '</div>';
                    if ($image_position === 'below_body') {
                        echo $this->renderImageWrapper($node, $field_image);
                    }
                }
            }

            echo $style === 'list' ? '</li>' : '</div>';
        }

        echo $style === 'list' ? '</ul>' : '</div>';
        echo '<style>
        .elementor-flex { display:flex; align-items:center; gap:10px; }
        .elementor-item-title { font-weight:bold; }
        </style>';
    }

    /**
     * Helper to render image field.
     */
    protected function renderImageWrapper($node, $field_image)
    {
        if ($field_image && $node->hasField($field_image)) {
            $image_field = $node->get($field_image);

            if (!$image_field->isEmpty()) {
                $entity = $image_field->entity;
                if ($entity instanceof \Drupal\media\Entity\Media && $entity->hasField('field_media_image') && !$entity->get('field_media_image')->isEmpty()) {
                    $file = $entity->get('field_media_image')->entity;
                    if ($file) {
                        $url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
                        return '<div class="elementor-item-image"><img src="' . $url . '" alt=""></div>';
                    }
                } elseif ($entity instanceof \Drupal\file\Entity\File) {
                    $url = \Drupal::service('file_url_generator')->generateAbsoluteString($entity->getFileUri());
                    return '<div class="elementor-item-image"><img src="' . $url . '" alt=""></div>';
                }
                return "<div class='elementor-alert'>Selected field is not an image.</div>";
            }
            return "<div class='elementor-alert'>Image is not present</div>";
        }
        return '';
    }


    /**
     * Helper to render any Drupal field type except images/files.
     */
    protected function renderFieldValue($field)
    {
        if ($field->isEmpty()) {
            return 'Value not found';
        }

        $def = $field->getFieldDefinition();
        $type = $def->getType();

        switch ($type) {
            case 'entity_reference':
                $target = $def->getSetting('target_type');
                $labels = [];
                foreach ($field->referencedEntities() as $entity) {
                    if (in_array($target, ['taxonomy_term', 'node'])) {
                        $labels[] = $entity->label();
                    } elseif ($target === 'user') {
                        $labels[] = $entity->getDisplayName();
                    } elseif (in_array($target, ['file', 'image'])) {
                        $labels[] = 'Invalid field type for Title/Body';
                    }
                }
                return implode(', ', $labels);

            case 'entity_reference_revisions':
                $paras = [];
                foreach ($field->referencedEntities() as $para) {
                    $heading = '';
                    $description = '';

                    if ($para->hasField('field_heading') && !$para->get('field_heading')->isEmpty()) {
                        $heading = '<h3 class="para-heading">' . htmlspecialchars($para->get('field_heading')->value) . '</h3>';
                    }

                    if ($para->hasField('field_description') && !$para->get('field_description')->isEmpty()) {
                        $item = $para->get('field_description')->first();
                        if ($item) {
                            $build = [
                                '#type' => 'processed_text',
                                '#text' => $item->value,
                                '#format' => $item->format,
                            ];
                            $description = '<div class="para-description">' .
                                \Drupal::service('renderer')->renderPlain($build) .
                                '</div>';
                        }
                    }

                    $paras[] = $heading . $description;
                }

                return implode('', $paras);



            case 'text':
            case 'string':
            case 'string_long':
                return htmlspecialchars($field->value);

            case 'text_long':
            case 'text_with_summary':
                $item = $field->first();
                if ($item) {
                    $build = [
                        '#type' => 'processed_text',
                        '#text' => $item->value,
                        '#format' => $item->format,
                    ];
                    return \Drupal::service('renderer')->renderPlain($build);
                }
                return '';

            case 'email':
                $email = $field->value;
                return '<a href="mailto:' . htmlspecialchars($email) . '">' . htmlspecialchars($email) . '</a>';

            case 'boolean':
                return $field->value ? 'Yes' : 'No';

            case 'integer':
            case 'decimal':
            case 'float':
                return $field->value;

            default:
                return 'Unsupported field type: ' . $type;
        }
    }


    public function render_plain_content()
    {
        echo 'Drupal Blocks';
    }

    protected function _content_template()
    {
        // Editor preview - keep minimal
    }
    protected function get_content_types()
    {
        $types = \Drupal\node\Entity\NodeType::loadMultiple();
        $options = [];
        foreach ($types as $type) {
            $options[$type->id()] = $type->label();
        }
        return $options;
    }

    protected function get_fields_for_content_type($bundle = null)
    {
        $fields = [];

        if (!$bundle) {
            return $fields;
        }
        $field_definitions = \Drupal::service('entity_field.manager')
            ->getFieldDefinitions('node', $bundle);

        // Add "None" as the first option
        $fields['none'] = $this->t('- None -');

        foreach ($field_definitions as $field_name => $definition) {
            // Skip base/internal fields
            if ($definition->getFieldStorageDefinition()->isBaseField()) {
                if ($field_name !== 'title') {
                    continue;
                }
            }

            if ($definition->isComputed()) {
                continue;
            }

            if ($field_name === 'body' || str_starts_with($field_name, 'field_') || $field_name === 'title') {
                $fields[$field_name] = $definition->getLabel();
            }
        }

        return $fields;
    }
}
