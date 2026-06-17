<?php

namespace Drupal\zu_rest_api\ContentTransformer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Drupal\zu_rest_api\Utility\UrlHelper;

/**
 * Transformer for faculty content type.
 */
class FacultyTransformer implements ContentTransformerInterface {

  protected EntityTypeManagerInterface $entityTypeManager;

  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function getBundle(): string {
    return 'faculty_staff';
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldAliasMap(): array {
    return [
      'field_department' => 'department',
      'field_area_of_expertise' => 'area_of_expertise',
      'field_campus' => 'campus',
      'field_designation' => 'designation',
      'field_email' => 'email',
      'field_office_location' => 'office_location',
      'field_phone' => 'phone',
      'field_position' => 'position',
      'field_photo' => 'photo',
      'field_cv' => 'cv',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExcludedFields(): array {
    // These are handled manually in transform().
    return [
      'field_background',
      'field_research',
      'field_teaching',
      'field_external_link',
      'field_recent_publications',
      'field_link_event',
      'field_college',
      'field_photo',
      'field_cv',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function transform(array $item, NodeInterface $node): array {
    // nid as string.
    $item['nid'] = (string) $item['nid'];

    // Paragraph field extraction (with metadata).
    $item['background'] = $this->extractParagraphField($node, 'field_background');
    $item['research'] = $this->extractParagraphField($node, 'field_research');
    $item['teaching'] = $this->extractParagraphField($node, 'field_teaching');
    $item['external_link'] = $this->extractParagraphField($node, 'field_external_link');
    $item['recent_publications'] = $this->extractParagraphField($node, 'field_recent_publications');

    // Content type references.
    $item['link_event'] = $this->extractContentTypeReference($node, 'field_link_event');

    // College: entity reference → name string.
    $college_nid = NULL;
    if ($node->hasField('field_college') && !$node->get('field_college')->isEmpty()) {
      $college_entity = $node->get('field_college')->entity;
      if ($college_entity) {
        $item['college'] = $college_entity->label();
        $college_nid = (int) $college_entity->id();
      }
      else {
        $item['college'] = '';
      }
    }
    else {
      $item['college'] = '';
    }

    // College slug.
    if ($college_nid) {
      $url = Url::fromRoute('entity.node.canonical', ['node' => $college_nid]);
      $relative_path = $url->setAbsolute(FALSE)->toString();
      $segments = explode('/', trim($relative_path, '/'));
      $languages = ['en', 'ar'];
      if (isset($segments[0]) && in_array($segments[0], $languages)) {
        array_shift($segments);
      }
      $item['slug'] = '/' . implode('/', $segments);
    }
    else {
      $item['slug'] = NULL;
    }

    // Photo: render as <img> HTML from media reference.
    $item['photo'] = '';
    if ($node->hasField('field_photo') && !$node->get('field_photo')->isEmpty()) {
      $media = $node->get('field_photo')->entity;
      if ($media) {
        $item['photo'] = $this->renderMediaAsImgTag($media);
      }
    }

    // CV: file URL.
    $item['cv'] = '';
    if ($node->hasField('field_cv') && !$node->get('field_cv')->isEmpty()) {
      $file = $node->get('field_cv')->entity;
      if ($file) {
        $absolute = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
        $item['cv'] = preg_replace('#^https?://[^/]+#', '', $absolute);
      }
    }

    // Convert department and area_of_expertise to arrays.
    foreach (['department', 'area_of_expertise'] as $field) {
      if (!empty($item[$field]) && !is_array($item[$field])) {
        $item[$field] = array_map('trim', explode(',', $item[$field]));
      }
    }

    // Language detection and URL cleanup.
    $langcode = 'en';
    if (!empty($item['url'])) {
      $langcode = UrlHelper::detectLangFromUrl($item['url']);
      $item['url'] = UrlHelper::stripLangPrefix(UrlHelper::normalizeUrl($item['url']));
    }

    $item['langcode'] = $langcode;
    return $item;
  }

  /**
   * Render a media entity as an <img> HTML tag.
   */
  protected function renderMediaAsImgTag($media): string {
    if (!$media) {
      return '';
    }

    $source_field = $media->getSource()->getSourceFieldDefinition($media->bundle->entity);
    if (!$source_field) {
      return '';
    }

    $source_field_name = $source_field->getName();
    if (!$media->hasField($source_field_name) || $media->get($source_field_name)->isEmpty()) {
      return '';
    }

    $field_item = $media->get($source_field_name)->first();
    $file = $field_item->entity;
    if (!$file) {
      return '';
    }

    $absolute = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
    $src = preg_replace('#^https?://[^/]+#', '', $absolute);
    $width = $field_item->width ?? '';
    $height = $field_item->height ?? '';
    $alt = $field_item->alt ?? '';

    $tag = '<img loading="lazy" src="' . $src . '"';
    if ($width) {
      $tag .= ' width="' . $width . '"';
    }
    if ($height) {
      $tag .= ' height="' . $height . '"';
    }
    $tag .= ' alt="' . htmlspecialchars($alt, ENT_QUOTES) . '" />';

    return $tag;
  }

  /**
   * Extract paragraph field into structured array.
   */
  protected function extractParagraphField(NodeInterface $node, string $field_name): array {
    $result = [];

    if (!$node->hasField($field_name) || $node->get($field_name)->isEmpty()) {
      return $result;
    }

    $referenced = $node->get($field_name)->referencedEntities();

    foreach ($referenced as $paragraph) {
      if (!method_exists($paragraph, 'getFieldDefinitions')) {
        continue;
      }

      $item = [];

      // Include paragraph metadata fields.
      $item['uuid'] = $paragraph->uuid();
      $item['langcode'] = $paragraph->language()->getId();

      // Type as array of paragraph type labels.
      $type_entity = $paragraph->getParagraphType();
      $item['type'] = $type_entity ? [$type_entity->label()] : [];

      // Created timestamp as string.
      $item['created'] = (string) $paragraph->getCreatedTime();

      // Behavior settings as serialized string.
      $behavior = $paragraph->getAllBehaviorSettings();
      $item['behavior_settings'] = serialize($behavior);

      // Default langcode.
      $item['default_langcode'] = $paragraph->isDefaultTranslation() ? '1' : '0';

      // Revision default.
      $item['revision_default'] = $paragraph->isDefaultRevision() ? '1' : '0';

      // Revision translation affected (include if available).
      if ($paragraph->hasField('revision_translation_affected') && !$paragraph->get('revision_translation_affected')->isEmpty()) {
        $item['revision_translation_affected'] = (string) $paragraph->get('revision_translation_affected')->value;
      }

      // Content fields (skip internal metadata already handled above).
      $skip_fields = [
        'id', 'uuid', 'revision_id', 'langcode', 'type',
        'status', 'parent_id', 'parent_type', 'parent_field_name',
        'behavior_settings', 'default_langcode',
        'revision_default', 'revision_translation_affected',
        'content_translation_source', 'content_translation_outdated',
        'content_translation_changed', 'created',
      ];

      $field_definitions = $paragraph->getFieldDefinitions();

      foreach ($field_definitions as $field_def) {
        $fname = $field_def->getName();

        if (in_array($fname, $skip_fields, TRUE)) {
          continue;
        }

        if (!$paragraph->hasField($fname) || $paragraph->get($fname)->isEmpty()) {
          continue;
        }

        $p_field = $paragraph->get($fname);
        $p_type = $field_def->getType();

        if ($p_type === 'string' || $p_type === 'string_long') {
          $item[$fname] = (string) $p_field->value;
        }
        elseif ($p_type === 'text_long' || $p_type === 'text_with_summary') {
          $item[$fname] = (string) ($p_field->value ?? '');
        }
        elseif ($p_type === 'entity_reference' || $p_type === 'entity_reference_revisions') {
          $refs = [];
          foreach ($p_field->referencedEntities() as $ref_entity) {
            $refs[] = $ref_entity->label();
          }
          $item[$fname] = $refs;
        }
        elseif ($p_type === 'image' || $p_type === 'file') {
          $files = [];
          foreach ($p_field->referencedEntities() as $file_entity) {
            if ($file_entity) {
              $uri = $file_entity->getFileUri();
              $absolute = \Drupal::service('file_url_generator')->generateAbsoluteString($uri);
              $files[] = preg_replace('#^https?://[^/]+#', '', $absolute);
            }
          }
          $item[$fname] = $files;
        }
        elseif ($p_type === 'link') {
          $links = [];
          foreach ($p_field as $link_item) {
            $links[] = [
              'uri' => $link_item->uri ?? '',
              'title' => $link_item->title ?? '',
            ];
          }
          $item[$fname] = count($links) === 1 ? $links[0] : $links;
        }
        else {
          $val = $p_field->value;
          $item[$fname] = $val !== NULL ? $val : $p_field->getValue();
        }
      }

      if (!empty($item)) {
        $result[] = $item;
      }
    }

    return $result;
  }

  /**
   * Extract content type references (node refs) to label + URL.
   */
  protected function extractContentTypeReference(NodeInterface $node, string $field_name): array {
    $result = [];

    if (!$node->hasField($field_name) || $node->get($field_name)->isEmpty()) {
      return $result;
    }

    foreach ($node->get($field_name)->referencedEntities() as $ref) {
      if ($ref->getEntityTypeId() !== 'node') {
        continue;
      }

      $url = $ref->toUrl()->toString();
      $url = preg_replace('#^/(en|ar)/#', '/', $url);
      $url = preg_replace('#^/blog/#', '/', $url);

      $result[] = [
        'label' => $ref->label(),
        'url' => $url,
      ];
    }

    return $result;
  }

  /**
   * {@inheritdoc}
   */
  public function getDeployConfig(): array {
    return [
      'fileName' => 'zu-faculty-list',
      'contentKey' => 'facultyData',
      'deployType' => 'faculty',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getExtraPayloadData(string $langcode): array {
    return [];
  }

}
