<?php

declare(strict_types=1);

namespace Drupal\zu_super_admin_dashboard\Service;

/**
 * ERD entity → database table mappings from feature/layout-as-data-and-db-schema.
 *
 * Primary counts use custom schema tables when installed; otherwise Drupal fallbacks apply.
 */
final class ErdSchemaRegistry {

  public const SCHEMA_BRANCH = 'feature/layout-as-data-and-db-schema';

  /**
   * Marker tables that indicate the ERD schema branch is installed.
   *
   * @var list<string>
   */
  public const SCHEMA_MARKER_TABLES = [
    'zu_site',
    'zu_course',
    'zu_personalization_rule',
    'zu_analytics_event',
  ];

  /**
   * @return list<array<string, mixed>>
   */
  public static function entityDefinitions(): array {
    return [
      // Core user & auth.
      ['id' => 'USER', 'category' => 'core', 'label' => 'USER', 'table' => NULL, 'resolver' => 'user_active', 'drupal_map' => 'users_field_data'],
      ['id' => 'ROLE', 'category' => 'core', 'label' => 'ROLE', 'table' => NULL, 'resolver' => 'role_custom', 'drupal_map' => 'user_role'],
      ['id' => 'USER_ROLE', 'category' => 'core', 'label' => 'USER_ROLE', 'table' => 'zu_site_user_access', 'fallback' => 'user_custom_roles', 'drupal_map' => 'zu_site_user_access'],
      ['id' => 'SSO_SESSION', 'category' => 'core', 'label' => 'SSO_SESSION', 'table' => 'zu_refresh_tokens', 'fallback' => 'public_user_tokens', 'drupal_map' => 'zu_refresh_tokens / public_user_reset_tokens'],

      // Content.
      ['id' => 'CONTENT_NODE', 'category' => 'content', 'label' => 'CONTENT_NODE', 'table' => NULL, 'resolver' => 'node_all', 'drupal_map' => 'node', 'route' => 'system.admin_content'],
      ['id' => 'TAXONOMY_TERM', 'category' => 'content', 'label' => 'TAXONOMY_TERM', 'table' => NULL, 'resolver' => 'taxonomy_term', 'drupal_map' => 'taxonomy_term', 'route' => 'entity.taxonomy_vocabulary.collection'],
      ['id' => 'NODE_TAXONOMY', 'category' => 'content', 'label' => 'NODE_TAXONOMY', 'table' => NULL, 'resolver' => 'taxonomy_index', 'drupal_map' => 'taxonomy_index'],
      ['id' => 'NEWS', 'category' => 'content', 'label' => 'NEWS', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'news', 'drupal_map' => 'node:news', 'route' => 'entity.node.collection', 'bundle_filter' => 'news'],
      ['id' => 'EVENT', 'category' => 'content', 'label' => 'EVENT', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'event', 'drupal_map' => 'node:event', 'route' => 'entity.node.collection', 'bundle_filter' => 'event'],
      ['id' => 'BLOG_POST', 'category' => 'content', 'label' => 'BLOG_POST', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'blogs', 'drupal_map' => 'node:blogs', 'route' => 'entity.node.collection', 'bundle_filter' => 'blogs'],
      ['id' => 'GALLERY', 'category' => 'content', 'label' => 'GALLERY', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'photo_gallery', 'drupal_map' => 'node:photo_gallery', 'route' => 'entity.node.collection', 'bundle_filter' => 'photo_gallery'],
      ['id' => 'GALLERY_IMAGE', 'category' => 'content', 'label' => 'GALLERY_IMAGE', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'photo_gallery', 'drupal_map' => 'node:photo_gallery (proxy)'],

      // Academic / LMS.
      ['id' => 'COURSE', 'category' => 'academic', 'label' => 'COURSE', 'table' => 'zu_course', 'fallback' => 'node_bundle', 'bundle' => 'courses', 'drupal_map' => 'zu_course', 'route' => 'entity.node.collection', 'bundle_filter' => 'courses'],
      ['id' => 'ENROLLMENT', 'category' => 'academic', 'label' => 'ENROLLMENT', 'table' => 'zu_enrollment', 'fallback' => 'node_bundle', 'bundle' => 'programs', 'drupal_map' => 'zu_enrollment'],
      ['id' => 'COURSE_ACTIVITY', 'category' => 'academic', 'label' => 'COURSE_ACTIVITY', 'table' => 'zu_course_activity', 'drupal_map' => 'zu_course_activity'],
      ['id' => 'ATTENDANCE', 'category' => 'academic', 'label' => 'ATTENDANCE', 'table' => 'zu_attendance', 'drupal_map' => 'zu_attendance'],
      ['id' => 'ANNOUNCEMENT', 'category' => 'academic', 'label' => 'ANNOUNCEMENT', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'article', 'drupal_map' => 'node:article'],

      // Community & engagement.
      ['id' => 'EVENT_REGISTRATION', 'category' => 'community', 'label' => 'EVENT_REGISTRATION', 'table' => 'event_notification_queue', 'fallback' => 'webform_submission', 'drupal_map' => 'event_notification_queue'],
      ['id' => 'BLOG_COMMENT', 'category' => 'community', 'label' => 'BLOG_COMMENT', 'table' => NULL, 'resolver' => 'comment_blogs', 'drupal_map' => 'comment (blogs)'],
      ['id' => 'FORUM_CATEGORY', 'category' => 'community', 'label' => 'FORUM_CATEGORY', 'table' => NULL, 'resolver' => 'taxonomy_vocabulary', 'vocabulary' => 'forums', 'drupal_map' => 'taxonomy:forums'],
      ['id' => 'FORUM_THREAD', 'category' => 'community', 'label' => 'FORUM_THREAD', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'forum', 'drupal_map' => 'node:forum', 'bundle_filter' => 'forum'],
      ['id' => 'FORUM_POST', 'category' => 'community', 'label' => 'FORUM_POST', 'table' => NULL, 'resolver' => 'comment_forum', 'drupal_map' => 'comment (forum)'],
      ['id' => 'FORUM_SUBSCRIPTION', 'category' => 'community', 'label' => 'FORUM_SUBSCRIPTION', 'table' => NULL, 'resolver' => 'unavailable', 'drupal_map' => 'not in schema yet'],

      // Media & search.
      ['id' => 'MEDIA_ASSET', 'category' => 'media_search', 'label' => 'MEDIA_ASSET', 'table' => NULL, 'resolver' => 'media', 'drupal_map' => 'media', 'route' => 'entity.media.collection'],
      ['id' => 'NODE_MEDIA', 'category' => 'media_search', 'label' => 'NODE_MEDIA', 'table' => NULL, 'resolver' => 'media', 'drupal_map' => 'media (references)'],
      ['id' => 'SEARCH_INDEX', 'category' => 'media_search', 'label' => 'SEARCH_INDEX', 'table' => NULL, 'resolver' => 'search_api', 'drupal_map' => 'search_api index'],

      // Jobs & forms.
      ['id' => 'JOB_LISTING', 'category' => 'jobs_forms', 'label' => 'JOB_LISTING', 'table' => NULL, 'resolver' => 'node_bundle', 'bundle' => 'jobs', 'drupal_map' => 'node:jobs', 'route' => 'entity.node.collection', 'bundle_filter' => 'jobs'],
      ['id' => 'JOB_APPLICATION', 'category' => 'jobs_forms', 'label' => 'JOB_APPLICATION', 'table' => 'job_application', 'fallback' => 'webform_submission', 'drupal_map' => 'job_application', 'route' => 'entity.webform_submission.collection'],
      ['id' => 'FORM_DEFINITION', 'category' => 'jobs_forms', 'label' => 'FORM_DEFINITION', 'table' => 'zu_survey', 'fallback' => 'webform', 'drupal_map' => 'zu_survey / webform', 'route' => 'entity.webform.collection'],
      ['id' => 'FORM_SUBMISSION', 'category' => 'jobs_forms', 'label' => 'FORM_SUBMISSION', 'table' => 'zu_survey_response', 'fallback' => 'webform_submission', 'drupal_map' => 'zu_survey_response', 'route' => 'entity.webform_submission.collection'],
      ['id' => 'SURVEY', 'category' => 'jobs_forms', 'label' => 'SURVEY', 'table' => 'zu_survey', 'fallback' => 'webform', 'drupal_map' => 'zu_survey'],

      // Config / cross-cutting.
      ['id' => 'SITE', 'category' => 'config', 'label' => 'SITE', 'table' => 'zu_site', 'fallback' => 'zu_multidomain', 'drupal_map' => 'zu_site', 'route' => 'zu_multidomain.list'],
      ['id' => 'NOTIFICATION', 'category' => 'config', 'label' => 'NOTIFICATION', 'table' => 'zu_admin_notifications', 'fallback' => 'event_notifications', 'drupal_map' => 'zu_admin_notifications'],
      ['id' => 'PERSONALIZATION_RULE', 'category' => 'config', 'label' => 'PERSONALIZATION_RULE', 'table' => 'zu_personalization_rule', 'drupal_map' => 'zu_personalization_rule'],
      ['id' => 'USER_ACTIVITY_LOG', 'category' => 'config', 'label' => 'USER_ACTIVITY_LOG', 'table' => 'zu_admin_audit_log', 'fallback' => 'dblog', 'drupal_map' => 'zu_admin_audit_log'],
      ['id' => 'ANALYTICS_EVENT', 'category' => 'config', 'label' => 'ANALYTICS_EVENT', 'table' => 'zu_analytics_event', 'drupal_map' => 'zu_analytics_event'],
      ['id' => 'EMAIL_CAMPAIGN', 'category' => 'config', 'label' => 'EMAIL_CAMPAIGN', 'table' => 'email_marketing_campaigns', 'fallback' => 'email_campaign', 'drupal_map' => 'email_marketing_campaigns'],
      ['id' => 'SEO_META', 'category' => 'config', 'label' => 'SEO_META', 'table' => 'seo_broken_link', 'fallback' => 'seo_notifications', 'drupal_map' => 'seo_toolkit tables'],
      ['id' => 'LIVE_CHAT_SESSION', 'category' => 'config', 'label' => 'LIVE_CHAT_SESSION', 'table' => 'zu_chat_session', 'drupal_map' => 'zu_chat_session'],
    ];
  }

  /**
   * @return list<string>
   */
  public static function expectedSchemaTables(): array {
    $tables = [];
    foreach (self::entityDefinitions() as $definition) {
      if (!empty($definition['table'])) {
        $tables[] = $definition['table'];
      }
    }
    return array_values(array_unique($tables));
  }

}
