/*!
 * AEGov Design System v3.0 — Interactive Component Bundle
 * UAE Government Design System | MIT License | TDRA
 * https://designsystem.gov.ae
 */
(function () {
  'use strict';

  // =========================================================
  // UTILITY
  // =========================================================
  function on(el, event, selector, handler) {
    if (typeof selector === 'function') {
      el.addEventListener(event, selector);
    } else {
      el.addEventListener(event, function (e) {
        const target = e.target.closest(selector);
        if (target && el.contains(target)) handler.call(target, e);
      });
    }
  }

  function trapFocus(el) {
    const focusable = el.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // =========================================================
  // ACCORDION
  // =========================================================
  function initAccordion(root) {
    root.querySelectorAll('.aegov-accordion').forEach(function (acc) {
      acc.querySelectorAll('.aegov-accordion__trigger').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const panel = document.getElementById(btn.getAttribute('aria-controls'));
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          // Close others in same accordion
          acc.querySelectorAll('.aegov-accordion__trigger[aria-expanded="true"]').forEach(function (other) {
            if (other !== btn) {
              other.setAttribute('aria-expanded', 'false');
              const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
              if (otherPanel) { otherPanel.removeAttribute('open'); otherPanel.style.maxHeight = '0'; }
            }
          });
          btn.setAttribute('aria-expanded', String(!expanded));
          if (panel) {
            if (!expanded) {
              panel.setAttribute('open', '');
              panel.style.maxHeight = panel.scrollHeight + 'px';
            } else {
              panel.removeAttribute('open');
              panel.style.maxHeight = '0';
            }
          }
        });
        // Set initial state
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel && btn.getAttribute('aria-expanded') === 'true') {
          panel.setAttribute('open', '');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  // =========================================================
  // TABS
  // =========================================================
  function initTabs(root) {
    root.querySelectorAll('.aegov-tabs').forEach(function (tabs) {
      const tabList = tabs.querySelector('[role="tablist"]');
      if (!tabList) return;
      tabList.querySelectorAll('[role="tab"]').forEach(function (tab) {
        tab.addEventListener('click', function () {
          activateTab(tabs, tab);
        });
        tab.addEventListener('keydown', function (e) {
          const allTabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
          const idx = allTabs.indexOf(tab);
          const isRtl = document.documentElement.dir === 'rtl' || tab.closest('[dir="rtl"]');
          if (e.key === 'ArrowRight' || (isRtl && e.key === 'ArrowLeft')) {
            e.preventDefault();
            activateTab(tabs, allTabs[(idx + 1) % allTabs.length]);
            allTabs[(idx + 1) % allTabs.length].focus();
          } else if (e.key === 'ArrowLeft' || (isRtl && e.key === 'ArrowRight')) {
            e.preventDefault();
            activateTab(tabs, allTabs[(idx - 1 + allTabs.length) % allTabs.length]);
            allTabs[(idx - 1 + allTabs.length) % allTabs.length].focus();
          } else if (e.key === 'Home') {
            e.preventDefault();
            activateTab(tabs, allTabs[0]);
            allTabs[0].focus();
          } else if (e.key === 'End') {
            e.preventDefault();
            activateTab(tabs, allTabs[allTabs.length - 1]);
            allTabs[allTabs.length - 1].focus();
          }
        });
      });
    });
  }

  function activateTab(tabs, tab) {
    const tabList = tabs.querySelector('[role="tablist"]');
    tabList.querySelectorAll('[role="tab"]').forEach(function (t) {
      t.setAttribute('aria-selected', 'false');
      t.classList.remove('aegov-tabs__tab--active');
    });
    tabs.querySelectorAll('[role="tabpanel"]').forEach(function (p) {
      p.classList.remove('aegov-tabs__panel--active');
    });
    tab.setAttribute('aria-selected', 'true');
    tab.classList.add('aegov-tabs__tab--active');
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) panel.classList.add('aegov-tabs__panel--active');
  }

  // =========================================================
  // MODAL
  // =========================================================
  function initModals(root) {
    root.querySelectorAll('[data-modal-target]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const modal = document.getElementById(trigger.getAttribute('data-modal-target'));
        if (modal) openModal(modal);
      });
    });

    root.querySelectorAll('.aegov-modal').forEach(function (modal) {
      modal.querySelectorAll('.aegov-modal__close').forEach(function (closeEl) {
        closeEl.addEventListener('click', function () { closeModal(modal); });
      });
      modal.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal(modal);
      });
      trapFocus(modal);
    });
  }

  function openModal(modal) {
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal(modal) {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  // =========================================================
  // DROPDOWN
  // =========================================================
  function initDropdowns(root) {
    root.querySelectorAll('.aegov-dropdown').forEach(function (dd) {
      const trigger = dd.querySelector('.aegov-dropdown__trigger');
      const menu = dd.querySelector('.aegov-dropdown__menu');
      if (!trigger || !menu) return;

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = !menu.hasAttribute('hidden');
        closeAllDropdowns();
        if (!isOpen) {
          menu.removeAttribute('hidden');
          trigger.setAttribute('aria-expanded', 'true');
          // Position adjustment
          const rect = dd.getBoundingClientRect();
          if (rect.right + 200 > window.innerWidth) {
            menu.style.right = '0';
            menu.style.left = 'auto';
          }
        }
      });

      menu.addEventListener('keydown', function (e) {
        const items = Array.from(menu.querySelectorAll('.aegov-dropdown__item'));
        const idx = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
        if (e.key === 'Escape') { closeAllDropdowns(); trigger.focus(); }
      });
    });

    document.addEventListener('click', closeAllDropdowns);
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.aegov-dropdown__menu').forEach(function (menu) {
      menu.setAttribute('hidden', '');
    });
    document.querySelectorAll('.aegov-dropdown__trigger').forEach(function (t) {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  // =========================================================
  // POPOVER
  // =========================================================
  function initPopovers(root) {
    root.querySelectorAll('[data-popover-target]').forEach(function (trigger) {
      const popover = document.getElementById(trigger.getAttribute('data-popover-target'));
      if (!popover) return;

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = !popover.hasAttribute('hidden');
        closeAllPopovers();
        if (!isOpen) popover.removeAttribute('hidden');
      });
    });
    document.addEventListener('click', closeAllPopovers);
  }

  function closeAllPopovers() {
    document.querySelectorAll('.aegov-popover').forEach(function (p) {
      p.setAttribute('hidden', '');
    });
  }

  // =========================================================
  // ALERT DISMISS
  // =========================================================
  function initAlerts(root) {
    on(root, 'click', '.aegov-alert__dismiss', function (e) {
      const alert = e.target.closest('.aegov-alert');
      if (alert) {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.2s';
        setTimeout(function () { alert.remove(); }, 200);
      }
    });
  }

  // =========================================================
  // BANNER DISMISS
  // =========================================================
  function initBanners(root) {
    on(root, 'click', '.aegov-banner__dismiss', function (e) {
      const banner = e.target.closest('.aegov-banner');
      if (banner) banner.remove();
    });
  }

  // =========================================================
  // TOAST
  // =========================================================
  function initToasts(root) {
    root.querySelectorAll('.aegov-toast').forEach(function (toast) {
      const duration = parseInt(toast.getAttribute('data-duration') || '3000', 10);
      if (duration > 0) {
        setTimeout(function () { dismissToast(toast); }, duration);
      }
      const closeBtn = toast.querySelector('.aegov-toast__close');
      if (closeBtn) closeBtn.addEventListener('click', function () { dismissToast(toast); });
    });
  }

  function dismissToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(function () { toast.remove(); }, 250);
  }

  // Programmatic toast API: AEGov.toast('message', 'success', 3000)
  window.AEGov = window.AEGov || {};
  window.AEGov.toast = function (message, type, duration) {
    type = type || 'info';
    duration = duration !== undefined ? duration : 3000;
    let container = document.querySelector('.aegov-toast-container--top-right');
    if (!container) {
      container = document.createElement('div');
      container.className = 'aegov-toast-container aegov-toast-container--top-right';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'aegov-toast aegov-toast--' + type;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('data-duration', String(duration));
    toast.innerHTML = '<span class="aegov-toast__message">' + message + '</span><button class="aegov-toast__close" aria-label="Close">&times;</button>';
    container.appendChild(toast);
    initToasts(container);
  };

  // =========================================================
  // SLIDER / CAROUSEL
  // =========================================================
  function initSliders(root) {
    root.querySelectorAll('.aegov-slider').forEach(function (slider) {
      const track = slider.querySelector('.aegov-slider__track');
      const slides = slider.querySelectorAll('.aegov-slider__slide');
      const dots = slider.querySelectorAll('.aegov-slider__dot');
      const prevBtn = slider.querySelector('.aegov-slider__prev');
      const nextBtn = slider.querySelector('.aegov-slider__next');
      const autoplay = slider.getAttribute('data-autoplay') === 'true';
      const interval = parseInt(slider.getAttribute('data-interval') || '4000', 10);
      let current = 0;
      let timer = null;

      function goTo(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        slides.forEach(function (s, i) { s.classList.toggle('aegov-slider__slide--active', i === current); });
        dots.forEach(function (d, i) { d.classList.toggle('aegov-slider__dot--active', i === current); });
      }

      if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetTimer(); });
      dots.forEach(function (dot, i) { dot.addEventListener('click', function () { goTo(i); resetTimer(); }); });

      // Touch/swipe
      let touchStartX = 0;
      slider.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
      slider.addEventListener('touchend', function (e) {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
        resetTimer();
      });

      // Keyboard
      slider.setAttribute('tabindex', '0');
      slider.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
      });

      function startTimer() {
        if (autoplay && slides.length > 1) {
          timer = setInterval(function () { goTo(current + 1); }, interval);
        }
      }
      function resetTimer() { clearInterval(timer); startTimer(); }
      startTimer();
      // Pause on hover
      slider.addEventListener('mouseenter', function () { clearInterval(timer); });
      slider.addEventListener('mouseleave', startTimer);
    });
  }

  // =========================================================
  // PAGE RATING
  // =========================================================
  function initPageRating(root) {
    root.querySelectorAll('.aegov-page-rating').forEach(function (widget) {
      const buttons = widget.querySelectorAll('.aegov-page-rating__btn');
      const feedbackForm = widget.querySelector('.aegov-page-rating__feedback');
      const thanks = widget.querySelector('.aegov-page-rating__thanks');
      const submitBtn = feedbackForm ? feedbackForm.querySelector('button[type="submit"]') : null;

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          if (btn.getAttribute('data-value') === 'no' && feedbackForm) {
            feedbackForm.style.display = 'flex';
          } else if (feedbackForm) {
            feedbackForm.style.display = 'none';
            if (thanks) { widget.querySelector('.aegov-page-rating__buttons').style.display = 'none'; feedbackForm.style.display = 'none'; thanks.style.display = 'block'; }
          }
        });
      });

      if (submitBtn) {
        submitBtn.addEventListener('click', function () {
          if (feedbackForm) feedbackForm.style.display = 'none';
          if (thanks) { widget.querySelector('.aegov-page-rating__buttons').style.display = 'none'; thanks.style.display = 'block'; }
        });
      }
    });
  }

  // =========================================================
  // HEADER MOBILE TOGGLE
  // =========================================================
  function initHeader(root) {
    root.querySelectorAll('.aegov-header').forEach(function (header) {
      const toggle = header.querySelector('.aegov-header__mobile-toggle');
      const nav = header.querySelector('.aegov-header__nav');
      if (!toggle || !nav) return;
      toggle.addEventListener('click', function () {
        const open = nav.classList.toggle('aegov-header__nav--open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    });
  }

  // =========================================================
  // EMIRATES ID FORMATTER
  // =========================================================
  function initEmiratesId(root) {
    root.querySelectorAll('input[name="emirates_id"]').forEach(function (input) {
      input.addEventListener('input', function () {
        let val = input.value.replace(/[^0-9]/g, '');
        let formatted = '';
        if (val.length > 0) formatted += val.slice(0, 3);
        if (val.length > 3) formatted += '-' + val.slice(3, 7);
        if (val.length > 7) formatted += '-' + val.slice(7, 14);
        if (val.length > 14) formatted += '-' + val.slice(14, 15);
        input.value = formatted;
      });
    });
  }

  // =========================================================
  // LANGUAGE SWITCHER (RTL toggle)
  // =========================================================
  function initLangSwitcher(root) {
    root.querySelectorAll('.aegov-header__lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const isArabic = document.documentElement.lang === 'ar';
        document.documentElement.lang = isArabic ? 'en' : 'ar';
        document.documentElement.dir = isArabic ? 'ltr' : 'rtl';
        btn.textContent = isArabic ? 'عربي' : 'EN';
      });
    });
  }

  // =========================================================
  // MAIN INIT
  // =========================================================
  function init(root) {
    root = root || document;
    initAccordion(root);
    initTabs(root);
    initModals(root);
    initDropdowns(root);
    initPopovers(root);
    initAlerts(root);
    initBanners(root);
    initToasts(root);
    initSliders(root);
    initPageRating(root);
    initHeader(root);
    initEmiratesId(root);
    initLangSwitcher(root);
  }

  // Export public API
  window.AEGov = window.AEGov || {};
  window.AEGov.init = init;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  // Drupal behaviors integration
  if (typeof Drupal !== 'undefined') {
    Drupal.behaviors.aegovDesignSystem = {
      attach: function (context) { init(context); }
    };
  }

})();
