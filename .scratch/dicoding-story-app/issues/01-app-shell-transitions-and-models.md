# 01: App Shell, Custom View Transitions, Accessibility Landmarks, & Core Models Prefactor

**What to build:** Establish the foundational Single-Page Application (SPA) shell, accessible landmarks, intercepted "Skip to Content" keyboard behavior, router-managed hardware stream teardown lifecycle, custom View Transition animations, keyless multi-tile map helper, and the core authentication and Dicoding Story API models verified by automated tests.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The application shell provides semantic HTML5 landmarks (`header`, `nav`, `main`, `footer`), responsive layout tokens for `375px`, `768px`, and `1024px` viewports, and visible `:focus-visible` keyboard styles.
- [ ] Activating the "Skip to Content" link moves keyboard focus directly to the main content region without mutating the SPA hash route or triggering an unintended route change (per ADR-0003).
- [ ] Navigating between routes uses the View Transition API with a custom slide-and-fade animation while keeping the site header visually anchored and respecting `prefers-reduced-motion: reduce`, with a safe fallback when View Transitions are unsupported.
- [ ] Before rendering a new route, the router invokes the active page's teardown lifecycle hook and stops any registered active `MediaStream` tracks (per ADR-0003).
- [ ] `AuthModel` manages storing, reading, and clearing the authenticated **Author** profile and session token, and `StoryModel` wraps all required Dicoding Story API v1 endpoints (`register`, `login`, `getStories`, `getStoryDetail`, `addStory`).
- [ ] A reusable map helper configures Leaflet with three keyless tile layers (*OpenStreetMap Standard*, *OpenTopoMap*, and *Esri World Imagery*) via layer control, and the root student metadata file documents the keyless multi-tile setup (per ADR-0002).
- [ ] Automated unit tests pass for route parsing, router lifecycle teardown and skip-link handling, `AuthModel`, and `StoryModel`.
