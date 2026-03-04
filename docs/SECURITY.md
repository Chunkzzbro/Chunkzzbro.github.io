# Security & Data Integrity

## Threat Model: Static Portfolio Management
Since the application lacks a server-side component, the primary attack vectors are **Cross-Site Scripting (XSS)** through user-inputted content and **Local Storage Manipulation**.

## Mitigation Strategies

### 1. XSS Prevention
- **DOM Injection:** The system strictly uses `textContent` for most dynamic fields. 
- **Template Literals:** Where HTML structures are necessary (e.g., project metrics), the system uses controlled string templates. 
- **User Input:** All data captured via the Admin Editor is treated as untrusted. Sanitization occurs during the serialization process to ensure no `<script>` or event-handler attributes (`onmouseover`, etc.) are persisted.

### 2. Administrative Locking
- **Authentication:** While the frontend `admin/admin` logic is a deterrent rather than a server-grade firewall, it effectively prevents accidental content corruption and hides management tools from casual visitors.
- **Session Management:** Authentication state is held in volatile memory and is lost upon page refresh, requiring a re-login for every management session.

### 3. Data Integrity & Fail-safes
- **Defensive Population:** `contentManager.js` uses `try-catch` blocks and existence checks for every data node. A failure in one section (e.g., project images) will not block the rendering of others or break navigation.
- **Hard Reset:** The `Ctrl+Alt+R` shortcut provides an emergency escape to clear corrupted local state and reload the code-based baseline.
