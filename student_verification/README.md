# 🧩 Student Verification Module (Drupal 10/11)

This module provides:

1. **CSV upload interface** for admin users to manage student data (name, email, ZU ID).
2. **Webform validation** to ensure users can only submit forms if their ZU ID exists in the uploaded student database.

---

## 📁 Module Structure

```
student_verification/
├── student_verification.info.yml
├── student_verification.module
├── src/
│   └── Form/
│       └── StudentUploadForm.php
```

---

## ⚙️ Installation

1. Place the module inside
   `/modules/custom/student_verification`

2. Enable the module:

   ```bash
   drush en student_verification -y
   drush cr
   ```

3. Ensure the **Webform** module is installed and enabled:

   ```bash
   drush en webform -y
   ```

---

## 🧾 Features

### 1. Admin CSV Upload

* Path: `/admin/config/student/add`

* Uploads a `.csv` file containing student data in the format:

  ```
  name,email,zu_id
  John Doe,john@example.com,ZU1001
  Jane Smith,jane@example.com,ZU1002
  ```

* The file is processed and inserted into the database table:

  ```
  student_verification
  ├── id (auto)
  ├── name
  ├── email
  ├── zu_id
  ```

* The uploaded file is deleted after processing.

---

### 2. Webform Validation Integration

* Works with the **Webform module**.
* When users submit a specific webform (e.g., `student_form`), their **ZU ID** is validated against the custom table.

#### Implementation details:

In `student_verification.module`:

```php
use Drupal\Core\Form\FormStateInterface;
use Drupal\webform\WebformSubmissionForm;

/**
 * Implements hook_form_alter() for Webform submissions.
 */
function student_verification_form_alter(&$form, FormStateInterface $form_state, $form_id) {
  if ($form_state->getFormObject() instanceof WebformSubmissionForm) {
    $webform = $form_state->getFormObject()->getWebform();
    if ($webform->id() === 'student_form') {
      $form['#validate'][] = 'student_verification_webform_custom_validate';
    }
  }
}

/**
 * Custom Webform validation handler.
 */
function student_verification_webform_custom_validate(array &$form, FormStateInterface $form_state) {
  $values = $form_state->getValues();
  $zu_id = trim($values['zu_id'] ?? '');
  $email = trim($values['email'] ?? '');

  if (empty($zu_id)) {
    $form_state->setErrorByName('zu_id', t('Please enter your ZU ID.'));
    return;
  }

  $record = \Drupal::database()->select('student_verification', 's')
    ->fields('s', ['zu_id', 'email'])
    ->condition('zu_id', $zu_id)
    ->execute()
    ->fetchAssoc();

  if (!$record) {
    $form_state->setErrorByName('zu_id', t('This ZU ID does not exist in our records.'));
  } elseif (!empty($email) && strcasecmp($record['email'], $email) !== 0) {
    $form_state->setErrorByName('email', t('Email does not match our records.'));
  }
}
```

---

## 🧪 Testing

1. Upload your CSV file at
   **Configuration → Student → Upload CSV**
   (`/admin/config/student/add`)

2. Go to your Webform (e.g., `/webform/student_form`).

3. Try submitting with:

   * A valid `ZU ID` → should submit successfully.
   * An invalid `ZU ID` → should show an error message.

---

## 🧰 Drush Commands

Clear cache after any change:

```bash
drush cr
```

Reinstall module (for testing fresh table):

```bash
drush pmu student_verification -y && drush en student_verification -y
```

---

## 🧱 Requirements

* Drupal 10 or 11
* Webform module
* Database table `student_verification`

---

## 📜 License

GPL-2.0 or later
© 2025 Student Verification Project