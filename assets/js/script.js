'use strict';

/**
 * Main Application Entry Point
 *
 * Boot sequence:
 *  1. Fetch portfolio data (localStorage override or defaultContent.json fallback)
 *  2. Populate the DOM with that data
 *  3. Wire up UI interactions (sidebar, nav, filtering)
 *  4. Start page-transition animations
 *  5. Initialize the admin editor engine (auth, versioning, inline editing)
 */

import { initUI, initFiltering } from './ui.js';
import { loadContent, populateDOM } from './contentManager.js';
import { initEditor } from './editor.js';
import { initAnimations } from './animations.js';

document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadContent();

  if (data) {
    populateDOM(data);
    initUI();
    initFiltering();
    initAnimations();
    initEditor(data);
  } else {
    // Data load failed — still initialize UI so the page isn't completely broken
    initUI();
    initFiltering();
    initAnimations();
  }
});
