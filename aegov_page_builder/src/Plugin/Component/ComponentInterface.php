<?php

namespace Drupal\aegov_page_builder\Plugin\Component;

/**
 * Interface for AEGov component plugins.
 */
interface ComponentInterface {

  public function getId(): string;
  public function getLabel(): string;
  public function getCategory(): string;
  public function getDescription(): string;
  public function getIcon(): string;
  public function getFields(): array;
  public function buildRender(array $data, array $settings = []): array;
  public function getTemplateName(): string;
  public function getDefaultData(): array;

}
