<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;
use Drupal\webform\Entity\Webform;
use Symfony\Component\Mime\MimeTypes;

/**
 * Provides a public resource for uploading Base64 encoded files for webforms.
 *
 * @RestResource(
 *   id = "webform_file_upload_resource",
 *   label = @Translation("Webform File Upload"),
 *   uri_paths = {
 *     "create" = "/api/webform/upload"
 *   }
 * )
 */
class WebformFileUploadResource extends ResourceBase {

  /**
   * Handles POST requests for file upload.
   */
  public function post(array $data) {
    // Validate required fields.
    if (empty($data['webform_id']) || !is_string($data['webform_id'])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'webform_id is required.',
      ], 400);
    }

    if (empty($data['field_name']) || !is_string($data['field_name'])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'field_name is required.',
      ], 400);
    }

    if (empty($data['file_data']) || !is_string($data['file_data'])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'file_data is required and must be a base64 string.',
      ], 400);
    }

    // Load webform and validate field.
    $webform = Webform::load($data['webform_id']);

    if (!$webform) {
      return new JsonResponse([
        'status' => 'error',
        'message' => "Webform '{$data['webform_id']}' not found.",
      ], 404);
    }

    $elements = $webform->getElementsDecodedAndFlattened();
    $field_name = $data['field_name'];

    if (!isset($elements[$field_name])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => "Field '$field_name' not found in webform '{$data['webform_id']}'.",
      ], 404);
    }

    $element = $elements[$field_name];
    $element_type = $element['#type'] ?? '';

    // Ensure the field is a file upload type.
    $file_types = ['managed_file', 'webform_managed_file', 'webform_image_file', 'webform_document_file', 'webform_audio_file', 'webform_video_file'];
    if (!in_array($element_type, $file_types)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => "Field '$field_name' is not a file upload field.",
      ], 400);
    }

    // Get allowed extensions from the field
    $allowed_extensions = '';
    if (!empty($element['#file_extensions'])) {
      $allowed_extensions = $element['#file_extensions'];
    }
    else {
      $allowed_extensions = \Drupal::config('webform.settings')
        ->get('file.default_managed_file_extensions') ?? '';
    }

    $base64_data = $data['file_data'];

    if (!str_contains($base64_data, 'base64,')) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Invalid base64 format. Expected: data:<mime>;base64,<data>',
      ], 400);
    }

    // Extract MIME type from base64 header.
    $header = substr($base64_data, 0, strpos($base64_data, ','));
    preg_match('/data:(.*?);base64/', $header, $match);

    if (empty($match[1])) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Unable to detect MIME type from base64 header.',
      ], 400);
    }

    $mime = $match[1];

    // Resolve file extension from MIME type using Symfony MimeTypes.
    $mimeTypes = new MimeTypes();
    $extensions = $mimeTypes->getExtensions($mime);

    if (empty($extensions)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => "Unable to determine file extension for MIME type: $mime",
      ], 400);
    }

    // Check which resolved extension is allowed by the webform field.
    $ext = NULL;
    if (!empty($allowed_extensions)) {
      $allowed_list = explode(' ', strtolower($allowed_extensions));
      // Find the first extension that matches the webform allowed list.
      foreach ($extensions as $candidate) {
        if (in_array(strtolower($candidate), $allowed_list)) {
          $ext = $candidate;
          break;
        }
      }

      if (!$ext) {
        return new JsonResponse([
          'status' => 'error',
          'message' => "File type '$mime' is not allowed for this field. Allowed extensions: $allowed_extensions",
        ], 400);
      }
    }
    else {
      $ext = $extensions[0];
    }

    // Decode base64 data.
    $raw = substr($base64_data, strpos($base64_data, ',') + 1);

    if (empty($raw)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Base64 data is empty.',
      ], 400);
    }

    $binary = base64_decode($raw, TRUE);

    if ($binary === FALSE) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Failed to decode base64 data.',
      ], 400);
    }

    // Validate file size (max 10MB).
    $max_size = 10 * 1024 * 1024;
    if (strlen($binary) > $max_size) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'File size exceeds the maximum allowed size of 10MB.',
      ], 400);
    }

    // Prepare upload directory.
    $directory = 'public://webform_uploads/' . date('Y-m');
    $fs = \Drupal::service('file_system');

    if (!$fs->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY)) {
      \Drupal::logger('zu_rest_api')->error('Failed to create upload directory: @dir', ['@dir' => $directory]);
      return new JsonResponse([
        'status' => 'error',
        'message' => 'Server error: unable to prepare upload directory.',
      ], 500);
    }

    $filename = 'upload_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
    $destination = $directory . '/' . $filename;

    try {
      $file_uri = $fs->saveData($binary, $destination, FileSystemInterface::EXISTS_RENAME);

      if (!$file_uri) {
        return new JsonResponse([
          'status' => 'error',
          'message' => 'Failed to save file to disk.',
        ], 500);
      }

      $file = File::create([
        'uri' => $file_uri,
        'uid' => 0,
      ]);
      $file->setPermanent();
      $file->save();

      if (!$file->id()) {
        return new JsonResponse([
          'status' => 'error',
          'message' => 'Failed to create file entity.',
        ], 500);
      }

      $url = \Drupal::service('file_url_generator')
        ->generateAbsoluteString($file->getFileUri());

      return new JsonResponse([
        'status' => 'success',
        'fid' => (int) $file->id(),
        'filename' => $filename,
        'mime' => $mime,
        'url' => $url,
      ], 200);
    }
    catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error('Webform file upload failed: @message', ['@message' => $e->getMessage()]);
      return new JsonResponse([
        'status' => 'error',
        'message' => 'File upload failed. Please try again.',
      ], 500);
    }
  }

}
