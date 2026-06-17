(function (Drupal, once) {
  Drupal.behaviors.hideByClass = {
    attach: function (context, settings) {
      once('hideByClass', '.event_date_expose_fieldset', context).forEach(function (el) {
        el.style.display = 'none';
      });
    }
  };
})(Drupal, once);

jQuery(document).ready(function() {
  // Add onclick event listener to calendar tiles
  jQuery(document).on('click', '.react-calendar__tile', function() {
    // Check if this tile has the 'active' class (indicating it's selected)
    if (jQuery(this).hasClass('react-calendar__tile--active')) {
      // Get the day from the text inside the active tile
      var day = jQuery(this).text().trim();

      // Get the current month and year from the calendar header
      var monthYearText = jQuery(".react-calendar__navigation__label").text();
      var [monthName, year] = monthYearText.split(' ');

      // Convert month name to month number (0-based for JS Date)
      var monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      var monthIndex = monthNames.indexOf(monthName);
     
      if (monthIndex !== -1) {
        // Create the full date
        var fullDate = new Date(year, monthIndex, day);

        const date = new Date(year, monthIndex, day);
        // Extract year, month, and day
        const years = date.getFullYear();
        const months = String(date.getMonth() + 1).padStart(2, '0'); // `getMonth()` returns 0-based month (January is 0)
        const days = String(date.getDate()).padStart(2, '0'); // `getDate()` returns the day of the month

        // Format as YYYY-MM-DD
        const formattedDate = `${years}-${months}-${days}`;
        //console.log(formattedDate); // Outputs: "2026-01-01"

        jQuery("#edit-combine").val(formattedDate);
        //console.log("Selected Date: ", fullDate);
      }
    }
  });
});
(function ($, Drupal) {
  Drupal.behaviors.customEventToggle = {
    attach: function (context, settings) {
      const $radios = $('#edit-field-registration input[type="radio"]', context);
      const $linkWrapper = $('#edit-field-select-webform-wrapper', context);

      if (!$radios.length || !$linkWrapper.length) {
        return;
      }

      function toggleField() {
        const selected = $radios.filter(':checked').val();
        console.log('Registration selected:', selected); // Debug

        if (selected === '1') {
          $linkWrapper.show();
        } else {
          $linkWrapper.hide();
        }
      }

      // Run on page load
      toggleField();

      // Listen to radio change (always re-bind)
      $radios.on('change', toggleField);
    }
  };
})(jQuery, Drupal);


