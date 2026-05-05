<?php

namespace Drupal\elementor\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\file\Entity\File;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class FileBrowserController extends ControllerBase
{

    public function popup(Request $request)
    {
        // Load recent image files.
        $query = \Drupal::entityTypeManager()->getStorage('file')->getQuery()
            ->accessCheck(TRUE)
            ->condition('status', 1)
            ->sort('created', 'DESC')
            ->range(0, 20);

        $fids = $query->execute();
        $files = \Drupal::entityTypeManager()->getStorage('file')->loadMultiple($fids);

        $items = '';
        foreach ($files as $file) {
            /** @var \Drupal\file\Entity\File $file */
            $mime = $file->getMimeType();
            if (strpos($mime, 'image/') === 0) {
                $url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
                $items .= "<div class='file-item' onclick='selectFile(\"{$file->id()}\", \"{$url}\")'>
          <img src='{$url}' alt='' />
        </div>";
            }
        }

        $uploadUrl = '/elementor/file-upload';

        $html = <<<'HTML'
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Select File</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; color: #222; background: #fff; }
    h3 { margin-bottom: 10px; font-weight: 600; }
    .upload-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
    }
    .upload-box input[type="file"] { flex: 1; }
    .upload-box button {
      padding: 8px 16px;
      background: #0073e6;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .upload-box button:hover { background: #005bb5; }
    .file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }
    .file-item {
        border: 1px solid #ddd;
        background: #fafafa;
        padding: 0;
        cursor: pointer;
        text-align: center;
        transition: 0.2s;
        overflow: hidden;
        border-radius: 6px;
        aspect-ratio: 1 / 1;
        }
    .file-item:hover {
      transform: scale(1.03);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .file-item img {
        width: 100%;
        height: 100%;
        object-fit: cover; 
        display: block;
    }
  </style>
</head>
<body>

  <h3>Upload new file</h3>
  <form id="uploadForm" class="upload-box" enctype="multipart/form-data">
    <input type="file" name="file" accept="image/*" required />
    <button type="submit">Upload</button>
  </form>

  <h3>Select a recent file</h3>
  <div class="file-grid" id="fileGrid">
    {{file_items}}
  </div>

  <script>
    function selectFile(id, url) {
      const payload = { type: 'file-selected', id: id, url: url };
      try {
        if (window.opener) {
          window.opener.postMessage(payload, '*');
        } else if (window.parent) {
          window.parent.postMessage(payload, '*');
        }
      } catch (e) {}
      window.close();
    }

    // Upload file
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const fileInput = this.querySelector('input[name="file"]');
      if (!fileInput.files.length) {
        alert('Please select a file to upload.');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/elementor/file-upload', true);

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          console.log('Upload response:', xhr.responseText);
          try {
            const resp = JSON.parse(xhr.responseText);
            if (resp.status === 'success') {
              const grid = document.getElementById('fileGrid');
              const item = document.createElement('div');
              item.className = 'file-item';
              item.innerHTML = '<img src="' + resp.url + '" alt="uploaded" />';
              item.onclick = function() { selectFile(resp.id, resp.url); };
              grid.prepend(item);
              fileInput.value = '';
              alert('File uploaded successfully!');
            } else {
              alert('Upload failed: ' + (resp.message || 'Unknown error'));
            }
          } catch (err) {
            console.error('Invalid JSON:', xhr.responseText);
            alert('Error uploading file.');
          }
        }
      };
      xhr.send(formData);
    });
  </script>

</body>
</html>
HTML;

        // Inject dynamic grid markup.
        $html = str_replace('{{file_items}}', $items, $html);

        return new Response($html);
    }

    public function upload(Request $request)
    {
        // Validate uploaded file.
        if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            \Drupal::logger('elementor')->error('Upload failed. FILES: @files', ['@files' => print_r($_FILES, TRUE)]);
            return new JsonResponse([
                'status' => 'error',
                'message' => 'No file uploaded or PHP error.',
            ]);
        }

        $file_info = $_FILES['file'];
        $original_name = $file_info['name'];
        $tmp_path = $file_info['tmp_name'];

        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $ext = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed_extensions)) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Invalid file extension: ' . $ext,
            ]);
        }

        // Save to public://
        $directory = 'public://';
        $file_system = \Drupal::service('file_system');
        $destination = $file_system->createFilename($original_name, $directory);
        $file_uri = $file_system->copy($tmp_path, $destination, \Drupal\Core\File\FileSystemInterface::EXISTS_RENAME);

        if (!$file_uri) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Failed to save uploaded file.',
            ]);
        }

        $file = File::create(['uri' => $file_uri]);
        $file->setPermanent();
        $file->save();

        $url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());

        return new JsonResponse([
            'status' => 'success',
            'id' => $file->id(),
            'url' => $url,
        ]);
    }
}
