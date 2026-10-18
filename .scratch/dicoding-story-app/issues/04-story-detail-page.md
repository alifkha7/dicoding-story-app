# 04: Story Detail View with Dedicated Multi-Layer Location Map (#/stories/:id)

**What to build:** Allow authenticated **Authors** to open a dedicated detail view (`#/stories/:id`) for any **Story** to read its full content and inspect its **Story Location** on a dedicated multi-layer interactive map.

**Blocked by:** 01: App Shell, Custom View Transitions, Accessibility Landmarks, & Core Models Prefactor, 02: Author Registration, Login, Logout, & Router Auth Guard

**Status:** resolved

- [ ] Navigating to `#/stories/:id` fetches the requested **Story** from the API and displays its full-resolution photo with descriptive `alt` text, **Author** name, formatted publication date, full description, and coordinate details, with accessible loading and error states.
- [ ] When the **Story** has a valid **Story Location**, the detail view renders a dedicated Leaflet map with multi-tile layer control (per ADR-0002) centered on those coordinates with an open marker popup; when the **Story** has no coordinates, a clear accessible status message is shown instead.
- [ ] Includes an accessible back-navigation control to return to the **Story Feed** (`#/`), with custom View Transition continuity and responsive layout across `375px`, `768px`, and `1024px` viewports.
- [ ] `StoryDetailPresenter` is strictly DOM-free (per ADR-0001) and covered by passing automated tests for detail loading, coordinate presence/absence handling, and error states.
