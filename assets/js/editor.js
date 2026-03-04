'use strict';

/**
 * Advanced Editor Engine
 * Handles in-browser content editing, adding/deleting items, and floating link editing
 */

import { saveContent, populateDOM } from './contentManager.js';

let isEditMode = false;
let currentData = null;
let activeLinkElement = null;
let isHoveringBar = false;

export const initEditor = (data) => {
  currentData = data;
  
  // Shortcut: Ctrl + Shift + E
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      toggleEditMode();
    }
  });

  // Create floating link bar
  createFloatingLinkBar();
};

const toggleEditMode = () => {
  isEditMode = !isEditMode;
  document.body.classList.toggle('editing-enabled', isEditMode);
  
  const editables = document.querySelectorAll('.editable-section');
  editables.forEach(el => el.contentEditable = isEditMode);
  
  if (isEditMode) {
    showSaveButton();
    injectListControls();
    initLinkHoverListeners();
  } else {
    hideSaveButton();
    removeListControls();
    hideFloatingLinkBar();
  }
};

const createFloatingLinkBar = () => {
  const bar = document.createElement('div');
  bar.id = 'floating-link-bar';
  bar.style.cssText = `
    position: absolute;
    display: none;
    background: var(--onyx);
    border: 1px solid var(--accent-blue);
    padding: 5px;
    border-radius: 4px;
    z-index: 2000;
    gap: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  `;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter URL...';
  input.style.cssText = `
    background: var(--smoky-black);
    color: white;
    border: none;
    padding: 4px 8px;
    font-size: 11px;
    border-radius: 2px;
    width: 180px;
  `;
  
  const saveBtn = document.createElement('button');
  saveBtn.innerText = 'Set';
  saveBtn.className = 'admin-btn';
  saveBtn.style.padding = '2px 8px';
  saveBtn.onclick = saveLinkUrl;

  bar.addEventListener('mouseenter', () => { isHoveringBar = true; });
  bar.addEventListener('mouseleave', () => { 
    isHoveringBar = false;
    hideFloatingLinkBar();
  });

  bar.appendChild(input);
  bar.appendChild(saveBtn);
  document.body.appendChild(bar);
};

const initLinkHoverListeners = () => {
  // Listen for hover on project titles and resume link
  const linkTargets = document.querySelectorAll('.project-url-link, .resume-link');
  
  linkTargets.forEach(target => {
    target.addEventListener('mouseenter', showLinkBar);
    target.addEventListener('mouseleave', () => {
        // Small delay to allow moving mouse to the bar
        setTimeout(() => {
            if (!isHoveringBar) hideFloatingLinkBar();
        }, 100);
    });
  });
};

const showLinkBar = (e) => {
  if (!isEditMode) return;
  
  const target = e.currentTarget;
  activeLinkElement = target;
  
  const bar = document.getElementById('floating-link-bar');
  const input = bar.querySelector('input');
  
  const rect = target.getBoundingClientRect();
  bar.style.top = `${window.scrollY + rect.top - 40}px`;
  bar.style.left = `${window.scrollX + rect.left}px`;
  bar.style.display = 'flex';
  
  // Get current value from data model
  const key = target.dataset.key;
  input.value = getValueFromKey(key) || '';
};

const getValueFromKey = (key) => {
    if (!key) return null;
    const keys = key.split('.');
    let target = currentData;
    for (let k of keys) {
        if (target[k] === undefined) return null;
        target = target[k];
    }
    return target;
};

const hideFloatingLinkBar = () => {
  if (isHoveringBar) return;
  const bar = document.getElementById('floating-link-bar');
  if (bar) bar.style.display = 'none';
};

const saveLinkUrl = () => {
  const input = document.querySelector('#floating-link-bar input');
  const url = input.value.trim() || '#';
  
  if (activeLinkElement) {
    const key = activeLinkElement.dataset.key;
    updateDataModel(key, url);
    activeLinkElement.href = url;
  }
  isHoveringBar = false;
  hideFloatingLinkBar();
};

const updateDataModel = (key, value) => {
    const keys = key.split('.');
    let target = currentData;
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
};

