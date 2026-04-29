'use strict';

/**
 * Editor Engine
 *
 * The admin CMS layer that turns this static portfolio into an editable platform.
 * Everything here is behind authentication — nothing activates until login.
 *
 * Major subsystems:
 *  - Authentication:    Simple modal login (admin/admin), session lives in memory only.
 *  - Edit Mode:         Toggles contentEditable on all [.editable-section] elements.
 *  - Floating Link Bar: Hover-triggered URL editor for links, images, and social icons.
 *  - List CRUD:         Add/Delete buttons for projects, education, experience, skills, etc.
 *  - Category Manager:  Add/remove project filter categories, checkbox assignment per project.
 *  - Version History:   Save snapshots with titles, restore any version, set a custom default.
 *  - Hard Reset:        Ctrl+Alt+R wipes all localStorage and reloads from defaultContent.json.
 *
 * Data flow:
 *  Edit in DOM → performSave() reads all editable fields back → updates currentData →
 *  saves to localStorage (portfolioContent_v1) + creates a history entry (portfolioHistory_v1).
 */

import { saveContent, populateDOM } from './contentManager.js';
import { initFiltering } from './ui.js';

let isEditMode = false;
let isAuthenticated = false;
let currentData = null;        // The live data object being edited
let activeLinkElement = null;  // The element the floating link bar is attached to
let isHoveringBar = false;     // Prevents the link bar from hiding while mouse is on it
const HISTORY_KEY = 'portfolioHistory_v1';

// ------------------------------------------------------------------
//  Global handlers (attached to window so inline onclick in HTML works)
// ------------------------------------------------------------------

/** Updates the categories array for a project when a checkbox is toggled. */
window.updateProjectCategories = (pIdx, checkbox) => {
    if (!currentData || !currentData.projects[pIdx]) return;
    if (!currentData.projects[pIdx].categories) currentData.projects[pIdx].categories = [];
    const cats = currentData.projects[pIdx].categories;
    if (checkbox.checked) {
        if (!cats.includes(checkbox.value)) cats.push(checkbox.value);
    } else {
        const index = cats.indexOf(checkbox.value);
        if (index > -1) cats.splice(index, 1);
    }
};

// ------------------------------------------------------------------
//  Initialization
// ------------------------------------------------------------------

export const initEditor = (data) => {
  currentData = data;

  // Hard Reset shortcut: Ctrl + Alt + R
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
      if (confirm('HARD RESET: Clear all browser edits?')) {
        localStorage.removeItem('portfolioContent_v1');
        localStorage.removeItem(HISTORY_KEY);
        window.location.reload();
      }
    }
  });

  // "Edit Mode" button in the sidebar
  const trigger = document.getElementById('edit-mode-trigger');
  if (trigger) {
    trigger.addEventListener('click', () => {
        if (!isAuthenticated) showLoginModal();
        else toggleEditMode();
    });
  }

  // Keyboard shortcut: Ctrl + Shift + E
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      if (!isAuthenticated) showLoginModal();
      else toggleEditMode();
    }
  });

  // Create UI subsystems
  try {
    initHistoryBaseline(data);
    createFloatingLinkBar();
    createAuthModal();
    createHistoryPane();
  } catch (err) { console.error("Editor subsystems failed:", err); }

  // In edit mode, prevent link clicks from navigating away
  document.addEventListener('click', (e) => {
    if (isEditMode && e.target.closest('.project-url-link, .resume-link, .social-link-editable, .email-link-editable')) {
        e.preventDefault();
    }
  }, true);
};

// ------------------------------------------------------------------
//  Edit Mode Toggle
// ------------------------------------------------------------------

