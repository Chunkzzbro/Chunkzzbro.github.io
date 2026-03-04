'use strict';

/**
 * Animations Controller
 * Handles subtle entrance animations and transitions
 */

export const initAnimations = () => {
  const pages = document.querySelectorAll('[data-page]');
  
  // Example: Simple fade-in for active sections
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
