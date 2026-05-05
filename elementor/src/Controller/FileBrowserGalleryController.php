<?php

namespace Drupal\elementor\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\file\Entity\File;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class FileBrowserGalleryController extends ControllerBase
{

  /**
   * Multi-select gallery popup.
   */
  public function popup(Request $request)
  {
    // Load latest image files.
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
        $items .= "<div class='file-item' data-id='{$file->id()}' data-url='{$url}'>
          <img src='{$url}' alt='' />
          <div class='checkmark'>&#10003;</div>
        </div>";
      }
    }

    $html = <<<HTML
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Select Gallery Images</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 20px; background: #fff; color: #222; }
  h3 { margin-bottom: 12px; font-weight: 600; }
  .upload-box {
    display: flex; align-items: center; gap: 10px;
    background: #f8f9fa; border: 1px solid #ddd;
    border-radius: 6px; padding: 12px; margin-bottom: 20px;
  }
  .upload-box input[type=file]{ flex:1; }
  .upload-box button {
    padding:8px 16px; border:none; border-radius:4px;
    background:#0073e6; color:#fff; cursor:pointer;
  }
  .upload-box button:hover { background:#005bb5; }
  .file-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr));
    gap:15px;
  }
  .file-item {
    position:relative; border:2px solid #ddd; border-radius:6px;
    overflow:hidden; cursor:pointer; transition:0.2s; aspect-ratio:1/1;
  }
  .file-item img {
    width:100%; height:100%; object-fit:cover; display:block;
  }
  .file-item:hover { transform:scale(1.03); box-shadow:0 2px 10px rgba(0,0,0,0.1); }
  .file-item.selected { border-color:#0073e6; box-shadow:0 0 0 3px rgba(0,115,230,0.3); }
  .file-item .checkmark {
    position:absolute; top:8px; right:8px; width:20px; height:20px;
    background:#0073e6; color:#fff; border-radius:50%;
    font-size:14px; display:none; align-items:center; justify-content:center;
  }
  .file-item.selected .checkmark { display:flex; }
  #confirmBtn {
    margin-top:20px; padding:10px 18px; border:none;
    border-radius:4px; background:#0073e6; color:#fff; cursor:pointer;
  }
  #confirmBtn:hover { background:#005bb5; }
</style>
</head>
<body>

  <h3>Upload new images</h3>
  <form id="uploadForm" class="upload-box" enctype="multipart/form-data">
    <input type="file" name="files[]" accept="image/*" multiple required />
    <button type="submit">Upload</button>
  </form>

  <h3>Select one or more images</h3>
  <div class="file-grid" id="fileGrid">
    {{file_items}}
  </div>

  <button id="confirmBtn">Add Selected Images</button>

  <script>
window.addEventListener("DOMContentLoaded", function() {

  // --- Restore preselected images if coming from control ---
  const params = new URLSearchParams(window.location.search);
  const preselectedRaw = params.get('selected') || '[]';
  let preselected = [];
  try { preselected = JSON.parse(decodeURIComponent(preselectedRaw)); } catch(e){}

  // Collect IDs of preselected images
  let selected = preselected.map(f => String(f.id));
  document.querySelectorAll('.file-item').forEach(item => {
    const id = String(item.dataset.id);
    if (selected.includes(id)) item.classList.add('selected');
    item.addEventListener('click', () => toggleSelect(id, item.dataset.url, item));
  });

  function toggleSelect(id, url, el) {
    const index = selected.indexOf(String(id));
    if (index > -1) {
      selected.splice(index, 1);
      el.classList.remove('selected');
    } else {
      selected.push(String(id));
      el.classList.add('selected');
    }
  }

  // --- Confirm selection
  document.getElementById('confirmBtn').addEventListener('click', function() {
    const files = [];
    document.querySelectorAll('.file-item.selected').forEach(el => {
      files.push({ id: el.dataset.id, url: el.dataset.url });
    });
    const payload = { type: 'files-selected', files: files };
    try {
      if (window.opener) window.opener.postMessage(payload, '*');
      else if (window.parent) window.parent.postMessage(payload, '*');
    } catch(e){}
    window.close();
  });

  // --- Upload new file
  document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fileInput = this.querySelector('input[name="files[]"]');
  const files = fileInput.files;

  if (!files.length) {
    alert('Select at least one image.');
    return;
  }

  const fd = new FormData();

  // Important: append each file correctly
  for (let i = 0; i < files.length; i++) {
    fd.append('files[' + i + ']', files[i]);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/elementor/multifile-upload', true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      try {
        const resp = JSON.parse(xhr.responseText);
        if (resp.status === 'success' && Array.isArray(resp.files)) {
          const grid = document.getElementById('fileGrid');
          resp.files.forEach(f => {
            const div = document.createElement('div');
            div.className = 'file-item selected';
            div.dataset.id = f.id;
            div.dataset.url = f.url;
            div.innerHTML = '<img src="' + f.url + '"><div class="checkmark">&#10003;</div>';
            grid.prepend(div);
          });
          alert('Files uploaded successfully!');
        } else {
          alert('Upload failed: ' + (resp.message || 'Unknown error'));
        }
      } catch (e) {
        console.error('Upload parse error:', xhr.responseText);
        alert('Error uploading files.');
      }
      fileInput.value = '';
    }
  };

  xhr.send(fd);
});

});
</script>


</body>
</html>
HTML;

    $html = str_replace('{{file_items}}', $items, $html);
    return new Response($html);
  }

  /**
   * Reuse same upload endpoint from FileBrowserController.
   */
  public function upload(Request $request)
  {
    // Check if files exist.
    if (empty($_FILES['files']) || !isset($_FILES['files']['name']) || count($_FILES['files']['name']) === 0) {
      \Drupal::logger('elementor')->error('No files in upload request: @data', ['@data' => print_r($_FILES, TRUE)]);
      return new JsonResponse(['status' => 'error', 'message' => 'No file uploaded or PHP error.']);
    }

    $files_data = $_FILES['files'];
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $fs = \Drupal::service('file_system');
    $uploaded = [];

    // Loop through uploaded files
    foreach ($files_data['name'] as $index => $name) {
      if ($files_data['error'][$index] !== UPLOAD_ERR_OK) {
        continue;
      }

      $tmp_name = $files_data['tmp_name'][$index];
      $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

      if (!in_array($ext, $allowed)) {
        continue;
      }

      // Create unique filename and copy
      $dest = $fs->createFilename($name, 'public://');
      $uri = $fs->copy($tmp_name, $dest, \Drupal\Core\File\FileSystemInterface::EXISTS_RENAME);

      if (!$uri) {
        continue;
      }

      $file = File::create(['uri' => $uri]);
      $file->setPermanent();
      $file->save();

      $url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
      $uploaded[] = ['id' => $file->id(), 'url' => $url];
    }

    if (empty($uploaded)) {
      return new JsonResponse([
        'status' => 'error',
        'message' => 'No valid files uploaded.'
      ]);
    }

    return new JsonResponse([
      'status' => 'success',
      'files' => $uploaded
    ]);
  }
}
