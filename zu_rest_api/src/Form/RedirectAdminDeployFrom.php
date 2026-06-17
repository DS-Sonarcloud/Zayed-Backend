<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\Component\Datetime\TimeInterface;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Session\AccountProxyInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\domain\Entity\Domain;
use Drupal\Core\Url;

/**
 * The Translation Form.
 */
class RedirectAdminDeployFrom extends FormBase
{

    /**
     * The language manager service.
     *
     * @var \Drupal\Core\Language\LanguageManagerInterface
     */
    protected $languageManager;

    /**
     * The config service.
     *
     * @var \Drupal\Core\Config\ConfigFactoryInterface
     */
    protected $config;

    /**
     * The route service.
     *
     * @var \Drupal\Core\Routing\CurrentRouteMatch
     */
    protected $route;

    /**
     * The time service.
     *
     * @var \Drupal\Component\Datetime\TimeInterface
     */
    protected $time;

    /**
     * The current user service.
     *
     * @var \Drupal\Core\Session\AccountProxyInterface
     */
    protected $currentUser;

    /**
     * The module_handler service.
     *
     * @var \Drupal\Core\Extension\ModuleHandlerInterface
     */
    protected $moduleHandler;

    /**
     * Constructs a \Drupal\auto_node_translate\Form\TranslationForm object.
     *
     * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
     *   The language manager service.
     * @param \Drupal\Core\Config\ConfigFactoryInterface $config
     *   The config service.
     * @param \Drupal\Core\Routing\CurrentRouteMatch $route_match
     *   The route service.
     * @param \Drupal\Component\Datetime\TimeInterface $time
     *   The time service.
     * @param \Drupal\Core\Session\AccountProxyInterface $current_user
     *   The Current User service.
     * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
     *   The module_handler service.
     */
    public function __construct(
        LanguageManagerInterface $language_manager,
        ConfigFactoryInterface $config,
        CurrentRouteMatch $route_match,
        TimeInterface $time,
        AccountProxyInterface $current_user,
        ModuleHandlerInterface $module_handler
    ) {
        $this->languageManager = $language_manager;
        $this->config = $config;
        $this->route = $route_match;
        $this->time = $time;
        $this->currentUser = $current_user;
        $this->moduleHandler = $module_handler;
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'zu_rest_api.redirect_deploy';
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container)
    {
        return new static(
            $container->get('language_manager'),
            $container->get('config.factory'),
            $container->get('current_route_match'),
            $container->get('datetime.time'),
            $container->get('current_user'),
            $container->get('module_handler')
        );
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state, $node = NULL)
    {
        $form['actions']['submit'] = [
            '#type' => 'submit',
            '#value' => $this->t('Deploy Redirects'),
            '#button_type' => 'primary',
        ];

        return $form;
    }



    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        /** @var \Drupal\zu_rest_api\Service\DeploymentLogService $log_service */
        $log_service = \Drupal::service('zu_rest_api.deployment_log');

        // Retrieve all form data.
        $database = \Drupal::database();
        $query = $database->select('redirect', 're')
            ->fields('re');
        $result = $query->execute()->fetchAll();

        foreach ($result as $key => $value) {
            $result[$key]->redirect_redirect__uri = Url::fromUri($value->redirect_redirect__uri)->toString();

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

        if (empty($result)) {
            \Drupal::logger('zu_rest_api')->warning('No redirection data found.');
            $this->messenger()->addWarning($this->t('No redirects found to deploy.'));
        } else {
            $json_data = Json::encode($result);
            $constant_service = \Drupal::service('zu_rest_api.constant');
            // $backend_url = $constant_service->getConstant('BACKEND_API_BASE_URL');
            // $hostname = parse_url($backend_url, PHP_URL_HOST);
            $hostname = \Drupal::request()->getHost();

            $deploy_result = $this->deployJson($hostname, $json_data);

            if ($deploy_result) {
                $log_service->logSuccess('redirect', 'RedirectAdminDeployFrom', 'all', count($result), 'Redirects deployment completed successfully.');
                $this->messenger()->addStatus($this->t('Redirects deployed successfully.'));
            } else {
                $log_service->logFailure('redirect', 'RedirectAdminDeployFrom', 'all', 'Failed to deploy redirects.');
                $this->messenger()->addError($this->t('Redirects deployment failed.'));
            }

            \Drupal::logger('zu_rest_api')->info('Update redirections for @hostname', ['@hostname' => $hostname]);
        }

        $form_state->setRedirectUrl(new Url($this->getFormId()));
    }


    /**
     * Deploy JSON to frontend.
     *
     * @param string $domain_id
     *   The domain identifier.
     * @param string $json_data
     *   The JSON data to deploy.
     *
     * @return bool
     *   TRUE on success, FALSE on failure.
     */
    public function deployJson($domain_id, $json_data)
    {
        $deploy_api_service = \Drupal::service('zu_rest_api.constant');
        $FRONTEND_API_BASE_URL = $deploy_api_service->getConstant("FRONTEND_API_BASE_URL");
        $FRONTEND_DEPLOY_API_ENDPOINT = $deploy_api_service->getConstant("FRONTEND_DEPLOY_API_ENDPOINT");
        $drupal_dev_authorization = $deploy_api_service->getConstant("drupal_dev_authorization");

        try {
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $FRONTEND_API_BASE_URL . $FRONTEND_DEPLOY_API_ENDPOINT,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => '{"pathName": "' . $domain_id . '","fileName": "redirection","content": ' . $json_data . '}',
                CURLOPT_HTTPHEADER => array(
                    'Accept: application/json',
                    'x-api-key: ' . $drupal_dev_authorization,
                    'Content-Type: application/json'
                ),
            ));

            $response = curl_exec($curl);
            if (curl_errno($curl)) {
                $error_msg = curl_error($curl);
                curl_close($curl);
                throw new \Exception('CURL Error: ' . $error_msg);
            }

            \Drupal::logger('custom_log')->notice("Update URL response: " . $response);
            curl_close($curl);
            return TRUE;
        } catch (\Exception $e) {
            \Drupal::logger('custom_log')->error("Error during API call: " . $e->getMessage());
            return FALSE;
        }
    }
}
