<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\MessageCommand;


class DeployController extends ControllerBase
{

  public function eventRedirect()
  {
    /** @var \Drupal\zu_rest_api\Service\ContentDeployManager $manager */
    $manager = \Drupal::service('zu_rest_api.content_deploy_manager');
    $events_result = $manager->deployEvents();

    $redirects = $this->deployRedirectsInternal();

    /** @var \Drupal\zu_rest_api\Service\DeploymentLogService $log_service */
    $log_service = \Drupal::service('zu_rest_api.deployment_log');

    $message_type = 'status';
    $message_text = '';

    if ($events_result->success) {
      $message_text .= "Events deployed successfully. ";
    } else {
      $message_text .= "Events deployment FAILED. ";
      $message_type = 'error';
    }

    if ($redirects) {
      $log_service->logSuccess('redirect', 'DeployController', 'all', 0, 'Redirects deployment completed successfully via event_redirect.');
      $message_text .= "Redirects deployed successfully.";
    } else {
      $log_service->logFailure('redirect', 'DeployController', 'all', 'Redirects deployment failed via event_redirect.');
      $message_text .= "Redirects deployment FAILED.";
      $message_type = 'error';
    }

    if (\Drupal::request()->isXmlHttpRequest()) {
      $response = new AjaxResponse();
      $response->addCommand(new MessageCommand($message_text, null, ['type' => $message_type]));
      return $response;
    }

    // Fallback for non-AJAX
    if ($message_type === 'error') {
      $this->messenger()->addError($message_text);
    } else {
      $this->messenger()->addStatus($message_text);
    }

    return $this->redirect('view.event_dashboard.event_dashboard_page');
  }

  private function deployRedirectsInternal()
  {

    try {

      $database = \Drupal::database();

      $result = $database->select('redirect', 're')
        ->fields('re')
        ->execute()
        ->fetchAll();

      if (empty($result)) {
        return FALSE;
      }

      foreach ($result as $key => $value) {
        $result[$key]->redirect_redirect__uri =
          Url::fromUri($value->redirect_redirect__uri)->toString();

        // Extract target language from serialized options.
        if (!empty($value->redirect_redirect__options)) {
          $options = unserialize($value->redirect_redirect__options, ['allowed_classes' => ['Drupal\\Core\\Language\\Language']]);
          if (isset($options['language'])) {
            if ($options['language'] instanceof \Drupal\Core\Language\LanguageInterface) {
              $result[$key]->language = $options['language']->getId();
            }
            elseif (is_string($options['language'])) {
              $result[$key]->language = $options['language'];
            }
          }
        }
      }

      $json_data = Json::encode($result);

      $constant_service = \Drupal::service('zu_rest_api.constant');
      // $backend_url = $constant_service->getConstant('BACKEND_API_BASE_URL');
      // $hostname = parse_url($backend_url, PHP_URL_HOST);
      $hostname = \Drupal::request()->getHost();

      return $this->sendRedirectsJson($hostname, $json_data);
    } catch (\Exception $e) {

      \Drupal::logger('zu_rest_api')->error("REDIRECT DEPLOY ERROR: " . $e->getMessage());
      return FALSE;
    }
  }


  private function sendRedirectsJson($domain_id, $json_data)
  {

    $deploy_api_service = \Drupal::service('zu_rest_api.constant');
    $base = $deploy_api_service->getConstant("FRONTEND_API_BASE_URL");
    $endpoint = $deploy_api_service->getConstant("FRONTEND_DEPLOY_API_ENDPOINT");
    $auth = $deploy_api_service->getConstant("drupal_dev_authorization");

    try {

      $curl = curl_init();

      curl_setopt_array($curl, [
        CURLOPT_URL => $base . $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode([
          "pathName"  => $domain_id,
          "fileName" => "redirection",
          "content"  => json_decode($json_data, TRUE),
        ]),
        CURLOPT_HTTPHEADER => [
          "Content-Type: application/json",
          "x-api-key: " . $auth,
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
      ]);

      curl_exec($curl);

      if (curl_errno($curl)) {
        throw new \Exception(curl_error($curl));
      }

      curl_close($curl);
      return TRUE;
    } catch (\Exception $e) {

      \Drupal::logger('zu_rest_api')->error("REDIRECT API ERROR: " . $e->getMessage());
      return FALSE;
    }
  }
}
