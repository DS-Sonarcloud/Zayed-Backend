<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\node\Entity\Node;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\media\Entity\Media;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Psr\Log\LoggerInterface;

/**
 * Provides a REST API endpoint for creating Events securely.
 *
 * @RestResource(
 *   id = "event_create_api",
 *   label = @Translation("Event Create API"),
 *   uri_paths = {
 *     "create" = "/api/v1/events/create"
 *   }
 * )
 */
class EventCreateResource extends ResourceBase
{

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new EventCreateResource object.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
  {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('zu_rest_api'),
      $container->get('current_user')
    );
  }

  /**
   * Responds to POST requests for event creation.
   */
  public function post(Request $request)
  {
    if ($request->isSecure() === FALSE) {
      return new JsonResponse(['error' => 'HTTPS required.'], 403);
    }

    if (strpos((string)$request->headers->get('Content-Type'), 'application/json') === FALSE) {
      return new JsonResponse(['error' => 'Content-Type must be application/json.'], 415);
    }

    $data = json_decode($request->getContent(), TRUE);
    if (empty($data) || !is_array($data)) {
      return new JsonResponse(['error' => 'Invalid or empty JSON payload.'], 400);
    }

    try {
      $file_repository = \Drupal::service('file.repository');
      $media_storage = \Drupal::entityTypeManager()->getStorage('media');
      $media_ids = [];
      $multimedia_ids = [];

      if (!empty($data['field_media_upload']) && is_array($data['field_media_upload'])) {
        foreach ($data['field_media_upload'] as $image_info) {
          if (empty($image_info['filedata'])) {
            continue;
          }

          $base64_string = preg_replace('#^data:image/\w+;base64,#i', '', $image_info['filedata']);
          $file_data = base64_decode($base64_string);
          if ($file_data === FALSE) {
            continue;
          }

          $filename = $image_info['filename'] ?? ('event_image_' . uniqid() . '.jpg');
          $file = $file_repository->writeData($file_data, 'public://' . $filename, \Drupal\Core\File\FileSystemInterface::EXISTS_RENAME);

          if ($file) {
            $media = $media_storage->create([
              'bundle' => 'image',
              'name' => $filename,
              'field_media_image' => [
                'target_id' => $file->id(),
                'alt' => $image_info['alt'] ?? $filename,
              ],
              'status' => 1,
            ]);
            $media->save();
            $media_ids[] = ['target_id' => $media->id()];
          }
        }
      }
      if (!empty($data['field_multimedia']) && is_array($data['field_multimedia'])) {
        foreach ($data['field_multimedia'] as $file_info) {
          if (empty($file_info['filedata']) || empty($file_info['mediatype'])) {
            continue;
          }

          $media_type = strtolower($file_info['mediatype']);
          $filedata = preg_replace('#^data:[^;]+;base64,#i', '', $file_info['filedata']);
          $decoded = base64_decode($filedata);
          if ($decoded === FALSE) {
            continue;
          }

          $filename = $file_info['filename'] ?? ('file_' . uniqid());
          $file = $file_repository->writeData($decoded, 'public://' . $filename, \Drupal\Core\File\FileSystemInterface::EXISTS_RENAME);

          if ($file) {
            switch ($media_type) {
              case 'image':
                $media = $media_storage->create([
                  'bundle' => 'image',
                  'name' => $filename,
                  'field_media_image' => ['target_id' => $file->id()],
                  'status' => 1,
                ]);
                break;

              case 'video':
                $media = $media_storage->create([
                  'bundle' => 'video',
                  'name' => $filename,
                  'field_media_video_file' => ['target_id' => $file->id()],
                  'status' => 1,
                ]);
                break;

              case 'document':
              default:
                $media = $media_storage->create([
                  'bundle' => 'document',
                  'name' => $filename,
                  'field_media_document' => ['target_id' => $file->id()],
                  'status' => 1,
                ]);
                break;
            }

            $media->save();
            $multimedia_ids[] = ['target_id' => $media->id()];
          }
        }
      }

      $node = \Drupal\node\Entity\Node::create([
        'type' => 'event',
        'title' => $data['title'] ?? 'Untitled Event',
        'field_description' => [
          'value' => $data['field_description'] ?? '',
          'format' => 'full_html',
        ],
        'field_start_date' => $data['field_start_date'] ?? '',
        'field_start_time' => $data['field_start_time'] ?? '',
        'field_end_date' => $data['field_end_date'] ?? '',
        'field_end_time' => $data['field_end_time'] ?? '',
        'field_event_type' => $data['field_event_type'] ?? NULL,
        'field_media_upload' => $media_ids,
        'field_multimedia' => $multimedia_ids,
        'field_location_venue' => $data['field_location_venue'] ?? NULL,
        'field_organizer_name' => $data['field_organizer_name'] ?? NULL,
        'field_registration' => $data['field_registration'] ?? 0,
        'field_registration_url' => $data['field_registration_url'] ?? '',
        'field_registration_link' => $data['field_registration_link'] ?? '',
        'field_if_require_singin' => $data['field_if_require_singin'] ?? 0,
        'field_selectwebform' => $data['field_selectwebform'] ?? NULL,
        'field_speakers' => $data['field_speakers'] ?? NULL,
        'field_tags' => $data['field_tags'] ?? NULL,
        'field_venue' => $data['field_venue'] ?? '',
        'status' => 1,
      ]);

      $node->save();

      return new JsonResponse([
        'status' => 'success',
        'message' => 'Event created successfully.',
        'nid' => $node->id(),
        'media_uploads' => $media_ids,
        'multimedia_uploads' => $multimedia_ids,
      ], 201);
    } catch (\Exception $e) {
      \Drupal::logger('zu_rest_api')->error('API error: @msg', ['@msg' => $e->getMessage()]);
      return new JsonResponse(['error' => 'Server error: ' . $e->getMessage()], 500);
    }
  }
}
