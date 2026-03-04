'use strict';

/**
 * Admin Content Loader
 * Core logic for loading default and localized content
 */

export const loadContent = async (dataPath, storageKey) => {
  const stored = localStorage.getItem(storageKey);
  if (stored) return JSON.parse(stored);
  
  const response = await fetch(dataPath);
  return await response.json();
};

export const saveToLocal = (data, storageKey) => {
  localStorage.setItem(storageKey, JSON.stringify(data));
};
