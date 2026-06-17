<?php

namespace Drupal\zu_config_builder\Commands;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\FileStorage;
use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Config\TypedConfigManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ModuleInstallerInterface;
use Drupal\Core\Lock\LockBackendInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Drush\Attributes as CLI;
use Drush\Commands\DrushCommands;
use Symfony\Component\Yaml\Yaml;

/**
 * Drush commands to build or remove all config for a content type.
 *
 * Source of truth: config/sync YAML files already committed to the repo.
 * The command discovers every config object related to a bundle by scanning
 * filenames and dependency graphs, then imports only the missing ones.
 *
 * Fully portable — copy this module to any project that shares the same
 * config/sync directory and the commands will work for any content type.
 *
 * USAGE
 *   drush zu:build-content-type event           # build all event config
 *   drush zu:build-content-type event --dry-run # preview without changes
 *   drush zu:remove-content-type event          # remove all event config
 *   drush zu:list-content-types                 # list available types
 */
final class ConfigBuilderCommands extends DrushCommands {

  /** Lazily-populated cache of enabled module names, used after pm:enable subprocesses. */
  private array $enabledModulesCache = [];

  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly StorageInterface $activeConfigStorage,
    private readonly ConfigFactoryInterface $configFactory,
    private readonly ModuleHandlerInterface $moduleHandler,
    private readonly ModuleInstallerInterface $moduleInstaller,
    private readonly ConfigManagerInterface $configManager,
    private readonly TypedConfigManagerInterface $typedConfigManager,
    private readonly EventDispatcherInterface $eventDispatcher,
    private readonly LockBackendInterface $lock,
  ) {
    parent::__construct();
  }

  /**
   * Build all configuration for a content type from config/sync YAML files.
   *
   * Discovers every config object related to the given bundle by scanning
   * config/sync filenames and dependency graphs, then imports only the ones
   * that are missing from the active config. Safe to re-run.
   */
  #[CLI\Command(name: 'zu:build-content-type', aliases: ['zbct'])]
  #[CLI\Argument(name: 'content_type', description: 'Machine name of the node bundle (e.g. event, news, blogs).')]
  #[CLI\Option(name: 'dry-run', description: 'Show what would be imported without making any changes.')]
  #[CLI\Option(name: 'force', description: 'Re-import config even if it already exists in active storage.')]
  #[CLI\Option(name: 'install-modules', description: 'Automatically install any Drupal modules required by the config items before importing.')]
  #[CLI\Usage(name: 'drush zu:build-content-type event', description: 'Build all config for the event content type.')]
  #[CLI\Usage(name: 'drush zu:build-content-type event --install-modules', description: 'Build event config and auto-install any missing required modules.')]
  #[CLI\Usage(name: 'drush zu:build-content-type event --dry-run', description: 'Preview what would be built.')]
  #[CLI\Usage(name: 'drush zu:build-content-type news', description: 'Build all config for the news content type.')]
  public function buildContentType(
    string $content_type,
    array $options = ['dry-run' => FALSE, 'force' => FALSE, 'install-modules' => FALSE],
  ): void {
    $dry             = (bool) $options['dry-run'];
    $force           = (bool) $options['force'];
    $install_modules = (bool) $options['install-modules'];

    if ($dry) {
      $this->io()->caution('DRY RUN — no changes will be saved.');
    }

    $sync_dir = $this->getSyncDir();
    if (!is_dir($sync_dir)) {
      throw new \RuntimeException("Config sync directory not found: {$sync_dir}");
    }

    $this->io()->title("Building content type: {$content_type}");
    $this->io()->writeln("Config sync directory: <info>{$sync_dir}</info>");

    $all_configs = $this->collectRelatedConfigs($content_type, $sync_dir);

    if (empty($all_configs)) {
      throw new \RuntimeException(
        "No configuration found for content type '{$content_type}' in {$sync_dir}.\n" .
        "Make sure node.type.{$content_type}.yml exists in your config/sync directory."
      );
    }

    $ordered      = $this->sortByDependencyOrder($all_configs);
    $file_storage = new FileStorage($sync_dir);

    $all_missing = $this->collectAllMissingModules($ordered, $file_storage);
    [$installable, $unavailable] = $this->splitModuleAvailability($all_missing);

    if (!empty($unavailable)) {
      if ($install_modules && !$dry) {
        $this->io()->writeln("\n<comment>Contrib modules not on filesystem — running composer require...</comment>");
        $composer_root = dirname(DRUPAL_ROOT);
        $source_versions = $this->readSourceComposerVersions($composer_root);
        $composer_failed = [];
        foreach ($unavailable as $m) {
          $package = "drupal/{$m}";
          $constraint = $source_versions[$package] ?? '';
          $package_arg = $constraint ? "{$package}:{$constraint}" : $package;
          $this->io()->writeln("  composer require {$package_arg}");
          $cmd = "composer require " . escapeshellarg($package_arg) . " --no-interaction --no-progress 2>&1";
          $output = [];
          $exit_code = 0;
          exec("cd " . escapeshellarg($composer_root) . " && " . $cmd, $output, $exit_code);
          if ($exit_code !== 0) {
            if ($package_arg !== $package) {
              $cmd2 = "composer require " . escapeshellarg($package) . " --no-interaction --no-progress 2>&1";
              $out2 = [];
              $code2 = 0;
              exec("cd " . escapeshellarg($composer_root) . " && " . $cmd2, $out2, $code2);
              if ($code2 === 0) {
                $this->io()->writeln("    <info>[ok]</info> drupal/{$m} downloaded.");
                continue;
              }
            }
            $beta_arg = "{$package}:@beta";
            $cmd3 = "composer require " . escapeshellarg($beta_arg) . " --no-interaction --no-progress 2>&1";
            $out3 = [];
            $code3 = 0;
            exec("cd " . escapeshellarg($composer_root) . " && " . $cmd3, $out3, $code3);
            if ($code3 === 0) {
              $this->io()->writeln("    <info>[ok]</info> drupal/{$m} downloaded (with @beta stability).");
              continue;
            }
            $this->io()->writeln("    <error>[fail]</error> " . implode("\n", array_slice($output, -5)));
            $composer_failed[] = $m;
          }
          else {
            $this->io()->writeln("    <info>[ok]</info> {$package_arg} downloaded.");
          }
        }
        $still_unavailable = $composer_failed;
        $newly_available   = array_diff($unavailable, $composer_failed);
        if (!empty($newly_available)) {
          $all_to_enable = $this->expandModuleDependencies($newly_available);
          $installable = array_values(array_unique(array_merge($installable, $all_to_enable)));
        }
        $unavailable = $still_unavailable;
        if (!empty($unavailable)) {
          $this->io()->writeln("\n  <error>Could not download (composer failed):</error> " . implode(', ', $unavailable));
          $this->io()->writeln("  Config items depending on these modules will be <comment>skipped</comment>.");
        }
      }
      else {
        $this->io()->writeln("\n<comment>Contrib modules not on filesystem (run with --install-modules to auto-download via composer):</comment>");
        foreach ($unavailable as $m) {
          $this->io()->writeln("    composer require drupal/{$m}");
        }
        $this->io()->writeln("  Config items depending on these modules will be <comment>skipped</comment>.");
      }
    }

    if (!empty($installable)) {
      if ($install_modules && !$dry) {
        $this->io()->writeln("\nEnabling modules (on filesystem): <info>" . implode(', ', $installable) . "</info>");
        $this->ensureLanguageNegotiationConfig();
        $drush_bin  = $this->getDrushBinary();
        $enable_failed = [];
        foreach ($installable as $module) {
          $cmd  = $drush_bin . ' pm:enable ' . escapeshellarg($module) . ' --yes 2>&1';
          $out  = [];
          $code = 0;
          exec($cmd, $out, $code);
          if ($code !== 0) {
            $out_text = implode(' ', $out);
            if (str_contains($out_text, 'PreExistingConfigException') || str_contains($out_text, 'already exist in active configuration')) {
              $this->io()->writeln("  <comment>[retry]</comment>  {$module}: pre-existing config detected, cleaning and retrying...");
              $this->deleteModuleDefaultConfigs($module);
              $out2 = [];
              $code2 = 0;
              exec($cmd, $out2, $code2);
              if ($code2 !== 0) {
                $this->io()->writeln("  <error>[fail]</error>   could not enable {$module}: " . implode(' ', $out2));
                $enable_failed[] = $module;
              }
              else {
                $this->io()->writeln("  <info>[ok]</info>     enabled {$module}");
              }
            }
            else {
              $out_compact  = preg_replace('/\s+/', ' ', implode('', $out));
              $out_stripped = implode('', array_map('trim', $out));
              $dep_match    = NULL;
              foreach ([$out_text, implode("\n", $out), $out_compact, $out_stripped] as $_t) {
                if (preg_match('/missing its dependency module (\w+)/i', $_t, $_m)
                 || preg_match('/depends on.*module[:\s]+(\w+)/i', $_t, $_m)) {
                  $dep_match = $_m;
                  break;
                }
              }
              if ($dep_match !== NULL) {
                $dep = $dep_match[1];
                $this->io()->writeln("  <comment>[dep]</comment>    {$module} needs {$dep} — enabling {$dep} first...");
                [$dep_already_on_disk] = $this->splitModuleAvailability([$dep]);
                if (empty($dep_already_on_disk)) {
                  $this->io()->writeln("  <comment>[dep]</comment>    {$dep} not on disk — running composer require drupal/{$dep}...");
                  $composer_root = dirname(DRUPAL_ROOT);
                  $dep_dl_cmd = "composer require " . escapeshellarg("drupal/{$dep}") . " --no-interaction --no-progress 2>&1";
                  $dep_dl_out = [];
                  $dep_dl_code = 0;
                  exec("cd " . escapeshellarg($composer_root) . " && " . $dep_dl_cmd, $dep_dl_out, $dep_dl_code);
                  if ($dep_dl_code !== 0) {
                    $dep_dl_cmd2 = "composer require " . escapeshellarg("drupal/{$dep}:@beta") . " --no-interaction --no-progress 2>&1";
                    $dep_dl_out = [];
                    $dep_dl_code = 0;
                    exec("cd " . escapeshellarg($composer_root) . " && " . $dep_dl_cmd2, $dep_dl_out, $dep_dl_code);
                  }
                  if ($dep_dl_code !== 0) {
                    $this->io()->writeln("  <error>[fail]</error>   could not download {$dep}: " . implode(' ', $dep_dl_out));
                    $this->io()->writeln("  <error>[fail]</error>   could not enable {$module}: dependency unavailable");
                    $enable_failed[] = $module;
                    continue;
                  }
                  $this->io()->writeln("  <info>[ok]</info>     drupal/{$dep} downloaded");
                }
                $dep_cmd = $drush_bin . ' pm:enable ' . escapeshellarg($dep) . ' --yes 2>&1';
                $dep_out = [];
                $dep_code = 0;
                exec($dep_cmd, $dep_out, $dep_code);
                if ($dep_code !== 0) {
                  $this->io()->writeln("  <error>[fail]</error>   could not enable dependency {$dep}: " . implode(' ', $dep_out));
                  $this->io()->writeln("  <error>[fail]</error>   could not enable {$module}: " . $out_text);
                  $enable_failed[] = $module;
                }
                else {
                  $this->io()->writeln("  <info>[ok]</info>     enabled dependency {$dep}");
                  $out3 = [];
                  $code3 = 0;
                  exec($cmd, $out3, $code3);
                  if ($code3 !== 0) {
                    $this->io()->writeln("  <error>[fail]</error>   could not enable {$module}: " . implode(' ', $out3));
                    $enable_failed[] = $module;
                  }
                  else {
                    $this->io()->writeln("  <info>[ok]</info>     enabled {$module}");
                  }
                }
              }
              else {
                $this->io()->writeln("  <error>[fail]</error>   could not enable {$module}: " . $out_text);
                $enable_failed[] = $module;
              }
            }
          }
          else {
            $this->io()->writeln("  <info>[ok]</info>     enabled {$module}");
          }
        }
        if (!empty($enable_failed)) {
          $this->io()->writeln("  <comment>Note:</comment> modules that failed to enable will have their config skipped.");
        }
        $this->refreshModuleList();
        $this->rebuildContainerAfterModuleEnable();
      }
      else {
        $this->io()->writeln("\n<comment>Modules on filesystem but not enabled:</comment> " . implode(', ', $installable));
        if (!$install_modules) {
          $this->io()->writeln("  Run with <info>--install-modules</info> to enable them automatically.");
          $this->io()->writeln("  Config items needing these modules will be <comment>skipped</comment>.");
        }
      }
    }
    $item_data   = [];
    $skipped_set = [];

    foreach ($ordered as $name) {
      $data = $file_storage->read($name);
      $item_data[$name] = $data;
      if ($data === FALSE) {
        $skipped_set[$name] = 'unreadable';
        continue;
      }
      $missing = $this->getMissingModules($data);
      if (!empty($missing)) {
        $is_field_config = str_starts_with($name, 'field.storage.')
          || str_starts_with($name, 'field.field.')
          || str_starts_with($name, 'core.base_field_override.');
        if ($is_field_config) {
          $skipped_set[$name] = 'no module: ' . implode(', ', $missing);
        }
      }
    }

    $changed = TRUE;
    while ($changed) {
      $changed = FALSE;
      foreach ($ordered as $name) {
        if (isset($skipped_set[$name])) {
          continue;
        }

        $is_field_config = str_starts_with($name, 'field.storage.')
          || str_starts_with($name, 'field.field.')
          || str_starts_with($name, 'core.base_field_override.');
        if (!$is_field_config) {
          continue;
        }
        $data = $item_data[$name];
        if ($data === FALSE) {
          continue;
        }
        $config_deps = $data['dependencies']['config'] ?? [];
        foreach ($config_deps as $dep) {
          if (isset($skipped_set[$dep])) {
            $skipped_set[$name] = "depends on skipped: {$dep}";
            $changed = TRUE;
            break;
          }
        }
      }
    }

    $this->io()->writeln("\nFound <info>" . count($ordered) . "</info> config items:");
    $to_import = [];

    foreach ($ordered as $name) {
      $exists = $this->activeConfigStorage->exists($name);
      if ($exists && !$force) {
        $this->io()->writeln("  <comment>[skip]</comment>      {$name}");
        continue;
      }
      if (isset($skipped_set[$name])) {
        $reason = $skipped_set[$name];
        if ($reason === 'unreadable') {
          $this->io()->writeln("  <error>[unreadable]</error> {$name}");
        }
        elseif (str_starts_with($reason, 'no module')) {
          $this->io()->writeln("  <comment>[no module]</comment>  {$name} — needs: <comment>" . substr($reason, 11) . "</comment>");
        }
        else {
          $this->io()->writeln("  <comment>[dep-skip]</comment>  {$name} — {$reason}");
        }
        continue;
      }
      $action = $exists ? '[overwrite] ' : '[import]    ';
      $this->io()->writeln("  <info>{$action}</info>{$name}");
      $to_import[] = $name;
    }

    if (empty($to_import)) {
      $this->io()->success("Nothing to import — all items either already exist or have unmet module dependencies.");
      return;
    }

    if ($dry) {
      $this->io()->note("DRY RUN: " . count($to_import) . " item(s) would be imported.");
      return;
    }

    $this->io()->writeln("\nImporting " . count($to_import) . " config item(s)...");
    $imported     = 0;
    $failed       = 0;
    $rerun_needed = 0;

    foreach ($to_import as $name) {
      try {
        $data = $file_storage->read($name);
        if ($data === FALSE) {
          $this->io()->writeln("  <error>[error]</error>    {$name}: could not read from sync dir");
          $failed++;
          continue;
        }

        $data = $this->stripMissingModuleData($data);

        if (str_starts_with($name, 'core.entity_form_display.') || str_starts_with($name, 'core.entity_view_display.')) {
          $data = $this->stripSkippedFieldComponents($data, $skipped_set);
        }

        $is_display = str_starts_with($name, 'core.entity_form_display.')
          || str_starts_with($name, 'core.entity_view_display.')
          || str_starts_with($name, 'views.view.')
          || str_starts_with($name, 'workflows.workflow.');

        if ($is_display) {
          if ($this->activeConfigStorage->exists($name)) {
            $active = $this->activeConfigStorage->read($name);
            if (!empty($active['uuid'])) {
              $data['uuid'] = $active['uuid'];
            }
          }
          else {
            unset($data['uuid']);
          }
          $this->activeConfigStorage->write($name, $data);
          $this->configFactory->reset($name);
        }
        else {

          [$entity_type_id, $entity_id] = $this->resolveConfigEntityId($name);

          if ($entity_type_id) {
            $storage  = $this->entityTypeManager->getStorage($entity_type_id);
            $existing = $storage->load($entity_id);

            if ($existing) {
              foreach ($data as $key => $value) {
                if ($key !== 'uuid') {
                  $existing->set($key, $value);
                }
              }
              $existing->save();
            }
            else {
              if (str_starts_with($name, 'core.base_field_override.')) {
                $field_name = $data['field_name'] ?? NULL;
                $entity_type = $data['entity_type'] ?? NULL;
                if ($field_name && $entity_type) {
                  try {
                    $base_fields = \Drupal::service('entity_field.manager')
                      ->getBaseFieldDefinitions($entity_type);
                    if (!isset($base_fields[$field_name])) {
                      $this->io()->writeln("  <comment>[skip-no-base-field]</comment> {$name} — base field '{$field_name}' not defined (module not installed)");
                      continue;
                    }
                  }
                  catch (\Throwable) {}
                }
              }
              unset($data['uuid']);
              $entity = $storage->createFromStorageRecord($data);
              $entity->save();
            }
          }
          else {
            if ($this->activeConfigStorage->exists($name)) {
              $active = $this->activeConfigStorage->read($name);
              if (!empty($active['uuid'])) {
                $data['uuid'] = $active['uuid'];
              }
            }
            else {
              unset($data['uuid']);
            }
            $this->activeConfigStorage->write($name, $data);
            $this->configFactory->reset($name);
          }
        }

        $this->io()->writeln("  <info>[ok]</info>       {$name}");
        $imported++;
      }
      catch (\Exception $e) {
        $msg = $e->getMessage();
        // These errors all share the same root cause: a module was enabled in
        // this same PHP process run (via subprocess), but the current process's
        // plugin registry / class autoloader was initialised before that module
        // existed. drupal_flush_all_caches() cannot fix this mid-process.
        // Re-running starts a fresh process with a complete registry.
        $is_stale_registry =
          // Field type plugin not found: "Unable to determine class for field type 'X'"
          preg_match("/Unable to determine class for field type '([^']+)'/", $msg, $_m)
          // Action plugin not found: 'The "flag_action:X" plugin does not exist'
          || preg_match('/The "([^"]+)" plugin does not exist/', $msg, $_m);
        if ($is_stale_registry) {
          $plugin_id = $_m[1] ?? '?';
          $this->io()->writeln("  <comment>[rerun-needed]</comment> {$name} — plugin '{$plugin_id}' unavailable (module just enabled; re-run to complete import)");
          $rerun_needed++;
        }
        else {
          $this->io()->writeln("  <error>[error]</error>    {$name}: " . $msg);
          $this->logger()->error("Failed to import {$name}: " . $msg);
          $failed++;
        }
      }
    }

    // Rebuild caches. Wrap in try/catch because drupal_flush_all_caches() can
    // itself crash when a module that registered entity types or plugins was
    // downloaded this run but its declaring module isn't fully installed yet
    // (e.g. zu_public_user not on packagist — its entity type "public_user" is
    // referenced by flag action config but the module can't be installed).
    try {
      drupal_flush_all_caches();
    }
    catch (\Throwable) {
      // Non-fatal — caches will be stale but the import results are committed.
    }

    if ($rerun_needed > 0) {
      $this->io()->note("Re-run needed: {$rerun_needed} config item(s) could not be imported because their module was enabled in this same run. The PHP plugin registry does not pick up newly enabled modules mid-process. Run the same command again — those items will import successfully on the next run.");
    }
    if ($failed > 0) {
      $this->io()->warning("Imported: {$imported}, failed: {$failed}" . ($rerun_needed > 0 ? ", rerun-needed: {$rerun_needed}" : "") . ". Check errors above.");
    }
    elseif ($rerun_needed > 0) {
      $this->io()->writeln("\n<info>Imported {$imported} config item(s). Re-run the command to complete the {$rerun_needed} deferred item(s).</info>");
    }
    else {
      $this->io()->success("Imported {$imported} config item(s). Caches cleared.");
    }
  }

  /**
   * Remove all configuration for a content type (reverses build).
   *
   * Deletes: all content nodes of this type, field instances, field storages
   * (only if unused by other bundles), entity displays, node type, pathauto
   * pattern, workflow bundle mapping, views, image styles, flags, webforms,
   * and taxonomy vocabulary (only if exclusively used by this type).
   *
   * WARNING: Destructive. Run --dry-run first.
   */
  #[CLI\Command(name: 'zu:remove-content-type', aliases: ['zrct'])]
  #[CLI\Argument(name: 'content_type', description: 'Machine name of the node bundle to remove (e.g. event).')]
  #[CLI\Option(name: 'dry-run', description: 'Preview what would be deleted without making any changes.')]
  #[CLI\Option(name: 'keep-content', description: 'Skip deleting nodes of this type (keep the content, remove only config).')]
  #[CLI\Option(name: 'keep-shared', description: 'Skip deleting field storages and vocabs that are shared with other bundles.')]
  #[CLI\Usage(name: 'drush zu:remove-content-type event --dry-run', description: 'Preview what would be removed.')]
  #[CLI\Usage(name: 'drush zu:remove-content-type event', description: 'Remove all event content type configuration.')]
  public function removeContentType(
    string $content_type,
    array $options = ['dry-run' => FALSE, 'keep-content' => FALSE, 'keep-shared' => FALSE],
  ): void {
    $dry          = (bool) $options['dry-run'];
    $keep_content = (bool) $options['keep-content'];
    $keep_shared  = (bool) $options['keep-shared'];

    if ($dry) {
      $this->io()->caution('DRY RUN — no changes will be saved.');
    }

    if (!$this->activeConfigStorage->exists("node.type.{$content_type}")) {
      throw new \RuntimeException("Content type '{$content_type}' does not exist in active config.");
    }

    if (!$dry) {
      $this->io()->caution("This will permanently delete all configuration for '{$content_type}'" . ($keep_content ? '' : ' including all its content nodes') . '.');
      if (!$this->io()->confirm("Are you sure?", FALSE)) {
        $this->io()->writeln('Aborted.');
        return;
      }
    }

    $this->io()->title("Removing content type: {$content_type}");

    if (!$keep_content) {
      $this->deleteNodes($content_type, $dry);
    }

    $this->removeFromWorkflows($content_type, $dry);

    $this->deleteEntityDisplays($content_type, $dry);

    $field_names = $this->getFieldInstanceNames($content_type);
    foreach ($field_names as $field_name) {
      $this->deleteFieldInstance($field_name, $content_type, $dry);
    }

    if (!$keep_shared) {
      foreach ($field_names as $field_name) {
        $this->maybeDeleteFieldStorage($field_name, $dry);
      }
    }
    $this->deleteExclusiveViews($content_type, $dry);
    $this->deletePathautoPatterns($content_type, $dry);
    $this->deleteExclusiveImageStyles($content_type, $dry);
    $this->deleteExclusiveFlags($content_type, $dry);
    $this->deleteExclusiveWebforms($content_type, $dry);
    $this->deleteActiveConfig("node.type.{$content_type}", $dry);

    if (!$keep_shared) {
      $this->deleteExclusiveVocabularies($content_type, $dry);
    }

    if ($dry) {
      $this->io()->success("DRY RUN complete — no changes were made.");
    }
    else {
      drupal_flush_all_caches();
      $this->io()->success("Content type '{$content_type}' and its configuration removed.");
    }
  }

  /**
   * List all content types that have config in the sync directory.
   */
  #[CLI\Command(name: 'zu:list-content-types', aliases: ['zlct'])]
  #[CLI\Usage(name: 'drush zu:list-content-types', description: 'List node bundles available in config/sync.')]
  public function listContentTypes(): void {
    $sync_dir = $this->getSyncDir();
    if (!is_dir($sync_dir)) {
      throw new \RuntimeException("Config sync directory not found: {$sync_dir}");
    }

    $files = glob("{$sync_dir}/node.type.*.yml") ?: [];
    if (empty($files)) {
      $this->io()->writeln("No node type configs found in {$sync_dir}.");
      return;
    }

    $this->io()->title('Content types in config/sync');
    $rows = [];
    foreach ($files as $file) {
      preg_match('/node\.type\.(.+)\.yml$/', basename($file), $m);
      $type   = $m[1] ?? '?';
      $data   = Yaml::parseFile($file);
      $label  = $data['name'] ?? $type;
      $active = $this->activeConfigStorage->exists("node.type.{$type}") ? '<info>yes</info>' : '<comment>no</comment>';
      $count  = count($this->collectRelatedConfigs($type, $sync_dir));
      $rows[] = [$type, $label, $count . ' items', $active];
    }

    $this->io()->table(['Machine name', 'Label', 'Config items', 'Installed'], $rows);
    $this->io()->writeln("Run <info>drush zu:build-content-type &lt;type&gt;</info> to install.");
  }

  /**
   * Collect all config names in sync_dir that are related to the given bundle.
   *
   * Strategy:
   *   1. Direct filename patterns (covers 90% of cases).
   *   2. Dependency graph traversal — any config whose dependencies include
   *      one of the already-matched configs is also pulled in.
   *
   * @return string[] Config names (without .yml extension), deduplicated.
   */
  private function collectRelatedConfigs(string $bundle, string $sync_dir): array {
    $all_files = glob("{$sync_dir}/*.yml") ?: [];
    $all_names = array_map(fn($f) => basename($f, '.yml'), $all_files);

    $matched = [];
    foreach ($all_names as $name) {
      if ($this->isDirectlyRelated($name, $bundle)) {
        $matched[$name] = TRUE;
      }
    }

    if (empty($matched)) {
      return [];
    }

    $changed = TRUE;
    while ($changed) {
      $changed = FALSE;
      foreach ($all_names as $name) {
        if (isset($matched[$name])) {
          continue;
        }
        if ($this->isDependencyRelated($name, $bundle, array_keys($matched), $sync_dir)) {
          $matched[$name] = TRUE;
          $changed = TRUE;
        }
      }
    }

    $all_names_index = array_flip($all_names);
    foreach (array_keys($matched) as $name) {
      if (!preg_match('/^field\.field\.node\.' . preg_quote($bundle, '/') . '\.(.+)$/', $name, $m)) {
        continue;
      }

      $storage_name = 'field.storage.node.' . $m[1];
      if (!isset($matched[$storage_name]) && isset($all_names_index[$storage_name])) {
        $matched[$storage_name] = TRUE;
      }

      $field_file = "{$sync_dir}/{$name}.yml";
      if (!file_exists($field_file)) {
        continue;
      }
      try {
        $field_data = Yaml::parseFile($field_file);
      }
      catch (\Exception $e) {
        continue;
      }
      foreach ($field_data['dependencies']['config'] ?? [] as $dep) {
        if (str_starts_with($dep, 'taxonomy.vocabulary.') && !isset($matched[$dep]) && isset($all_names_index[$dep])) {
          $matched[$dep] = TRUE;
        }
      }
    }

    $added_vocabs = TRUE;
    while ($added_vocabs) {
      $added_vocabs = FALSE;
      foreach (array_keys($matched) as $name) {
        if (!preg_match('/^taxonomy\.vocabulary\.(.+)$/', $name, $m)) {
          continue;
        }
        $vocab = $m[1];
        foreach ($all_names as $candidate) {
          if (isset($matched[$candidate])) {
            continue;
          }

          if (
            str_starts_with($candidate, "core.base_field_override.taxonomy_term.{$vocab}.") ||
            str_starts_with($candidate, "field.field.taxonomy_term.{$vocab}.") ||
            str_starts_with($candidate, "core.entity_form_display.taxonomy_term.{$vocab}.") ||
            str_starts_with($candidate, "core.entity_view_display.taxonomy_term.{$vocab}.") ||
            $candidate === "language.content_settings.taxonomy_term.{$vocab}"
          ) {
            $matched[$candidate] = TRUE;
            $added_vocabs = TRUE;
          }
        }
      }
    }

    foreach (array_keys($matched) as $name) {
      if (!preg_match('/^field\.field\.taxonomy_term\.[^.]+\.(.+)$/', $name, $m)) {
        continue;
      }
      $storage_name = 'field.storage.taxonomy_term.' . $m[1];
      if (!isset($matched[$storage_name]) && isset($all_names_index[$storage_name])) {
        $matched[$storage_name] = TRUE;
      }
    }

    return array_keys($matched);
  }

  /**
   * TRUE if the config name is directly related to the bundle by filename.
   */
  private function isDirectlyRelated(string $name, string $bundle): bool {
    $b = preg_quote($bundle, '/');

    $patterns = [
      "/^node\.type\\.{$b}$/",
      "/^core\.base_field_override\.node\\.{$b}\./",
      "/^field\.field\.node\\.{$b}\./",
      "/^core\.entity_form_display\.node\\.{$b}\./",
      "/^core\.entity_view_display\.node\\.{$b}\./",
      "/^core\.entity_view_mode\.node\.{$b}_/",
      "/^language\.content_settings\.node\\.{$b}$/",
      "/^pathauto\.pattern\.[^.]*{$b}/",
      "/^views\.view\.[^.]*{$b}/",
      "/^workflows\.workflow\.[^.]*{$b}/",
      "/^feeds\.feed_type\.[^.]*{$b}/",
      "/^flag\.flag\.[^.]*{$b}/",
      "/^image\.style\.{$b}_/",
      "/^image\.style\.[^.]*_{$b}_/",
      "/^image\.style\.[^.]*_{$b}$/",
      "/^webform\.webform\.{$b}_/",
      "/^webform\.webform\.[^.]*_{$b}/",
      "/^rules\.reaction\.[^.]*{$b}/",
      "/^ultimate_cron\.job\.[^.]*{$b}/",
      "/^{$b}_[a-z]/",
      "/^zu_permission_matrix\.permission_group\.[^.]*{$b}/",
      "/^search_api\.[^.]+\.[^.]*{$b}/",
      "/^system\.action\.[^.]*{$b}/",
    ];

    foreach ($patterns as $pattern) {
      if (preg_match($pattern, $name)) {
        return TRUE;
      }
    }

    return FALSE;
  }

  /**
   * TRUE if this config depends on one of the already-matched configs AND
   * it still specifically concerns the given bundle (prevents pulling in
   * unrelated config that merely shares a dependency).
   */
  private function isDependencyRelated(string $name, string $bundle, array $matched_names, string $sync_dir): bool {
    if (preg_match('/^field\.field\.node\.([^.]+)\./', $name, $m) && $m[1] !== $bundle) {
      return FALSE;
    }

    if (preg_match('/^core\.entity_(form|view)_display\.node\.([^.]+)\./', $name, $m) && $m[2] !== $bundle) {
      return FALSE;
    }

    if (preg_match('/^core\.base_field_override\.node\.([^.]+)\./', $name, $m) && $m[1] !== $bundle) {
      return FALSE;
    }

    if (preg_match('/^language\.content_settings\.node\.([^.]+)$/', $name, $m) && $m[1] !== $bundle) {
      return FALSE;
    }

    $file = "{$sync_dir}/{$name}.yml";
    if (!file_exists($file)) {
      return FALSE;
    }

    try {
      $data = Yaml::parseFile($file);
    }
    catch (\Exception $e) {
      return FALSE;
    }

    $config_deps = $data['dependencies']['config'] ?? [];
    foreach ($config_deps as $dep) {
      if (in_array($dep, $matched_names, TRUE)) {
        if (str_contains($name, $bundle)) {
          return TRUE;
        }

        if (str_starts_with($name, 'language.content_settings.taxonomy_term.')) {
          return TRUE;
        }

        if (preg_match('/^(field\.(field|storage)|core\.entity_(form|view)_display)\.taxonomy_term\./', $name)) {
          return TRUE;
        }
      }
    }

    return FALSE;
  }

  /**
   * Sort config names into a safe import order.
   *
   * Correct order: vocab → node type → field storages → field instances
   *                → form displays → view displays → views → everything else.
   */
  private function sortByDependencyOrder(array $names): array {
    $priority = function (string $name): int {
      if (str_starts_with($name, 'taxonomy.vocabulary.'))             return 10;
      if (str_starts_with($name, 'node.type.'))                       return 20;
      if (str_starts_with($name, 'image.style.'))                     return 25;
      if (str_starts_with($name, 'field.storage.'))                   return 30;
      if (str_starts_with($name, 'field.field.'))                     return 40;
      if (str_starts_with($name, 'core.entity_view_mode.'))           return 45;
      if (str_starts_with($name, 'core.entity_form_mode.'))           return 45;
      if (str_starts_with($name, 'core.entity_form_display.'))        return 50;
      if (str_starts_with($name, 'core.entity_view_display.'))        return 55;
      if (str_starts_with($name, 'core.base_field_override.'))        return 60;
      if (str_starts_with($name, 'language.content_settings.'))       return 65;
      if (str_starts_with($name, 'webform.webform.'))                 return 70;
      if (str_starts_with($name, 'pathauto.pattern.'))                return 75;
      if (str_starts_with($name, 'workflows.workflow.'))              return 80;
      if (str_starts_with($name, 'views.view.'))                      return 85;
      if (str_starts_with($name, 'flag.flag.'))                       return 90;
      if (str_starts_with($name, 'feeds.feed_type.'))                 return 90;
      if (str_starts_with($name, 'rules.reaction.'))                  return 95;
      return 100;
    };

    usort($names, fn($a, $b) => $priority($a) <=> $priority($b) ?: strcmp($a, $b));
    return $names;
  }

  private function deleteNodes(string $bundle, bool $dry): void {
    $nids = $this->entityTypeManager->getStorage('node')
      ->getQuery()
      ->condition('type', $bundle)
      ->accessCheck(FALSE)
      ->execute();

    if (empty($nids)) {
      $this->io()->writeln("  <comment>[skip]</comment>    No '{$bundle}' nodes found.");
      return;
    }

    $this->io()->writeln("  <info>[delete]</info>   <comment>" . count($nids) . "</comment> node(s) of type '{$bundle}'");
    if ($dry) {
      return;
    }

    foreach (array_chunk($nids, 50) as $chunk) {
      $nodes = $this->entityTypeManager->getStorage('node')->loadMultiple($chunk);
      $this->entityTypeManager->getStorage('node')->delete($nodes);
    }
  }

  private function getFieldInstanceNames(string $bundle): array {
    $prefix  = "field.field.node.{$bundle}.";
    $names   = $this->activeConfigStorage->listAll($prefix);
    $result  = [];
    foreach ($names as $name) {
      $result[] = substr($name, strlen($prefix));
    }
    return $result;
  }

  private function deleteFieldInstance(string $field_name, string $bundle, bool $dry): void {
    $config_name = "field.field.node.{$bundle}.{$field_name}";
    if (!$this->activeConfigStorage->exists($config_name)) {
      return;
    }
    $this->io()->writeln("  <info>[delete]</info>   field instance <comment>{$config_name}</comment>");
    if ($dry) {
      return;
    }
    $field = \Drupal\field\Entity\FieldConfig::loadByName('node', $bundle, $field_name);
    $field?->delete();
  }

  private function maybeDeleteFieldStorage(string $field_name, bool $dry): void {
    $storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('node', $field_name);
    if (!$storage) {
      return;
    }
    $bundles = array_keys($storage->getBundles());
    if (!empty($bundles)) {
      $this->io()->writeln("  <comment>[skip]</comment>    field storage <comment>node.{$field_name}</comment> still used by: " . implode(', ', $bundles));
      return;
    }
    $this->io()->writeln("  <info>[delete]</info>   field storage <comment>node.{$field_name}</comment>");
    if (!$dry) {
      $storage->delete();
    }
  }

  private function deleteEntityDisplays(string $bundle, bool $dry): void {
    foreach (['entity_form_display', 'entity_view_display'] as $storage_type) {
      $ids = $this->entityTypeManager->getStorage($storage_type)
        ->getQuery()
        ->condition('targetEntityType', 'node')
        ->condition('bundle', $bundle)
        ->execute();
      foreach ($ids as $id) {
        $this->io()->writeln("  <info>[delete]</info>   {$storage_type} <comment>{$id}</comment>");
        if (!$dry) {
          $this->entityTypeManager->getStorage($storage_type)->load($id)?->delete();
        }
      }
    }
  }

  private function removeFromWorkflows(string $bundle, bool $dry): void {
    if (!$this->moduleHandler->moduleExists('content_moderation')) {
      return;
    }
    $workflows = $this->entityTypeManager->getStorage('workflow')->loadMultiple();
    foreach ($workflows as $workflow) {
      $config = $workflow->getTypePlugin()->getConfiguration();
      $bundles = $config['entity_types']['node'] ?? [];
      if (!in_array($bundle, $bundles, TRUE)) {
        continue;
      }
      $this->io()->writeln("  <info>[update]</info>   removing '{$bundle}' from workflow <comment>{$workflow->id()}</comment>");
      if ($dry) {
        continue;
      }
      $config['entity_types']['node'] = array_values(array_filter($bundles, fn($b) => $b !== $bundle));
      if (empty($config['entity_types']['node'])) {
        unset($config['entity_types']['node']);
      }
      $workflow->getTypePlugin()->setConfiguration($config);
      $workflow->save();
    }
  }

  private function deleteExclusiveViews(string $bundle, bool $dry): void {
    if (!$this->moduleHandler->moduleExists('views')) {
      return;
    }
    $views = $this->entityTypeManager->getStorage('view')->loadMultiple();
    foreach ($views as $view) {
      if (!str_contains($view->id(), $bundle)) {
        continue;
      }
      $this->io()->writeln("  <info>[delete]</info>   view <comment>{$view->id()}</comment>");
      if (!$dry) {
        $view->delete();
      }
    }
  }

  private function deletePathautoPatterns(string $bundle, bool $dry): void {
    if (!$this->moduleHandler->moduleExists('pathauto')) {
      return;
    }
    $patterns = $this->entityTypeManager->getStorage('pathauto_pattern')->loadMultiple();
    foreach ($patterns as $pattern) {
      foreach ($pattern->getSelectionConditions() as $condition) {
        $config = $condition->getConfiguration();
        if (!empty($config['bundles'][$bundle])) {
          $this->io()->writeln("  <info>[delete]</info>   pathauto pattern <comment>{$pattern->id()}</comment>");
          if (!$dry) {
            $pattern->delete();
          }
          break;
        }
      }
    }
  }

  private function deleteExclusiveImageStyles(string $bundle, bool $dry): void {
    if (!$this->moduleHandler->moduleExists('image')) {
      return;
    }
    $styles = $this->entityTypeManager->getStorage('image_style')->loadMultiple();
    foreach ($styles as $style) {
      if (str_starts_with($style->id(), $bundle . '_')) {
        $this->io()->writeln("  <info>[delete]</info>   image style <comment>{$style->id()}</comment>");
        if (!$dry) {
          $style->delete();
        }
      }
    }
  }

  private function deleteExclusiveFlags(string $bundle, bool $dry): void {
    if (!$this->moduleHandler->moduleExists('flag')) {
      return;
    }
    $flags = $this->entityTypeManager->getStorage('flag')->loadMultiple();
    foreach ($flags as $flag) {
      if (str_contains($flag->id(), $bundle)) {
        $this->io()->writeln("  <info>[delete]</info>   flag <comment>{$flag->id()}</comment>");
        if (!$dry) {
          $flag->delete();
        }
      }
    }
  }

  private function deleteExclusiveWebforms(string $bundle, bool $dry): void {
    if (!$this->moduleHandler->moduleExists('webform')) {
      return;
    }
    $webforms = $this->entityTypeManager->getStorage('webform')->loadMultiple();
    foreach ($webforms as $webform) {
      if (str_starts_with($webform->id(), $bundle . '_') || str_ends_with($webform->id(), '_' . $bundle)) {
        $this->io()->writeln("  <info>[delete]</info>   webform <comment>{$webform->id()}</comment>");
        if (!$dry) {
          $webform->delete();
        }
      }
    }
  }

  private function deleteExclusiveVocabularies(string $bundle, bool $dry): void {
    $prefix = "field.field.node.{$bundle}.";
    $instances = $this->activeConfigStorage->listAll($prefix);
    $vocabs_used_by_bundle = [];
    $vocabs_used_by_others = [];

    foreach ($instances as $instance_name) {
      $data = $this->activeConfigStorage->read($instance_name);
      $target_bundles = $data['settings']['handler_settings']['target_bundles'] ?? [];
      foreach (array_keys($target_bundles) as $vocab) {
        $vocabs_used_by_bundle[$vocab] = TRUE;
      }
    }

    $all_node_instances = $this->activeConfigStorage->listAll('field.field.node.');
    foreach ($all_node_instances as $instance_name) {
      if (str_starts_with($instance_name, $prefix)) {
        continue;
      }
      $data = $this->activeConfigStorage->read($instance_name);
      $target_bundles = $data['settings']['handler_settings']['target_bundles'] ?? [];
      foreach (array_keys($target_bundles) as $vocab) {
        $vocabs_used_by_others[$vocab] = TRUE;
      }
    }

    foreach (array_keys($vocabs_used_by_bundle) as $vocab) {
      if (!empty($vocabs_used_by_others[$vocab])) {
        $this->io()->writeln("  <comment>[skip]</comment>    taxonomy.vocabulary.{$vocab} used by other bundles.");
        continue;
      }
      $this->io()->writeln("  <info>[delete]</info>   taxonomy.vocabulary.{$vocab}");
      if (!$dry) {
        $vocabulary = $this->entityTypeManager->getStorage('taxonomy_vocabulary')->load($vocab);
        $vocabulary?->delete();
      }
    }
  }

  private function deleteActiveConfig(string $config_name, bool $dry): void {
    if (!$this->activeConfigStorage->exists($config_name)) {
      return;
    }
    $this->io()->writeln("  <info>[delete]</info>   <comment>{$config_name}</comment>");
    if (!$dry) {
      [$entity_type_id, $id] = $this->resolveConfigEntityId($config_name);
      if ($entity_type_id) {
        $entity = $this->entityTypeManager->getStorage($entity_type_id)->load($id);
        $entity?->delete();
      }
      else {
        $this->activeConfigStorage->delete($config_name);
      }
    }
  }

  /**
   * Resolve a config name to its entity type and ID, if it is a config entity.
   *
   * @return array{0: string|null, 1: string|null}
   */
  private function resolveConfigEntityId(string $config_name): array {
    $definitions = $this->entityTypeManager->getDefinitions();
    foreach ($definitions as $entity_type_id => $definition) {
      if (!$definition->entityClassImplements(\Drupal\Core\Config\Entity\ConfigEntityInterface::class)) {
        continue;
      }
      $prefix = $definition->getConfigPrefix() . '.';
      if (str_starts_with($config_name, $prefix)) {
        $id = substr($config_name, strlen($prefix));
        return [$entity_type_id, $id];
      }
    }
    return [NULL, NULL];
  }

  /**
   * Return any module names listed in the config's dependencies that are not
   * currently installed. An empty array means all dependencies are satisfied.
   *
   * @param array $config_data Parsed YAML data of the config item.
   * @return string[] Missing module machine names.
   */
  private function getMissingModules(array $config_data): array {
    $required = $config_data['dependencies']['module'] ?? [];
    $missing  = [];
    $cache = !empty($this->enabledModulesCache)
      ? array_flip($this->enabledModulesCache)
      : NULL;
    foreach ($required as $module) {
      $installed = $cache !== NULL
        ? isset($cache[$module])
        : $this->moduleHandler->moduleExists($module);
      if (!$installed) {
        $missing[] = $module;
      }
    }
    return $missing;
  }

  /**
   * Strip third_party_settings and dependency entries for any modules that are
   * not currently installed.
   *
   * When a contrib module (e.g. node_save_redirect) adds itself to an entity's
   * third_party_settings and dependencies.module, and that module is absent,
   * Drupal rejects the import because it references an unknown module. This
   * method removes those entries so the entity can be saved cleanly. The
   * settings will be re-added automatically once the module is installed.
   *
   * @param array $data Parsed YAML / config array.
   * @return array Cleaned config data.
   */
  private function stripMissingModuleData(array $data): array {
    $declared_modules = $data['dependencies']['module'] ?? [];
    if (empty($declared_modules)) {
      return $data;
    }

    $missing = [];
    foreach ($declared_modules as $module) {
      if (!$this->moduleHandler->moduleExists($module)) {
        $missing[$module] = TRUE;
      }
    }

    if (empty($missing)) {
      return $data;
    }

    $data['dependencies']['module'] = array_values(
      array_filter($declared_modules, fn($m) => !isset($missing[$m]))
    );

    foreach (array_keys($missing) as $module) {
      unset($data['third_party_settings'][$module]);
    }

    return $data;
  }

  /**
   * Remove display components/content that reference skipped field instances.
   *
   * Entity displays list field components by field name. If the field itself
   * was skipped (e.g. feeds_item), we remove its component from the display
   * so the display can be saved without it.
   *
   * @param array  $data        Parsed display config data.
   * @param array  $skipped_set Map of skipped config names.
   * @return array Cleaned display data.
   */
  private function stripSkippedFieldComponents(array $data, array $skipped_set): array {
    $skipped_fields = [];
    foreach (array_keys($skipped_set) as $config_name) {
      if (preg_match('/^field\.field\.\w+\.\w+\.(.+)$/', $config_name, $m)) {
        $skipped_fields[$m[1]] = TRUE;
      }
    }

    if (empty($skipped_fields)) {
      return $data;
    }

    foreach (['content', 'hidden'] as $section) {
      if (!isset($data[$section]) || !is_array($data[$section])) {
        continue;
      }
      foreach (array_keys($data[$section]) as $field_name) {
        if (isset($skipped_fields[$field_name])) {
          unset($data[$section][$field_name]);
          if (isset($data['dependencies']['config'])) {
            $data['dependencies']['config'] = array_values(
              array_filter($data['dependencies']['config'], fn($dep) => !str_ends_with($dep, ".{$field_name}"))
            );
          }
        }
      }
    }

    return $data;
  }

  /**
   * Scan all config items in the set and return a deduplicated list of every
   * module that is required but not currently installed.
   *
   * @param string[] $config_names
   * @param FileStorage $file_storage
   * @return string[] Sorted list of missing module machine names.
   */
  private function collectAllMissingModules(array $config_names, FileStorage $file_storage): array {
    $missing = [];
    foreach ($config_names as $name) {
      $data = $file_storage->read($name);
      if ($data === FALSE) {
        continue;
      }
      foreach ($this->getMissingModules($data) as $module) {
        $missing[$module] = TRUE;
      }
    }
    $result = array_keys($missing);
    sort($result);
    return $result;
  }

  /**
   * Split a list of missing module names into two buckets:
   *   [0] installable  — .info.yml exists on disk under modules/, just not enabled
   *   [1] unavailable  — not on the filesystem at all (needs composer require)
   *
   * Uses a direct filesystem scan so this works even when Drupal cannot fully
   * boot (e.g. when orphaned config from a previous failed run is in the DB).
   *
   * @param string[] $module_names
   * @return array{0: string[], 1: string[]}
   */
  private function splitModuleAvailability(array $module_names): array {
    if (empty($module_names)) {
      return [[], []];
    }

    $on_disk = [];
    $search_roots = [
      DRUPAL_ROOT . '/core/modules',
      DRUPAL_ROOT . '/modules',
      DRUPAL_ROOT . '/profiles',
      dirname(DRUPAL_ROOT) . '/vendor',
    ];

    foreach ($search_roots as $root) {
      if (!is_dir($root)) {
        continue;
      }
      $iterator = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($root, \RecursiveDirectoryIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
      );
      foreach ($iterator as $file) {
        if ($file->getExtension() === 'yml' && str_ends_with($file->getFilename(), '.info.yml')) {
          $module_name = basename($file->getFilename(), '.info.yml');
          $on_disk[$module_name] = TRUE;
        }
      }
    }

    $installable = [];
    $unavailable = [];
    foreach ($module_names as $name) {
      if (isset($on_disk[$name])) {
        $installable[] = $name;
      }
      else {
        $unavailable[] = $name;
      }
    }

    return [$installable, $unavailable];
  }

  /**
   * Resolve the config sync directory path.
   *
   * Checks (in order):
   *   1. $settings['config_sync_directory'] from settings.php
   *   2. Standard {DRUPAL_ROOT}/../config/sync
   *   3. Standard {DRUPAL_ROOT}/config/sync
   */
  /**
   * Delete a module's default config objects from the active store so that
   * drush pm:enable can install it cleanly (avoids PreExistingConfigException).
   *
   * Only deletes config that came from the module's config/install directory —
   * never touches content-type-specific config that may have been imported.
   */
  private function deleteModuleDefaultConfigs(string $module): void {
    $search_roots = [DRUPAL_ROOT . '/modules', DRUPAL_ROOT . '/profiles'];
    $module_dir = NULL;
    foreach ($search_roots as $root) {
      if (!is_dir($root)) continue;
      $it = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($root, \RecursiveDirectoryIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::SELF_FIRST
      );
      foreach ($it as $f) {
        if ($f->isFile() && $f->getFilename() === "{$module}.info.yml") {
          $module_dir = $f->getPath();
          break 2;
        }
      }
    }
    if (!$module_dir) {
      return;
    }
    $config_install = $module_dir . '/config/install';
    if (!is_dir($config_install)) {
      return;
    }
    foreach (glob("{$config_install}/*.yml") ?: [] as $file) {
      $config_name = basename($file, '.yml');
      if ($this->activeConfigStorage->exists($config_name)) {
        $this->activeConfigStorage->delete($config_name);
      }
    }
  }

  /**
   * Ensure language.negotiation config exists in the active store.
   *
   * On a fresh Drupal install the language module may be enabled but
   * language.negotiation may not be written to the DB yet. When any subsequent
   * module install fires hook_modules_installed, LanguageHooks::modulesInstalled
   * calls LanguageNegotiator::updateConfiguration($types) where $types comes
   * from reading language.negotiation — returning null on a missing record —
   * causing a TypeError. Writing a minimal valid record prevents this.
   */
  private function ensureLanguageNegotiationConfig(): void {
    if (!$this->moduleHandler->moduleExists('language')) {
      return;
    }
    if (!$this->activeConfigStorage->exists('language.types')
        || empty($this->activeConfigStorage->read('language.types')['configurable'])) {
      $this->activeConfigStorage->write('language.types', [
        'langcode'     => 'en',
        'configurable' => ['language_interface'],
        'all'          => ['language_interface', 'language_content', 'language_url'],
        'negotiation'  => [
          'language_interface' => [
            'enabled' => ['language-selected' => 0],
            'method_id' => 'language-selected',
          ],
        ],
      ]);
      $this->configFactory->reset('language.types');
    }
    if (!$this->activeConfigStorage->exists('language.negotiation')) {
      $this->activeConfigStorage->write('language.negotiation', [
        'langcode'          => 'en',
        'url'               => ['source' => 'path_prefix', 'conditions' => []],
        'session'           => ['parameter' => 'language'],
        'selected_langcode' => 'site_default',
        'negotiation'       => [
          'language_interface' => [
            'enabled'   => ['language-selected' => 0],
            'method_id' => 'language-selected',
          ],
          'language_content' => [
            'enabled'   => ['language-content-entity' => 0, 'language-selected' => -9],
            'method_id' => 'language-selected',
          ],
          'language_url' => [
            'enabled'   => ['language-url' => 0, 'language-selected' => -9],
            'method_id' => 'language-selected',
          ],
        ],
      ]);
      $this->configFactory->reset('language.negotiation');
    }
  }

  /**
   * Refresh the cached enabled-module set from the active config storage.
   *
   * Called after drush pm:enable subprocesses update the DB so that subsequent
   * getMissingModules() calls reflect the newly-enabled modules.
   */
  private function refreshModuleList(): void {
    try {
      $data = $this->activeConfigStorage->read('core.extension');
      if (is_array($data) && isset($data['module'])) {
        $this->enabledModulesCache = array_keys($data['module']);
      }
    }
    catch (\Throwable) {
    }
  }

  /**
   * Return the path to the drush binary, preferring the project-local copy.
   */
  /**
   * Rebuild the Drupal service container after modules are enabled via subprocess.
   *
   * drush pm:enable runs in a child process — it updates core.extension in the DB
   * but the current PHP process still has the old container with the old module
   * list. Any plugin class registered by newly-enabled modules (field types,
   * language plugins, etc.) will be "not found" until the container is rebuilt.
   *
   * We rebuild by calling drupal_flush_all_caches() which triggers a full
   * container rebuild including the module extension list, plugin discovery,
   * and the class loader. This is the same thing Drupal does after module install.
   */
  private function rebuildContainerAfterModuleEnable(): void {
    try {
      drupal_flush_all_caches();
    }
    catch (\Throwable $e) {
    }
  }

  /**
   * Read drupal/* package version constraints from the project's composer.json.
   *
   * Returns a map of "drupal/package-name" => "^1.2" so composer require can
   * use the exact constraint the source project uses (e.g. "^6.3@beta" for
   * webform which fails without a stability flag).
   *
   * @param string $composer_root Project root containing composer.json.
   * @return array<string, string> Map of package => version constraint.
   */
  private function readSourceComposerVersions(string $composer_root): array {
    $composer_file = $composer_root . '/composer.json';
    if (!file_exists($composer_file)) {
      return [];
    }
    try {
      $json = json_decode(file_get_contents($composer_file), TRUE, 512, JSON_THROW_ON_ERROR);
    }
    catch (\Throwable) {
      return [];
    }
    $versions = [];
    foreach ($json['require'] ?? [] as $package => $version) {
      if (str_starts_with($package, 'drupal/') && $package !== 'drupal/core-recommended') {
        $versions[$package] = $version;
      }
    }
    return $versions;
  }

  /**
   * Given a list of module names, return them plus all transitive dependencies
   * declared in each module's .info.yml, filtering to only those present on disk.
   *
   * This ensures that when we enable e.g. 'webform', its submodules and
   * declared deps (token, etc.) are also queued for pm:enable rather than
   * letting drush discover them interactively.
   *
   * @param string[] $modules
   * @return string[] Deduplicated list including all resolvable transitive deps.
   */
  private function expandModuleDependencies(array $modules): array {
    // Build on-disk module index once.
    $on_disk = [];
    $search_roots = [
      DRUPAL_ROOT . '/core/modules',
      DRUPAL_ROOT . '/modules',
      DRUPAL_ROOT . '/profiles',
    ];
    foreach ($search_roots as $root) {
      if (!is_dir($root)) continue;
      $it = new \RecursiveIteratorIterator(
        new \RecursiveDirectoryIterator($root, \RecursiveDirectoryIterator::SKIP_DOTS),
        \RecursiveIteratorIterator::LEAVES_ONLY
      );
      foreach ($it as $file) {
        if ($file->getExtension() === 'yml' && str_ends_with($file->getFilename(), '.info.yml')) {
          $name = basename($file->getFilename(), '.info.yml');
          $on_disk[$name] = $file->getPathname();
        }
      }
    }

    $resolved = [];
    $queue    = $modules;
    while (!empty($queue)) {
      $module = array_shift($queue);
      if (isset($resolved[$module])) continue;
      $resolved[$module] = TRUE;
      if (!isset($on_disk[$module])) continue;
      try {
        $info = Yaml::parseFile($on_disk[$module]);
      }
      catch (\Exception $e) { continue; }
      foreach ($info['dependencies'] ?? [] as $dep_raw) {
        $dep = preg_replace('/[:\s(].*$/', '', $dep_raw);
        $dep = preg_replace('/^drupal\//', '', $dep);
        if ($dep && !isset($resolved[$dep]) && isset($on_disk[$dep])) {
          $queue[] = $dep;
        }
      }
    }

    $enabled = [];
    try {
      $ext = $this->activeConfigStorage->read('core.extension');
      if (is_array($ext['module'] ?? NULL)) {
        $enabled = array_flip(array_keys($ext['module']));
      }
    }
    catch (\Throwable) {}

    return array_values(array_filter(array_keys($resolved), fn($m) => !isset($enabled[$m])));
  }

  private function getDrushBinary(): string {
    $candidates = [
      dirname(DRUPAL_ROOT) . '/vendor/bin/drush',
      dirname(DRUPAL_ROOT) . '/vendor/drush/drush/drush',
    ];
    foreach ($candidates as $path) {
      if (file_exists($path)) {
        return escapeshellarg($path);
      }
    }
    return 'drush';
  }

  private function getSyncDir(): string {
    $has_config = fn(string $dir): bool => is_dir($dir) && !empty(glob("{$dir}/*.yml"));

    $settings_dir = \Drupal\Core\Site\Settings::get('config_sync_directory', '');
    if ($settings_dir) {
      $resolved = str_starts_with($settings_dir, '/') || preg_match('/^[A-Za-z]:\\\\/', $settings_dir)
        ? $settings_dir
        : DRUPAL_ROOT . '/' . $settings_dir;
      $resolved = rtrim($resolved, '/\\');
      if ($has_config($resolved)) {
        return $resolved;
      }
    }

    $candidates = [
      dirname(DRUPAL_ROOT) . '/config/sync',
      DRUPAL_ROOT . '/config/sync',
      DRUPAL_ROOT . '/../config/sync',
    ];
    foreach ($candidates as $candidate) {
      $real = realpath($candidate);
      if ($real && $has_config($real)) {
        return $real;
      }
    }

    throw new \RuntimeException(
      "Cannot locate the config sync directory. " .
      "Set \$settings['config_sync_directory'] in settings.php or ensure config/sync exists."
    );
  }

}
