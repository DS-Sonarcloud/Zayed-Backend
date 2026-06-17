<?php

namespace Drupal\zu_rest_api\Form;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

class DeployForm extends FormBase
{

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'zu_rest_api_deploy_form';
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $form['form_urls'] = [
            '#type' => 'item',
            '#title' => $this->t('All Form URLs'),
            '#markup' => 'This is a list of all action form URLs.',
        ];

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        // No submit action needed for listing URLs.
    }

}