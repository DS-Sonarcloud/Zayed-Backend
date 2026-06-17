<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\File\FileSystemInterface;
use Drupal\file\Entity\File;

class WebformUploadController extends ControllerBase
{
    public function upload(Request $request)
    {
        $jwt = $request->attributes->get('jwt_user');
        if (!$jwt || empty($jwt->user_id)) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Unauthorized: missing or invalid token.',
            ], 401);
        }

        $data = json_decode($request->getContent(), TRUE);

        if (empty($data['file_data'])) {
            return new JsonResponse(['status' => 'error', 'message' => 'file_data is required'], 400);
        }

        $base64 = $data['file_data'];
        if (!str_contains($base64, 'base64,')) {
            return new JsonResponse(['status' => 'error', 'message' => 'Invalid base64 format'], 400);
        }

        $header = substr($base64, 0, strpos($base64, ','));
        preg_match('/data:(.*?);base64/', $header, $match);

        if (empty($match[1])) {
            return new JsonResponse(['status' => 'error', 'message' => 'Unable to detect MIME type'], 400);
        }

        $mime = $match[1];
        $ext_map = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/bmp' => 'bmp',
            'application/pdf' => 'pdf',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/vnd.ms-excel' => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
            'application/vnd.ms-powerpoint' => 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
            'text/plain' => 'txt',
            'text/html' => 'html',
            'audio/mpeg' => 'mp3',
            'audio/wav' => 'wav',
            'video/mp4' => 'mp4',
            'video/quicktime' => 'mov',
        ];

        if (!isset($ext_map[$mime])) {
            return new JsonResponse([
                'status' => 'error',
                'message' => "Unsupported MIME type: $mime",
            ], 400);
        }

        $ext = $ext_map[$mime];
        $raw = substr($base64, strpos($base64, ',') + 1);
        $binary = base64_decode($raw);

        if ($binary === false) {
            return new JsonResponse(['status' => 'error', 'message' => 'Failed to decode Base64'], 400);
        }
        $directory = 'public://webform_uploads/' . date('Y-m');

        $fs = \Drupal::service('file_system');
        $fs->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY);

        $filename = 'upload_' . time() . '.' . $ext;
        $destination = $directory . '/' . $filename;

        try {
            $file_uri = $fs->saveData($binary, $destination, FileSystemInterface::EXISTS_RENAME);

            $file = File::create([
                'uri' => $file_uri,
                'uid' => 0, 
            ]);

            $file->setPermanent();

            $file->save();

            $url = \Drupal::service('file_url_generator')
                ->generateAbsoluteString($file->getFileUri());

            return new JsonResponse([
                'status' => 'success',
                'fid' => $file->id(),
                'filename' => $filename,
                'mime' => $mime,
                'url' => $url,
            ], 200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'File save failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
