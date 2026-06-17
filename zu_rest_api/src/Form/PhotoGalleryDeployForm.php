<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Deploy Photo Gallery JSON (Grouped by Year).
 */
class PhotoGalleryDeployForm extends FormBase
{

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'photo_gallery_deploy_form';
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {

        $form['description'] = [
            '#markup' => $this->t('<p>Click the button below to deploy photo gallery.</p>'),
        ];

        $form['deploy'] = [
            '#type' => 'submit',
            '#value' => $this->t('Deploy Photo Gallery'),
        ];

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        /** @var \Drupal\zu_rest_api\Service\ContentDeployManager $manager */
        $manager = \Drupal::service('zu_rest_api.content_deploy_manager');
        $result = $manager->deploy('photo_gallery');

        if ($result->success) {
            \Drupal::messenger()->addStatus($this->t('Photo gallery deployed successfully.'));
        } else {
            \Drupal::messenger()->addError($this->t('Photo gallery deployment failed.'));
        }
    }
}
