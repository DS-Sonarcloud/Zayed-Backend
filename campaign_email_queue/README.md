# Campaign Email Queue

Large-scale campaign email sending for Zayed University. **No terminal, Drush, or SSH required for day-to-day use.**

## For marketing / content staff

1. Create campaign → attach template and user group (event subscribers).
2. Open **Campaign Email Queues** → click **Process** once.
3. Close the browser if you want — sending continues automatically.

Progress updates on the dashboard every few seconds when you return.

## How sending runs without a terminal

| Mechanism | When it runs |
|-----------|----------------|
| **Ultimate Cron** | Every ~5 minutes on the server (`campaign_email_queue_cron` job) |
| **Automated Cron** | When anyone visits the site (about every 5 minutes) |
| **Process click** | Starts sending + ~30s burst after you click |
| **Dashboard poll** | Short send burst while the queue dashboard is open |
| **Admin keep-alive** | While any admin page is open and a campaign is sending |

## One-time IT / hosting setup (recommended for 50k+)

Your hosting control panel (cPanel, Plesk, Azure, etc.) can call a URL on a schedule — **no SSH**.

1. Log in as site admin → **Configuration → System → Cron**.
2. Copy the **Cron URL**.
3. Ask IT to add a scheduled task: **every 5 minutes**, request that URL (GET).

That is the only “technical” step; staff never run commands.

## Configuration

Settings: `campaign_email_queue.settings` (via config sync or Drush on deploy only).

| Key | Default |
|-----|---------|
| `cron_batch_size` | 500 |
| `cron_background_seconds` | 55 |
| `keepalive_drain_seconds` | 12 |
| `shutdown_drain_seconds` | 30 |

## Dashboard

`/admin/content/campaign-email-queues`
