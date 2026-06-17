<?php

/**
 * Implements hook_views_data().
 */
function student_verification_views_data() {
  $data['student_verification'] = [];

  $data['student_verification']['table'] = [
    'group' => t('Student Verification'),
    'provider' => 'student_verification',
    'base' => [
      'field' => 'id',
      'title' => t('Student Verification'),
      'help' => t('Stores uploaded student data.'),
    ],
  ];

  // Expose fields.
  $data['student_verification']['id'] = [
    'title' => t('ID'),
    'help' => t('Primary key.'),
    'field' => ['id' => 'numeric'],
    'sort' => ['id' => 'standard'],
    'filter' => ['id' => 'numeric'],
  ];

  $data['student_verification']['name'] = [
    'title' => t('Name'),
    'help' => t('Student name.'),
    'field' => ['id' => 'standard'],
    'filter' => ['id' => 'string'],
    'sort' => ['id' => 'standard'],
  ];

  $data['student_verification']['email'] = [
    'title' => t('Email'),
    'help' => t('Student email.'),
    'field' => ['id' => 'standard'],
    'filter' => ['id' => 'string'],
    'sort' => ['id' => 'standard'],
  ];

  $data['student_verification']['zu_id'] = [
    'title' => t('ZU ID'),
    'help' => t('Student unique ID.'),
    'field' => ['id' => 'standard'],
    'filter' => ['id' => 'string'],
    'sort' => ['id' => 'standard'],
  ];

  return $data;
}