const toggleEditMode = () => {
  isEditMode = !isEditMode;
  document.body.classList.toggle('editing-enabled', isEditMode);
  document.querySelectorAll('.editable-section').forEach(el => el.contentEditable = isEditMode);

  const trigger = document.getElementById('edit-mode-trigger');
  if (trigger) {
    trigger.innerText = isEditMode ? "Exit Edit Mode" : "Edit Mode";
    trigger.style.background = isEditMode ? "var(--accent-blue)" : "transparent";
    trigger.style.color = isEditMode ? "white" : "var(--accent-blue)";
  }

  if (isEditMode) {
    showSaveButton();
    injectListControls();
    initLinkHoverListeners();
    convertCategoriesToDropdowns();
    const hp = document.querySelector('.history-toggle-btn');
    if (hp) hp.style.display = 'block';
  } else {
    hideSaveButton();
    removeListControls();
    hideFloatingLinkBar();
    const hp = document.querySelector('.history-toggle-btn');
    const hpane = document.querySelector('.history-pane');
    if (hp) hp.style.display = 'none';
    if (hpane) hpane.classList.remove('active');
    refreshUI();
  }
};

// ------------------------------------------------------------------
//  Authentication
// ------------------------------------------------------------------

/** Creates the glassmorphism login modal (appended to body, hidden by default). */
const createAuthModal = () => {
  if (document.querySelector('.auth-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-modal">
      <h3>Admin Login</h3>
      <input type="text" id="auth-user" class="auth-input" placeholder="Username">
      <input type="password" id="auth-pass" class="auth-input" placeholder="Password">
      <button id="auth-login-btn" class="auth-submit">Login</button>
      <p id="auth-error-msg" class="auth-error">Invalid credentials.</p>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('auth-login-btn').addEventListener('click', handleLogin);
  // Click outside the modal to dismiss
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
};

const showLoginModal = () => { const o = document.querySelector('.auth-overlay'); if (o) o.classList.add('active'); };

/** Validates credentials and enters edit mode on success. */
const handleLogin = () => {
  const u = document.getElementById('auth-user').value;
  const p = document.getElementById('auth-pass').value;
  if (u === 'admin' && p === 'admin') {
    isAuthenticated = true;
    document.querySelector('.auth-overlay').classList.remove('active');
    toggleEditMode();
  } else { document.getElementById('auth-error-msg').style.display = 'block'; }
};

// ------------------------------------------------------------------
//  Version History
// ------------------------------------------------------------------

/** Ensures a "Factory Default" entry exists in history on first load. */
const initHistoryBaseline = (defaultData) => {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length === 0) {
        history.push({ id: 'factory_default', timestamp: new Date().toLocaleString(), title: 'Factory Default', description: 'Original.', data: defaultData, isDefault: true, isImmutable: true });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
};

/** Creates the sliding right-side history pane and its toggle button. */
const createHistoryPane = () => {
    const pane = document.createElement('div');
    pane.className = 'history-pane';
    pane.innerHTML = `<div class="history-header"><h3 class="h3">Edit History</h3><button class="admin-btn" onclick="document.querySelector('.history-pane').classList.remove('active')">Close</button></div><div class="history-list"></div>`;
    document.body.appendChild(pane);
    const toggle = document.createElement('button');
    toggle.className = 'history-toggle-btn';
    toggle.innerText = 'History';
    toggle.onclick = () => { renderHistoryList(); pane.classList.toggle('active'); };
    document.body.appendChild(toggle);
};

/** Renders all saved versions inside the history pane. */
const renderHistoryList = () => {
    const list = document.querySelector('.history-list');
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    list.innerHTML = [...history].reverse().map(v => `
        <div class="history-item ${v.isDefault ? 'default' : ''}">
            <div class="history-item-meta"><span>${v.timestamp}</span>${v.isDefault ? '<span style="color: var(--accent-blue);">DEFAULT</span>' : ''}</div>
            <div class="history-item-title">${v.title}</div>
            <div class="history-item-actions">
                <button class="admin-btn" onclick="window.restoreVersion('${v.id}')">Restore</button>
                ${!v.isDefault ? `<button class="admin-btn" onclick="window.setAsDefault('${v.id}')">Set Default</button>` : ''}
                ${!v.isImmutable ? `<button class="admin-btn delete" onclick="window.deleteVersion('${v.id}')">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
};

/** Marks a version as the default restore point. */
window.setAsDefault = (id) => {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.forEach(v => v.isDefault = (v.id === id));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistoryList();
};

/** Restores a saved version — replaces localStorage content and reloads. */
window.restoreVersion = (id) => {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const version = history.find(v => v.id === id);
    if (version && confirm(`Restore to "${version.title}"?`)) { saveContent(version.data); window.location.reload(); }
};

/** Deletes a version from history (factory default is protected). */
window.deleteVersion = (id) => {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (confirm('Delete permanently?')) { history = history.filter(v => v.id !== id); localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); renderHistoryList(); }
};

/** Resets to the default version (or factory default if none set). */
const hardResetToDefault = () => {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const def = history.find(v => v.isDefault) || history.find(v => v.isImmutable);
    if (def) { saveContent(def.data); window.location.reload(); }
    else { localStorage.removeItem('portfolioContent_v1'); window.location.reload(); }
};

// ------------------------------------------------------------------
//  List CRUD (Add / Delete items)
// ------------------------------------------------------------------

/**
 * Injects "Add" buttons above each list container and "Delete" buttons
 * on each individual item. Also handles metric/tech tag delete buttons.
 */
const injectListControls = () => {
  const containers = [
    { selector: '.project-list', key: 'projects', label: 'Project' },
    { selector: 'section.timeline:nth-of-type(1) .timeline-list', key: 'education', label: 'Education' },
    { selector: 'section.timeline:nth-of-type(2) .timeline-list', key: 'experience', label: 'Experience' },
    { selector: '.skills-list', key: 'skills', label: 'Skill' },
    { selector: '.service-list', key: 'about.focusAreas', label: 'Focus Area' },
    { selector: '.achievements-list', key: 'achievements', label: 'Achievement' },
    { selector: '.certifications-list', key: 'certifications', label: 'Cert' }
  ];

  // "Add" buttons
  containers.forEach(conf => {
    const el = document.querySelector(conf.selector);
    if (el && !el.previousElementSibling?.classList.contains('add-item-btn')) {
      const btn = document.createElement('button');
      btn.className = 'admin-btn add-item-btn';
      btn.innerText = `+ Add ${conf.label}`;
      btn.onclick = () => addItem(conf.key);
      el.parentNode.insertBefore(btn, el);
    }
  });

  injectCategoryControls();

  // "Delete" buttons on each item
  const itemMappings = [
    { selector: '.project-item', key: 'projects' },
    { selector: 'section.timeline:nth-of-type(1) .timeline-item', key: 'education' },
    { selector: 'section.timeline:nth-of-type(2) .timeline-item', key: 'experience' },
    { selector: '.skills-item', key: 'skills' },
    { selector: '.service-item', key: 'about.focusAreas' },
    { selector: '.achievements-list .blog-post-item', key: 'achievements' },
    { selector: '.certifications-list .blog-post-item', key: 'certifications' }
  ];

  itemMappings.forEach(map => {
    document.querySelectorAll(map.selector).forEach((item, index) => {
      if (!item.querySelector('.delete-item-btn')) {
        const btn = document.createElement('button');
        btn.className = 'admin-btn delete delete-item-btn';
        btn.innerText = 'Delete';
        btn.onclick = () => deleteItem(map.key, index);
        item.appendChild(btn);
      }
    });
  });

  // Delete buttons on individual metric badges and tech tags
  document.querySelectorAll('.metric-container, .tech-tag-container').forEach(cont => {
    if (!cont.querySelector('.sub-delete-btn')) {
        const btn = document.createElement('button');
        btn.className = 'sub-delete-btn metric-delete-btn tech-delete-btn';
        btn.innerText = '\u00d7';
        const el = cont.querySelector('.editable-section');
        if (el) { btn.onclick = () => deleteSubItem(el.dataset.key); cont.appendChild(btn); }
    }
  });
};

/** Adds a new item (with template defaults) to the beginning of a list. */
const addItem = (key) => {
  const templates = {
    projects: { title: "New Project", url: "#", categories: [], description: "Desc", tech: ["Python"], image: "./assets/images/project-1.jpg", metrics: [], links: { github: "#", demo: "#" } },
    experience: { company: "New Company", role: "Role", duration: "2024", bullets: ["Task 1"] },
    education: { university: "Uni", degree: "Degree", duration: "Years", impact: "Grade" },
    skills: { category: "New Category", items: "Skill 1" },
    'about.focusAreas': { title: "New Focus", description: "Desc.", icon: "./assets/images/icon-dev.svg" },
    achievements: { title: "New Achievement", description: "Desc" },
    certifications: { title: "New Cert", description: "Desc" }
  };
  const keys = key.split('.');
  let target = currentData;
  for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
  target[keys[keys.length - 1]].unshift(templates[key]);
  refreshUI();
};

const deleteItem = (key, index) => { if (confirm(`Delete?`)) {
    const keys = key.split('.');
    let target = currentData;
    for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
    target[keys[keys.length - 1]].splice(index, 1);
    refreshUI();
} };

/** Deletes a single sub-item (metric badge or tech tag) by its data-key path. */
const deleteSubItem = (key) => {
    const k = key.split('.');
    let target = currentData;
    for (let i = 0; i < k.length - 1; i++) target = target[k[i]];
    target.splice(k[k.length-1], 1);
    refreshUI();
};

const addMetric = (idx) => { if (!currentData.projects[idx].metrics) currentData.projects[idx].metrics = []; currentData.projects[idx].metrics.push("New Metric: 0%"); refreshUI(); };
const addTech = (idx) => { if (!currentData.projects[idx].tech) currentData.projects[idx].tech = []; currentData.projects[idx].tech.push("New Tech"); refreshUI(); };

// ------------------------------------------------------------------
//  Category Management
// ------------------------------------------------------------------

/** Replaces category text with checkbox selectors in edit mode. */
const convertCategoriesToDropdowns = () => {
    document.querySelectorAll('.project-categories-display').forEach((container, pIdx) => {
        const categories = currentData.projectCategories || [];
        const selected = currentData.projects[pIdx].categories || [];
        container.innerHTML = `<div class="category-selector" style="background: var(--onyx); padding: 10px; border-radius: 8px; margin-bottom: 10px;"><p style="font-size: 10px; color: var(--light-gray-70); margin-bottom: 5px;">Select Categories:</p><div style="display: flex; flex-wrap: wrap; gap: 8px;">${categories.map(cat => `<label style="font-size: 10px; color: white; display: flex; align-items: center; gap: 4px; cursor: pointer;"><input type="checkbox" value="${cat}" ${selected.includes(cat) ? 'checked' : ''} onchange="window.updateProjectCategories(${pIdx}, this)">${cat}</label>`).join('')}</div></div>`;
    });
};

/** Injects "add tab" button and delete-X on unused category tabs. */
const injectCategoryControls = () => {
    const filterList = document.querySelector('.filter-list');
    if (!filterList) return;
    if (!filterList.querySelector('.add-cat-btn')) {
        const btn = document.createElement('button'); btn.className = 'admin-btn add-cat-btn'; btn.innerText = '+ Tab'; btn.style.fontSize = '10px'; btn.style.marginLeft = '10px'; btn.onclick = addGlobalCategory; filterList.appendChild(btn);
    }
    // Show delete-X only on category tabs not currently used by any project
    const tabs = filterList.querySelectorAll('.filter-item');
    tabs.forEach(tab => {
        const btn = tab.querySelector('button'); const catName = btn.innerText.trim(); if (catName === "All") return;
        const isUsed = currentData.projects.some(p => p.categories && p.categories.includes(catName));
        if (!isUsed && !tab.querySelector('.cat-delete-x')) {
            const cross = document.createElement('span'); cross.className = 'cat-delete-x'; cross.innerText = '\u00d7'; cross.style.cssText = `margin-left: 5px; color: #ff4b4b; cursor: pointer; font-weight: bold;`;
            cross.onclick = (e) => { e.stopPropagation(); deleteGlobalCategory(catName); };
            btn.appendChild(cross);
        }
    });
};

const addGlobalCategory = () => {
    const newCat = prompt("New category:");
    if (newCat && !currentData.projectCategories.includes(newCat)) { currentData.projectCategories.push(newCat); refreshUI(); }
};

const deleteGlobalCategory = (catName) => {
    if (confirm(`Delete "${catName}"?`)) { currentData.projectCategories = currentData.projectCategories.filter(c => c !== catName); refreshUI(); }
};

// ------------------------------------------------------------------
//  Floating Link / Image URL Bar
// ------------------------------------------------------------------

/** Creates the absolute-positioned URL input bar (hidden until hover trigger). */
const createFloatingLinkBar = () => {
  const bar = document.createElement('div');
  bar.id = 'floating-link-bar';
  bar.style.cssText = `position: absolute; display: none; background: var(--onyx); border: 1px solid var(--accent-blue); padding: 5px; border-radius: 4px; z-index: 4000; gap: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);`;
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'URL...';
  input.style.cssText = `background: var(--smoky-black); color: white; border: none; padding: 4px 8px; font-size: 11px; border-radius: 2px; width: 220px;`;
  const saveBtn = document.createElement('button');
  saveBtn.innerText = 'Set';
  saveBtn.className = 'admin-btn';
  saveBtn.onclick = saveLinkUrl;
  bar.addEventListener('mouseenter', () => { isHoveringBar = true; });
  bar.addEventListener('mouseleave', () => { isHoveringBar = false; hideFloatingLinkBar(); });
  bar.appendChild(input);
  bar.appendChild(saveBtn);
  document.body.appendChild(bar);
};

/** Attaches hover listeners on all link/image elements that should show the URL bar. */
const initLinkHoverListeners = () => {
  const targets = ['.project-url-link', '.resume-link', '.project-image-editable', '.sidebar-avatar-editable', '.email-link-editable', '.social-link-editable', '.focus-icon-editable'];
  document.querySelectorAll(targets.join(', ')).forEach(t => {
    t.addEventListener('mouseenter', showLinkBar);
    t.addEventListener('mouseleave', () => { setTimeout(() => { if (!isHoveringBar) hideFloatingLinkBar(); }, 200); });
  });
};

/** Positions the link bar above the hovered element and pre-fills current URL. */
const showLinkBar = (e) => {
  if (!isEditMode) return;
  activeLinkElement = e.currentTarget;
  const bar = document.getElementById('floating-link-bar');
  const input = bar.querySelector('input');
  const rect = activeLinkElement.getBoundingClientRect();
  bar.style.top = `${window.scrollY + rect.top - 40}px`;
  bar.style.left = `${window.scrollX + rect.left}px`;
  bar.style.display = 'flex';
  const key = activeLinkElement.dataset.key;
  input.value = getValueFromKey(key) || '';
};

/** Saves the URL from the link bar input back into the data model and DOM. */
const saveLinkUrl = () => {
  const input = document.querySelector('#floating-link-bar input');
  const url = input.value.trim() || '#';
  if (activeLinkElement) {
    const key = activeLinkElement.dataset.key;
    updateDataModel(key, url);
    // Update the right DOM attribute depending on element type
    if (activeLinkElement.classList.contains('project-image-editable') || activeLinkElement.classList.contains('focus-icon-editable')) {
        const img = activeLinkElement.querySelector('img') || activeLinkElement.nextElementSibling;
        if (img && img.tagName === 'IMG') img.src = url;
    } else if (activeLinkElement.classList.contains('sidebar-avatar-editable')) {
        activeLinkElement.src = url;
    } else { activeLinkElement.href = url; }
  }
  isHoveringBar = false;
  hideFloatingLinkBar();
};

const hideFloatingLinkBar = () => { if (!isHoveringBar) { const bar = document.getElementById('floating-link-bar'); if (bar) bar.style.display = 'none'; } };

// ------------------------------------------------------------------
//  Data Model Helpers
// ------------------------------------------------------------------

/** Sets a value in the nested data object using a dot-separated key path. */
const updateDataModel = (key, value) => {
    const keys = key.split('.');
    let target = currentData;
    for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
    target[keys[keys.length - 1]] = value;
};

/** Gets a value from the nested data object using a dot-separated key path. */
const getValueFromKey = (key) => {
    if (!key) return null;
    const keys = key.split('.');
    let target = currentData;
    for (let k of keys) { if (target[k] === undefined) return null; target = target[k]; }
    return target;
};

// ------------------------------------------------------------------
//  Save & Refresh
// ------------------------------------------------------------------

/**
 * Reads all edited DOM fields back into currentData, creates a history
 * snapshot, and persists to localStorage.
 */
const performSave = () => {
    const title = prompt("Version Title:");
    if (!title) return;
    // Sync DOM edits back into the data model
    document.querySelectorAll('.editable-section').forEach(el => {
        const key = el.dataset.key;
        if (key && !key.includes('.categories')) updateDataModel(key, el.innerText.trim());
    });
    // Create a history snapshot
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.push({ id: 'ver_' + Date.now(), timestamp: new Date().toLocaleString(), title: title, data: JSON.parse(JSON.stringify(currentData)), isDefault: false, isImmutable: false });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    saveContent(currentData);
    alert('Saved!');
    toggleEditMode();
};

/** Re-renders the DOM from currentData and restores edit mode state if active. */
const refreshUI = () => {
  populateDOM(currentData);
  initFiltering();
  if (isEditMode) { removeListControls(); injectListControls(); initLinkHoverListeners(); convertCategoriesToDropdowns(); document.querySelectorAll('.editable-section').forEach(el => el.contentEditable = true); }
};

// ------------------------------------------------------------------
//  Save / Reset Button Bar
// ------------------------------------------------------------------

/** Shows the fixed bottom-right panel with "Save All Changes" and "Reset to Defaults". */
const showSaveButton = () => {
  let container = document.getElementById('admin-save-container');
  if (!container) {
    container = document.createElement('div'); container.id = 'admin-save-container';
    container.style.cssText = `position: fixed; bottom: 20px; right: 20px; z-index: 3000; display: flex; gap: 15px; background: var(--eerie-black-2); padding: 15px; border-radius: 12px; border: 1px solid var(--jet); box-shadow: 0 10px 40px rgba(0,0,0,0.6);`;
    const saveBtn = document.createElement('button'); saveBtn.innerText = 'Save All Changes'; saveBtn.className = 'form-btn'; saveBtn.onclick = performSave;
    const resetBtn = document.createElement('button'); resetBtn.innerText = 'Reset to Defaults'; resetBtn.className = 'admin-btn';
    resetBtn.style.cssText = `background: hsla(0, 100%, 50%, 0.1); color: #ff4b4b; border: 1px solid #ff4b4b; padding: 12px 20px; font-size: 13px; font-weight: 600;`;
    resetBtn.onclick = () => { if (confirm('Reset to default?')) hardResetToDefault(); };
    container.appendChild(resetBtn); container.appendChild(saveBtn); document.body.appendChild(container);
  } else { container.style.display = 'flex'; }
};

const hideSaveButton = () => { const container = document.getElementById('admin-save-container'); if (container) container.style.display = 'none'; };

/** Removes all injected admin buttons from the DOM when exiting edit mode. */
const removeListControls = () => { document.querySelectorAll('.admin-btn, .metric-delete-btn, .tech-delete-btn, .sub-delete-btn, .cat-delete-x').forEach(btn => btn.remove()); };
