<?php

namespace Drupal\grapesjs_editor\Services;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Image\ImageFactory;
use Drupal\file\FileInterface;

/**
 * Defines a class to manage asset object.
 */
class AssetManager {

  /**
   * The image factory service.
   *
   * @var \Drupal\Core\Image\ImageFactory
   */
  protected $imageFactory;

  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * AssetManager constructor.
   *
   * @param \Drupal\Core\Image\ImageFactory $image_factory
   *   The image factory service.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(ImageFactory $image_factory, EntityTypeManagerInterface $entity_type_manager) {
    $this->imageFactory = $image_factory;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * Build asset array with file parameter.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file to transform.
   *
   * @return array
   *   The asset array with file data.
   */
  public function buildAsset(FileInterface $file) {
    $asset = [
      'type' => 'image',
      'src' => $file->createFileUrl(FALSE),
      'data' => [
        'entity-uuid' => $file->uuid(),
        'entity-type' => 'file',
      ],
    ];

    $image = $this->imageFactory->get($file->getFileUri());
    if ($image->isValid()) {
      $asset['width'] = $image->getWidth();
      $asset['height'] = $image->getHeight();
    }

    return $asset;
  }

  /**
   * Returns assets array.
   *
   * @return array
   *   The assets array.
   */
  public function getAssets() {
    $storage = $this->entityTypeManager->getStorage('file');
    $query = $storage->getQuery()
      ->accessCheck(FALSE)
      ->sort('created', 'DESC');

    $fids = $query->execute();
    if (empty($fids)) {
      return [];
    }

    /* @var \Drupal\file\FileInterface[] $files */
    $files = $storage->loadMultiple($fids);
    $assets = [];

    foreach ($fids as $fid) {
      if (!isset($files[$fid])) {
        continue;
      }
      $assets[] = $this->buildAsset($files[$fid]);
    }

    return $assets;
  }

}
