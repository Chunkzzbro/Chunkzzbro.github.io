'use strict';

/**
 * Animations Controller
 *
 * Adds a subtle fade-in + slide-up transition whenever a page section
 * becomes active (i.e. when a navbar tab is clicked).
 * Uses a MutationObserver to watch for class changes on [data-page] articles.
 */

export const initAnimations = () => {
  const pages = document.querySelectorAll('[data-page]');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('active')) {
          target.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], {
            duration: 400,
            easing: 'ease-out'
          });
        }
      }
    });
  });

  pages.forEach(page => {
    observer.observe(page, { attributes: true });
  });
};
