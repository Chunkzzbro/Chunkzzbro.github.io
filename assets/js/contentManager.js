'use strict';

/**
 * Content Manager
 * Handles data fetching, persistence, and DOM population
 */

const STORAGE_KEY = 'portfolioContent_v1';
const DATA_PATH = './data/defaultContent.json';

export const loadContent = async () => {
  try {
    const storedContent = localStorage.getItem(STORAGE_KEY);
    if (storedContent) {
      return JSON.parse(storedContent);
    }

    const response = await fetch(DATA_PATH);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading content:', error);
    return null;
  }
};

export const saveContent = (content) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
};

export const populateDOM = (data) => {
  if (!data) return;

  try {
    // Hero Section
    const nameEl = document.querySelector('.name');
    const titleEl = document.querySelector('.title');
    const availabilityEl = document.querySelector('.availability');
    const taglineEl = document.querySelector('.tagline');
    
    if (nameEl) nameEl.innerText = data.hero.name || "Renjith Anil";
    if (titleEl) titleEl.innerText = data.hero.title || "";
    if (availabilityEl) availabilityEl.innerText = data.hero.availability || "";
    if (taglineEl) taglineEl.innerText = data.hero.tagline || "";
    
    const resumeLink = document.querySelector('.resume-link');
    if (resumeLink && data.hero.resumeLink) resumeLink.href = data.hero.resumeLink;

    const contacts = document.querySelectorAll('.contact-link');
    if (contacts[0] && data.hero.email) {
      contacts[0].innerText = data.hero.email;
      contacts[0].href = `mailto:${data.hero.email}`;
    }

    // Sidebar Socials
    const socialLinks = document.querySelectorAll('.social-link');
    if (socialLinks.length >= 2 && data.hero.socials) {
      socialLinks[0].href = data.hero.socials.github || "#";
      socialLinks[1].href = data.hero.socials.linkedin || "#";
    }
  } catch (e) { console.error("Error populating hero:", e); }

  try {
    // About Section
    const aboutText = document.querySelector('.about-text');
    if (aboutText && data.about.description) {
      aboutText.innerHTML = data.about.description
        .map((p, i) => `<p class="editable-section" data-key="about.description.${i}">${p}</p>`)
        .join('');
    }
  } catch (e) { console.error("Error populating about:", e); }

  try {
    // Focus Areas
    const focusList = document.querySelector('.service-list');
    if (focusList && data.about.focusAreas) {
      focusList.innerHTML = data.about.focusAreas.map((area, i) => `
        <li class="service-item">
          <div class="service-icon-box">
            <img src="${area.icon}" alt="${area.title}" width="40">
          </div>
          <div class="service-content-box">
            <h4 class="h4 service-item-title editable-section" data-key="about.focusAreas.${i}.title">${area.title}</h4>
            <p class="service-item-text editable-section" data-key="about.focusAreas.${i}.description">${area.description}</p>
          </div>
        </li>
      `).join('');
    }
  } catch (e) { console.error("Error populating focus areas:", e); }

  try {
    // Resume Section - Education & Experience
    const resumeSections = document.querySelectorAll('.timeline-list');
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

    if (resumeSections[1] && data.experience) {
      resumeSections[1].innerHTML = data.experience.map((exp, i) => `
        <li class="timeline-item">
          <h4 class="h4 timeline-item-title editable-section" data-key="experience.${i}.company">${exp.company}</h4>
          <span class="editable-section" data-key="experience.${i}.duration">${exp.duration} — ${exp.role}</span>
          <ul class="experience-bullets" style="margin-top: 10px; list-style: disc; padding-left: 20px;">
            ${exp.bullets ? exp.bullets.map((b, bi) => `
              <li class="timeline-text editable-section" data-key="experience.${i}.bullets.${bi}">${b}</li>
            `).join('') : ''}
          </ul>
        </li>
      `).join('');
    }
  } catch (e) { console.error("Error populating resume:", e); }

  try {
    // Skills Section
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
  } catch (e) { console.error("Error populating skills:", e); }

  try {
    // Projects Section
    const projectList = document.querySelector('.project-list');
    if (projectList && data.projects) {
      projectList.innerHTML = data.projects.map((project, i) => `
        <li class="project-item active" data-filter-item data-category="${project.category.toLowerCase()}">
          <div class="project-card">
            <figure class="project-img">
              <div class="project-item-icon-box project-image-editable" data-key="projects.${i}.image">
                <ion-icon name="eye-outline"></ion-icon>
              </div>
              <img src="${project.image}" alt="${project.title}" loading="lazy">
            </figure>
            
            <div class="project-metrics-list">
              ${project.metrics ? project.metrics.map((m, mi) => `
                <div class="metric-container" style="display: inline-block; margin-right: 8px;">
                  <span class="metric-badge editable-section" data-key="projects.${i}.metrics.${mi}">${m}</span>
                </div>
              `).join('') : ''}
            </div>

            <a href="${project.url || '#'}" target="_blank" class="project-url-link" style="text-decoration: none;" data-key="projects.${i}.url">
              <h3 class="project-title editable-section" data-key="projects.${i}.title" style="color: var(--white-2);">${project.title}</h3>
            </a>

            <p class="project-category editable-section" data-key="projects.${i}.category">${project.category}</p>
            
            <div class="project-tech-list">
              ${project.tech ? (Array.isArray(project.tech) ? project.tech : project.tech.split(',')).map((t, ti) => `
                <div class="tech-tag-container" style="display: inline-block; margin-right: 6px;">
                  <span class="tech-tag editable-section" data-key="projects.${i}.tech.${ti}">${t.trim()}</span>
                </div>
              `).join('') : ''}
            </div>

            <p class="project-text editable-section" data-key="projects.${i}.description" style="font-size: 13px; color: var(--light-gray-70); margin-top: 5px; text-align: left;">${project.description}</p>
            
            <div class="project-links admin-only-view" style="display: flex; gap: 10px; margin-top: 10px;">
              ${project.links.github ? `<a href="${project.links.github}" target="_blank" class="admin-btn">GitHub</a>` : ''}
              ${project.links.demo ? `<a href="${project.links.demo}" target="_blank" class="admin-btn">Demo</a>` : ''}
            </div>
          </div>
        </li>
      `).join('');
    }
  } catch (e) { console.error("Error populating projects:", e); }

  try {
    // Achievements Section
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
  } catch (e) { console.error("Error populating achievements:", e); }

  try {
    // Certifications Section
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
  } catch (e) { console.error("Error populating certifications:", e); }
};
