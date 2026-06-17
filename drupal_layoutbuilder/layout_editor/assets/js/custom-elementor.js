// 1. Elementor Accordion JS ------------------------------------------------------
document.querySelectorAll('.drupal_layoutbuilder-accordion').forEach(function(accordion) {
    accordion.querySelectorAll('.drupal_layoutbuilder-tab-title').forEach(function(tabTitle) {
        tabTitle.addEventListener('click', function() {
            const item = this.parentElement;
            const content = item.querySelector('.drupal_layoutbuilder-tab-content');

            // Single open behavior: close all
            accordion.querySelectorAll('.drupal_layoutbuilder-accordion-item').forEach(function(otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('drupal_layoutbuilder-active');
                    const otherContent = otherItem.querySelector('.drupal_layoutbuilder-tab-content');
                    if (otherContent) otherContent.style.display = 'none';
                }
            });

            // Toggle this one
            if (item.classList.contains('drupal_layoutbuilder-active')) {
                item.classList.remove('drupal_layoutbuilder-active');
                content.style.display = 'none';
            } else {
                item.classList.add('drupal_layoutbuilder-active');
                content.style.display = 'block';
            }
        });
    });

    // Open the first accordion item by default
    const firstItem = accordion.querySelector('.drupal_layoutbuilder-accordion-item');
    if (firstItem) {
        const firstContent = firstItem.querySelector('.drupal_layoutbuilder-tab-content');
        firstItem.classList.add('drupal_layoutbuilder-active');
        if (firstContent) firstContent.style.display = 'block';
    }
});
// End--------------------------------------------------------------------------------



// 2. code to the tabs Js ------------------------------------------------------------------
(function() {
    document.addEventListener("DOMContentLoaded", function() {
        const tabContainers = document.querySelectorAll(".drupal_layoutbuilder-tabs");

        tabContainers.forEach((tabsWrapper) => {
            const tabTitles = tabsWrapper.querySelectorAll(".drupal_layoutbuilder-tab-title.drupal_layoutbuilder-tab-desktop-title");
            const tabContents = tabsWrapper.querySelectorAll(".drupal_layoutbuilder-tab-content");

            // Function to deactivate all tabs
            function deactivateTabs() {
                tabTitles.forEach((title) => {
                    title.classList.remove("drupal_layoutbuilder-active");
                });
                tabContents.forEach((content) => {
                    content.style.display = "none";
                });
            }

            // Activate the first tab by default
            deactivateTabs();
            if (tabTitles[0] && tabContents[0]) {
                tabTitles[0].classList.add("drupal_layoutbuilder-active");
                tabContents[0].style.display = "block";
            }

            // Add click event for each tab
            tabTitles.forEach((title) => {
                title.addEventListener("click", function() {
                    const tabNum = this.dataset.tab;
                    const tabContent = tabsWrapper.querySelector(`.drupal_layoutbuilder-tab-content[data-tab="${tabNum}"]`);

                    if (!this.classList.contains("drupal_layoutbuilder-active")) {
                        deactivateTabs();
                        this.classList.add("drupal_layoutbuilder-active");
                        if (tabContent) {
                            tabContent.style.display = "block";
                        }
                    }
                });
            });
        });
    });
})();
// End--------------------------------------------------------------------------------



// 3. Custom Elementor Counter Animation js code---------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {

    function animateCounter(el) {
        const toValue = parseFloat(el.getAttribute('data-to-value')) || 0;
        const duration = parseInt(el.getAttribute('data-duration')) || 1000;
        const delimiter = el.getAttribute('data-delimiter') || '';

        let startTimestamp = null;
        const startValue = 0;

        function step(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (toValue - startValue) + startValue);

            if (delimiter && delimiter === ',') {
                el.textContent = currentValue.toLocaleString();
            } else {
                el.textContent = currentValue;
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                if (delimiter && delimiter === ',') {
                    el.textContent = toValue.toLocaleString();
                } else {
                    el.textContent = toValue;
                }
            }
        }

        window.requestAnimationFrame(step);
    }

    // Find all Elementor counters
    document.querySelectorAll('.drupal_layoutbuilder-counter-number').forEach(function(counter) {
        animateCounter(counter);
    });

});
// End--------------------------------------------------------------------------------



// 4. Custom Elementor Progress Bar Animation js code-----------------------------------------------
document.addEventListener("DOMContentLoaded", function() {

    function animateProgressBar(bar) {
        const max = parseInt(bar.getAttribute('data-max')) || 0;
        const duration = 1500; // ms (adjust if you want)
        let startTimestamp = null;

        function step(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * max);

            bar.style.width = currentValue + '%';

            const percentageText = bar.querySelector('.drupal_layoutbuilder-progress-percentage');
            if (percentageText) {
                percentageText.textContent = currentValue + '%';
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                bar.style.width = max + '%';
                if (percentageText) {
                    percentageText.textContent = max + '%';
                }
            }
        }

        window.requestAnimationFrame(step);
    }
    // Find all Elementor progress bars
    document.querySelectorAll('.drupal_layoutbuilder-progress-bar').forEach(function(bar) {
        // Reset initial state in case server-rendered markup has leftover width
        bar.style.width = '0%';
        // Animate
        animateProgressBar(bar);
    });

});
// End--------------------------------------------------------------------------------


// 5. Custom Elementor Alert Dismiss js code---------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.drupal_layoutbuilder-alert').forEach(function(alert) {
        var dismissButton = alert.querySelector('.drupal_layoutbuilder-alert-dismiss');
        if (dismissButton) {
            dismissButton.addEventListener('click', function() {
                // Option 1: fade out (optional) - or just hide instantly
                alert.style.transition = 'opacity 0.3s ease';
                alert.style.opacity = '0';
                setTimeout(function() {
                    alert.style.display = 'none';
                }, 300);
            });
        }
    });
});
// End--------------------------------------------------------------------------------

// 6. Custom Elementor Toggle Widget JS code---------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.drupal_layoutbuilder-toggle').forEach(function(toggleWidget) {
        toggleWidget.querySelectorAll('.drupal_layoutbuilder-tab-title').forEach(function(tabTitle) {
            tabTitle.addEventListener('click', function() {
                const item = this.parentElement;
                const content = item.querySelector('.drupal_layoutbuilder-tab-content');

                if (item.classList.contains('drupal_layoutbuilder-active')) {
                    // Collapse it
                    item.classList.remove('drupal_layoutbuilder-active');
                    content.style.display = 'none';
                } else {
                    // Expand it
                    item.classList.add('drupal_layoutbuilder-active');
                    content.style.display = 'block';
                }
            });
        });

        // Optionally: set all closed initially
        toggleWidget.querySelectorAll('.drupal_layoutbuilder-toggle-item').forEach(function(item) {
            item.classList.remove('drupal_layoutbuilder-active');
            const content = item.querySelector('.drupal_layoutbuilder-tab-content');
            if (content) content.style.display = 'none';
        });
    });
});
// End--------------------------------------------------------------------------------
(function($, Drupal) {
    Drupal.behaviors.customElementorAnimation = {
        attach: function(context, settings) {
            window.elementorFrontend.init();
        }
    };
})(jQuery, Drupal);

// End--------------------------------------------------------------------------------
(function($, Drupal) {
    Drupal.behaviors.customSlickSlider = {
        attach: function(context, settings) {
            window.elementorFrontend.init();
        }
    };
})(jQuery, Drupal);