'use strict';

/**
 * Advanced Editor Engine with Authentication, Multi-Category, and Version Control
 */

import { saveContent, populateDOM } from './contentManager.js';
import { initFiltering } from './ui.js';

let isEditMode = false;
let isAuthenticated = false;
let currentData = null;
let activeLinkElement = null;
let isHoveringBar = false;
const HISTORY_KEY = 'portfolioHistory_v1';

// Expose category updater to global scope
window.updateProjectCategories = (pIdx, checkbox) => {
    if (!currentData.projects[pIdx].categories) currentData.projects[pIdx].categories = [];
    const cats = currentData.projects[pIdx].categories;
    if (checkbox.checked) {
        if (!cats.includes(checkbox.value)) cats.push(checkbox.value);
    } else {
        const index = cats.indexOf(checkbox.value);
        if (index > -1) cats.splice(index, 1);
    }
};

export const initEditor = (data) => {
  currentData = data;
  
  if (!currentData.projectCategories) currentData.projectCategories = ["ML Systems", "Computer Vision", "Full Stack"];
  currentData.projects.forEach(p => { if (!p.categories) p.categories = []; });

  // Initialize History if empty
  initHistoryBaseline(data);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'r') {
      if (confirm('HARD RESET: Clear all browser edits?')) {
        localStorage.removeItem('portfolioContent_v1');
        localStorage.removeItem(HISTORY_KEY);
        window.location.reload();
      }
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      handleAuthOrToggle();
    }
  });

  const trigger = document.getElementById('edit-mode-trigger');
  if (trigger) trigger.addEventListener('click', handleAuthOrToggle);

  document.addEventListener('click', (e) => {
    if (isEditMode && e.target.closest('.project-url-link, .resume-link')) e.preventDefault();
  }, true);

  createFloatingLinkBar();
  createAuthModal();
  createHistoryPane();
};

const handleAuthOrToggle = () => {
    if (!isAuthenticated) showLoginModal();
    else toggleEditMode();
};

const toggleEditMode = () => {
  isEditMode = !isEditMode;
  document.body.classList.toggle('editing-enabled', isEditMode);
  
  const editables = document.querySelectorAll('.editable-section');
  editables.forEach(el => el.contentEditable = isEditMode);
  
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
    document.querySelector('.history-toggle-btn').style.display = 'block';
  } else {
    hideSaveButton();
    removeListControls();
    hideFloatingLinkBar();
    document.querySelector('.history-toggle-btn').style.display = 'none';
    document.querySelector('.history-pane').classList.remove('active');
    refreshUI(); 
  }
};

/* --- Authentication --- */

