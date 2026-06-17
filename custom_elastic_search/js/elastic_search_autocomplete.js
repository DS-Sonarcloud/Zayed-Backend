(function ($, Drupal) {
  Drupal.behaviors.elasticSearchAutocomplete = {
    attach: function (context, settings) {
      once('elasticSearchAutocomplete', '#elastic-search-input', context).forEach(function (input) {
        $(input).on('keyup', function () {
          let query = $(this).val();

          if (query.length < 1) {
            $('#elastic-search-results').empty();
            return;
          }

          $.ajax({
            url: Drupal.url('custom_elastic_search/search'),
            data: { q: query },
            dataType: 'json',
            success: function (data) {
              let resultsContainer = $('#elastic-search-results');
              resultsContainer.empty();

              let ul = $('<ul></ul>');

            if (data.length) {
                data.forEach(function (item) {
                // Use title if exists, otherwise filename
                let displayText = item.title || item.filename || 'No title';
                let displayUrl = item.url || item.file_relative_url || '#';

                let link = $('<a></a>')
                .attr('href', displayUrl)
                .text(displayText);

                let li = $('<li></li>').append(link);
                ul.append(li);
            });
        } else {
            let li = $('<li>No results found</li>').css('color', '#999');
            ul.append(li);
        }
              // ✅ Add the Advanced Search link as the last list item
              let advancedLink = $('<a></a>')
                .addClass('advance-search-live-search')
                .attr('href', '/elastic-advanced-search')
                .text('Try Advanced Search');

              let advancedLi = $('<li></li>')
                .addClass('advanced-search-link')
                .append(advancedLink);

              ul.append(advancedLi);

              resultsContainer.append(ul);
            }
          });
        });
      });
    }
  };
})(jQuery, Drupal);
