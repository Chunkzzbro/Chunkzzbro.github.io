'use strict';

/**
 * Content Manager
 *
 * The data bridge between storage and the DOM.
 *
 * Data priority:
 *  1. localStorage (key: portfolioContent_v1) — user's saved edits
 *  2. data/defaultContent.json — factory baseline
 *
 * populateDOM() reads the data object and injects it into the HTML structure.
 * Every injected element gets a `data-key` attribute mapping back to the JSON path,
 * enabling the editor to read values back out when saving.
 */

const STORAGE_KEY = 'portfolioContent_v1';
const DATA_PATH = './data/defaultContent.json';

/**
 * Load content: returns saved edits from localStorage if available,
 * otherwise fetches the default JSON file.
 */
export const loadContent = async () => {
  try {
    const storedContent = localStorage.getItem(STORAGE_KEY);
    if (storedContent) return JSON.parse(storedContent);
    const response = await fetch(DATA_PATH);
    return await response.json();
  } catch (error) {
    console.error('Error loading content:', error);
    return null;
  }
};

/** Persist the current data object to localStorage. */
export const saveContent = (content) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
};

/**
 * Populate the entire DOM from a data object.
 *
 * Each section is wrapped in its own try/catch so a failure in one
 * (e.g. missing field) doesn't break the rest of the page.
 */
