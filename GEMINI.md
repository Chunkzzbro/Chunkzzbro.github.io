# GEMINI.md  
Project: Renjith Anil – ML Systems & Applied AI Portfolio  
Base Template: codewithsadee/vcard-personal-portfolio  
Deployment Target: GitHub Pages (Static Only)

---

# GLOBAL OBJECTIVE

Refactor the vCard template into a production-grade ML Systems engineering portfolio platform.

The final system must:

- Replace all placeholder content
- Reposition branding to ML Systems & Applied AI
- Implement structured, safe, persistent in-browser editing
- Maintain strict static-site compatibility (GitHub Pages)
- Introduce a formal documentation system
- Enforce incremental engineering workflow
- Preserve performance and responsiveness
- Harden against XSS and DOM corruption
- Maintain clean modular architecture

This is a controlled refactor — NOT a rewrite.

---

# STRICT WORKFLOW ENFORCEMENT (MANDATORY)

## 1. Incremental Development Only

Implement ONE logical unit at a time.

Examples:

- Update hero section
- Refactor About section
- Implement contentManager.js
- Add editor toggle
- Add localStorage persistence
- Create /docs folder
- Inject SEO metadata
- Refactor one JS module

Do NOT combine unrelated tasks.

---

## 2. Atomic Commit Enforcement

After each logical unit, Gemini must show:

- Files modified
- Clear summary of changes
- Diff-style explanation
- Proposed Conventional Commit message

Allowed prefixes:

- feat:
- fix:
- refactor:
- docs:
- seo:
- chore:

Example:
feat: implement localStorage content persistence

Adds portfolioContent_v1 storage key,
JSON serialization logic, and load override mechanism.


Gemini must then ask:

Approve commit? (yes/no)

No commit without explicit approval.

Never auto-commit.

---

## 3. No Bulk File Rewrites

- Modify only necessary lines
- Preserve formatting
- Do not delete unrelated logic
- Preserve CSS selector integrity
- Maintain layout responsiveness

---

# PHASE 1 — CONTENT REPLACEMENT

Remove all template demo content.

---

# HERO SECTION

Name:
Renjith Anil

Title:
Machine Learning Systems Engineer | Distributed AI & Production ML

Availability Line:
Available for SDE / ML Engineer Roles — 2026

Tagline:
Building real-time AI systems, distributed ML pipelines, and production-grade backend integrations.

Buttons:
- View Projects
- Download Resume
- GitHub → https://github.com/Chunkzzbro
- LinkedIn → https://linkedin.com/in/renjith-anil

Email:
renjithaniltvm@gmail.com

Location:
VIT Chennai, India

Theme:
Dark

Accent Color:
#2563eb

---

# ABOUT SECTION

B.Tech Computer Science (AI & ML) undergraduate (CGPA 9.49) specializing in scalable ML systems, distributed training, and backend-integrated AI deployments.

Key Work:

- Distributed CNN training using OpenMPI (40% training time reduction)
- Container-level anomaly detection pipeline (25% faster detection)
- Real-time computer vision systems (~30 FPS)
- AWS SageMaker deployment workflows
- Face recognition ranking system (~92% accuracy)

Primary Focus Areas:

- Scalable ML Systems Architecture
- Real-Time AI Inference Pipelines
- Distributed ML Training (MPI)
- ML Monitoring & Observability
- Backend + AI Integration

Strong foundation in:

Operating Systems, Networks, Data Structures & Algorithms, Databases, Probability & Statistics.

---

# SKILLS STRUCTURE

## Core CS
Data Structures & Algorithms  
OOP  
Operating Systems  
Computer Networks  
Databases  
Probability & Statistics  

## Programming
Python  
Java  
C++  
C  
SQL  
JavaScript  

## ML & AI
Regression  
Classification  
Autoencoders  
Random Forest  
CNN Architectures  
Distributed Training (MPI)  
MLFlow  

## Frameworks
PyTorch  
TensorFlow  
Keras  
scikit-learn  
OpenCV  
MediaPipe  
FastAPI  
Streamlit  

## Backend
Node.js  
Express.js  
REST APIs  
JWT  
Service Architecture  

## Cloud & DevOps
AWS (SageMaker, EC2, S3)  
Docker  
GitHub Actions  
Prometheus  
Linux  

## Game Development
Unity  
C#  
AI Pathfinding  
Tilemaps  
Physics Systems  

---

# EXPERIENCE

Cloud Control Solutions Inc — AI/ML Intern  
July 2023

- Built container-level anomaly detection pipeline
- Reduced anomaly detection time by 25%
- Integrated Prometheus telemetry
- Containerized deployment via Docker
- Documented production ML workflows

