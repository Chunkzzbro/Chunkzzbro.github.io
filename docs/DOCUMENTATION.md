# User Manual: Administrative Suite

## 1. Entering Admin Mode
- **Method A:** Click the "**Edit Mode**" button in the sidebar.
- **Method B:** Press `Ctrl + Shift + E`.
- **Credentials:** 
  - Username: `admin`
  - Password: `admin`

## 2. Content Editing
Once in Admin Mode, the interface becomes interactive:
- **Text:** Any text highlighted with a subtle border is directly editable. Simply click and type.
- **Lists:** Look for the "**+ Add**" and "**Delete**" buttons to manage Projects, Experience blocks, Skills, and Focus Areas.
- **Links & Images:** Hover your mouse over any Project Title, Image, or Sidebar Social Icon to reveal the **Floating URL Editor**. Enter the new URL and click "**Set**".

## 3. Version Control & Saving
- **Save All Changes:** Clicking this button in the bottom-right bar will prompt you for a **Version Title**. This creates a new restore point in your history.
- **History Pane:** Click the "**History**" tab on the right side of the screen to view all previous saves.
- **Restoring:** Click "**Restore**" on any item in the history list to instantly revert the entire site to that state.
- **Setting a Baseline:** Click "**Set Default**" on your preferred version. Future resets will now return to this version instead of the factory code.

## 4. Troubleshooting (Hard Reset)
If the data becomes corrupted or the UI becomes unresponsive:
- **Shortcut:** Press `Ctrl + Alt + R`.
- **Action:** This will wipe all local data and reload the site from your designated default version.

---
*Note: Edits are stored in your browser's LocalStorage. To move edits between devices, you must export/import the `portfolioContent_v1` key.*
