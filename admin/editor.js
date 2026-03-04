'use strict';

/**
 * Admin Editor Engine
 * Logic for initializing the contenteditable fields and persistence
 */

export const toggleEditing = (isEditMode) => {
  const sections = document.querySelectorAll('.editable-section');
  sections.forEach(section => {
    section.contentEditable = isEditMode;
  });
  
  if (isEditMode) {
    document.body.classList.add('admin-editing-active');
  } else {
    document.body.classList.remove('admin-editing-active');
  }
};

export const extractEdits = () => {
  const sections = document.querySelectorAll('.editable-section');
  const data = {};
  
  sections.forEach(section => {
    const key = section.dataset.key;
    if (key) data[key] = section.innerText.trim();
  });
  
  return data;
};
