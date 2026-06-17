<?php

namespace Drupal\student_verification\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class DataSourceDeleteForm extends ConfirmFormBase
{

    protected $id;

    public function getFormId()
    {
        return 'student_verification_datasource_delete';
    }

    public function getQuestion()
    {
        return $this->t('Are you sure you want to delete this data source?');
    }

    public function getCancelUrl()
    {
        return new Url('student_verification.datasource_list');
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
        try {
            \Drupal::database()->delete('student_verification_datasource')->condition('table_name', $this->id)->execute();
            $table_exists = \Drupal::database()->schema()->tableExists($this->id);
            if ($table_exists) {
                \Drupal::database()->schema()->dropTable($this->id);
            }
            $this->messenger()->addMessage($this->t('Deleted.'));
            $form_state->setRedirect('student_verification.datasource_list');
        } catch (\Exception $e) {
            $this->messenger()->addError($this->t('Error deleting data source: @error', ['@error' => $e->getMessage()]));
        }
    }
}
