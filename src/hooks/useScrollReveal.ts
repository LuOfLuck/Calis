import { useEffect } from 'react';

/**
 * Native Intersection Observer Hook for Repeating Bidirectional Scroll Reveal
 * Detects elements with .reveal, .reveal-up, .reveal-left, .reveal-right.
 * Adds .is-revealed when entering viewport and removes it when leaving,
 * ensuring animations re-trigger continuously both scrolling down and scrolling up.
 */
export function useScrollReveal() {
  useEffect(() => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document
        .querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right')
        .forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          } else {
            // When element leaves viewport (scrolling up or down), reset state
            entry.target.classList.remove('is-revealed');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '20px 0px -40px 0px'
      }
    );

    const observedSet = new WeakSet<Element>();

    const observeAll = () => {
      const elements = document.querySelectorAll(
        '.reveal, .reveal-up, .reveal-left, .reveal-right'
      );
      elements.forEach((el) => {
        if (!observedSet.has(el)) {
          observer.observe(el);
          observedSet.add(el);
        }
      });
    };

    observeAll();

    // MutationObserver to observe newly rendered dynamic content
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
