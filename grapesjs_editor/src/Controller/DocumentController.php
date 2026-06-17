<?php

namespace Drupal\grapesjs_editor\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;
use Drupal\grapesjs_editor\Services\DocumentManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Returns responses for Document routes.
 */
class DocumentController extends ControllerBase
{

  /**
   * The file system service.
   */
  protected $fileSystem;

  /**
   * The document manager service.
   */
  protected $documentManager;

  /**
   * DocumentController constructor.
   */
  public function __construct(FileSystemInterface $file_system, DocumentManager $document_manager)
  {
    $this->fileSystem = $file_system;
    $this->documentManager = $document_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('file_system'),
      $container->get('grapesjs_editor.document_manager')
    );
  }

  /**
   * Handles document uploads using file repository service.
   */
  public function uploadDocuments()
  {
    $directory = 'public://upload/grapesjs-documents';
    $assets = [];
    $errors = [];

    if (!$this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY)) {
      return new JsonResponse(['data' => [], 'errors' => ['Failed to create upload directory']]);
    }

    // Handle multiple files
    if (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
      $file_count = count($_FILES['files']['name']);

      for ($i = 0; $i < $file_count; $i++) {
        if ($_FILES['files']['error'][$i] !== UPLOAD_ERR_OK) {
          $errors[] = 'Upload error for ' . $_FILES['files']['name'][$i];
          continue;
        }

        try {
          $file_data = file_get_contents($_FILES['files']['tmp_name'][$i]);
          $filename = $_FILES['files']['name'][$i];

          // Use file repository to save
          $file = \Drupal::service('file.repository')->writeData(
            $file_data,
            $directory . '/' . $filename,
            FileSystemInterface::EXISTS_RENAME
          );

          if ($file) {
            $file->setPermanent();
            $file->save();
            $assets[] = $this->documentManager->buildAsset($file);
          } else {
            $errors[] = 'Failed to save ' . $filename;
          }
        } catch (\Exception $e) {
          $errors[] = 'Error: ' . $e->getMessage();
        }
      }
    }

    return new JsonResponse(['data' => $assets, 'errors' => $errors]);
  }

  /**
   * Returns a list of documents.
   */
  public function getDocuments()
  {
    $assets = $this->documentManager->getAssets();
    return new JsonResponse(['data' => $assets]);
  }

  /**
   * Deletes a document by UUID.
   */
  public function deleteDocument($uuid)
  {
    try {
      $files = \Drupal::entityTypeManager()
        ->getStorage('file')
        ->loadByProperties(['uuid' => $uuid]);

      if (empty($files)) {
        return new JsonResponse(['success' => false, 'error' => 'File not found'], 404);
      }

      $file = reset($files);
      $file->delete();

      return new JsonResponse(['success' => true]);
    } catch (\Exception $e) {
      return new JsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
  }
}