---

# PROJECT ORDER (STRICT PRIORITY)

1. Parallelized Leukemia Detection (Springer ICAC 2024)
   - 40% faster distributed CNN training
   - 92% validation accuracy
   - OpenMPI implementation

2. FaceMatch AI
   - 92% recognition accuracy
   - RetinaFace + ArcFace
   - Real-time similarity ranking

3. Real-Time Drowsiness Detection
   - 85% accuracy
   - ~30 FPS inference
   - Alert logic system

4. Real-Time Diabetes Prediction
   - 87% accuracy
   - AWS SageMaker deployment

5. Posture Correction System
   - 4,700 image dataset
   - 76% accuracy
   - ~30 FPS inference

6. MERN Movie Booking System

7. LIORA Unity Game

Each project card must support:
- Metrics badge
- Tech stack tags
- GitHub link
- Optional live demo link

---

# PHASE 2 — STRUCTURED PERSISTENT EDITING SYSTEM

Static-compatible only. No backend allowed.

## Activation

Ctrl + Shift + E

## Behavior

- Elements with `.editable-section` become contenteditable
- Edit mode banner appears: "EDIT MODE — NOT LIVE"
- Floating Save button appears

## Save Process

- Extract textContent only
- Serialize structured JSON
- Store in localStorage key:
portfolioContent_v1


## Load Process

- On page load:
  - If localStorage exists → override content
  - Else → load `/data/defaultContent.json`

## STRICT CONSTRAINTS

- Never store innerHTML
- Strip script tags
- Strip event attributes
- No DOM structural mutation
- No eval()
- No inline event handlers
- No external dependencies

Must remain GitHub Pages compatible.

---

# SECURITY REQUIREMENTS (STATIC SITE MODEL)

Primary risks:

- XSS via editable fields
- Script injection
- DOM corruption
- Malicious localStorage payload

Mitigation:

- Use textContent only
- Sanitize all stored data
- Reject `<script>`, `<iframe>`, inline JS
- Use strict mode
- Avoid global variable leakage
- No inline onclick attributes
- No external runtime CDN scripts

---

# PERFORMANCE REQUIREMENTS

- No blocking JS in `<head>`
- Use `defer`
- Avoid heavy libraries
- Remove unused CSS
- Optimize images
- Target Lighthouse ≥ 90

---

# CODE STRUCTURE REQUIREMENTS

Refactor JS into:
/assets/js/
ui.js
animations.js
contentManager.js
editor.js


Add:
/data/defaultContent.json


No monolithic index.js logic.

No global namespace pollution.

---

# PHASE 3 — DOCUMENTATION SYSTEM (MANDATORY)

Create:
/docs
PROJECT_OVERVIEW.md
ARCHITECTURE.md
FEATURE_ROADMAP.md
DECISION_LOG.md
CHANGELOG.md
DEV_LOG.md
DOCUMENTATION.md
SECURITY.md


## Documentation Requirements

Each document must:

- Explain purpose clearly
- Define architectural decisions
- Log major changes
- Maintain structured changelog
- Track feature additions
- Document security model
- Document editing system logic
- Explain rollback strategy

Documentation must be updated with every major feature.

Each documentation addition must follow incremental commit rules.

---

# SEO UPDATE

Title:
Renjith Anil | ML Systems Engineer

Meta Description:
Distributed ML, real-time AI systems, and production-grade backend ML integration.

Keywords:
Machine Learning Engineer, AI Systems Engineer, Distributed ML, Computer Vision, Backend ML Developer

Add:
- Open Graph tags
- Twitter card tags
- Proper canonical URL
- Favicon

---

# TESTING PROTOCOL (MANDATORY AFTER EACH PHASE)

Gemini must confirm:

- No console errors
- No undefined variables
- Mobile responsiveness intact
- Editing toggle works
- Persistence works
- Default content loads properly
- No layout shift
- No performance regression

---

# HOSTING DISCIPLINE (GITHUB PAGES)

- Use relative paths
- No localhost references
- Validate external links
- Use `rel="noopener noreferrer"`
- Ensure HTTPS compatibility
- No backend dependencies

---

# ROLLBACK STRATEGY

- Every logical unit → separate commit
- No mixed concerns
- Easy revert using git reset
- Maintain stable main branch

---

# FINAL ENFORCEMENT

Gemini must:

- Work incrementally
- Generate structured commit messages
- Ask approval before every commit
- Preserve template integrity
- Maintain static compatibility
- Maintain performance
- Maintain security
- Maintain documentation discipline
- Avoid uncontrolled refactors

End of file.