const showSaveButton = () => {
  let container = document.getElementById('admin-save-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-save-container';
    container.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 3000;
      display: flex; gap: 15px;
      background: var(--eerie-black-2);
      padding: 15px;
      border-radius: 12px;
      border: 1px solid var(--jet);
      box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    `;
    
    const saveBtn = document.createElement('button');
    saveBtn.id = 'save-changes-btn';
    saveBtn.innerText = 'Save All Changes';
    saveBtn.className = 'form-btn';
    saveBtn.style.cssText = `padding: 12px 25px; margin: 0;`;
    saveBtn.onclick = performSave;

    const resetBtn = document.createElement('button');
    resetBtn.innerText = 'Reset to Defaults';
    resetBtn.className = 'admin-btn';
    resetBtn.style.cssText = `
      background: hsla(0, 100%, 50%, 0.1); 
      color: #ff4b4b; 
      border: 1px solid #ff4b4b; 
      padding: 12px 20px;
      font-size: 13px;
      font-weight: 600;
    `;
    resetBtn.onclick = () => {
      if (confirm('CRITICAL: This will permanently delete all your browser-based edits and revert the site to its original code state. Proceed?')) {
        localStorage.removeItem('portfolioContent_v1');
        window.location.reload();
      }
    };

    container.appendChild(resetBtn);
    container.appendChild(saveBtn);
    document.body.appendChild(container);
  } else {
    container.style.display = 'flex';
  }
};

const hideSaveButton = () => {
  const container = document.getElementById('admin-save-container');
  if (container) container.style.display = 'none';
};

const injectListControls = () => {
  const containers = [
    { selector: '.project-list', key: 'projects', label: 'Project' },
    { selector: 'section.timeline:nth-of-type(1) .timeline-list', key: 'education', label: 'Education' },
    { selector: 'section.timeline:nth-of-type(2) .timeline-list', key: 'experience', label: 'Experience' },
    { selector: '.skills-list', key: 'skills', label: 'Skill Category' },
    { selector: '.achievements-list', key: 'achievements', label: 'Achievement' },
    { selector: '.certifications-list', key: 'certifications', label: 'Certification' }
  ];

  containers.forEach(conf => {
    const el = document.querySelector(conf.selector);
    if (el && !el.previousElementSibling?.classList.contains('add-item-btn')) {
      const btn = document.createElement('button');
      btn.className = 'admin-btn add-item-btn';
      btn.innerText = `+ Add ${conf.label}`;
      btn.style.margin = '10px 0';
      btn.onclick = () => addItem(conf.key);
      el.parentNode.insertBefore(btn, el);
    }
  });

  // Inject Delete buttons
  const itemMappings = [
    { selector: '.project-item', key: 'projects' },
    { selector: 'section.timeline:nth-of-type(1) .timeline-item', key: 'education' },
    { selector: 'section.timeline:nth-of-type(2) .timeline-item', key: 'experience' },
    { selector: '.skills-item', key: 'skills' },
    { selector: '.achievements-list .blog-post-item', key: 'achievements' },
    { selector: '.certifications-list .blog-post-item', key: 'certifications' }
  ];

  itemMappings.forEach(map => {
    document.querySelectorAll(map.selector).forEach((item, index) => {
      if (!item.querySelector('.delete-item-btn')) {
        const btn = document.createElement('button');
        btn.className = 'admin-btn delete delete-item-btn';
        btn.innerText = 'Delete';
        btn.style.marginTop = '10px';
        btn.onclick = () => deleteItem(map.key, index);
        item.appendChild(btn);
      }
    });
  });
};

const removeListControls = () => {
  document.querySelectorAll('.admin-btn').forEach(btn => btn.remove());
};

const addItem = (key) => {
  const templates = {
    projects: { 
      title: "New Project", 
      url: "#",
      category: "ML Systems", 
      description: "Short description here", 
      tech: "Tech used", 
      image: "./assets/images/project-1.jpg",
      links: { github: "#", demo: "#" }
    },
    experience: { 
      company: "New Company", 
      role: "Role", 
      duration: "2024", 
      bullets: ["New achievement bullet point"] 
    },
    education: {
      university: "University Name",
      degree: "Degree Name",
      duration: "Years",
      impact: "Grade/Honors"
    },
    skills: {
      category: "New Category",
      items: "Skill 1, Skill 2, Skill 3"
    },
    achievements: {
      title: "New Achievement",
      description: "Description of the achievement."
    },
    certifications: {
      title: "New Certification",
      description: "Description of the certification."
    }
  };

  currentData[key].unshift(templates[key]);
  refreshUI();
};

const deleteItem = (key, index) => {
  if (confirm(`Are you sure you want to delete this ${key} item?`)) {
    currentData[key].splice(index, 1);
    refreshUI();
  }
};

const refreshUI = () => {
  populateDOM(currentData);
  if (isEditMode) {
    removeListControls();
    injectListControls();
    initLinkHoverListeners();
    const editables = document.querySelectorAll('.editable-section');
    editables.forEach(el => el.contentEditable = true);
  }
};

const performSave = () => {
  const editables = document.querySelectorAll('.editable-section');
  
  editables.forEach(el => {
    const key = el.dataset.key;
    if (!key) return;
    
    const value = el.innerText.trim();
    updateDataModel(key, value);
  });

  saveContent(currentData);
  alert('Portfolio updated successfully!');
  toggleEditMode();
};
