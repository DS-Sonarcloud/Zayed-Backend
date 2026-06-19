<?php

namespace Drupal\aegov_page_builder\Plugin\Component;

use Drupal\Component\Plugin\PluginBase;

/**
 * Base class for all AEGov Design System component plugins.
 */
abstract class ComponentBase extends PluginBase implements ComponentInterface {

  /**
   * {@inheritdoc}
   */
  public function getId(): string {
    return $this->pluginDefinition['id'];
  }

  /**
   * {@inheritdoc}
   */
  public function getLabel(): string {
    return (string) $this->pluginDefinition['label'];
  }

  /**
   * {@inheritdoc}
   */
  public function getCategory(): string {
    return $this->pluginDefinition['category'] ?? 'component';
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription(): string {
    return (string) ($this->pluginDefinition['description'] ?? '');
  }

  /**
   * {@inheritdoc}
   */
  public function getIcon(): string {
    return $this->pluginDefinition['icon'] ?? 'puzzle-piece';
  }

  /**
   * Returns the field definitions for the admin form.
   * Each field: ['type' => text|textarea|select|image|boolean|entity_reference, 'label' => '', 'default' => ''].
   */
  abstract public function getFields(): array;

  /**
   * {@inheritdoc}
   */
  public function buildRender(array $data, array $settings = []): array {
    return [
      '#theme' => 'aegov_' . $this->getCategory() . '_' . $this->getId(),
      '#data' => $data,
      '#settings' => $settings,
    ];
  }

  /**
   * Returns the Twig template name (without .html.twig).
   */
  public function getTemplateName(): string {
    $prefix = match($this->getCategory()) {
      'block' => 'block--',
      'pattern' => 'pattern--',
      default => 'component--',
    };
    return $prefix . str_replace('_', '-', $this->getId());
  }

  /**
   * Returns default field values for preview rendering.
   */
  public function getDefaultData(): array {
    $data = [];
    foreach ($this->getFields() as $key => $field) {
      $data[$key] = $field['default'] ?? '';
    }
    return $data;
  }

}
