<?php

namespace Drupal\zu_user_group\Commands;

use Drush\Commands\DrushCommands;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\zu_user_group\Entity\UserGroup;

/**
 * A Drush commandfile.
 */
class MigrationCommands extends DrushCommands
{

    /**
     * Entity type manager.
     *
     * @var \Drupal\Core\Entity\EntityTypeManagerInterface
     */
    protected $entityTypeManager;

    /**
     * Constructs a new MigrationCommands object.
     *
     * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
     *   Entity type manager.
     */
    public function __construct(EntityTypeManagerInterface $entityTypeManager)
    {
        parent::__construct();
        $this->entityTypeManager = $entityTypeManager;
    }

    /**
     * Migrates User Group taxonomy terms to User Group entities.
     *
     * @command zu-user-group:migrate
     * @aliases zugm
     */
    public function migrate()
    {
        $this->output()->writeln('Starting migration of User Group taxonomy terms...');

        $vocabulary_name = 'user_groups'; 
        $term_storage = $this->entityTypeManager->getStorage('taxonomy_term');
        $terms = $term_storage->loadByProperties(['vid' => $vocabulary_name]);

        if (empty($terms)) {
            $this->output()->writeln('No taxonomy terms found in vocabulary: ' . $vocabulary_name);
            return;
        }

        $count = 0;
        foreach ($terms as $term) {
            $group_name = $term->label();

            $existing = $this->entityTypeManager->getStorage('user_group')->loadByProperties(['name' => $group_name]);
            if (!empty($existing)) {
                $this->output()->writeln('Skipping existing group: ' . $group_name);
                continue;
            }

            $user_group = UserGroup::create([
                'name' => $group_name,
            ]);

            if ($term->hasField('field_user_members')) {
                $user_ids = [];
                foreach ($term->get('field_user_members')->getValue() as $value) {
                    $user_ids[] = ['target_id' => $value['target_id']];
                }
                $user_group->set('users', $user_ids);
            }

            if ($term->hasField('field_public_user_groups')) {
                $public_user_ids = [];
                foreach ($term->get('field_public_user_groups')->getValue() as $value) {
                    $public_user_ids[] = ['target_id' => $value['target_id']];
                }
                $user_group->set('public_users', $public_user_ids);
            }

            $user_group->save();
            $this->output()->writeln('Migrated term "' . $group_name . '" to User Group entity.');
            $count++;
        }

        $this->output()->writeln('Migration finished. Total groups created: ' . $count);
    }

}
