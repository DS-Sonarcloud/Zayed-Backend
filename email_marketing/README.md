# Email Marketing Module

The **Email Marketing** module allows you to send Drupal content (e.g., articles) as HTML email campaigns. It uses the node’s existing template for rendering, wraps it in an email-friendly layout, and delivers it via Drupal’s mail system.

## 📦 Installation

1. Copy the module into your `modules/custom/` directory:
   ```
   modules/custom/email_marketing
   ```

2. Enable the module:
   ```bash
   drush en email_marketing
   ```

3. Clear caches:
   ```bash
   drush cr
   ```

## ⚙️ Configuration

1. Go to **Configuration → Email Marketing** in the Drupal admin menu.
2. Select the node (content) you want to send as an email.
3. Enter subject and recipient details.
4. Send the campaign.

## 🚀 Usage

- Create a node of type **Email Template** (`email_template`).
- This will be used as the HTML body for emails.
- When sending, the module will wrap the node in `templates/email-marketing-wrapper.html.twig`.

## 🛠 Developer Notes

- The main sending logic is in:
  ```
  src/Service/EmailMarketingSender.php
  ```
- You can call the service directly in code:

  ```php
  \Drupal::service('email_marketing.sender')
    ->sendCampaignFromNode($nid, 'user@example.com', 'My Subject');
  ```

- The module supports **CSS inlining** via [Pelago Emogrifier](https://github.com/MyIntervals/emogrifier) if available.

## 🔄 Changing the Content Type

By default, the module expects the content type:

```
Email Template (machine name: email_template)
```

If you want to use a different content type (for example, `article`), you need to update the checks in the module’s PHP code.

### Example Change in `EmailMarketingSender.php`

```php
// File: src/Service/EmailMarketingSender.php

// Before (default expects 'email_template')
if ($node->getType() !== 'email_template') {
  throw new \InvalidArgumentException('Node must be of type Email Template.');
}

// After (use 'article' instead)
if ($node->getType() !== 'article') {
  throw new \InvalidArgumentException('Node must be of type Article.');
}
```

### Example Change in `EmailMarketingForm.php`

```php
// File: src/Form/EmailMarketingForm.php

// Validate node type before sending
if ($node && $node->bundle() !== 'email_template') {
  $form_state->setErrorByName('nid', $this->t('The selected node must be of type Email Template.'));
}
```

👉 Change `'email_template'` to `'article'` (or your chosen content type machine name).

That’s it! Now the module will use your custom content type instead of the default one.

## 📂 File Structure

```
email_marketing/
  ├── email_marketing.info.yml
  ├── email_marketing.install
  ├── email_marketing.links.menu.yml
  ├── email_marketing.links.task.yml
  ├── email_marketing.module
  ├── email_marketing.permissions.yml
  ├── email_marketing.routing.yml
  ├── email_marketing.services.yml
  ├── src/
  │   ├── Form/EmailMarketingForm.php
  │   └── Service/EmailMarketingSender.php
  └── templates/
      └── email-marketing-wrapper.html.twig
```

## ✅ Requirements

- Drupal 10 or 11
- PHP 8.1+
- Recommended: [Emogrifier](https://github.com/MyIntervals/emogrifier) library for CSS inlining.

## 📧 Example Workflow

1. Create a new node of type **Email Template**.
2. Go to **Configuration → Email Marketing**.
3. Select your node, enter a subject, and add recipients.
4. Click **Send Campaign**.
5. Recipients will get the node content as a nicely formatted HTML email.

## 📊 Admin Pages

### `/admin/content/email-marketing/campaigns`
This page lists all **created email campaigns**.
Displayed data includes:
- **Campaign ID** (internal entity ID)
- **Label / Campaign Name**
- **Subject**
- **Recipient type** (all users, by role, or single email)
- **Tags** (if assigned)
- **Created / Updated timestamp**

### `/admin/content/email-marketing/sent`
This page shows a log of all **emails that were sent**.
Displayed data includes:
- **Email ID** (log entry)
- **Campaign** (the campaign it was sent from)
- **Recipient email(s)**
- **Sent timestamp**
- **Status** (success / failed)

These pages give administrators full visibility into both campaign setup and delivery logs.

## Maintainers

Current maintainers:

- [Shubham Rathore (shubham rathore)](https://www.drupal.org/u/shubham-rathore-0)

## Supporting organizations:

- [Dotsquares India](https://drupal.dotsquares.com/)
