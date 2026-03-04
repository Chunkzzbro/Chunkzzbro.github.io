# System Architecture

## Core Philosophy
The system follows a **Separation of Concerns** (SoC) model, modularizing logic into specialized JS engines to maintain a fully static, backend-less architecture compatible with GitHub Pages.

## Module Map

### 1. `contentManager.js` (The Data Engine)
- **Role:** Bridges the JSON data layer and the DOM.
- **Features:** 
  - Defensive population (fail-safe checks).
  - Multi-category project mapping.
  - Dynamic rendering of metrics badges and tech tags.

### 2. `editor.js` (The Management Suite)
- **Role:** Handles the Administrative UX.
- **Features:**
  - **Authentication:** `admin/admin` logic and glassmorphism UI.
  - **CRUD Operations:** Logic for adding/deleting projects, experience, and focus areas.
  - **Floating Link Editor:** Context-aware hover input for URLs and Images.
  - **Shortcuts:** `Ctrl+Shift+E` (Edit) and `Ctrl+Alt+R` (Hard Reset).

### 3. `ui.js` (The Interface Controller)
- **Role:** Manages core template behaviors.
- **Features:**
  - Tab navigation and sidebar toggles.
  - Advanced Multi-Category filtering logic.

### 4. `animations.js` (The Polish Layer)
- **Role:** Subtle visual feedback.
- **Features:** Section entry transitions via MutationObserver.

## Data Flow
1. **Load:** `contentManager` checks `localStorage` -> fallback to `defaultContent.json`.
2. **Render:** DOM is populated with `editable-section` hooks.
3. **Edit:** `editor` captures changes and updates the in-memory `currentData` object.
4. **Persist:** `saveContent` serializes JSON to `localStorage` and commits a version to the History array.
