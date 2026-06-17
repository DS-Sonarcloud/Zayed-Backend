<?php
/**
 * @file
 * Contains \Drupal\drupal_layoutbuilder\DrupalPost_CSS.
 */

namespace Drupal\drupal_layoutbuilder;

use DrupalLayoutbuilder\Core\Files\CSS\Post as Post_CSS;
use DrupalLayoutbuilder\Element_Base;

class DrupalPost_CSS extends Post_CSS
{
  public function render_styles(Element_Base $element)
  {
    parent::render_styles($element);
  }
}