export const populateDOM = (data) => {
  if (!data) return;

  // Helper: safely set text content and mark element as editable
  const setEditableText = (selector, text, key) => {
    const el = document.querySelector(selector);
    if (el) {
        el.innerText = text || "";
        el.classList.add('editable-section');
        el.dataset.key = key;
    }
  };

  // --- Hero / Sidebar ---
  try {
    setEditableText('.name', data.hero?.name, 'hero.name');
    setEditableText('.title', data.hero?.title, 'hero.title');
    setEditableText('.availability', data.hero?.availability, 'hero.availability');
    setEditableText('.tagline', data.hero?.tagline, 'hero.tagline');

    const avatarImg = document.querySelector('.avatar-box img');
    if (avatarImg && data.hero?.avatar) {
        avatarImg.src = data.hero.avatar;
        avatarImg.classList.add('sidebar-avatar-editable');
        avatarImg.dataset.key = 'hero.avatar';
    }

    const resumeLink = document.querySelector('.resume-link');
    if (resumeLink && data.hero?.resumeLink) {
        resumeLink.href = data.hero.resumeLink;
        resumeLink.dataset.key = 'hero.resumeLink';
    }

    // Contact details
    const contacts = document.querySelectorAll('.contact-item');
    if (contacts[0] && data.hero?.email) {
      const link = contacts[0].querySelector('.contact-link');
      if (link) {
          link.innerText = data.hero.email;
          link.href = `mailto:${data.hero.email}`;
          link.dataset.key = 'hero.email';
          link.classList.add('email-link-editable');
      }
    }
    if (contacts[1] && data.hero?.location) {
        const addr = contacts[1].querySelector('address');
        if (addr) {
            addr.innerText = data.hero.location;
            addr.classList.add('editable-section');
            addr.dataset.key = 'hero.location';
        }
    }

    // Social links
    const socialLinks = document.querySelectorAll('.social-link');
    if (socialLinks.length >= 2 && data.hero?.socials) {
      socialLinks[0].href = data.hero.socials.github || "#";
      socialLinks[0].dataset.key = 'hero.socials.github';
      socialLinks[0].classList.add('social-link-editable');
      socialLinks[1].href = data.hero.socials.linkedin || "#";
      socialLinks[1].dataset.key = 'hero.socials.linkedin';
      socialLinks[1].classList.add('social-link-editable');
    }
  } catch (e) { console.error("Hero population failed:", e); }

  // --- About section ---
  try {
    const aboutText = document.querySelector('.about-text');
    if (aboutText && data.about?.description) {
      aboutText.innerHTML = data.about.description
        .map((p, i) => `<p class="editable-section" data-key="about.description.${i}">${p}</p>`)
        .join('');
    }
  } catch (e) { console.error("About population failed:", e); }

  // --- Focus Areas (service cards) ---
  try {
    const focusList = document.querySelector('.service-list');
    if (focusList && data.about?.focusAreas) {
      focusList.innerHTML = data.about.focusAreas.map((area, i) => `
        <li class="service-item focus-area-item">
          <div class="service-icon-box focus-icon-editable" data-key="about.focusAreas.${i}.icon">
            <img src="${area.icon || './assets/images/icon-dev.svg'}" alt="${area.title}" width="40">
          </div>
          <div class="service-content-box">
            <h4 class="h4 service-item-title editable-section" data-key="about.focusAreas.${i}.title">${area.title}</h4>
            <p class="service-item-text editable-section" data-key="about.focusAreas.${i}.description">${area.description}</p>
          </div>
        </li>
      `).join('');
    }
  } catch (e) { console.error("Focus areas population failed:", e); }

  // --- Resume: Education & Experience timelines ---
  try {
    const resumeSections = document.querySelectorAll('.timeline-list');

    // Education
    if (resumeSections[0] && data.education) {
      resumeSections[0].innerHTML = data.education.map((edu, i) => `
        <li class="timeline-item">
          <h4 class="h4 timeline-item-title editable-section" data-key="education.${i}.university">${edu.university}</h4>
          <span class="editable-section" data-key="education.${i}.duration">${edu.duration}</span>
          <p class="timeline-text editable-section" data-key="education.${i}.degree">${edu.degree}</p>
          <p class="timeline-text editable-section" data-key="education.${i}.impact">${edu.impact}</p>
        </li>
      `).join('');
    }

    // Experience (with bullet points)
    if (resumeSections[1] && data.experience) {
      resumeSections[1].innerHTML = data.experience.map((exp, i) => `
        <li class="timeline-item">
          <h4 class="h4 timeline-item-title editable-section" data-key="experience.${i}.company">${exp.company}</h4>
          <span>
            <span class="editable-section" data-key="experience.${i}.duration" style="display: inline;">${exp.duration}</span>
            —
            <span class="editable-section" data-key="experience.${i}.role" style="display: inline;">${exp.role}</span>
          </span>
          <ul class="experience-bullets" style="margin-top: 10px; list-style: disc; padding-left: 20px;">
            ${exp.bullets ? exp.bullets.map((b, bi) => `
              <li class="timeline-text editable-section" data-key="experience.${i}.bullets.${bi}">${b}</li>
            `).join('') : ''}
          </ul>
        </li>
      `).join('');
    }
  } catch (e) { console.error("Resume population failed:", e); }

  // --- Skills ---
  try {
    const skillsList = document.querySelector('.skills-list');
    if (skillsList && data.skills) {
      skillsList.innerHTML = data.skills.map((skill, i) => `
        <li class="skills-item">
          <div class="title-wrapper">
            <h5 class="h5 editable-section" data-key="skills.${i}.category">${skill.category}</h5>
          </div>
          <p class="timeline-text editable-section" data-key="skills.${i}.items">${skill.items}</p>
        </li>
      `).join('');
    }
  } catch (e) { console.error("Skills population failed:", e); }

  // --- Projects (with category filter tabs) ---
  try {
    // Rebuild filter tabs from projectCategories array
    const filterList = document.querySelector('.filter-list');
    if (filterList && data.projectCategories) {
        const cats = ["All", ...data.projectCategories];
        filterList.innerHTML = cats.map((cat, i) => `
            <li class="filter-item">
                <button class="${i === 0 ? 'active' : ''} project-filter-tab" data-filter-btn>${cat}</button>
            </li>
        `).join('');
    }

    // Build project cards — each card gets data-category for filtering (pipe-separated)
    const projectList = document.querySelector('.project-list');
    if (projectList && data.projects) {
      projectList.innerHTML = data.projects.map((project, i) => {
        const categoryString = Array.isArray(project.categories) ? project.categories.join('|') : (project.category || "");
        return `
        <li class="project-item active" data-filter-item data-category="${categoryString.toLowerCase()}">
          <div class="project-card">
            <figure class="project-img">
              <div class="project-item-icon-box project-image-editable" data-key="projects.${i}.image">
                <ion-icon name="eye-outline"></ion-icon>
              </div>
              <img src="${project.image || ''}" alt="${project.title}" loading="lazy">
            </figure>
            <div class="project-metrics-list">
              ${project.metrics ? project.metrics.map((m, mi) => `
                <div class="metric-container" style="display: inline-block; margin-right: 8px;">
                  <span class="metric-badge editable-section" data-key="projects.${i}.metrics.${mi}">${m}</span>
                </div>
              `).join('') : ''}
            </div>
            <a href="${project.url || '#'}" target="_blank" class="project-url-link" data-key="projects.${i}.url">
              <h3 class="project-title editable-section" data-key="projects.${i}.title" style="color: var(--white-2);">${project.title}</h3>
            </a>
            <div class="project-categories-display">
                <span class="project-category editable-section" data-key="projects.${i}.categories">
                    ${Array.isArray(project.categories) ? project.categories.join(', ') : ""}
                </span>
            </div>
            <div class="project-tech-list">
              ${project.tech ? (Array.isArray(project.tech) ? project.tech : []).map((t, ti) => `
                <div class="tech-tag-container" style="display: inline-block; margin-right: 6px;">
                  <span class="tech-tag editable-section" data-key="projects.${i}.tech.${ti}">${t}</span>
                </div>
              `).join('') : ''}
            </div>
            <p class="project-text editable-section" data-key="projects.${i}.description">${project.description}</p>
            <div class="project-links admin-only-view" style="display: flex; gap: 10px; margin-top: 10px;">
              ${project.links?.github ? `<a href="${project.links.github}" target="_blank" class="admin-btn">GitHub</a>` : ''}
              ${project.links?.demo ? `<a href="${project.links.demo}" target="_blank" class="admin-btn">Demo</a>` : ''}
            </div>
          </div>
        </li>
      `}).join('');
    }
  } catch (e) { console.error("Projects population failed:", e); }

  // --- Achievements & Certifications ---
  try {
    const achievementList = document.querySelector('.achievements-list');
    if (achievementList && data.achievements) {
      achievementList.innerHTML = data.achievements.map((ach, i) => `
        <li class="blog-post-item">
          <div class="blog-content">
            <h3 class="h3 blog-item-title editable-section" data-key="achievements.${i}.title">${ach.title}</h3>
            <p class="blog-text editable-section" data-key="achievements.${i}.description">${ach.description}</p>
          </div>
        </li>
      `).join('');
    }
    const certList = document.querySelector('.certifications-list');
    if (certList && data.certifications) {
      certList.innerHTML = data.certifications.map((cert, i) => `
        <li class="blog-post-item">
          <div class="blog-content">
            <h3 class="h3 blog-item-title editable-section" data-key="certifications.${i}.title">${cert.title}</h3>
            <p class="blog-text editable-section" data-key="certifications.${i}.description">${cert.description}</p>
          </div>
        </li>
      `).join('');
    }
  } catch (e) { console.error("Achievements population failed:", e); }
};
