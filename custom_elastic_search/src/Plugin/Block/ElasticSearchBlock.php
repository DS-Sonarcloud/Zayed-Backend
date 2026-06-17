<?php

namespace Drupal\custom_elastic_search\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides an ElasticSearch auto-search block.
 *
 * @Block(
 *   id = "elastic_search_block",
 *   admin_label = @Translation("Elastic Search Auto Search Box"),
 * )
 */
class ElasticSearchBlock extends BlockBase {

  public function build() {
    return [
      '#type' => 'inline_template',
      '#template' => '<input type="text" id="elastic-search-input" placeholder="Search..." autocomplete="off" />
                      <button type="button" id="voice-search-btn" class="voice-btn" title="Speak now" style="display: block;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 18.93V22h2v-3.07A8.001 8.001 0 0 0 19.938 13H17.9a6.002 6.002 0 0 1-11.8 0H4.062A8.001 8.001 0 0 0 11 18.93z"/>
</svg>
</button>
                      <div id="elastic-search-results" class="search-results"></div>',
      '#attached' => [
        'library' => ['custom_elastic_search/elastic_search_autocomplete','custom_elastic_search/voice_to_text'],
      ],
    ];
  }

}
