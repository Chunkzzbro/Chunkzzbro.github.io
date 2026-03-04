'use strict';

import { initUI, initFiltering } from './ui.js';
import { loadContent, populateDOM } from './contentManager.js';
import { initEditor } from './editor.js';
import { initAnimations } from './animations.js';

/**
 * Main Application Entry Point
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load data
  const data = await loadContent();
  
  if (data) {
    // 2. Populate DOM with data
    populateDOM(data);
    
    // 3. Initialize UI behaviors
    initUI();
    initFiltering();
    initAnimations();
    
    // 4. Initialize Editor Engine
    initEditor(data);
  } else {
    // Fallback if content fails to load
    initUI();
    initFiltering();
    initAnimations();
  }
});
