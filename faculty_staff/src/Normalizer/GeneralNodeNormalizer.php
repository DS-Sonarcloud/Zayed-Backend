<?php

namespace Drupal\faculty_staff\Normalizer;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityTypeRepositoryInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\Entity\Node;
use Drupal\serialization\Normalizer\ContentEntityNormalizer;
use Drupal\user\Entity\User;
use Drupal\taxonomy\Entity\Term;

class GeneralNodeNormalizer extends ContentEntityNormalizer {

  /**
   * The formats supported by this normalizer.
   */
  protected $format = ['json', 'hal_json'];

  /**
   * The current entity type manager.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected Connection $database;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected AccountInterface $currentUser;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    EntityTypeRepositoryInterface $entity_type_repository,
    EntityFieldManagerInterface $entity_field_manager,
    Connection $database,
    AccountInterface $current_user,
  ) {
    parent::__construct($entity_type_manager, $entity_type_repository, $entity_field_manager);
    $this->entityTypeManager = $entity_type_manager;
    $this->database = $database;
    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public function supportsNormalization($data, ?string $format = NULL, array $context = []): bool {
    return $data instanceof Node && in_array($format, $this->format);
  }

  /**
   * {@inheritdoc}
   */
  public function normalize($entity, $format = NULL, array $context = []): array|string|int|float|bool|\ArrayObject|NULL {
    $normalized = parent::normalize($entity, $format, $context);

    if ($entity->bundle() === 'faculty_staff') {
			$terms = $normalized['field_area_of_expertise'];
			if (!empty($terms)) {
        foreach ($terms as $key => $data) {
					$term = Term::load($data['target_id']);
					if ($term) {
						$normalized['field_area_of_expertise'][$key]['name'] = $term->label();
						$normalized['field_area_of_expertise'][$key]['id'] = $term->id();
					}
				}
      }

      $terms = $normalized['field_campus'];
			if (!empty($terms)) {
				$id = $terms[0]['target_id'];
        $term = Term::load($id);
        if ($term) {
          $normalized['field_campus'][0]['name'] = $term->label();
          $normalized['field_campus'][0]['id'] = $term->id();
        }
      }

			$terms = $normalized['field_position'];
			if (!empty($terms)) {
				$id = $terms[0]['target_id'];
        $term = Term::load($id);
        if ($term) {
          $normalized['field_position'][0]['name'] = $term->label();
          $normalized['field_position'][0]['id'] = $term->id();
        }
      }

      $terms = $normalized['field_college'];
      if (!empty($terms)) {
        $id = $terms[0]['target_id'];
        $college_node = $this->entityTypeManager->getStorage('node')->load($id);
        if ($college_node) {
          $normalized['field_college'][0]['name'] = $college_node->getTitle();
          $normalized['field_college'][0]['id'] = $college_node->id();
        }
      }

      $terms = $normalized['field_department'];
			if (!empty($terms)) {
        foreach ($terms as $key => $data) {
					$term = Term::load($data['target_id']);
					if ($term) {
						$normalized['field_department'][$key]['name'] = $term->label();
						$normalized['field_department'][$key]['id'] = $term->id();
					}
				}
      }

      $media_data = $normalized['field_photo'];
      if (!empty($media_data)) {
        $id = $media_data[0]['target_id'];
				$media = $this->entityTypeManager->getStorage('media')->load($id);
				$bundle = $media->bundle();
				if ($bundle === 'image') {
					// Fetch file URL from media.
					$file = $media->get('field_media_image')->entity;
					if ($file) {
						$normalized['field_photo'][0]['type'] = 'image';
						$normalized['field_photo'][0]['image_url'] = $file->createFileUrl(FALSE);
						$normalized['field_photo'][0]['image_alt'] = $media->get('field_media_image')->alt ?? '';
					}
				}
      }

			// Fetch paragraph entities field values
			$background = $normalized['field_background'];
			if (!empty($background)) {
				foreach ($background as $key => $data) {
					$paragraph = $this->entityTypeManager->getStorage('paragraph')->load($data['target_id']);
					if ($paragraph) {
						$normalized['field_background'][$key]['heading'] = $paragraph->get('field_heading')->value ?? '';
						$normalized['field_background'][$key]['description'] = $paragraph->get('field_description')->value ?? '';
					}
				}
			}

			$background = $normalized['field_research'];
			if (!empty($background)) {
				foreach ($background as $key => $data) {
					$paragraph = $this->entityTypeManager->getStorage('paragraph')->load($data['target_id']);
					if ($paragraph) {
						$normalized['field_research'][$key]['heading'] = $paragraph->get('field_heading')->value ?? '';
						$normalized['field_research'][$key]['description'] = $paragraph->get('field_description')->value ?? '';
					}
				}
			}

			$background = $normalized['field_teaching'];
			if (!empty($background)) {
				foreach ($background as $key => $data) {
					$paragraph = $this->entityTypeManager->getStorage('paragraph')->load($data['target_id']);
					if ($paragraph) {
						$normalized['field_teaching'][$key]['heading'] = $paragraph->get('field_heading')->value ?? '';
						$normalized['field_teaching'][$key]['description'] = $paragraph->get('field_description')->value ?? '';
					}
				}
			}

			$background = $normalized['field_recent_publications'];
			if (!empty($background)) {
				foreach ($background as $key => $data) {
					$paragraph = $this->entityTypeManager->getStorage('paragraph')->load($data['target_id']);
					if ($paragraph) {
						$normalized['field_recent_publications'][$key]['heading'] = $paragraph->get('field_heading')->value ?? '';
						$normalized['field_recent_publications'][$key]['description'] = $paragraph->get('field_description')->value ?? '';
					}
				}
			}

    }

		elseif ($entity->bundle() === 'news') {
			$terms = $normalized['field_categories'];
			if (!empty($terms)) {
        foreach ($terms as $key => $data) {
					$term = Term::load($data['target_id']);
					if ($term) {
						$normalized['field_categories'][$key]['name'] = $term->label();
						$normalized['field_categories'][$key]['id'] = $term->id();
					}
				}
      }

			$terms = $normalized['field_tags'];
			if (!empty($terms)) {
        foreach ($terms as $key => $data) {
					$term = Term::load($data['target_id']);
					if ($term) {
						$normalized['field_tags'][$key]['name'] = $term->label();
						$normalized['field_tags'][$key]['id'] = $term->id();
					}
				}
      }

			$terms = $normalized['field_campus'];
			if (!empty($terms)) {
				$id = $terms[0]['target_id'];
        $term = Term::load($id);
        if ($term) {
          $normalized['field_campus'][0]['name'] = $term->label();
          $normalized['field_campus'][0]['id'] = $term->id();
        }
      }

			$media_data = $normalized['field_featured_image'];
      if (!empty($media_data)) {
        $id = $media_data[0]['target_id'];
				$media = $this->entityTypeManager->getStorage('media')->load($id);
				$bundle = $media->bundle();
				if ($bundle === 'image') {
					// Fetch file URL from media.
					$file = $media->get('field_media_image')->entity;
					if ($file) {
						$normalized['field_featured_image'][0]['type'] = 'image';
						$normalized['field_featured_image'][0]['image_url'] = $file->createFileUrl(FALSE);
						$normalized['field_featured_image'][0]['image_alt'] = $media->get('field_media_image')->alt ?? '';
					}
				}
      }

			$media_data = $normalized['field_thumbnail'];
      if (!empty($media_data)) {
        $id = $media_data[0]['target_id'];
				$media = $this->entityTypeManager->getStorage('media')->load($id);
				$bundle = $media->bundle();
				if ($bundle === 'image') {
					// Fetch file URL from media.
					$file = $media->get('field_media_image')->entity;
					if ($file) {
						$normalized['field_thumbnail'][0]['type'] = 'image';
						$normalized['field_thumbnail'][0]['image_url'] = $file->createFileUrl(FALSE);
						$normalized['field_thumbnail'][0]['image_alt'] = $media->get('field_media_image')->alt ?? '';
					}
				}
      }

			$media_data = $normalized['field_image_gallery'];
      if (!empty($media_data)) {
        foreach ($media_data as $key => $data) {
          $media = $this->entityTypeManager->getStorage('media')->load($data['target_id']);
          $bundle = $media->bundle();
          if ($bundle === 'image') {
            // Fetch file URL from media.
            $file = $media->get('field_media_image')->entity;
            if ($file) {
              $normalized['field_image_gallery'][$key]['type'] = 'image';
              $normalized['field_image_gallery'][$key]['image_url'] = $file->createFileUrl(FALSE);
              $normalized['field_image_gallery'][$key]['image_alt'] = $media->get('field_media_image')->alt ?? '';
            }
          }
        }
      }


		}

    return $normalized;
  }

  /**
   * {@inheritdoc}
   */
  protected function getSupportedEntityTypeIds(): array {
    return ['node'];
  }
}
