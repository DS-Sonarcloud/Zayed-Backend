(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.elasticAdvancedSearch = {
    attach: function (context, settings) {

      // ── Autocomplete ────────────────────────────────────────────────────────
      const AC_MIN      = 2;
      const AC_DEBOUNCE = 300;
      let acTimer = null;
      let acItems = [];
      let acIndex = -1;

      // Inject dropdown once, positioned relative to the input wrapper.
      const $wrap = $('.elastic-advanced-search__input-wrap', context);
      if ($wrap.length && !$wrap.find('.eas-ac-list').length) {
        $wrap.css('position', 'relative')
             .append('<ul class="eas-ac-list" role="listbox" aria-label="Suggestions" hidden></ul>');
      }
      const $acList = $wrap.find('.eas-ac-list');

      const escStr = s => $('<div>').text(s || '').html();

      function closeAC() {
        acIndex = -1;
        acItems = [];
        $acList.hide().empty().attr('hidden', true);
      }

      function moveAC(dir) {
        acIndex = Math.max(-1, Math.min(acItems.length - 1, acIndex + dir));
        $acList.find('.eas-ac-item').removeClass('is-active').eq(acIndex).addClass('is-active');
        if (acIndex >= 0) { $('#srch_term').val(acItems[acIndex].title); }
      }

      function selectAC(item) {
        $('#srch_term').val(item.title);
        closeAC();
        $('#sbmt').trigger('click');
      }

      function buildACItem(item) {
        const $li = $('<li>', { class: 'eas-ac-item', role: 'option', tabindex: '-1' });
        $li.html(
          '<span class="eas-ac-title">' + escStr(item.title) + '</span>' +
          '<span class="eas-ac-type">'  + escStr(item.content_type || '') + '</span>'
        );
        $li.on('mousedown', e => { e.preventDefault(); selectAC(item); });
        return $li;
      }

      function renderAC(items) {
        $acList.empty();
        if (!items.length) { closeAC(); return; }
        acIndex = -1;
        items.forEach(item => $acList.append(buildACItem(item)));
        $acList.removeAttr('hidden').show();
      }

      function onACSuccess(data) {
        acItems = Array.isArray(data) ? data : [];
        renderAC(acItems);
      }

      function fetchAC(q) {
        const path = drupalSettings.elasticSearch?.autocompletePath;
        if (!path) { return; }
        $.ajax({
          url: path + '?q=' + encodeURIComponent(q),
          method: 'GET',
          xhrFields: { withCredentials: true },
          success: onACSuccess,
          error: closeAC,
        });
      }

      function onACInput() {
        clearTimeout(acTimer);
        const q = $(this).val().trim();
        if (q.length < AC_MIN) { closeAC(); return; }
        acTimer = setTimeout(() => fetchAC(q), AC_DEBOUNCE);
      }

      function onACKeydown(e) {
        if (!$acList.is(':visible')) { return; }
        if      (e.key === 'ArrowDown')              { e.preventDefault(); moveAC(1); }
        else if (e.key === 'ArrowUp')                { e.preventDefault(); moveAC(-1); }
        else if (e.key === 'Escape')                 { closeAC(); }
        else if (e.key === 'Enter' && acIndex >= 0)  { e.preventDefault(); selectAC(acItems[acIndex]); }
      }

      once('easAutocomplete', '#srch_term', context).forEach(input => {
        $(input).on('input', onACInput).on('keydown', onACKeydown);
      });

      // Close dropdown when clicking outside the input wrapper.
      once('easAutocompleteClose', 'body', context).forEach(() => {
        $(document).on('click.easAC', e => {
          if (!$(e.target).closest('.elastic-advanced-search__input-wrap').length) {
            closeAC();
          }
        });
      });
      // ── End Autocomplete ────────────────────────────────────────────────────

      // ── Filter state ────────────────────────────────────────────────────────
      let activeFilters = {
        content_types: [],
        date_from:     '',
        date_to:       '',
        langcode:      '',
        media_type:    'all',
      };

      /**
       * Reads the current UI state into activeFilters and updates the badge.
       */
      function syncFilterState() {
        activeFilters.content_types = [];
        $('.eas-filter-type:checked').each(function () {
          activeFilters.content_types.push($(this).val());
        });

        activeFilters.date_from  = $('.eas-filter-date-from').val() || '';
        activeFilters.date_to    = $('.eas-filter-date-to').val() || '';
        activeFilters.langcode   = $('input[name="filter_langcode"]:checked').val() || '';
        activeFilters.media_type = $('input[name="filter_media_type"]:checked').val() || 'all';

        updateFilterBadge();
      }

      /**
       * Counts active filters and shows/hides the badge on the toggle button.
       */
      function updateFilterBadge() {
        var count = activeFilters.content_types.length;
        if (activeFilters.date_from)                        { count += 1; }
        if (activeFilters.date_to)                          { count += 1; }
        if (activeFilters.langcode && activeFilters.langcode !== '') { count += 1; }
        if (activeFilters.media_type && activeFilters.media_type !== 'all') { count += 1; }

        var $chip = $('#eas-filter-chip');
        if (count > 0) {
          $chip.text(count).removeAttr('hidden').show();
        }
        else {
          $chip.text('0').attr('hidden', true).hide();
        }
      }

      // ── Filter toggle ────────────────────────────────────────────────────────
      once('easFilterToggle', '#eas-filter-toggle', context).forEach(function (btn) {
        $(btn).on('click', function () {
          var $panel    = $('#eas-filter-panel');
          var expanded  = $(btn).attr('aria-expanded') === 'true';

          if (expanded) {
            $(btn).attr('aria-expanded', 'false');
            $panel.attr('hidden', true);
          }
          else {
            $(btn).attr('aria-expanded', 'true');
            $panel.removeAttr('hidden');
          }
        });
      });

      // ── React to filter changes ──────────────────────────────────────────────
      once('easFilterChange', '.eas-filter-panel', context).forEach(function (panel) {
        $(panel).on('change', '.eas-filter-type, .eas-filter-date-from, .eas-filter-date-to, .eas-filter-lang, .eas-filter-media', function () {
          syncFilterState();
        });
      });

      // Also handle direct input events on date fields (typing, not just picker).
      once('easFilterDateInput', '.eas-filter-panel', context).forEach(function (panel) {
        $(panel).on('input', '.eas-filter-date-from, .eas-filter-date-to', function () {
          syncFilterState();
        });
      });

      // ── Clear filters ────────────────────────────────────────────────────────
      once('easFilterClear', '#eas-filter-clear', context).forEach(function (link) {
        $(link).on('click', function (e) {
          e.preventDefault();

          // Uncheck all content-type checkboxes.
          $('.eas-filter-type').prop('checked', false);

          // Clear date inputs.
          $('.eas-filter-date-from').val('');
          $('.eas-filter-date-to').val('');

          // Reset language to "All".
          $('input[name="filter_langcode"][value=""]').prop('checked', true);

          // Reset media type to "All".
          $('input[name="filter_media_type"][value="all"]').prop('checked', true);

          syncFilterState();
        });
      });

      // ── Search submit ────────────────────────────────────────────────────────
      once('elasticAdvancedSearch', '#sbmt', context).forEach(function (element) {
        $(element).on('click', function () {
          runSearch();
        });
      });

      once('elasticAdvancedSearchEnter', '#srch_term', context).forEach(function (element) {
        $(element).on('keydown', function (e) {
          if (e.key === 'Enter' && acIndex < 0) { runSearch(); }
        });
      });

      once('elasticAdvancedSearchQueryPrefill', 'body', context).forEach(function () {
        if (context !== document) {
          return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('q') || '').trim();
        if (q === '') {
          return;
        }
        var $term = $('#srch_term');
        if ($term.length) {
          $term.val(q);
        }
        var $submit = $('#sbmt');
        if ($submit.length) {
          $submit.trigger('click');
        }
      });

      function showLoadingState() {
        $('#search-did-you-mean').hide().empty();
        $('#search-related-queries').hide().find('.related-chips').empty();
        $('#search_results').html(
          '<div class="eas-loading" role="status" aria-live="polite">' +
          '<span class="eas-loading__spinner" aria-hidden="true"></span>' +
          '<span>Searching…</span></div>'
        );
      }

      function showSearchError() {
        $('#search_results').html('<div class="eas-error" role="alert">Error occurred during search. Please try again.</div>');
      }

      function showInputError(msg) {
        const $input = $('#srch_term');
        let $err = $('#eas-input-error');
        if (!$err.length) {
          $err = $('<p>', { id: 'eas-input-error', class: 'eas-input-error', role: 'alert', 'aria-live': 'polite' });
          $input.closest('.eas-form-group').append($err);
        }
        $err.text(msg).show();
        $input.attr('aria-describedby', 'eas-input-error').addClass('eas-input--error').trigger('focus');
      }

      function clearInputError() {
        $('#eas-input-error').hide();
        $('#srch_term').removeAttr('aria-describedby').removeClass('eas-input--error');
      }

      /**
       * Builds the POST body for the current search, merging in active filters.
       */
      function buildSearchPayload(term, queryMode) {
        // Always sync filter state before building payload.
        syncFilterState();

        var payload = {
          query:      term,
          query_mode: queryMode,
        };

        // Determine whether any filters are active.
        var hasContentTypes = activeFilters.content_types.length > 0;
        var hasDate         = activeFilters.date_from !== '' || activeFilters.date_to !== '';
        var hasLang         = activeFilters.langcode !== '';
        var hasMediaType    = activeFilters.media_type !== 'all';
        var hasAnyFilter    = hasContentTypes || hasDate || hasLang || hasMediaType;

        if (hasAnyFilter) {
          payload.search_all = false;
          if (hasContentTypes) {
            payload.content_types = activeFilters.content_types;
          }
          if (hasDate) {
            payload.date_from = activeFilters.date_from;
            payload.date_to   = activeFilters.date_to;
          }
          if (hasLang) {
            payload.langcode = activeFilters.langcode;
          }
          if (hasMediaType) {
            payload.media_type = activeFilters.media_type;
          }
        }
        else {
          payload.search_all = true;
        }

        return payload;
      }

      function runSearch() {
        const searchText = $('#srch_term').val().trim();
        if (!searchText) {
          showInputError('Please enter a search keyword.');
          return;
        }
        clearInputError();

        const queryMode = $('input[name="query_mode"]:checked').val() || 'OR';
        const payload   = buildSearchPayload(searchText, queryMode);

        showLoadingState();

        $.ajax({
          url: drupalSettings.elasticSearch.ajaxPath,
          method: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(payload),
          success: function (response) {
            renderDidYouMean(response.did_you_mean, searchText, queryMode);
            renderRelatedQueries(response.related_queries || [], queryMode);
            renderResults(response, searchText, queryMode);
          },
          error: showSearchError,
        });
      }

      function renderDidYouMean(suggestion, originalQuery, queryMode) {
        if (!suggestion || suggestion === originalQuery) { return; }
        var $dym = $('#search-did-you-mean');
        $dym.html(
          'Did you mean: <a href="#" class="dym-suggestion" data-suggestion="' +
          escAttr(suggestion) + '">' + escHtml(suggestion) + '</a>?'
        ).show();

        $dym.find('.dym-suggestion').off('click.dym').on('click.dym', function (e) {
          e.preventDefault();
          var term = $(this).data('suggestion');
          $('#srch_term').val(term);
          runSearchWith(term, queryMode);
        });
      }

      function renderRelatedQueries(queries, queryMode) {
        if (!queries || !queries.length) { return; }
        var $chips = $('#search-related-queries .related-chips').empty();
        queries.forEach(function (q) {
          $('<a>', {
            href: '#',
            class: 'related-query-chip',
            text: q,
            'data-query': q,
          }).appendTo($chips);
        });
        $('#search-related-queries').show();

        $chips.find('.related-query-chip').off('click.rq').on('click.rq', function (e) {
          e.preventDefault();
          var term = $(this).data('query');
          $('#srch_term').val(term);
          runSearchWith(term, queryMode);
        });
      }

      const TYPE_BADGE = {
        page:    'page',
        news:    'news',
        event:   'event',
        article: 'article',
        file:    'file',
      };

      function badgeClass(type) {
        const key = (type || '').toLowerCase();
        return 'eas-result__type eas-result__type--' + (TYPE_BADGE[key] || 'default');
      }

      function friendlyUrl(url) {
        try {
          const u = new URL(url);
          return u.hostname + u.pathname.replace(/\/$/, '');
        } catch (_) {
          return url;
        }
      }

      function renderResults(response, searchText, queryMode) {
        if (!response.results || !response.results.length) {
          $('#search_results').html(
            '<div class="eas-empty" role="status">' +
            '<strong>No results found</strong>' +
            '<span>Try different keywords or broaden your search.</span></div>'
          );
          return;
        }

        let html = '<div class="eas-results__header">';
        html += '<h2 class="eas-results__title">Search Results</h2>';
        html += '<span class="eas-results__count">' + response.total + ' result' + (response.total !== 1 ? 's' : '') + '</span>';
        html += '</div>';
        html += '<div class="eas-results__list">';

        response.results.forEach(item => {
          const type = (item.content_type || '').toLowerCase();
          html += '<article class="eas-result search-result-item">';

          // meta row: badge
          if (type) {
            html += '<div class="eas-result__meta">';
            html += '<span class="' + escAttr(badgeClass(type)) + '">' + escHtml(type) + '</span>';
            html += '</div>';
          }

          // title
          html += '<h3 class="eas-result__title">';
          html += '<a class="eas-result__link result-link" href="' + escAttr(item.url) +
            '" data-query="' + escAttr(searchText) +
            '" data-title="' + escAttr(item.title) +
            '" data-content-type="' + escAttr(item.content_type || '') + '">' +
            escHtml(item.title) + '</a>';
          html += '</h3>';

          // friendly URL
          if (item.url) {
            html += '<p class="eas-result__url">' + escHtml(friendlyUrl(item.url)) + '</p>';
          }

          // snippet
          if (item.snippet) {
            html += '<p class="eas-result__snippet">' + escHtml(item.snippet) + '</p>';
          }

          html += '</article>';
        });

        html += '</div>';
        $('#search_results').html(html);

        // Click tracking
        $('#search_results').find('.result-link').off('click.track').on('click.track', function () {
          var $a = $(this);
          if (!drupalSettings.elasticSearch.clickPath) { return; }
          navigator.sendBeacon
            ? navigator.sendBeacon(drupalSettings.elasticSearch.clickPath, new Blob([JSON.stringify({
                query:        $a.data('query'),
                title:        $a.data('title'),
                url:          $a.attr('href'),
                content_type: $a.data('content-type'),
              })], { type: 'application/json' }))
            : $.ajax({ url: drupalSettings.elasticSearch.clickPath, method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ query: $a.data('query'), title: $a.data('title'),
                  url: $a.attr('href'), content_type: $a.data('content-type') }) });
        });
      }

      function runSearchWith(term, queryMode) {
        showLoadingState();
        const payload = buildSearchPayload(term, queryMode);
        $.ajax({
          url: drupalSettings.elasticSearch.ajaxPath,
          method: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify(payload),
          success: function (response) {
            renderDidYouMean(response.did_you_mean, term, queryMode);
            renderRelatedQueries(response.related_queries || [], queryMode);
            renderResults(response, term, queryMode);
          },
          error: showSearchError,
        });
      }

      function escHtml(str) {
        return $('<div>').text(str || '').html();
      }

      function escAttr(str) {
        return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      }

      // Voice search
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // Sync badge with any pre-filled filter values (e.g. browser autofill).
      once('easFilterInit', '.eas-filter-panel', context).forEach(function () {
        syncFilterState();
      });

      once('elasticVoiceSearch', '#voice-search-btn-advance', context).forEach(function (btn) {
          var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.interimResults  = false;
          recognition.maxAlternatives = 1;
          recognition.continuous      = false;

          $(btn).on('click', function () {
            $(btn).addClass('listening');
            recognition.start();
          });

          recognition.onresult = function (event) {
            var transcript = event.results[0][0].transcript;
            $('#srch_term').val(transcript);
            $(btn).removeClass('listening');
            runSearch();
          };

          recognition.onerror  = function () { $(btn).removeClass('listening'); };
          recognition.onend    = function () { $(btn).removeClass('listening'); };
        });
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
