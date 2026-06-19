<?php

namespace Drupal\aegov_page_builder\Service;

/**
 * Central registry of all UAE Design System components, blocks, and patterns.
 */
class ComponentRegistry {

  /**
   * Returns all component definitions grouped by category.
   */
  public static function getAll(): array {
    return array_merge(
      self::getComponents(),
      self::getBlocks(),
      self::getPatterns()
    );
  }

  public static function getComponents(): array {
    return [
      'accordion' => [
        'id' => 'accordion', 'category' => 'component', 'label' => 'Accordion',
        'description' => 'Collapsible content sections', 'icon' => 'chevrons-down',
        'fields' => [
          'items' => ['type' => 'repeater', 'label' => 'Accordion Items', 'subfields' => [
            'title' => ['type' => 'text', 'label' => 'Title', 'default' => 'Section Title'],
            'content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Section content goes here.'],
            'open' => ['type' => 'boolean', 'label' => 'Open by default', 'default' => FALSE],
          ], 'default' => []],
        ],
      ],
      'alert' => [
        'id' => 'alert', 'category' => 'component', 'label' => 'Alert',
        'description' => 'Status and notification messages', 'icon' => 'bell',
        'fields' => [
          'type' => ['type' => 'select', 'label' => 'Alert Type', 'options' => ['info' => 'Info', 'success' => 'Success', 'warning' => 'Warning', 'danger' => 'Danger'], 'default' => 'info'],
          'title' => ['type' => 'text', 'label' => 'Title', 'default' => 'Alert Title'],
          'message' => ['type' => 'textarea', 'label' => 'Message', 'default' => 'Alert message content.'],
          'dismissible' => ['type' => 'boolean', 'label' => 'Dismissible', 'default' => TRUE],
          'icon' => ['type' => 'boolean', 'label' => 'Show Icon', 'default' => TRUE],
        ],
      ],
      'avatar' => [
        'id' => 'avatar', 'category' => 'component', 'label' => 'Avatar',
        'description' => 'User profile images or initials', 'icon' => 'user-circle',
        'fields' => [
          'image' => ['type' => 'image', 'label' => 'Image URL', 'default' => ''],
          'initials' => ['type' => 'text', 'label' => 'Initials (fallback)', 'default' => 'AE'],
          'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['xs' => 'Extra Small', 'sm' => 'Small', 'md' => 'Medium', 'lg' => 'Large', 'xl' => 'Extra Large'], 'default' => 'md'],
          'alt' => ['type' => 'text', 'label' => 'Alt Text', 'default' => 'User avatar'],
          'status' => ['type' => 'select', 'label' => 'Status Indicator', 'options' => ['' => 'None', 'online' => 'Online', 'offline' => 'Offline', 'busy' => 'Busy'], 'default' => ''],
        ],
      ],
      'badge' => [
        'id' => 'badge', 'category' => 'component', 'label' => 'Badge',
        'description' => 'Small status indicators', 'icon' => 'tag',
        'fields' => [
          'text' => ['type' => 'text', 'label' => 'Badge Text', 'default' => 'New'],
          'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default' => 'Default', 'primary' => 'Primary', 'success' => 'Success', 'warning' => 'Warning', 'danger' => 'Danger', 'info' => 'Info'], 'default' => 'primary'],
          'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm' => 'Small', 'md' => 'Medium', 'lg' => 'Large'], 'default' => 'md'],
          'pill' => ['type' => 'boolean', 'label' => 'Pill Shape', 'default' => FALSE],
        ],
      ],
      'banner' => [
        'id' => 'banner', 'category' => 'component', 'label' => 'Banner',
        'description' => 'Page-wide announcement banners', 'icon' => 'megaphone',
        'fields' => [
          'message' => ['type' => 'textarea', 'label' => 'Message', 'default' => 'Important announcement message.'],
          'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['info' => 'Info', 'warning' => 'Warning', 'success' => 'Success'], 'default' => 'info'],
          'link_text' => ['type' => 'text', 'label' => 'Link Text', 'default' => 'Learn more'],
          'link_url' => ['type' => 'text', 'label' => 'Link URL', 'default' => '#'],
          'dismissible' => ['type' => 'boolean', 'label' => 'Dismissible', 'default' => TRUE],
        ],
      ],
      'blockquote' => [
        'id' => 'blockquote', 'category' => 'component', 'label' => 'Blockquote',
        'description' => 'Highlighted quoted text blocks', 'icon' => 'quote',
        'fields' => [
          'quote' => ['type' => 'textarea', 'label' => 'Quote Text', 'default' => 'An inspiring quote or important statement goes here.'],
          'author' => ['type' => 'text', 'label' => 'Author Name', 'default' => 'Author Name'],
          'author_title' => ['type' => 'text', 'label' => 'Author Title', 'default' => 'Position, Organization'],
          'author_image' => ['type' => 'image', 'label' => 'Author Image', 'default' => ''],
        ],
      ],
      'breadcrumbs' => [
        'id' => 'breadcrumbs', 'category' => 'component', 'label' => 'Breadcrumbs',
        'description' => 'Navigation hierarchy trail', 'icon' => 'chevron-right',
        'fields' => [
          'items' => ['type' => 'repeater', 'label' => 'Breadcrumb Items', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Home'],
            'url' => ['type' => 'text', 'label' => 'URL', 'default' => '/'],
          ], 'default' => []],
          'current_page' => ['type' => 'text', 'label' => 'Current Page Label', 'default' => 'Current Page'],
        ],
      ],
      'button' => [
        'id' => 'button', 'category' => 'component', 'label' => 'Button',
        'description' => 'Interactive action buttons', 'icon' => 'cursor-click',
        'fields' => [
          'text' => ['type' => 'text', 'label' => 'Button Text', 'default' => 'Click Here'],
          'url' => ['type' => 'text', 'label' => 'URL', 'default' => '#'],
          'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['primary' => 'Primary', 'secondary' => 'Secondary', 'outline' => 'Outline', 'ghost' => 'Ghost', 'danger' => 'Danger'], 'default' => 'primary'],
          'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm' => 'Small', 'md' => 'Medium', 'lg' => 'Large'], 'default' => 'md'],
          'icon_left' => ['type' => 'text', 'label' => 'Left Icon (SVG name)', 'default' => ''],
          'icon_right' => ['type' => 'text', 'label' => 'Right Icon (SVG name)', 'default' => ''],
          'full_width' => ['type' => 'boolean', 'label' => 'Full Width', 'default' => FALSE],
          'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => FALSE],
          'type' => ['type' => 'select', 'label' => 'HTML Type', 'options' => ['button' => 'Button', 'submit' => 'Submit', 'reset' => 'Reset'], 'default' => 'button'],
        ],
      ],
      'card' => [
        'id' => 'card', 'category' => 'component', 'label' => 'Card',
        'description' => 'Content container cards', 'icon' => 'rectangle',
        'fields' => [
          'variant' => ['type' => 'select', 'label' => 'Card Variant', 'options' => ['default' => 'Default', 'horizontal' => 'Horizontal', 'news' => 'News Card', 'service' => 'Service Card', 'stat' => 'Statistics Card'], 'default' => 'default'],
          'image' => ['type' => 'image', 'label' => 'Image URL', 'default' => ''],
          'image_alt' => ['type' => 'text', 'label' => 'Image Alt Text', 'default' => 'Card image'],
          'badge' => ['type' => 'text', 'label' => 'Badge Label', 'default' => ''],
          'title' => ['type' => 'text', 'label' => 'Title', 'default' => 'Card Title'],
          'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => 'Card description text goes here.'],
          'date' => ['type' => 'text', 'label' => 'Date', 'default' => ''],
          'link_text' => ['type' => 'text', 'label' => 'Link Text', 'default' => 'Read more'],
          'link_url' => ['type' => 'text', 'label' => 'Link URL', 'default' => '#'],
          'entity_type' => ['type' => 'entity_reference', 'label' => 'Map to Content Type', 'default' => ''],
        ],
      ],
      'checkbox' => [
        'id' => 'checkbox', 'category' => 'component', 'label' => 'Checkbox',
        'description' => 'Checkbox form input', 'icon' => 'check-square',
        'fields' => [
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Check this option'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'checkbox_field'],
          'checked' => ['type' => 'boolean', 'label' => 'Checked by default', 'default' => FALSE],
          'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => FALSE],
          'helper_text' => ['type' => 'text', 'label' => 'Helper Text', 'default' => ''],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
        ],
      ],
      'dropdown' => [
        'id' => 'dropdown', 'category' => 'component', 'label' => 'Dropdown',
        'description' => 'Dropdown menu component', 'icon' => 'chevron-down',
        'fields' => [
          'trigger_text' => ['type' => 'text', 'label' => 'Trigger Button Text', 'default' => 'Options'],
          'items' => ['type' => 'repeater', 'label' => 'Menu Items', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Menu Item'],
            'url' => ['type' => 'text', 'label' => 'URL', 'default' => '#'],
            'icon' => ['type' => 'text', 'label' => 'Icon', 'default' => ''],
            'divider' => ['type' => 'boolean', 'label' => 'Add divider after', 'default' => FALSE],
          ], 'default' => []],
          'placement' => ['type' => 'select', 'label' => 'Placement', 'options' => ['bottom' => 'Bottom', 'top' => 'Top', 'left' => 'Left', 'right' => 'Right'], 'default' => 'bottom'],
        ],
      ],
      'file_input' => [
        'id' => 'file_input', 'category' => 'component', 'label' => 'File Input',
        'description' => 'File upload field', 'icon' => 'upload',
        'fields' => [
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Upload File'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'file_upload'],
          'accept' => ['type' => 'text', 'label' => 'Accepted Types (e.g. .pdf,.docx)', 'default' => ''],
          'multiple' => ['type' => 'boolean', 'label' => 'Allow Multiple', 'default' => FALSE],
          'helper_text' => ['type' => 'text', 'label' => 'Helper Text', 'default' => 'PDF, DOCX up to 10MB'],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
        ],
      ],
      'hyperlink' => [
        'id' => 'hyperlink', 'category' => 'component', 'label' => 'Hyperlink',
        'description' => 'Styled text link', 'icon' => 'link',
        'fields' => [
          'text' => ['type' => 'text', 'label' => 'Link Text', 'default' => 'Click here'],
          'url' => ['type' => 'text', 'label' => 'URL', 'default' => '#'],
          'target' => ['type' => 'select', 'label' => 'Target', 'options' => ['_self' => 'Same Tab', '_blank' => 'New Tab'], 'default' => '_self'],
          'variant' => ['type' => 'select', 'label' => 'Style', 'options' => ['default' => 'Default', 'underline' => 'Underline', 'no-underline' => 'No Underline'], 'default' => 'default'],
          'icon' => ['type' => 'boolean', 'label' => 'Show external icon', 'default' => FALSE],
        ],
      ],
      'input' => [
        'id' => 'input', 'category' => 'component', 'label' => 'Input',
        'description' => 'Text input form field', 'icon' => 'input-cursor-text',
        'fields' => [
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Field Label'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'field_name'],
          'type' => ['type' => 'select', 'label' => 'Input Type', 'options' => ['text' => 'Text', 'email' => 'Email', 'password' => 'Password', 'number' => 'Number', 'tel' => 'Phone', 'search' => 'Search', 'url' => 'URL'], 'default' => 'text'],
          'placeholder' => ['type' => 'text', 'label' => 'Placeholder', 'default' => 'Enter value...'],
          'helper_text' => ['type' => 'text', 'label' => 'Helper Text', 'default' => ''],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
          'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => FALSE],
          'icon_left' => ['type' => 'text', 'label' => 'Left Icon', 'default' => ''],
        ],
      ],
      'modal' => [
        'id' => 'modal', 'category' => 'component', 'label' => 'Modal',
        'description' => 'Dialog / overlay window', 'icon' => 'window',
        'fields' => [
          'modal_id' => ['type' => 'text', 'label' => 'Modal ID', 'default' => 'modal-1'],
          'title' => ['type' => 'text', 'label' => 'Modal Title', 'default' => 'Modal Title'],
          'content' => ['type' => 'textarea', 'label' => 'Modal Content', 'default' => 'Modal body content.'],
          'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm' => 'Small', 'md' => 'Medium', 'lg' => 'Large', 'xl' => 'Extra Large', 'full' => 'Full Screen'], 'default' => 'md'],
          'trigger_text' => ['type' => 'text', 'label' => 'Trigger Button Text', 'default' => 'Open Modal'],
          'footer_actions' => ['type' => 'boolean', 'label' => 'Show Footer Actions', 'default' => TRUE],
          'confirm_text' => ['type' => 'text', 'label' => 'Confirm Button Text', 'default' => 'Confirm'],
          'cancel_text' => ['type' => 'text', 'label' => 'Cancel Button Text', 'default' => 'Cancel'],
        ],
      ],
      'navigation' => [
        'id' => 'navigation', 'category' => 'component', 'label' => 'Navigation',
        'description' => 'Main navigation menu', 'icon' => 'menu',
        'fields' => [
          'items' => ['type' => 'repeater', 'label' => 'Nav Items', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Home'],
            'url' => ['type' => 'text', 'label' => 'URL', 'default' => '/'],
            'active' => ['type' => 'boolean', 'label' => 'Active', 'default' => FALSE],
          ], 'default' => []],
          'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['horizontal' => 'Horizontal', 'vertical' => 'Vertical', 'mega' => 'Mega Menu'], 'default' => 'horizontal'],
        ],
      ],
      'pagination' => [
        'id' => 'pagination', 'category' => 'component', 'label' => 'Pagination',
        'description' => 'Page browsing controls', 'icon' => 'dots-horizontal',
        'fields' => [
          'total_pages' => ['type' => 'text', 'label' => 'Total Pages', 'default' => '10'],
          'current_page' => ['type' => 'text', 'label' => 'Current Page', 'default' => '1'],
          'base_url' => ['type' => 'text', 'label' => 'Base URL', 'default' => '/page/'],
          'show_prev_next' => ['type' => 'boolean', 'label' => 'Show Prev/Next', 'default' => TRUE],
          'show_first_last' => ['type' => 'boolean', 'label' => 'Show First/Last', 'default' => FALSE],
        ],
      ],
      'popover' => [
        'id' => 'popover', 'category' => 'component', 'label' => 'Popover',
        'description' => 'Context tooltip / info bubble', 'icon' => 'chat-bubble',
        'fields' => [
          'trigger_text' => ['type' => 'text', 'label' => 'Trigger Text', 'default' => 'More info'],
          'title' => ['type' => 'text', 'label' => 'Popover Title', 'default' => 'Details'],
          'content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Popover content.'],
          'placement' => ['type' => 'select', 'label' => 'Placement', 'options' => ['top' => 'Top', 'bottom' => 'Bottom', 'left' => 'Left', 'right' => 'Right'], 'default' => 'top'],
        ],
      ],
      'radio' => [
        'id' => 'radio', 'category' => 'component', 'label' => 'Radio',
        'description' => 'Radio button form input', 'icon' => 'radio-button',
        'fields' => [
          'legend' => ['type' => 'text', 'label' => 'Group Legend', 'default' => 'Choose an option'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'radio_group'],
          'options' => ['type' => 'repeater', 'label' => 'Options', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Option'],
            'value' => ['type' => 'text', 'label' => 'Value', 'default' => 'option_1'],
            'checked' => ['type' => 'boolean', 'label' => 'Selected by default', 'default' => FALSE],
          ], 'default' => []],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
          'layout' => ['type' => 'select', 'label' => 'Layout', 'options' => ['vertical' => 'Vertical', 'horizontal' => 'Horizontal'], 'default' => 'vertical'],
        ],
      ],
      'range_slider' => [
        'id' => 'range_slider', 'category' => 'component', 'label' => 'Range Slider',
        'description' => 'Numeric range selection slider', 'icon' => 'adjustments',
        'fields' => [
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Select Range'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'range_field'],
          'min' => ['type' => 'text', 'label' => 'Minimum', 'default' => '0'],
          'max' => ['type' => 'text', 'label' => 'Maximum', 'default' => '100'],
          'step' => ['type' => 'text', 'label' => 'Step', 'default' => '1'],
          'value' => ['type' => 'text', 'label' => 'Default Value', 'default' => '50'],
          'show_value' => ['type' => 'boolean', 'label' => 'Show current value', 'default' => TRUE],
        ],
      ],
      'select' => [
        'id' => 'select', 'category' => 'component', 'label' => 'Select',
        'description' => 'Dropdown select form field', 'icon' => 'selector',
        'fields' => [
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Select Option'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'select_field'],
          'placeholder' => ['type' => 'text', 'label' => 'Placeholder', 'default' => 'Choose...'],
          'options' => ['type' => 'repeater', 'label' => 'Options', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Option'],
            'value' => ['type' => 'text', 'label' => 'Value', 'default' => 'option_1'],
          ], 'default' => []],
          'multiple' => ['type' => 'boolean', 'label' => 'Multiple Select', 'default' => FALSE],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
          'helper_text' => ['type' => 'text', 'label' => 'Helper Text', 'default' => ''],
        ],
      ],
      'news_card_slider' => [
        'id' => 'news_card_slider', 'category' => 'component', 'label' => 'News Card Slider',
        'description' => 'Slick carousel of news cards', 'icon' => 'newspaper',
        'fields' => [
          'title' => ['type' => 'text', 'label' => 'Section Title', 'default' => 'Latest News'],
          'show_title' => ['type' => 'boolean', 'label' => 'Show Section Title', 'default' => TRUE],
          'items' => ['type' => 'repeater', 'label' => 'News Cards', 'subfields' => [
            'image'      => ['type' => 'image',    'label' => 'Image URL',   'default' => ''],
            'image_alt'  => ['type' => 'text',     'label' => 'Image Alt',   'default' => ''],
            'date'       => ['type' => 'text',     'label' => 'Date',        'default' => ''],
            'category'   => ['type' => 'text',     'label' => 'Category',    'default' => 'Press release'],
            'category_url' => ['type' => 'text',   'label' => 'Category URL','default' => '#'],
            'title'      => ['type' => 'text',     'label' => 'Headline',    'default' => 'News article title'],
            'excerpt'    => ['type' => 'textarea', 'label' => 'Excerpt',     'default' => 'Brief summary of the news article.'],
            'link_url'   => ['type' => 'text',     'label' => 'Article URL', 'default' => '#'],
            'link_text'  => ['type' => 'text',     'label' => 'Link Text',   'default' => 'View details'],
          ], 'default' => []],
          'autoplay'        => ['type' => 'boolean', 'label' => 'Autoplay',          'default' => FALSE],
          'slides_to_show'  => ['type' => 'select',  'label' => 'Cards Visible',
            'options' => ['1' => '1', '2' => '2', '3' => '3', '4' => '4'], 'default' => '3'],
          'show_dots'       => ['type' => 'boolean', 'label' => 'Show Dots',         'default' => TRUE],
          'show_arrows'     => ['type' => 'boolean', 'label' => 'Show Arrows',       'default' => TRUE],
          'background'      => ['type' => 'select',  'label' => 'Background',
            'options' => ['white' => 'White', 'light' => 'Light Gray', 'gold' => 'AEGold'], 'default' => 'white'],
        ],
      ],
      'slider' => [
        'id' => 'slider', 'category' => 'component', 'label' => 'Slider',
        'description' => 'Image / content carousel slider', 'icon' => 'view-boards',
        'fields' => [
          'items' => ['type' => 'repeater', 'label' => 'Slides', 'subfields' => [
            'image' => ['type' => 'image', 'label' => 'Image URL', 'default' => ''],
            'title' => ['type' => 'text', 'label' => 'Title', 'default' => 'Slide Title'],
            'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => ''],
            'link_text' => ['type' => 'text', 'label' => 'Link Text', 'default' => ''],
            'link_url' => ['type' => 'text', 'label' => 'Link URL', 'default' => '#'],
          ], 'default' => []],
          'autoplay' => ['type' => 'boolean', 'label' => 'Autoplay', 'default' => TRUE],
          'interval' => ['type' => 'text', 'label' => 'Interval (ms)', 'default' => '4000'],
          'show_indicators' => ['type' => 'boolean', 'label' => 'Show Indicators', 'default' => TRUE],
          'show_controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => TRUE],
        ],
      ],
      'steps' => [
        'id' => 'steps', 'category' => 'component', 'label' => 'Steps',
        'description' => 'Process / wizard step indicator', 'icon' => 'list-ordered',
        'fields' => [
          'steps' => ['type' => 'repeater', 'label' => 'Steps', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Step Label', 'default' => 'Step 1'],
            'description' => ['type' => 'text', 'label' => 'Description', 'default' => ''],
            'status' => ['type' => 'select', 'label' => 'Status', 'options' => ['pending' => 'Pending', 'current' => 'Current', 'completed' => 'Completed'], 'default' => 'pending'],
          ], 'default' => []],
          'orientation' => ['type' => 'select', 'label' => 'Orientation', 'options' => ['horizontal' => 'Horizontal', 'vertical' => 'Vertical'], 'default' => 'horizontal'],
        ],
      ],
      'tabs' => [
        'id' => 'tabs', 'category' => 'component', 'label' => 'Tabs',
        'description' => 'Tabbed content sections', 'icon' => 'collection',
        'fields' => [
          'tabs' => ['type' => 'repeater', 'label' => 'Tabs', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Tab Label', 'default' => 'Tab 1'],
            'content' => ['type' => 'textarea', 'label' => 'Tab Content', 'default' => 'Tab content here.'],
            'active' => ['type' => 'boolean', 'label' => 'Active by default', 'default' => FALSE],
          ], 'default' => []],
          'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default' => 'Default', 'pill' => 'Pill', 'underline' => 'Underline'], 'default' => 'default'],
        ],
      ],
      'textarea' => [
        'id' => 'textarea', 'category' => 'component', 'label' => 'Textarea',
        'description' => 'Multi-line text input', 'icon' => 'document-text',
        'fields' => [
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Your Message'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'message'],
          'placeholder' => ['type' => 'text', 'label' => 'Placeholder', 'default' => 'Write your message here...'],
          'rows' => ['type' => 'text', 'label' => 'Rows', 'default' => '4'],
          'helper_text' => ['type' => 'text', 'label' => 'Helper Text', 'default' => ''],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
          'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => FALSE],
          'max_length' => ['type' => 'text', 'label' => 'Max Length', 'default' => ''],
        ],
      ],
      'toast' => [
        'id' => 'toast', 'category' => 'component', 'label' => 'Toast',
        'description' => 'Temporary notification toasts', 'icon' => 'bell',
        'fields' => [
          'message' => ['type' => 'text', 'label' => 'Message', 'default' => 'Action completed successfully.'],
          'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['success' => 'Success', 'error' => 'Error', 'warning' => 'Warning', 'info' => 'Info'], 'default' => 'success'],
          'position' => ['type' => 'select', 'label' => 'Position', 'options' => ['top-right' => 'Top Right', 'top-left' => 'Top Left', 'bottom-right' => 'Bottom Right', 'bottom-left' => 'Bottom Left', 'top-center' => 'Top Center'], 'default' => 'top-right'],
          'duration' => ['type' => 'text', 'label' => 'Duration (ms, 0 = persistent)', 'default' => '3000'],
          'show_icon' => ['type' => 'boolean', 'label' => 'Show Icon', 'default' => TRUE],
        ],
      ],
      'toggle' => [
        'id' => 'toggle', 'category' => 'component', 'label' => 'Toggle',
        'description' => 'On/off toggle switch', 'icon' => 'switch-horizontal',
        'fields' => [
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Enable feature'],
          'name' => ['type' => 'text', 'label' => 'Field Name', 'default' => 'toggle_field'],
          'checked' => ['type' => 'boolean', 'label' => 'On by default', 'default' => FALSE],
          'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => FALSE],
          'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm' => 'Small', 'md' => 'Medium', 'lg' => 'Large'], 'default' => 'md'],
          'helper_text' => ['type' => 'text', 'label' => 'Helper Text', 'default' => ''],
        ],
      ],
      'tooltip' => [
        'id' => 'tooltip', 'category' => 'component', 'label' => 'Tooltip',
        'description' => 'Hover information tooltip', 'icon' => 'information-circle',
        'fields' => [
          'trigger_text' => ['type' => 'text', 'label' => 'Trigger Text', 'default' => 'Hover me'],
          'content' => ['type' => 'text', 'label' => 'Tooltip Content', 'default' => 'Tooltip information text'],
          'placement' => ['type' => 'select', 'label' => 'Placement', 'options' => ['top' => 'Top', 'bottom' => 'Bottom', 'left' => 'Left', 'right' => 'Right'], 'default' => 'top'],
          'trigger' => ['type' => 'select', 'label' => 'Trigger', 'options' => ['hover' => 'Hover', 'click' => 'Click', 'focus' => 'Focus'], 'default' => 'hover'],
        ],
      ],
    ];
  }

  public static function getBlocks(): array {
    return [
      'hero' => [
        'id' => 'hero', 'category' => 'block', 'label' => 'Hero',
        'description' => 'Primary visual banner above the fold', 'icon' => 'photograph',
        'fields' => [
          'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default' => 'Default', 'centered' => 'Centered', 'split' => 'Split (Image Right)', 'video' => 'Video Background', 'minimal' => 'Minimal'], 'default' => 'default'],
          'eyebrow' => ['type' => 'text', 'label' => 'Eyebrow Label', 'default' => 'UAE Government'],
          'title' => ['type' => 'text', 'label' => 'Headline', 'default' => 'Building a Better Digital Future'],
          'subtitle' => ['type' => 'textarea', 'label' => 'Subtitle / Description', 'default' => 'Unified digital services for all UAE residents and citizens.'],
          'primary_cta_text' => ['type' => 'text', 'label' => 'Primary CTA Text', 'default' => 'Get Started'],
          'primary_cta_url' => ['type' => 'text', 'label' => 'Primary CTA URL', 'default' => '#'],
          'secondary_cta_text' => ['type' => 'text', 'label' => 'Secondary CTA Text', 'default' => 'Learn More'],
          'secondary_cta_url' => ['type' => 'text', 'label' => 'Secondary CTA URL', 'default' => '#'],
          'image' => ['type' => 'image', 'label' => 'Hero Image URL', 'default' => ''],
          'image_alt' => ['type' => 'text', 'label' => 'Image Alt Text', 'default' => 'Hero image'],
          'background_color' => ['type' => 'select', 'label' => 'Background', 'options' => ['white' => 'White', 'gold' => 'AEGold', 'dark' => 'Dark', 'gradient' => 'Gradient'], 'default' => 'white'],
          'entity_type' => ['type' => 'entity_reference', 'label' => 'Map to Content Type', 'default' => ''],
        ],
      ],
      'header' => [
        'id' => 'header', 'category' => 'block', 'label' => 'Header',
        'description' => 'Site header with logo and navigation', 'icon' => 'template',
        'fields' => [
          'logo_url' => ['type' => 'image', 'label' => 'Logo Image URL', 'default' => ''],
          'logo_alt' => ['type' => 'text', 'label' => 'Logo Alt Text', 'default' => 'UAE Government'],
          'site_name' => ['type' => 'text', 'label' => 'Site Name', 'default' => 'UAE Government Portal'],
          'nav_items' => ['type' => 'repeater', 'label' => 'Navigation Items', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Home'],
            'url' => ['type' => 'text', 'label' => 'URL', 'default' => '/'],
            'active' => ['type' => 'boolean', 'label' => 'Active', 'default' => FALSE],
          ], 'default' => []],
          'show_language_switcher' => ['type' => 'boolean', 'label' => 'Show Language Switcher (AR/EN)', 'default' => TRUE],
          'show_search' => ['type' => 'boolean', 'label' => 'Show Search', 'default' => TRUE],
          'sticky' => ['type' => 'boolean', 'label' => 'Sticky Header', 'default' => TRUE],
        ],
      ],
      'footer' => [
        'id' => 'footer', 'category' => 'block', 'label' => 'Footer',
        'description' => 'Page footer with links and copyright', 'icon' => 'view-grid',
        'fields' => [
          'logo_url' => ['type' => 'image', 'label' => 'Logo Image URL', 'default' => ''],
          'logo_alt' => ['type' => 'text', 'label' => 'Logo Alt Text', 'default' => 'UAE Government'],
          'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => 'UAE Government official digital portal.'],
          'columns' => ['type' => 'repeater', 'label' => 'Link Columns', 'subfields' => [
            'title' => ['type' => 'text', 'label' => 'Column Title', 'default' => 'Services'],
            'links' => ['type' => 'textarea', 'label' => 'Links (JSON: [{"label":"","url":""}])', 'default' => '[]'],
          ], 'default' => []],
          'social_links' => ['type' => 'textarea', 'label' => 'Social Links (JSON)', 'default' => '[]'],
          'copyright_text' => ['type' => 'text', 'label' => 'Copyright Text', 'default' => '© 2025 UAE Government. All rights reserved.'],
          'show_uaepass' => ['type' => 'boolean', 'label' => 'Show UAE Pass branding', 'default' => FALSE],
        ],
      ],
      'columns' => [
        'id' => 'columns', 'category' => 'block', 'label' => 'Columns Layout',
        'description' => 'Multi-column grid wrapper', 'icon' => 'view-columns',
        'fields' => [
          'columns'   => ['type' => 'select', 'label' => 'Number of Columns',
            'options' => ['2' => '2 Columns', '3' => '3 Columns', '4' => '4 Columns'], 'default' => '2'],
          'gap'       => ['type' => 'select', 'label' => 'Gap Between Columns',
            'options' => ['sm' => 'Small (16px)', 'md' => 'Medium (24px)', 'lg' => 'Large (40px)'], 'default' => 'md'],
          'align'     => ['type' => 'select', 'label' => 'Vertical Alignment',
            'options' => ['start' => 'Top', 'center' => 'Center', 'end' => 'Bottom', 'stretch' => 'Stretch'], 'default' => 'start'],
          'background' => ['type' => 'select', 'label' => 'Background',
            'options' => ['white' => 'White', 'light' => 'Light Gray', 'gold' => 'AEGold', 'dark' => 'Dark'], 'default' => 'white'],
          'items' => ['type' => 'repeater', 'label' => 'Column Items', 'subfields' => [
            'span'           => ['type' => 'select',   'label' => 'Column Span',
              'options' => ['1' => '1 col', '2' => '2 cols', '3' => '3 cols'], 'default' => '1'],
            'component_id'   => ['type' => 'component_slot', 'label' => 'Component',      'default' => ''],
            'component_data' => ['type' => 'hidden',         'label' => 'Component Data', 'default' => '{}'],
            // Legacy plain-HTML fields kept for backward compatibility
            'title'     => ['type' => 'text',     'label' => 'Title (fallback)',   'default' => ''],
            'content'   => ['type' => 'textarea', 'label' => 'HTML (fallback)',    'default' => ''],
            'image'     => ['type' => 'image',    'label' => 'Image (fallback)',   'default' => ''],
            'image_alt' => ['type' => 'text',     'label' => 'Image Alt',         'default' => ''],
            'link_text' => ['type' => 'text',     'label' => 'Link Text',         'default' => ''],
            'link_url'  => ['type' => 'text',     'label' => 'Link URL',          'default' => '#'],
          ], 'default' => []],
        ],
      ],
      'content' => [
        'id' => 'content', 'category' => 'block', 'label' => 'Content',
        'description' => 'Rich content section', 'icon' => 'document',
        'fields' => [
          'variant' => ['type' => 'select', 'label' => 'Layout', 'options' => ['single' => 'Single Column', 'two-col' => 'Two Columns', 'three-col' => 'Three Columns', 'sidebar-left' => 'Sidebar Left', 'sidebar-right' => 'Sidebar Right'], 'default' => 'single'],
          'title' => ['type' => 'text', 'label' => 'Section Title', 'default' => 'Section Title'],
          'subtitle' => ['type' => 'textarea', 'label' => 'Subtitle', 'default' => ''],
          'body' => ['type' => 'textarea', 'label' => 'Body Content (HTML)', 'default' => '<p>Content goes here.</p>'],
          'image' => ['type' => 'image', 'label' => 'Image URL', 'default' => ''],
          'image_alt' => ['type' => 'text', 'label' => 'Image Alt', 'default' => ''],
          'background' => ['type' => 'select', 'label' => 'Background', 'options' => ['white' => 'White', 'light' => 'Light Gray', 'gold' => 'AEGold Light', 'dark' => 'Dark'], 'default' => 'white'],
          'entity_type' => ['type' => 'entity_reference', 'label' => 'Map to Content Type', 'default' => ''],
        ],
      ],
      'filter' => [
        'id' => 'filter', 'category' => 'block', 'label' => 'Filter',
        'description' => 'Filterable listing section', 'icon' => 'filter',
        'fields' => [
          'title' => ['type' => 'text', 'label' => 'Section Title', 'default' => 'Browse Services'],
          'filter_groups' => ['type' => 'repeater', 'label' => 'Filter Groups', 'subfields' => [
            'label' => ['type' => 'text', 'label' => 'Group Label', 'default' => 'Category'],
            'name' => ['type' => 'text', 'label' => 'Filter Name', 'default' => 'category'],
            'options' => ['type' => 'textarea', 'label' => 'Options (JSON: [{"label":"","value":""}])', 'default' => '[]'],
          ], 'default' => []],
          'show_search' => ['type' => 'boolean', 'label' => 'Show Search Bar', 'default' => TRUE],
          'entity_type' => ['type' => 'entity_reference', 'label' => 'Map to Content Type', 'default' => ''],
        ],
      ],
      'login' => [
        'id' => 'login', 'category' => 'block', 'label' => 'Login',
        'description' => 'UAE Pass login block', 'icon' => 'lock-closed',
        'fields' => [
          'title' => ['type' => 'text', 'label' => 'Block Title', 'default' => 'Sign In'],
          'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => 'Use your UAE Pass to access government services.'],
          'uaepass_url' => ['type' => 'text', 'label' => 'UAE Pass Auth URL', 'default' => '#'],
          'show_register' => ['type' => 'boolean', 'label' => 'Show Register Link', 'default' => TRUE],
          'show_guest' => ['type' => 'boolean', 'label' => 'Allow Guest Access', 'default' => FALSE],
        ],
      ],
      'newsletter' => [
        'id' => 'newsletter', 'category' => 'block', 'label' => 'Newsletter',
        'description' => 'Email subscription block', 'icon' => 'mail',
        'fields' => [
          'title' => ['type' => 'text', 'label' => 'Title', 'default' => 'Stay Updated'],
          'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => 'Subscribe to receive the latest news and updates.'],
          'placeholder' => ['type' => 'text', 'label' => 'Email Placeholder', 'default' => 'Enter your email address'],
          'button_text' => ['type' => 'text', 'label' => 'Button Text', 'default' => 'Subscribe'],
          'privacy_text' => ['type' => 'text', 'label' => 'Privacy Notice', 'default' => 'We respect your privacy.'],
          'background' => ['type' => 'select', 'label' => 'Background', 'options' => ['white' => 'White', 'light' => 'Light', 'gold' => 'Gold', 'dark' => 'Dark'], 'default' => 'gold'],
        ],
      ],
      'page_rating' => [
        'id' => 'page_rating', 'category' => 'block', 'label' => 'Page Rating',
        'description' => 'User feedback rating block', 'icon' => 'star',
        'fields' => [
          'title' => ['type' => 'text', 'label' => 'Question Text', 'default' => 'Was this page helpful?'],
          'yes_text' => ['type' => 'text', 'label' => 'Positive Label', 'default' => 'Yes'],
          'no_text' => ['type' => 'text', 'label' => 'Negative Label', 'default' => 'No'],
          'feedback_placeholder' => ['type' => 'text', 'label' => 'Feedback Placeholder', 'default' => 'Tell us how we can improve...'],
          'submit_text' => ['type' => 'text', 'label' => 'Submit Button Text', 'default' => 'Submit Feedback'],
          'success_message' => ['type' => 'text', 'label' => 'Thank You Message', 'default' => 'Thank you for your feedback!'],
        ],
      ],
      'team' => [
        'id' => 'team', 'category' => 'block', 'label' => 'Team',
        'description' => 'Team members showcase', 'icon' => 'users',
        'fields' => [
          'title' => ['type' => 'text', 'label' => 'Section Title', 'default' => 'Our Team'],
          'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => ''],
          'columns' => ['type' => 'select', 'label' => 'Columns', 'options' => ['2' => '2 Columns', '3' => '3 Columns', '4' => '4 Columns'], 'default' => '3'],
          'members' => ['type' => 'repeater', 'label' => 'Team Members', 'subfields' => [
            'name' => ['type' => 'text', 'label' => 'Name', 'default' => 'Team Member'],
            'title' => ['type' => 'text', 'label' => 'Job Title', 'default' => 'Position'],
            'image' => ['type' => 'image', 'label' => 'Photo URL', 'default' => ''],
            'bio' => ['type' => 'textarea', 'label' => 'Short Bio', 'default' => ''],
            'email' => ['type' => 'text', 'label' => 'Email', 'default' => ''],
          ], 'default' => []],
          'entity_type' => ['type' => 'entity_reference', 'label' => 'Map to Content Type', 'default' => ''],
        ],
      ],
    ];
  }

  public static function getPatterns(): array {
    return [
      'address' => [
        'id' => 'address', 'category' => 'pattern', 'label' => 'Address',
        'description' => 'Standardized UAE address input', 'icon' => 'location-marker',
        'fields' => [
          'mode'            => ['type' => 'select', 'label' => 'Mode', 'options' => ['within_country' => 'Within the Country', 'outside_country' => 'Outside the Country', 'display_card' => 'Display Card'], 'default' => 'within_country'],
          'label'           => ['type' => 'text',    'label' => 'Legend / Label',          'default' => 'Address'],
          // Within country defaults
          'emirate'         => ['type' => 'select',  'label' => 'Default Emirate',          'default' => 'Dubai',
            'options' => ['Dubai' => 'Dubai', 'Abu Dhabi' => 'Abu Dhabi', 'Sharjah' => 'Sharjah', 'Ajman' => 'Ajman', 'Umm Al Quwain' => 'Umm Al Quwain', 'Fujairah' => 'Fujairah', 'Ras Al Khaimah' => 'Ras Al Khaimah']],
          'city'            => ['type' => 'text',    'label' => 'Default City',             'default' => 'Dubai'],
          // Display card values
          'apartment'       => ['type' => 'text',    'label' => 'Apartment / Villa No.',    'default' => '706, The Metropolitan Tower B'],
          'street_display'  => ['type' => 'text',    'label' => 'Street (display)',         'default' => 'Marasi Dr, Business Bay'],
          'po_box'          => ['type' => 'text',    'label' => 'P.O. Box (display)',       'default' => '123456'],
          'city_display'    => ['type' => 'text',    'label' => 'City / Emirate (display)', 'default' => 'Dubai, Dubai'],
          // Shared
          'required'        => ['type' => 'boolean', 'label' => 'Required',                 'default' => FALSE],
          'show_landmark'   => ['type' => 'boolean', 'label' => 'Show Additional Landmark field', 'default' => TRUE],
        ],
      ],
      'contact_number' => [
        'id' => 'contact_number', 'category' => 'pattern', 'label' => 'Contact Number',
        'description' => 'UAE phone number field', 'icon' => 'phone',
        'fields' => [
          'mode' => ['type' => 'select', 'label' => 'Mode', 'options' => ['display' => 'Display', 'input' => 'Input Form'], 'default' => 'input'],
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Contact Number'],
          'value' => ['type' => 'text', 'label' => 'Value (display)', 'default' => '+971 4 123 4567'],
          'country_code' => ['type' => 'text', 'label' => 'Default Country Code', 'default' => '+971'],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
        ],
      ],
      'currency_symbol' => [
        'id' => 'currency_symbol', 'category' => 'pattern', 'label' => 'Currency',
        'description' => 'AED currency display / input', 'icon' => 'currency-dollar',
        'fields' => [
          'mode' => ['type' => 'select', 'label' => 'Mode', 'options' => ['display' => 'Display', 'input' => 'Input Form'], 'default' => 'display'],
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Amount'],
          'value' => ['type' => 'text', 'label' => 'Amount (display)', 'default' => '1,500.00'],
          'currency' => ['type' => 'select', 'label' => 'Currency', 'options' => ['AED' => 'AED (درهم)', 'USD' => 'USD', 'EUR' => 'EUR'], 'default' => 'AED'],
          'placeholder' => ['type' => 'text', 'label' => 'Placeholder', 'default' => '0.00'],
        ],
      ],
      'date' => [
        'id' => 'date', 'category' => 'pattern', 'label' => 'Date',
        'description' => 'UAE-formatted date input / display', 'icon' => 'calendar',
        'fields' => [
          'mode' => ['type' => 'select', 'label' => 'Mode', 'options' => ['display' => 'Display', 'input' => 'Input Form'], 'default' => 'input'],
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Date'],
          'value' => ['type' => 'text', 'label' => 'Value (display)', 'default' => '15/06/2025'],
          'format' => ['type' => 'select', 'label' => 'Display Format', 'options' => ['DD/MM/YYYY' => 'DD/MM/YYYY', 'YYYY-MM-DD' => 'YYYY-MM-DD', 'D MMMM YYYY' => 'D MMMM YYYY'], 'default' => 'DD/MM/YYYY'],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
          'min_date' => ['type' => 'text', 'label' => 'Min Date', 'default' => ''],
          'max_date' => ['type' => 'text', 'label' => 'Max Date', 'default' => ''],
        ],
      ],
      'emirates_id' => [
        'id' => 'emirates_id', 'category' => 'pattern', 'label' => 'Emirates ID',
        'description' => 'UAE Emirates ID validation field', 'icon' => 'identification',
        'fields' => [
          'mode' => ['type' => 'select', 'label' => 'Mode', 'options' => ['display' => 'Display', 'input' => 'Input Form'], 'default' => 'input'],
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Emirates ID'],
          'value' => ['type' => 'text', 'label' => 'Value (display)', 'default' => '784-1234-1234567-1'],
          'placeholder' => ['type' => 'text', 'label' => 'Placeholder', 'default' => '784-XXXX-XXXXXXX-X'],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
          'helper_text' => ['type' => 'text', 'label' => 'Helper Text', 'default' => 'Format: 784-YYYY-NNNNNNN-C'],
        ],
      ],
      'name' => [
        'id' => 'name', 'category' => 'pattern', 'label' => 'Name',
        'description' => 'Standardized name input / display', 'icon' => 'user',
        'fields' => [
          'mode' => ['type' => 'select', 'label' => 'Mode', 'options' => ['display' => 'Display', 'input' => 'Input Form'], 'default' => 'input'],
          'label' => ['type' => 'text', 'label' => 'Label', 'default' => 'Full Name'],
          'value' => ['type' => 'text', 'label' => 'Value (display)', 'default' => ''],
          'show_title' => ['type' => 'boolean', 'label' => 'Show Title Field', 'default' => FALSE],
          'show_middle_name' => ['type' => 'boolean', 'label' => 'Show Middle Name', 'default' => FALSE],
          'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => FALSE],
          'bilingual' => ['type' => 'boolean', 'label' => 'Arabic + English Fields', 'default' => FALSE],
        ],
      ],
    ];
  }

}
