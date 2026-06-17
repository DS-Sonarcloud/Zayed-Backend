<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Password\PasswordInterface;
use Drupal\file\FileRepositoryInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Drupal\zu_rest_api\Constants;
use Drupal\webform\Entity\Webform;
use Drupal\node\NodeInterface;


class EventCreateController extends ControllerBase
{

    protected EntityTypeManagerInterface $etm;
    protected FileRepositoryInterface $fileRepository;
    protected FileSystemInterface $fileSystem;
    protected PasswordInterface $password;

    protected string $jwtSecret = Constants::JWT_SECRET;
    protected string $jwtAlgo = Constants::JWT_ALGO;

    public function __construct(
        EntityTypeManagerInterface $entityTypeManager,
        FileRepositoryInterface $fileRepository,
        FileSystemInterface $fileSystem,
        PasswordInterface $password
    ) {
        $this->etm = $entityTypeManager;
        $this->fileRepository = $fileRepository;
        $this->fileSystem = $fileSystem;
        $this->password = $password;
    }

    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('entity_type.manager'),
            $container->get('file.repository'),
            $container->get('file_system'),
            $container->get('password')
        );
    }

    /**
     * Login for event creator users.
     */
    public function login(Request $request)
    {
        $data = json_decode($request->getContent(), TRUE);
        $email = strtolower($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            return new JsonResponse(['error' => 'Email and password are required.'], 400);
        }

        $users = $this->etm
            ->getStorage('user')
            ->loadByProperties(['mail' => $email, 'status' => 1]);

        if (!$users) {
            return new JsonResponse(['error' => 'Invalid credentials.'], 401);
        }

        $user = reset($users);

        if (!$this->password->check($password, $user->getPassword())) {
            return new JsonResponse(['error' => 'Invalid credentials.'], 401);
        }

        if (!$user->hasRole('event_creation')) {
            return new JsonResponse(['error' => 'Access denied: event_creation role required'], 403);
        }

        $payload = [
            'uid' => $user->id(),
            'email' => $user->getEmail(),
            'exp' => time() + 3600,
        ];

        $token = JWT::encode($payload, $this->jwtSecret, $this->jwtAlgo);
        $refresh_token = bin2hex(random_bytes(32));

        \Drupal::database()->insert('zu_refresh_tokens')->fields([
            'uid' => $user->id(),
            'access_token' => $token,
            'refresh_token' => $refresh_token,
            'expires' => time() + Constants::REFRESH_TOKEN_LIFETIME,
        ])->execute();

        return new JsonResponse([
            'status' => 'success',
            'access_token' => $token,
            'refresh_token' => $refresh_token,
            'user' => [
                'uid' => $user->id(),
                'name' => $user->getAccountName(),
            ]
        ], 200);
    }

    /**
     * Create event with JWT.
     */
    public function createEvent(Request $request): JsonResponse
    {

        try {
            $request = \Drupal::request();
            $jwtUser = $request->attributes->get('jwt_user');
            $uid = $jwtUser->uid ?? NULL;
            $data = json_decode($request->getContent(), TRUE);

            if (empty($uid)) {
                throw new \Exception('Invalid token');
            }

            $user = $this->etm->getStorage('user')->load($uid);

            if (!$user || !$user->hasRole('event_creation') || !$user->isActive()) {
                throw new \Exception('Unauthorized user');
            }
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Unauthorized: ' . $e->getMessage()
            ], 401);
        }

        $input = $request->request->all();
        $files = $request->files->all();
        if (empty($input['title'])) {
            return new JsonResponse(['error' => 'Title is required'], 400);
        }

        $required_fields = [
            'title',
            'field_start_date',
            'field_registration',
            'field_if_require_singin',
        ];

        foreach ($required_fields as $field) {
            if (empty($input[$field])) {
                return new JsonResponse(['error' => "Missing required field: $field"], 400);
            }
        }

        $title = trim($input['title']);

        $existing = $this->etm->getStorage('node')
            ->getQuery()
            ->accessCheck(FALSE)
            ->condition('type', 'event')
            ->condition('title', $title)
            ->count()
            ->execute();


        if ($existing > 0) {
            return new JsonResponse(['error' => 'An event with this title already exists.'], 409);
        }

        $image_dir = 'public://events/';
        $file_dir = 'public://events/files/';

        $this->fileSystem->prepareDirectory($image_dir, FileSystemInterface::CREATE_DIRECTORY);
        $this->fileSystem->prepareDirectory($file_dir, FileSystemInterface::CREATE_DIRECTORY);

        $image_media_ids = [];
        $multi_media_ids = [];

        if (!empty($files['field_media_upload'])) {
            foreach ($files['field_media_upload'] as $uploaded) {
                if ($uploaded instanceof UploadedFile && $uploaded->isValid()) {
                    $image_media_ids[] = $this->saveMediaFile($uploaded, 'image', $image_dir, $title);
                }
            }
        }

        if (!empty($files['field_multimedia'])) {
            foreach ($files['field_multimedia'] as $uploaded) {
                if ($uploaded instanceof UploadedFile && $uploaded->isValid()) {
                    $multi_media_ids[] = $this->saveMediaFile($uploaded, $this->getMediaBundle($uploaded), $file_dir, $title);
                }
            }
        }
        $start_time = !empty($input['field_start_time'])
            ? $this->convertTimeToSeconds($input['field_start_time'])
            : NULL;

        $end_time = !empty($input['field_end_time'])
            ? $this->convertTimeToSeconds($input['field_end_time'])
            : NULL;



        $node_data = [
            'type' => 'event',
            'uid' => $uid,
            'title' => $title,
            'field_description' => [
                'value' => $input['field_description'] ?? '',
                'format' => 'full_html',
            ],
            'field_start_date' => $input['field_start_date'],
            'field_start_time' => $start_time,
            'field_end_date' => $input['field_end_date'] ?? NULL,
            'field_end_time' => $end_time,
            'field_event_type' => $this->normalizeTaxonomyField($input['field_event_type'] ?? NULL),
            'field_tags' => $this->normalizeMultiTaxonomy($input['field_tags'] ?? []),
            'field_venue' => $input['field_venue'] ?? NULL,
            'field_organizer_name' => $this->normalizeEntityReference($input['field_organizer_name'] ?? NULL),
            'field_location_venue' => $this->normalizeAddress($input['field_location_venue'] ?? []),
            'field_speakers' => $this->normalizeEntityReference($input['field_speakers'] ?? NULL),
            'field_registration' => (int) $input['field_registration'],
            'field_if_require_singin' => (int) $input['field_if_require_singin'],
            'field_select_webform' => $this->resolveWebform($input['field_select_webform'] ?? NULL),
            'field_show_social_media_icon' => $this->normalizeCheckboxes($input['field_show_social_media_icon'] ?? []),
            'field_media_upload' => array_filter($image_media_ids),
            'field_multimedia' => array_filter($multi_media_ids),
            'status' => NodeInterface::PUBLISHED,
        ];
        $node = $this->etm->getStorage('node')->create($node_data);
        $node->save();
        return new JsonResponse([
            'status' => 'success',
            'message' => 'Event created successfully.',
            'nid' => $node->id(),
        ], 201);
    }

    private function saveMediaFile(UploadedFile $uploaded, string $bundle, string $directory, string $alt): ?array
    {
        $filename = preg_replace('/[^A-Za-z0-9\.\-_]/', '_', $uploaded->getClientOriginalName());
        $file = $this->fileRepository->writeData(
            file_get_contents($uploaded->getRealPath()),
            $directory . $filename,
            FileSystemInterface::EXISTS_RENAME
        );

        if ($file) {
            $media = $this->etm->getStorage('media')->create([
                'bundle' => $bundle,
                'name' => $filename,
                $this->getMediaField($bundle) => [
                    'target_id' => $file->id(),
                    'alt' => $alt,
                ],
                'status' => 1,
            ]);
            $media->save();
            return ['target_id' => $media->id()];
        }

        return NULL;
    }

    private function getMediaBundle(UploadedFile $file): string
    {
        return match (strtolower($file->getClientOriginalExtension())) {
            'png', 'jpg', 'jpeg', 'webp' => 'image',
            'mp4', 'mov', 'avi' => 'video',
            default => 'document',
        };
    }

    private function getMediaField(string $bundle): string
    {
        return match ($bundle) {
            'image' => 'field_media_image',
            'video' => 'field_media_video_file',
            default => 'field_media_document',
        };
    }

    private function normalizeEntityReference($value): ?array
    {
        return !empty($value) && $value !== '_none' ? ['target_id' => (int)$value] : NULL;
    }

    private function normalizeTaxonomyField($value): ?array
    {
        return is_numeric($value) ? ['target_id' => (int)$value] : NULL;
    }

    private function normalizeMultiTaxonomy(array $values): array
    {
        return array_map(fn($tid) => ['target_id' => (int)$tid], array_filter($values));
    }

    private function resolveWebform($value): ?array
    {
        if (empty($value)) {
            return NULL;
        }

        if (is_numeric($value)) {
            return ['target_id' => (int) $value];
        }

        $webform = Webform::load($value);
        return $webform ? ['target_id' => $webform->id()] : NULL;
    }
    /**
     * Normalize and validate the address field based on country.
     */
    private function normalizeAddress(array $value): ?array
    {

        if (empty($value['country_code'])) {
            return NULL;
        }

        $country = strtoupper($value['country_code']);
        $uae_emirates = ['AZ', 'DU', 'SH', 'AJ', 'UQ', 'RK', 'FU'];

        switch ($country) {

            // ---------------- UAE ----------------
            case 'AE':
                if (empty($value['administrative_area']) || !in_array($value['administrative_area'], $uae_emirates)) {
                    return NULL;
                }

                return [
                    'country_code' => 'AE',
                    'address_line1' => $value['address_line1'] ?? '',
                    'address_line2' => $value['address_line2'] ?? '',
                    'locality' => $value['locality'] ?? '',
                    'administrative_area' => $value['administrative_area'],
                    'postal_code' => $value['postal_code'] ?? '',
                ];

                // ---------------- USA ----------------
            case 'US':
                if (empty($value['administrative_area']) || empty($value['postal_code'])) {
                    return NULL;
                }

                return [
                    'country_code' => 'US',
                    'address_line1' => $value['address_line1'] ?? '',
                    'address_line2' => $value['address_line2'] ?? '',
                    'locality' => $value['locality'] ?? '',
                    'administrative_area' => $value['administrative_area'],
                    'postal_code' => $value['postal_code'],
                ];

                // ---------------- INDIA ----------------
            case 'IN':
                if (empty($value['administrative_area']) || empty($value['postal_code'])) {
                    return NULL;
                }

                return [
                    'country_code' => 'IN',
                    'address_line1' => $value['address_line1'] ?? '',
                    'address_line2' => $value['address_line2'] ?? '',
                    'locality' => $value['locality'] ?? '',
                    'administrative_area' => $value['administrative_area'],
                    'postal_code' => $value['postal_code'],
                ];

                // ---------------- UK ----------------
            case 'GB':
                if (empty($value['locality']) || empty($value['postal_code'])) {
                    return NULL;
                }

                return [
                    'country_code' => 'GB',
                    'address_line1' => $value['address_line1'] ?? '',
                    'address_line2' => $value['address_line2'] ?? '',
                    'locality' => $value['locality'],
                    'postal_code' => $value['postal_code'],
                ];

                // ---------------- OTHER COUNTRIES ----------------
            default:
                return [
                    'country_code' => $country,
                    'address_line1' => $value['address_line1'] ?? '',
                    'address_line2' => $value['address_line2'] ?? '',
                    'locality' => $value['locality'] ?? '',
                    'administrative_area' => $value['administrative_area'] ?? '',
                    'postal_code' => $value['postal_code'] ?? '',
                ];
        }
    }
    private function normalizeCheckboxes($values): array
    {
        if (!is_array($values)) {
            return [];
        }

        $output = [];
        foreach ($values as $key => $value) {
            if (!empty($value)) {
                $output[] = ['value' => $value];
            }
        }
        return $output;
    }
    private function convertTimeToSeconds($timeString)
    {
        if (empty($timeString)) {
            return NULL;
        }

        $ts = strtotime($timeString);
        if (!$ts) {
            return NULL;
        }

        return intval(date('H', $ts)) * 3600
            + intval(date('i', $ts)) * 60
            + intval(date('s', $ts));
    }
}
