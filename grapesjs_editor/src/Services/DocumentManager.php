<?php

namespace Drupal\grapesjs_editor\Services;

use Drupal\file\Entity\File;
use Drupal\file\FileInterface;
use Drupal\Core\File\FileSystemInterface;

/**
 * Defines a class to manage document assets.
 */
class DocumentManager
{

    /**
     * The file system service.
     *
     * @var \Drupal\Core\File\FileSystemInterface
     */
    protected $fileSystem;

    /**
     * DocumentManager constructor.
     *
     * @param \Drupal\Core\File\FileSystemInterface $file_system
     *   The file system service.
     */
    public function __construct(FileSystemInterface $file_system)
    {
        $this->fileSystem = $file_system;
    }

    /**
     * Build asset array for a document file.
     *
     * @param \Drupal\file\FileInterface $file
     *   The file to transform.
     *
     * @return array
     *   The asset array with file data.
     */
    public function buildAsset(FileInterface $file)
    {
        $extension = strtolower(pathinfo($file->getFileUri(), PATHINFO_EXTENSION));

        return [
            'type' => 'file',
            'name' => $file->getFilename(),
            'src' => $file->createFileUrl(FALSE),
            'extension' => $extension,
            'size' => $file->getSize() . ' bytes',
            'data' => [
                'entity-uuid' => $file->uuid(),
                'entity-type' => 'file',
            ],
        ];
    }

    /**
     * Returns document assets array.
     *
     * @return array
     *   The document assets array.
     */
    public function getAssets()
    {
        $directory = 'public://upload/grapesjs-documents';
        if (!$this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY)) {
            return [];
        }

        // Load files that are in our specific directory.
        $query = \Drupal::entityQuery('file')
            ->condition('uri', $directory . '/%', 'LIKE')
            ->accessCheck(FALSE)
            ->sort('created', 'DESC');

        $fids = $query->execute();
        if (empty($fids)) {
            return [];
        }

        $files = File::loadMultiple($fids);
        return array_map([$this, 'buildAsset'], array_values($files));
    }
}
