<?php

namespace Drupal\email_marketing\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Email Marketing settings.
 */
class SettingsForm extends ConfigFormBase
{
    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'email_marketing_settings';
    }

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames()
    {
        return ['email_marketing.settings'];
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $config = $this->config('email_marketing.settings');

        $form['frontend_base_url'] = [
            '#type' => 'url',
            '#title' => $this->t('Frontend Base URL'),
            '#description' => $this->t('The base URL of the frontend site. Used for content links (events, news, faculty, etc.) in emails. Example: https://zayed.24livehost.com. If empty, falls back to FRONTEND_API_BASE_URL from .env.'),
            '#default_value' => $config->get('frontend_base_url'),
        ];

        // $form['frontend_unsubscribe_url'] = [
        //     '#type' => 'url',
        //     '#title' => $this->t('Frontend Unsubscribe URL'),
        //     '#description' => $this->t('The base URL of the frontend for unsubscriptions. Example: https://frontend.com. If empty, the backend URL will be used.'),
        //     '#default_value' => $config->get('frontend_unsubscribe_url'),
        // ];

        return parent::buildForm($form, $form_state);
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $this->config('email_marketing.settings')
            ->set('frontend_base_url', $form_state->getValue('frontend_base_url'))
            //->set('frontend_unsubscribe_url', $form_state->getValue('frontend_unsubscribe_url'))
            ->save();

        parent::submitForm($form, $form_state);
    }
}
