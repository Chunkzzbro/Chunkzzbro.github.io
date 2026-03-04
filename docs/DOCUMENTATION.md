# Portfolio Refactor Documentation

## Purpose

This document explains:

- What changes were made to the base template
- Why those changes were made
- How the editing and persistence system works
- How future modifications should be implemented

Base Template:
codewithsadee/vcard-personal-portfolio

This project converts a static template into a structured ML Systems engineering portfolio with persistent in-browser editing capability.

---

# 1. Structural Changes

## 1.1 Content Replacement

All placeholder demo content was removed and replaced with:

- Real experience (Cloud Control Solutions – AI/ML Intern)
- Production ML systems
- Distributed CNN research publication
- Real-time AI projects
- Backend + cloud integrations

The section hierarchy was preserved to maintain template responsiveness.

---

## 1.2 Repositioning Strategy

Original template: Generic personal portfolio  
Current version: ML Systems & Applied AI Engineer

Changes included:

- Rewriting hero tagline
- Reordering projects by technical depth
- Elevating distributed ML research as primary highlight
- Structuring skills into ML Systems, Backend, Cloud, Core CS

This shifts perception from “student portfolio” to “engineering systems portfolio”.

---

# 2. JavaScript Refactor

Original template used a monolithic JS structure.

New structure:

/assets/js/
- ui.js
- animations.js
- contentManager.js
- editor.js

This improves:

- Separation of concerns
- Maintainability
- Scalability
- Debugging clarity

---

# 3. Persistent In-Browser Editing System

## 3.1 Objective

Allow live editing of text content directly on the webpage, without backend dependency, while preserving layout integrity.

## 3.2 How It Works

When edit mode is activated:

1. All elements with class `.editable-section` become:
   contenteditable = true

2. A floating "Save Changes" button appears.

3. On clicking Save:
   - The script extracts innerText of each editable section
   - Serializes the data into structured JSON
   - Stores it in localStorage under key:
     portfolioContent_v1

4. On page load:
   - The system checks localStorage
   - If data exists → override default content
   - If not → load defaultContent.json

This ensures persistence across page refreshes.

---

## 3.3 Example Implementation Snippet

Example of saving content:

```js
function saveContent() {
  const sections = document.querySelectorAll(".editable-section");
  const contentData = {};

  sections.forEach((section, index) => {
    contentData[`section_${index}`] = section.innerText;
  });

  localStorage.setItem("portfolioContent_v1", JSON.stringify(contentData));
}