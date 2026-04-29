# Renjith Anil — Portfolio (Editable Static CMS)

A personal portfolio website with a **built-in content management system** — edit everything directly in the browser without touching code, all while running as a zero-backend static site on GitHub Pages.

🌐 **Live site:** [chunkzzbro.github.io](https://chunkzzbro.github.io/)

Built on top of [codewithsadee/vcard-personal-portfolio](https://github.com/codewithsadee/vcard-personal-portfolio), extended with a modular JavaScript engine that adds authenticated editing, version history, and full CRUD for all content sections.

## Features

- **Inline Editing** — Click "Edit Mode", log in, and edit any text directly on the page.
- **Full CRUD** — Add or delete projects, experience, education, skills, achievements, certifications, and focus areas.
- **Image & Link Editor** — Hover over any link, image, or social icon to edit its URL via a floating input bar.
- **Project Categories** — Multi-category filtering with dynamic tab management. Create new categories or remove unused ones.
- **Version History** — Save named snapshots of your content, restore any previous version, or set a custom default baseline.
- **Hard Reset** — `Ctrl+Alt+R` wipes all edits and returns to the factory default.
- **No Backend Required** — All data persists in the browser's localStorage. Deploy anywhere that serves static files.

## How It Works

All portfolio content lives in `data/defaultContent.json`. On page load, the content manager checks localStorage for saved edits — if found, those are used instead. The DOM is populated dynamically from this data, and every text element is tagged with a `data-key` that maps back to the JSON structure.

When you save in edit mode, the editor reads all edited fields back from the DOM, updates the data model, and writes it to localStorage along with a versioned history snapshot.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full module map and data flow.

## Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/Chunkzzbro/Chunkzzbro.github.io.git
   ```

2. **Serve locally** — open `index.html` directly, or use any static server:
   ```bash
   npx serve .
   ```

3. **Edit content** — click "Show Contacts" in the sidebar, then "Edit Mode". Login with `admin` / `admin`.

4. **Customize your data** — edit `data/defaultContent.json` to replace the placeholder content with your own. This is the factory baseline that loads on first visit.

5. **Deploy** — push to GitHub and enable GitHub Pages, or deploy to any static hosting (Netlify, Vercel, Cloudflare Pages).

## Project Structure

```
index.html                    — Main HTML shell (all content injected dynamically)
data/defaultContent.json      — Portfolio content (the single source of truth)
assets/
  css/style.css               — All styles (original template + admin/editor additions)
  js/
    script.js                 — Entry point, boot sequence
    contentManager.js          — Data loading, localStorage persistence, DOM population
    editor.js                  — Admin CMS engine (auth, editing, versioning, CRUD)
    ui.js                      — Sidebar, navigation, project filtering
    animations.js              — Page transition animations
docs/
    ARCHITECTURE.md            — Module map and data flow
    DOCUMENTATION.md           — Admin editor user manual
    SECURITY.md                — Threat model and XSS mitigations
    DECISION_LOG.md            — Rationale for key architectural choices
```

## Customization Guide

**To use this as your own portfolio:**

1. Edit `data/defaultContent.json` — replace name, title, about text, projects, skills, etc.
2. Replace images in `assets/images/` — drop in your avatar and project screenshots.
3. Update the social links and contact info in the JSON.
4. Update `<title>` and `<meta>` tags in `index.html` for SEO.

**To add a new content section:**

1. Add the data structure to `defaultContent.json`.
2. Add a population block in `contentManager.js` → `populateDOM()`.
3. Add CRUD support in `editor.js` → `injectListControls()` and `addItem()`.
4. Add the HTML container in `index.html`.

## Admin Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+E` | Toggle edit mode (requires login) |
| `Ctrl+Alt+R` | Hard reset — clears all saved edits |

## Author

**Renjith Anil** — ML Systems & Applied AI Engineer
- GitHub: [@Chunkzzbro](https://github.com/Chunkzzbro)
- Email: renjithaniltvm@gmail.com

All custom CMS engine code (`assets/js/contentManager.js`, `assets/js/editor.js`, `assets/js/ui.js`, `assets/js/animations.js`, the JSON content schema, version history, auth flow, and inline editing system) authored by me.

## Credits

- Original visual template: [codewithsadee/vcard-personal-portfolio](https://github.com/codewithsadee/vcard-personal-portfolio) (MIT License)
- Icons: [Ionicons](https://ionic.io/ionicons)
- Font: [Poppins](https://fonts.google.com/specimen/Poppins) via Google Fonts

## License

MIT — see [LICENSE](LICENSE)
