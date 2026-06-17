<?php

namespace Drupal\zu_rest_api\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;

class ForumApiController extends ControllerBase
{
    public function getFullForumTree()
    {

        $formatter = \Drupal::service('date.formatter');

        $tids = \Drupal::entityQuery('taxonomy_term')
            ->condition('vid', 'forums')
            ->accessCheck(FALSE)
            ->execute();

        $terms = \Drupal\taxonomy\Entity\Term::loadMultiple($tids);

        $containers = [];
        $children = [];

        foreach ($terms as $term) {
            $tid = $term->id();
            $parent = $term->parent->target_id ?? 0;

            if ($parent) {
                $children[$parent][] = $tid;
            } else {
                $containers[$tid] = $tid;
            }
        }

        $output = [];

        foreach ($containers as $cid) {

            $container_term = $terms[$cid];

            $container_data = [
                'tid' => $cid,
                'name' => $container_term->getName(),
                'url' => '/forum/' . $cid,
                'topics_count' => 0,
                'posts_count' => 0,
                'forums' => []
            ];

            $forum_tids = $children[$cid] ?? [];

            foreach ($forum_tids as $forum_tid) {

                $forum_term = $terms[$forum_tid];

                $topic_nids = \Drupal::entityQuery('node')
                    ->condition('type', 'forum')
                    ->condition('taxonomy_forums', $forum_tid)
                    ->condition('status', 1)
                    ->accessCheck(FALSE)
                    ->execute();

                $topics = [];
                $total_posts = 0;

                if ($topic_nids) {
                    $nodes = \Drupal\node\Entity\Node::loadMultiple($topic_nids);

                    foreach ($nodes as $node) {
                        $nid = $node->id();

                        // Count comments
                        $replies = \Drupal::entityQuery('comment')
                            ->condition('entity_id', $nid)
                            ->condition('status', 1)
                            ->accessCheck(FALSE)
                            ->count()
                            ->execute();

                        $topics[] = [
                            'nid' => $nid,
                            'title' => $node->getTitle(),
                            'author' => $node->getOwner()->getDisplayName(),
                            'created' => \Drupal::service('date.formatter')->format(
                                $node->getCreatedTime(),
                                'custom',
                                'd M Y'
                            ),
                            'replies' => $replies,
                            'url' => "/forum/{$forum_tid}/{$nid}",
                            'body' => $node->body->value,
                        ];

                        $total_posts += $replies;
                    }
                }

                // Add forum data
                $container_data['forums'][] = [
                    'tid' => $forum_tid,
                    'name' => $forum_term->getName(),
                    'url' => '/forum/' . $forum_tid,
                    'topics_count' => count($topics),
                    'posts_count' => $total_posts,
                    'topics' => $topics
                ];

                $container_data['topics_count'] += count($topics);
                $container_data['posts_count'] += $total_posts;
            }

            $output[] = $container_data;
        }

        return new JsonResponse([
            'status' => 'success',
            'forumData' => $output,
        ]);
    }
}
