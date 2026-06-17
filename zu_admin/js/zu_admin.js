/**
 * zu_admin.js
 * General JS for the ZU Admin Dashboard.
 */
(function (Drupal, once) {
  'use strict';

  /**
   * Attach sidebar active-state based on current URL.
   */
  Drupal.behaviors.zuAdminSidebar = {
    attach: function (context) {
      once('zu-sidebar', '.zu-nav-item', context).forEach(function (el) {
        const href = el.getAttribute('href');
        if (href && window.location.pathname.startsWith(href) && href !== '/') {
          el.classList.add('is-active');
        }
      });
    }
  };

  /**
   * Notification badge: auto-hide if count is 0.
   */
  Drupal.behaviors.zuAdminNotifications = {
    attach: function (context) {
      once('zu-notif', '.zu-nav-badge', context).forEach(function (badge) {
        if (badge.textContent.trim() === '0') {
          badge.style.display = 'none';
        }
      });
    }
  };

  /**
   * Search field clear button.
   */
  Drupal.behaviors.zuSearchClear = {
    attach: function (context) {
      once('zu-search-clear', '.zu-clear-btn', context).forEach(function (btn) {
        btn.addEventListener('click', function () {
          const wrap = btn.closest('.zu-search-input-wrap');
          if (wrap) {
            const input = wrap.querySelector('input');
            if (input) {
              input.value = '';
              input.focus();
            }
          }
        });
      });
    }
  };

})(Drupal, once);
