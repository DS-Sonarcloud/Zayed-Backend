<?php

namespace Drupal\zu_rest_api\Model;

/**
 * Value object representing the outcome of a deployment operation.
 */
class DeployResult {

  public bool $success;
  public int $totalItems;
  public string $error;

  public function __construct(bool $success, int $totalItems = 0, string $error = '') {
    $this->success = $success;
    $this->totalItems = $totalItems;
    $this->error = $error;
  }

  public static function success(int $items): self {
    return new self(TRUE, $items);
  }

  public static function failure(string $error): self {
    return new self(FALSE, 0, $error);
  }

}
