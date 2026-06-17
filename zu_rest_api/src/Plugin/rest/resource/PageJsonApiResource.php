<?php

namespace Drupal\zu_rest_api\Plugin\rest\resource;

use Dom\Element;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;



/**
 * Provides a REST API to get pages.
 *
 * @RestResource(
 *   id = "page_json_api_resource",
 *   label = @Translation("Page JSON API Resource"),
 *   uri_paths = {
 *     "canonical" = "/api/pages"
 *   }
 * )
 */
class PageJsonApiResource extends ResourceBase
{

    /**
     * Responds to GET requests.
     *
     * Returns a list of published pages.
     *
     * @return \Drupal\rest\ResourceResponse
     */
    public function get()
    {
        $page_info = $this->get_node_id_from_url_ml($_GET['url']);
        $nid = $page_info['node_id'];
        $data = $this->get_data($nid);
        $data['page_info'] = $page_info;
        return new ResourceResponse($data);
    }

    public function get_data($uid)
    {
        $connection = \Drupal::database();
        $result = $connection->query("SELECT data FROM drupal_layoutbuilder_data WHERE uid = " . $uid . " ORDER BY ID DESC LIMIT 1")
            ->fetch();
        $result->data = json_decode($result->data, true);
        $result->data = json_encode($result->data);
        return json_decode($result->data, true);
    }

    public function get_node_id_from_url_ml($url)
    {
        $language = \Drupal::languageManager()->getLanguages();
        $language = array_map(function ($v) {
            return '/' . $v . '/';
        }, array_keys($language));

        if ($url !== NULL) {
            $url = str_replace($language, '/', $url);
            $url = str_replace('//', '/', $url);
        }

        if (strlen($url) < 2) {
            $url = "home";
        }

        $nid = 0;
        $database = \Drupal::database();
        $current_domain_id = \Drupal::service('domain.negotiator')->getActiveId();
        $query = $database->select('path_alias', 'pa')->fields('pa')->condition('pa.alias', $url);
        $result = $query->execute()->fetchAll();
        $path = '';
        if (isset($result[0])) {
            foreach ($result as $result_key => $result_value) {
                if ($result_value->domain_id == $current_domain_id || $result_value->domain_id === NULL) {
                    $path = $result[$result_key]->path;
                    if (preg_match('/node\/(\d+)/', $path, $matches)) {
                        $nid = (int) $matches[1];
                    }
                }
            }
        } elseif ($url == "home") {
            $path = \Drupal::config('system.site')->get('page.front');
            if (preg_match('/node\/(\d+)/', $path, $matches)) {
                $nid = (int) $matches[1];
            }
        }
        $query = $database->select('path_alias', 'pa')->fields('pa')->condition('pa.path', $path);
        $result = $query->execute()->fetchAll();
        $front_page = \Drupal::config('system.site')->get('page.front');
        $data = [];
        foreach ($result as $value) {
            if ($front_page == $path) {
                $value->alias = '';
            }
            $data[$value->langcode] = '/' . $value->langcode . $value->alias;
        }
        if (empty($data)) {
            $data = [
                "en" => "/en",
                "ar" => "/ar"
            ];
        }
        return ['node_id' => $nid, 'url' => $data];
    }
}
