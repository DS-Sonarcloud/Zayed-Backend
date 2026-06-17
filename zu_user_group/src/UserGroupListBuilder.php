<?php

namespace Drupal\zu_user_group;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;

/**
 * Provides a list controller for User Group entity.
 */
class UserGroupListBuilder extends EntityListBuilder
{

    /**
     * {@inheritdoc}
     */
    /**
     * {@inheritdoc}
     */
    protected function getEntityIds()
    {
        $query = $this->getStorage()->getQuery()
            ->accessCheck(TRUE)
            ->sort('id', 'DESC')
            ->pager(10);
        return $query->execute();
    }

    /**
     * {@inheritdoc}
     */
    public function buildHeader()
    {
        $header['sno'] = $this->t('S.No');
        $header['name'] = $this->t('Name');
        $header['id'] = $this->t('ID');
        unset($header['id']);

        return $header + parent::buildHeader();
    }

    /**
     * {@inheritdoc}
     */
    public function buildRow(EntityInterface $entity)
    {
        /** @var \Drupal\zu_user_group\Entity\UserGroup $entity */
        static $row_counter = 0;
        $pager = \Drupal::service('pager.manager')->getPager();
        $page = $pager ? $pager->getCurrentPage() : 0;
        $sno = ($page * 10) + (++$row_counter);

        $row['sno'] = $sno;
        $row['name'] = $entity->toLink();
        return $row + parent::buildRow($entity);
    }
}
