<?php

namespace Drupal\zu_rest_api\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Deploy Forums JSON.
 */
class ForumDeployForm extends FormBase
{

    /**
     * {@inheritdoc}
     */
    public function getFormId()
    {
        return 'forum_admin_deploy_form';
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $form['description'] = [
            '#markup' => '<p>Click the button to deploy Forum.</p>',
        ];

        $form['deploy'] = [
            '#type' => 'submit',
            '#value' => $this->t('Deploy Forums'),
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
        $result = $manager->deploy('forum');

        if ($result->success) {
            \Drupal::messenger()->addStatus($this->t('Forum deployed successfully.'));
        } else {
            \Drupal::messenger()->addError($this->t('Forum deployment failed.'));
        }
    }
}
