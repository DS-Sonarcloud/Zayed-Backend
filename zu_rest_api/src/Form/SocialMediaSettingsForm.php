<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure social media platforms for the site.
 */
class SocialMediaSettingsForm extends ConfigFormBase
{

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'zu_rest_api_social_media_settings';
    }

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames()
    {
        return ['zu_rest_api.social_media'];
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $config = $this->config('zu_rest_api.social_media');
        $platforms = $config->get('platforms') ?: [];

        $form['platforms'] = [
            '#type' => 'table',
            '#header' => [
                $this->t('ID'),
                $this->t('Label'),
                $this->t('URL'),
                $this->t('SVG Icon'),
                $this->t('Operations'),
            ],
            '#empty' => $this->t('No social media platforms defined.'),
            '#prefix' => '<div id="platforms-fieldset-wrapper">',
            '#suffix' => '</div>',
        ];

        foreach ($platforms as $id => $platform) {
            $form['platforms'][$id]['id'] = [
                '#markup' => $id,
            ];
            $form['platforms'][$id]['label'] = [
                '#type' => 'textfield',
                '#default_value' => $platform['label'] ?? '',
                '#required' => TRUE,
            ];
            $form['platforms'][$id]['url'] = [
                '#type' => 'textfield',
                '#default_value' => $platform['url'] ?? '',
                '#required' => TRUE,
            ];
            $form['platforms'][$id]['icon'] = [
                '#type' => 'textarea',
                '#default_value' => $platform['icon'] ?? '',
                '#required' => TRUE,
                '#rows' => 3,
            ];
            $form['platforms'][$id]['remove'] = [
                '#type' => 'submit',
                '#value' => $this->t('Remove'),
                '#name' => 'remove_' . $id,
                '#submit' => [[$this, 'removePlatform']],
                '#ajax' => [
                    'callback' => [$this, 'ajaxCallback'],
                    'wrapper' => 'platforms-fieldset-wrapper',
                ],
            ];
        }

        $form['new_platform'] = [
            '#type' => 'details',
            '#title' => $this->t('Add New Platform'),
            '#open' => FALSE,
        ];
        $form['new_platform']['new_id'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Internal ID'),
            '#description' => $this->t('Example: facebook (Machine name)'),
        ];
        $form['new_platform']['new_label'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Label'),
        ];
        $form['new_platform']['new_url'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Default URL'),
        ];
        $form['new_platform']['new_icon'] = [
            '#type' => 'textarea',
            '#title' => $this->t('SVG Icon'),
            '#rows' => 3,
        ];
        $form['new_platform']['add'] = [
            '#type' => 'submit',
            '#value' => $this->t('Add Platform'),
            '#submit' => [[$this, 'addPlatform']],
        ];

        return parent::buildForm($form, $form_state);
    }

    /**
     * Submit handler for adding a platform.
     */
    public function addPlatform(array &$form, FormStateInterface $form_state)
    {
        $id = trim($form_state->getValue('new_id'));
        if ($id) {
            $config = $this->config('zu_rest_api.social_media');
            $platforms = $config->get('platforms') ?: [];
            $platforms[$id] = [
                'label' => $form_state->getValue('new_label'),
                'url' => $form_state->getValue('new_url'),
                'icon' => $form_state->getValue('new_icon'),
            ];
            $config->set('platforms', $platforms)->save();
            $this->messenger()->addStatus($this->t('Platform @label added.', ['@label' => $id]));
        }
    }

    /**
     * Submit handler for removing a platform.
     */
    public function removePlatform(array &$form, FormStateInterface $form_state)
    {
        $triggering_element = $form_state->getTriggeringElement();
        $id = str_replace('remove_', '', $triggering_element['#name']);

        $config = $this->configFactory()->getEditable('zu_rest_api.social_media');
        $platforms = $config->get('platforms') ?: [];
        if (isset($platforms[$id])) {
            unset($platforms[$id]);
            $config->set('platforms', $platforms)->save();
            $this->messenger()->addStatus($this->t('Platform @id removed.', ['@id' => $id]));
        }
        $form_state->setRebuild();
    }

    /**
     * Ajax callback for rebuild.
     */
    public function ajaxCallback(array &$form, FormStateInterface $form_state)
    {
        return $form['platforms'];
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $config = $this->config('zu_rest_api.social_media');
        $platforms = $config->get('platforms') ?: [];

        $submitted_platforms = $form_state->getValue('platforms');
        if ($submitted_platforms) {
            foreach ($submitted_platforms as $id => $values) {
                if (isset($platforms[$id])) {
                    $platforms[$id]['label'] = $values['label'];
                    $platforms[$id]['url'] = $values['url'];
                    $platforms[$id]['icon'] = $values['icon'];
                }
            }
            $config->set('platforms', $platforms)->save();
        }

        parent::submitForm($form, $form_state);
    }

}
