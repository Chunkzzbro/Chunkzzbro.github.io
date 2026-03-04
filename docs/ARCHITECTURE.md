# Architecture

## Base Template
codewithsadee/vcard-personal-portfolio

## Structural Modifications
- Replace placeholder content
- Modularize JS
- Add content persistence layer
- Add editing engine

## Folder Structure

/data
  defaultContent.json

/admin
  editor.js
  contentLoader.js

/assets/js
  ui.js
  animations.js
  contentManager.js
  editor.js

## Content Persistence

- JSON-based structure
- LocalStorage key: portfolioContent_v1
- Fallback to defaultContent.json

## Deployment Model
Static hosting (GitHub Pages compatible)