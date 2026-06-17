<?php

namespace Drupal\student_verification\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class StudentDeleteForm extends ConfirmFormBase
{

    protected $id;

    public function getFormId()
    {
        return 'student_delete_form';
    }

    public function getQuestion()
    {
        return $this->t('Are you sure you want to delete this record?');
    }

    public function getCancelUrl()
    {
        // return new Url('student_verification.list', ['datasource' => "uuuuuuuuuu"]);
    }

    public function getConfirmText()
    {
        return $this->t('Delete');
    }

    public function buildForm(array $form, FormStateInterface $form_state, $id = NULL)
    {
        $this->id = $id;
        return parent::buildForm($form, $form_state);
    }

    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        \Drupal::database()->delete($_GET['datasource'])
            ->condition('id', $this->id)
            ->execute();
        $this->messenger()->addMessage('Record deleted successfully.');
        $form_state->setRedirect('student_verification.list', ['datasource' => $_GET['datasource']]);
    }
}
