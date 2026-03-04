# Decision Log

## Decision 1: Static Architecture vs. Headless CMS
- **Decision:** Built a custom client-side JSON editor.
- **Rationale:** Maintaining a purely static site ensures zero-cost hosting (GitHub Pages) and eliminates the need for managing a third-party CMS or backend API. It demonstrates "Full Stack" thinking within a constrained environment.

## Decision 2: LocalStorage Persistence
- **Decision:** Use `localStorage` as the primary persistence layer.
- **Rationale:** Provides instant feedback and zero latency. For a personal portfolio, the owner is the only editor, making client-side storage a practical and efficient choice.

## Decision 3: Versioning System
- **Decision:** Implement a custom "Restore Point" system within LocalStorage.
- **Rationale:** Since there is no database to revert, a version history pane was necessary to prevent data loss during experimental content edits and to allow for custom "Default" states.

## Decision 4: Multi-Category Filtering
- **Decision:** Switch from single-string categories to array-based labels.
- **Rationale:** Recruiter feedback often highlights that "Applied AI" work overlaps multiple domains (e.g., CV + Systems). Multi-label support allows projects to be discovered under all relevant tags.
