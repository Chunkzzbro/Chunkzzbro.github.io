# GEMINI.md  
Project: Renjith Anil – ML Systems & Applied AI Portfolio  
Base Template: codewithsadee/vcard-personal-portfolio  
Deployment Target: GitHub Pages (Static Only)

---

# GLOBAL OBJECTIVE

Refactor the vCard template into a production-grade ML Systems engineering portfolio platform with a built-in, secure, and versioned Content Management System (CMS).

The final system must:
- Position branding as ML Systems & Applied AI.
- Implement a secure, authenticated "Edit Mode".
- Provide a versioned edit history with restore points.
- Maintain strict static-site compatibility (no backend).
- Ensure high-performance and mobile responsiveness.
- Harden against XSS and malicious localStorage payloads.

---

# CURRENT ACTUAL STATE (SYNCED)

- [x] **Modular JS Architecture:** Logic separated into `ui.js`, `animations.js`, `contentManager.js`, and `editor.js`.
- [x] **Data-Driven Population:** UI is populated dynamically from `data/defaultContent.json`.
- [x] **Interactive Editor:** `Ctrl+Shift+E` activation (to be replaced by Auth button).
- [x] **Dynamic Lists:** Add/Delete functionality for Experience, Education, Skills, and Projects.
- [x] **Hover Link Editor:** Contextual URL editing for projects and resume.
- [x] **Reset to Defaults:** Ability to wipe localStorage and reload code baseline.

---

# CORE FUNCTIONALITIES (PENDING)

## 1. Admin Authentication
- **Entry Point:** "Edit Mode" button in sidebar next to "View Resume".
- **Login Block:** Centered modal on top of page.
- **Visuals:** Translucent "glassmorphism" overlay for the rest of the site.
- **Verification:** Username: `admin`, Password: `admin`.
- **Session:** Temporary session flag in memory (clears on reload).

## 2. Versioned Edit History
- **Pane:** Fixed-position window pane on the right side (slides in/out).
- **Triggers:** Reveal on specific right-side hover zone or button toggle.
- **Content:** List of saved versions with:
  - Timestamp
  - Title
  - Description
- **Default Save:** A permanent, undeletable "Factory Default" version (from `defaultContent.json`).
- **Save Flow:** Clicking "Save All Changes" prompts for a Title and Description before committing to history.

## 3. Security & Integrity
- **Constraints:** Never store `innerHTML`; use `textContent` only.
- **Sanitization:** Strip `<script>`, `<iframe>`, and inline event attributes from all user inputs.
- **Safe Persistence:** Validate `localStorage` structure on load before rendering.

---

# PHASE 3 — DOCUMENTATION (MANDATORY)

Populate `/docs` with:
- `PROJECT_OVERVIEW.md`: High-level goals and positioning.
- `ARCHITECTURE.md`: Module map and data flow.
- `FEATURE_ROADMAP.md`: Planned enhancements.
- `DECISION_LOG.md`: Rationale for architectural choices.
- `CHANGELOG.md`: Version history.
- `DEV_LOG.md`: Engineering notes.
- `DOCUMENTATION.md`: How to use the editor/auth.
- `SECURITY.md`: Threat model and sanitization logic.

---

# REFINED WORKFLOW (MANDATORY)

1. **Logical Unit Implementation:** One small, testable unit at a time.
2. **Approval Gate:** Every unit requires explicit user approval before `git commit`.
3. **Project State Sync:** Cross off tasks in `project_state.md` immediately after commit.
4. **Code Quality:** Qodo.ai style reviews for each unit (Logic, UX, Security).

---

# SEO CONFIGURATION

- **Title:** Renjith Anil | ML Systems & Applied AI
- **Meta:** Distributed ML, real-time AI systems, and production-grade backend integration.
- **Keywords:** Machine Learning Systems Engineer, Distributed AI, Production ML, Backend ML Developer.

End of file.