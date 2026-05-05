(function (Drupal, once) {
  Drupal.behaviors.scrollFadeAnimations = {
    attach: function (context) {

      // Select all Elementor animation-enabled elements
      once('scrollAnimation', '.animated', context).forEach(function (el) {
        // Detect which Elementor animation class is applied
        const animationClass = Array.from(el.classList).find(cls =>
          // All animation families from Elementor
          cls.startsWith('fadeIn') ||
          cls.startsWith('zoomIn') ||
          cls.startsWith('bounceIn') ||
          cls.startsWith('slideIn') ||
          cls.startsWith('rotateIn') ||
          cls.startsWith('lightSpeedIn') ||
          cls.startsWith('rollIn') ||
          // Attention Seekers (don’t start with “In”)
          [
            'bounce', 'flash', 'pulse', 'rubberBand',
            'shake', 'headShake', 'swing', 'tada',
            'wobble', 'jello'
          ].includes(cls)
        );

        if (!animationClass) return;

        // Remove animation class initially to prevent load animation
        el.classList.remove(animationClass);

        // Hide element initially (for entrance-type animations)
        if (!['bounce', 'flash', 'pulse', 'rubberBand', 'shake', 'headShake', 'swing', 'tada', 'wobble', 'jello'].includes(animationClass)) {
          el.style.opacity = '0';
        }

        // Initial transform (optional for directional animations)
        if (animationClass.includes('Left')) {
          el.style.transform = 'translate3d(-100%, 0, 0)';
        } else if (animationClass.includes('Right')) {
          el.style.transform = 'translate3d(100%, 0, 0)';
        } else if (animationClass.includes('Up')) {
          el.style.transform = 'translate3d(0, 100%, 0)';
        } else if (animationClass.includes('Down')) {
          el.style.transform = 'translate3d(0, -100%, 0)';
        }

        // Observe when the element enters the viewport
        const observer = new IntersectionObserver(function (entries) {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Add the animation class
              el.classList.add(animationClass);

              // Clean up inline styles after animation completes
              el.addEventListener('animationend', function() {
                el.style.opacity = '';
                el.style.transform = '';
              }, { once: true });

              // Stop observing after triggering once
              observer.unobserve(el);
            }
          });
        }, {
          root: null,
          rootMargin: '0px 0px -10% 0px',
          threshold: 0.1
        });

        observer.observe(el);
      });
    }
  };
})(Drupal, once);