const createAuthModal = () => {
  if (document.querySelector('.auth-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-modal">
      <h3 style="text-align: center;">Admin Login</h3>
      <input type="text" id="auth-user" class="auth-input" placeholder="Username">
      <input type="password" id="auth-pass" class="auth-input" placeholder="Password">
      <button id="auth-login-btn" class="auth-submit">Login</button>
      <p id="auth-error-msg" class="auth-error">Invalid credentials. Try again.</p>
      <p style="font-size: 9px; color: var(--light-gray-70); margin-top: 15px;">Hint: admin / admin</p>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('auth-login-btn').addEventListener('click', handleLogin);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
};

const showLoginModal = () => { document.querySelector('.auth-overlay').classList.add('active'); };

const handleLogin = () => {
  const user = document.getElementById('auth-user').value;
  const pass = document.getElementById('auth-pass').value;
  if (user === 'admin' && pass === 'admin') {
    isAuthenticated = true;
    document.querySelector('.auth-overlay').classList.remove('active');
    toggleEditMode();
  } else {
    document.getElementById('auth-error-msg').style.display = 'block';
  }
};

/* --- Version Control System --- */

const initHistoryBaseline = (defaultData) => {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (history.length === 0) {
        history.push({
            id: 'default',
            timestamp: new Date().toLocaleString(),
            title: 'Factory Default',
            description: 'Original baseline configuration.',
            data: defaultData,
            isDefault: true
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
};

const createHistoryPane = () => {
    const pane = document.createElement('div');
    pane.className = 'history-pane';
    pane.innerHTML = `
        <div class="history-header">
            <h3 class="h3">Edit History</h3>
            <button class="admin-btn" onclick="document.querySelector('.history-pane').classList.remove('active')">Close</button>
        </div>
        <div class="history-list"></div>
    `;
    document.body.appendChild(pane);

    const toggle = document.createElement('button');
    toggle.className = 'history-toggle-btn';
    toggle.innerText = 'History';
    toggle.onclick = () => {
        renderHistoryList();
        pane.classList.toggle('active');
    };
    document.body.appendChild(toggle);
};

const renderHistoryList = () => {
    const list = document.querySelector('.history-list');
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    list.innerHTML = history.reverse().map(version => `
        <div class="history-item ${version.isDefault ? 'default' : ''}">
            <div class="history-item-meta">
                <span>${version.timestamp}</span>
                ${version.isDefault ? '<span>IMMUTABLE</span>' : ''}
            </div>
            <div class="history-item-title">${version.title}</div>
            <div class="history-item-desc">${version.description}</div>
            <div class="history-item-actions">
                <button class="admin-btn" onclick="window.restoreVersion('${version.id}')">Restore</button>
                ${!version.isDefault ? `<button class="admin-btn delete" onclick="window.deleteVersion('${version.id}')">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
};

window.restoreVersion = (id) => {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const version = history.find(v => v.id === id);
    if (version && confirm(`Restore to "${version.title}"? Current unsaved changes will be lost.`)) {
        currentData = JSON.parse(JSON.stringify(version.data)); // Deep clone
        saveContent(currentData);
        window.location.reload();
    }
};

window.deleteVersion = (id) => {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    if (confirm('Delete this version permanently?')) {
        history = history.filter(v => v.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistoryList();
    }
};

const performSave = () => {
    const title = prompt("Enter a title for this version:", `Update ${new Date().toLocaleDateString()}`);
    if (!title) return;
    const desc = prompt("Enter a short description of changes:");
    
    const editables = document.querySelectorAll('.editable-section');
    editables.forEach(el => {
        const key = el.dataset.key;
        if (key && !key.includes('.categories.')) {
            const keys = key.split('.');
            let target = currentData;
            for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
            target[keys[keys.length - 1]] = el.innerText.trim();
        }
    });

    // Save current state to history
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.push({
        id: 'ver_' + Date.now(),
        timestamp: new Date().toLocaleString(),
        title: title,
        description: desc || 'No description provided.',
        data: currentData
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    saveContent(currentData);
    alert('Portfolio saved and versioned successfully!');
    toggleEditMode();
};

/* --- List & Sub-item Management --- */

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

  injectCategoryControls();

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

  document.querySelectorAll('.project-item').forEach((item, index) => {
    const metricsList = item.querySelector('.project-metrics-list');
    if (metricsList && !metricsList.querySelector('.add-metric-btn')) {
        const btn = document.createElement('button');
        btn.className = 'admin-btn add-metric-btn';
        btn.innerText = '+ Metric';
        btn.style.fontSize = '9px';
        btn.onclick = (e) => { e.preventDefault(); addMetric(index); };
        metricsList.appendChild(btn);
    }
    const techList = item.querySelector('.project-tech-list');
    if (techList && !techList.querySelector('.add-tech-btn')) {
        const btn = document.createElement('button');
        btn.className = 'admin-btn add-tech-btn';
        btn.innerText = '+ Tech';
        btn.style.fontSize = '9px';
        btn.onclick = (e) => { e.preventDefault(); addTech(index); };
        techList.appendChild(btn);
    }
  });

  document.querySelectorAll('.metric-container, .tech-tag-container').forEach(cont => {
    if (!cont.querySelector('.sub-delete-btn')) {
        const btn = document.createElement('button');
        btn.className = 'sub-delete-btn metric-delete-btn tech-delete-btn';
        btn.innerText = '×';
        const el = cont.querySelector('.editable-section');
        if (el) {
            btn.onclick = () => deleteSubItem(el.dataset.key);
            cont.appendChild(btn);
        }
    }
  });
};

const injectCategoryControls = () => {
    const filterList = document.querySelector('.filter-list');
    if (!filterList) return;
    if (!filterList.querySelector('.add-cat-btn')) {
        const btn = document.createElement('button');
        btn.className = 'admin-btn add-cat-btn';
        btn.innerText = '+ Tab';
        btn.style.fontSize = '10px';
        btn.style.marginLeft = '10px';
        btn.onclick = addGlobalCategory;
        filterList.appendChild(btn);
    }
    const tabs = filterList.querySelectorAll('.filter-item');
    tabs.forEach(tab => {
        const btn = tab.querySelector('button');
        const catName = btn.innerText.trim();
        if (catName === "All") return;
        const isUsed = currentData.projects.some(p => p.categories && p.categories.includes(catName));
        if (!isUsed && !tab.querySelector('.cat-delete-x')) {
            const cross = document.createElement('span');
            cross.className = 'cat-delete-x';
            cross.innerText = '×';
            cross.style.cssText = `margin-left: 5px; color: #ff4b4b; cursor: pointer; font-weight: bold;`;
            cross.onclick = (e) => { e.stopPropagation(); deleteGlobalCategory(catName); };
            btn.appendChild(cross);
        }
    });
};

const addGlobalCategory = () => {
    const newCat = prompt("Enter new category name:");
    if (newCat && !currentData.projectCategories.includes(newCat)) {
        currentData.projectCategories.push(newCat);
        refreshUI();
    }
};

const deleteGlobalCategory = (catName) => {
    if (confirm(`Delete the category "${catName}"?`)) {
        currentData.projectCategories = currentData.projectCategories.filter(c => c !== catName);
        refreshUI();
    }
};

const convertCategoriesToDropdowns = () => {
    document.querySelectorAll('.project-categories-display').forEach((container, pIdx) => {
        const categories = currentData.projectCategories || [];
        const selected = currentData.projects[pIdx].categories || [];
        container.innerHTML = `
            <div class="category-selector" style="background: var(--onyx); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <p style="font-size: 10px; color: var(--light-gray-70); margin-bottom: 5px;">Select Categories:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${categories.map(cat => `
                        <label style="font-size: 10px; color: white; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                            <input type="checkbox" value="${cat}" ${selected.includes(cat) ? 'checked' : ''} 
                                   onchange="window.updateProjectCategories(${pIdx}, this)">
                            ${cat}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
};

const addMetric = (idx) => {
    if (!currentData.projects[idx].metrics) currentData.projects[idx].metrics = [];
    currentData.projects[idx].metrics.push("New Metric: 0%");
    refreshUI();
};

const addTech = (idx) => {
    if (!currentData.projects[idx].tech) currentData.projects[idx].tech = [];
    currentData.projects[idx].tech.push("New Tech");
    refreshUI();
};

const deleteSubItem = (key) => {
    const k = key.split('.');
    currentData.projects[k[1]][k[2]].splice(k[3], 1);
    refreshUI();
};

const addItem = (key) => {
  const templates = {
    projects: { title: "New Project", url: "#", categories: [], description: "Short description here", tech: ["Python"], image: "./assets/images/project-1.jpg", metrics: [], links: { github: "#", demo: "#" } },
    experience: { company: "New Company", role: "Role", duration: "2024", bullets: ["Task 1"] },
    education: { university: "University Name", degree: "Degree Name", duration: "Years", impact: "Grade" },
    skills: { category: "New Category", items: "Skill 1, Skill 2" },
    achievements: { title: "New Achievement", description: "Desc" },
    certifications: { title: "New Certification", description: "Desc" }
  };
  currentData[key].unshift(templates[key]);
  refreshUI();
};

const deleteItem = (key, index) => {
  if (confirm(`Delete this ${key} item?`)) {
    currentData[key].splice(index, 1);
    refreshUI();
  }
};

const refreshUI = () => {
  populateDOM(currentData);
  initFiltering(); 
  if (isEditMode) {
    removeListControls();
    injectListControls();
    initLinkHoverListeners();
    convertCategoriesToDropdowns();
    const editables = document.querySelectorAll('.editable-section');
    editables.forEach(el => el.contentEditable = true);
  }
};

/* --- Link/Image Editor --- */

const createFloatingLinkBar = () => {
  const bar = document.createElement('div');
  bar.id = 'floating-link-bar';
  bar.style.cssText = `position: absolute; display: none; background: var(--onyx); border: 1px solid var(--accent-blue); padding: 5px; border-radius: 4px; z-index: 4000; gap: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);`;
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter URL or Image Link...';
  input.style.cssText = `background: var(--smoky-black); color: white; border: none; padding: 4px 8px; font-size: 11px; border-radius: 2px; width: 220px;`;
  const saveBtn = document.createElement('button');
  saveBtn.innerText = 'Set';
  saveBtn.className = 'admin-btn';
  saveBtn.style.padding = '2px 8px';
  saveBtn.onclick = saveLinkUrl;
  bar.addEventListener('mouseenter', () => { isHoveringBar = true; });
  bar.addEventListener('mouseleave', () => { isHoveringBar = false; hideFloatingLinkBar(); });
  bar.appendChild(input);
  bar.appendChild(saveBtn);
  document.body.appendChild(bar);
};

const initLinkHoverListeners = () => {
  const linkTargets = document.querySelectorAll('.project-url-link, .resume-link, .project-image-editable');
  linkTargets.forEach(target => {
    target.addEventListener('mouseenter', showLinkBar);
    target.addEventListener('mouseleave', () => { setTimeout(() => { if (!isHoveringBar) hideFloatingLinkBar(); }, 200); });
  });
};

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

const getValueFromKey = (key) => {
    if (!key) return null;
    const keys = key.split('.');
    let target = currentData;
    for (let k of keys) { if (target[k] === undefined) return null; target = target[k]; }
    return target;
};

const hideFloatingLinkBar = () => { if (!isHoveringBar) { const bar = document.getElementById('floating-link-bar'); if (bar) bar.style.display = 'none'; } };

const saveLinkUrl = () => {
  const input = document.querySelector('#floating-link-bar input');
  const url = input.value.trim() || '#';
  if (activeLinkElement) {
    const key = activeLinkElement.dataset.key;
    const keys = key.split('.');
    let target = currentData;
    for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
    target[keys[keys.length - 1]] = url;
    if (activeLinkElement.classList.contains('project-image-editable')) {
        const img = activeLinkElement.nextElementSibling;
        if (img && img.tagName === 'IMG') img.src = url;
    } else { activeLinkElement.href = url; }
  }
  isHoveringBar = false;
  hideFloatingLinkBar();
};

/* --- Global Admin UI --- */

const showSaveButton = () => {
  let container = document.getElementById('admin-save-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-save-container';
    container.style.cssText = `position: fixed; bottom: 20px; right: 20px; z-index: 3000; display: flex; gap: 15px; background: var(--eerie-black-2); padding: 15px; border-radius: 12px; border: 1px solid var(--jet); box-shadow: 0 10px 40px rgba(0,0,0,0.6);`;
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save All Changes';
    saveBtn.className = 'form-btn';
    saveBtn.style.padding = '12px 25px';
    saveBtn.onclick = performSave;
    const resetBtn = document.createElement('button');
    resetBtn.innerText = 'Reset to Defaults';
    resetBtn.className = 'admin-btn';
    resetBtn.style.cssText = `background: hsla(0, 100%, 50%, 0.1); color: #ff4b4b; border: 1px solid #ff4b4b; padding: 12px 20px; font-size: 13px; font-weight: 600;`;
    resetBtn.onclick = () => { if (confirm('Permanently delete all browser edits?')) { localStorage.removeItem('portfolioContent_v1'); localStorage.removeItem(HISTORY_KEY); window.location.reload(); } };
    container.appendChild(resetBtn);
    container.appendChild(saveBtn);
    document.body.appendChild(container);
  } else { container.style.display = 'flex'; }
};

const hideSaveButton = () => { const container = document.getElementById('admin-save-container'); if (container) container.style.display = 'none'; };

const removeListControls = () => { document.querySelectorAll('.admin-btn, .metric-delete-btn, .tech-delete-btn, .sub-delete-btn, .cat-delete-x').forEach(btn => btn.remove()); };
