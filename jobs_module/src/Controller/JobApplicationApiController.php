<?php

namespace Drupal\jobs_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\node\Entity\Node;
use Drupal\zu_public_user\Entity\PublicUser;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Drupal\zu_rest_api\Constants;
use Drupal\file\Entity\File;
use Drupal\Core\File\FileExists;

class JobApplicationApiController extends ControllerBase {

  private const ERR_MISSING_TOKEN = 'Missing token';
  private const ERR_INVALID_TOKEN = 'Invalid token';
  private const ERR_USER_NOT_FOUND = 'User not found';

  /**
   * GET API — Prefill data.
   */
  public function getApplication($job_id, Request $request) {
    $jwt = $this->extractToken($request);
    if (!$jwt) {
      return new JsonResponse(['error' => self::ERR_MISSING_TOKEN], 401);
    }

    try {
      $decoded = JWT::decode($jwt, new Key(Constants::jwtSecret(), Constants::JWT_ALGO));
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => self::ERR_INVALID_TOKEN], 401);
    }

    $uid = $decoded->user_id;
    $user = PublicUser::load($uid);
    if (!$user) {
      return new JsonResponse(['error' => self::ERR_USER_NOT_FOUND], 404);
    }

    $job = Node::load($job_id);
    if (!$job) {
      return new JsonResponse(['error' => 'Job not found'], 404);
    }

    $record = \Drupal::database()->select('job_application', 'ja')
      ->fields('ja')
      ->condition('job_id', $job_id)
      ->condition('public_user_id', $uid)
      ->execute()
      ->fetchAssoc();

    $resume_url = NULL;
    if (!empty($record['resume_fid']) && ($file = File::load($record['resume_fid']))) {
      $resume_url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
    }

    return new JsonResponse([
      'status' => 'success',
      'job' => [
        'id' => $job_id,
        'title' => $job->getTitle(),
      ],
      'user' => [
        'id' => $uid,
        'name' => $user->get('name')->value,
        'email' => $user->get('email')->value,
      ],
      'application' => $record ? [
        'applicant_name' => $record['applicant_name'],
        'mobile_number' => $record['mobile_number'],
        'cover_letter' => $record['cover_letter'],
        'resume_url' => $resume_url,
        'status' => $record['status'],
      ] : NULL,
    ]);
  }

  /**
   * POST API — Insert OR Update Application.
   */
  public function submit(Request $request, $job_id) {
    $jwt = $this->extractToken($request);
    if (!$jwt) {
      return new JsonResponse(['error' => self::ERR_MISSING_TOKEN], 401);
    }

    try {
      $decoded = JWT::decode($jwt, new Key(Constants::jwtSecret(), Constants::JWT_ALGO));
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => self::ERR_INVALID_TOKEN], 401);
    }

    $uid = $decoded->user_id;
    $user = PublicUser::load($uid);
    if (!$user) {
      return new JsonResponse(['error' => self::ERR_USER_NOT_FOUND], 404);
    }

    $job = Node::load($job_id);
    if (!$job) {
      return new JsonResponse(['error' => 'Job not found'], 404);
    }

    $existing = \Drupal::database()->select('job_application', 'ja')
      ->fields('ja')
      ->condition('job_id', $job_id)
      ->condition('public_user_id', $uid)
      ->execute()
      ->fetchAssoc();

    $data = $request->request->all();
    $applicant_name  = $data['name'] ?? '';
    $applicant_email = $data['email'] ?? '';
    $mobile          = $data['mobile'] ?? '';
    $cover_letter    = $data['cover_letter'] ?? '';
    $fid = $existing['resume_fid'] ?? NULL;

    if (!empty($_FILES['resume']['tmp_name'])) {
      $filename = basename($_FILES['resume']['name']);
      $filecontent = file_get_contents($_FILES['resume']['tmp_name']);
      $destination = 'public://job-resumes/' . $filename;
      \Drupal::service('file_system')->saveData($filecontent, $destination, FileExists::Replace);
      $file = File::create(['uri' => $destination, 'filename' => $filename, 'status' => 1]);
      $file->save();
      $fid = $file->id();
    }

    $time = time();
    $job_title = $job->getTitle();
    $admin_email = \Drupal::config('system.site')->get('mail');

    if ($existing) {
      if ($existing['status'] !== 'submitted') {
        return new JsonResponse(['error' => 'You cannot update form now.'], 403);
      }

      \Drupal::database()->update('job_application')
        ->fields([
          'applicant_name'  => $applicant_name,
          'applicant_email' => $applicant_email,
          'mobile_number'   => $mobile,
          'cover_letter'    => $cover_letter,
          'resume_fid'      => $fid,
          'changed'         => $time,
        ])
        ->condition('id', $existing['id'])
        ->execute();

      $body = $this->renderTemplate('modules/custom/jobs_module/templates/application_updated.html.twig', [
        'name' => $applicant_name,
        'job_title' => $job_title,
      ]);
      jobs_module_send_mail('application_updated_user', $applicant_email, [
        'subject' => "Application Updated – $job_title",
        'body' => $body,
      ]);
      if ($admin_email) {
        jobs_module_send_mail('application_updated_admin', $admin_email, [
          'subject' => "Application Updated: $job_title",
          'body' => "$applicant_name ($applicant_email) updated their application.",
        ]);
      }

      return new JsonResponse(['status' => 'success', 'message' => 'Application updated successfully.'], 200);
    }

    \Drupal::database()->insert('job_application')
      ->fields([
        'job_id' => $job_id,
        'public_user_id' => $uid,
        'applicant_name' => $applicant_name,
        'applicant_email' => $applicant_email,
        'mobile_number' => $mobile,
        'cover_letter' => $cover_letter,
        'resume_fid' => $fid,
        'status' => 'submitted',
        'created' => $time,
        'changed' => $time,
      ])
      ->execute();

    $body = $this->renderTemplate('modules/custom/jobs_module/templates/application_submitted.html.twig', [
      'name' => $applicant_name,
      'job_title' => $job_title,
    ]);
    jobs_module_send_mail('application_received_applicant', $applicant_email, [
      'subject' => "Application Received – $job_title",
      'body' => $body,
    ]);
    if ($admin_email) {
      jobs_module_send_mail('application_received_admin', $admin_email, [
        'subject' => "New Application: $job_title",
        'body' => "$applicant_name <$applicant_email> applied for $job_title",
      ]);
    }

    return new JsonResponse(['status' => 'success', 'message' => 'Application submitted successfully.'], 201);
  }

  /**
   * GET API — All job applications for logged-in public user.
   */
  public function jobApplicationList(Request $request) {
    $jwt = $this->extractToken($request);
    if (!$jwt) {
      return new JsonResponse(['error' => self::ERR_MISSING_TOKEN], 401);
    }

    try {
      $decoded = JWT::decode($jwt, new Key(Constants::jwtSecret(), Constants::JWT_ALGO));
    }
    catch (\Exception $e) {
      return new JsonResponse(['error' => self::ERR_INVALID_TOKEN], 401);
    }

    $uid = $decoded->user_id;
    $user = PublicUser::load($uid);
    if (!$user) {
      return new JsonResponse(['error' => self::ERR_USER_NOT_FOUND], 404);
    }

    $records = \Drupal::database()->select('job_application', 'ja')
      ->fields('ja')
      ->condition('public_user_id', $uid)
      ->orderBy('created', 'DESC')
      ->execute()
      ->fetchAll();

    $file_url_generator = \Drupal::service('file_url_generator');
    $applications = [];

    foreach ($records as $r) {
      $job = Node::load($r->job_id);
      if (!$job) {
        continue;
      }

      $department = NULL;
      if ($job->hasField('field_job_department') && !$job->get('field_job_department')->isEmpty()) {
        $term = $job->get('field_job_department')->entity;
        $department = $term ? $term->getName() : NULL;
      }

      $job_type = $job->hasField('field_job_type') ? $job->get('field_job_type')->value : NULL;

      $resume_url = NULL;
      if (!empty($r->resume_fid) && ($file = File::load($r->resume_fid))) {
        $resume_url = $file_url_generator->generateAbsoluteString($file->getFileUri());
      }

      $applications[] = [
        'job_id'             => $r->job_id,
        'job_title'          => $job->getTitle(),
        'department'         => $department,
        'job_type'           => $job_type,
        'application_status' => $r->status,
        'applied_on'         => $r->created,
        'resume_url'         => $resume_url,
      ];
    }

    return new JsonResponse(['status' => 'success', 'applications' => $applications]);
  }

  private function extractToken(Request $request) {
    $auth = $request->headers->get('Authorization');
    if ($auth && preg_match('/Bearer\s+(\S+)/', $auth, $m)) {
      return $m[1];
    }
    return $request->query->get('token');
  }

  private function renderTemplate($template, array $vars = []) {
    return \Drupal::service('twig')->render($template, $vars);
  }

}
