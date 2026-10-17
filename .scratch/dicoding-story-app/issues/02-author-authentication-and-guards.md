# 02: Author Registration, Login, Logout, & Router Auth Guard

**What to build:** Enable visitors to register a new **Author** account and log in to access protected pages, enforce route authentication guards across the SPA, and dynamically update navigation controls including a working logout action, built using strict Passive View MVP.

**Blocked by:** 01: App Shell, Custom View Transitions, Accessibility Landmarks, & Core Models Prefactor

**Status:** resolved

- [ ] Visitors can register a new **Author** account on `#/register` with name, email, and password ($\ge 8$ characters), receiving immediate accessible validation feedback and clear error or success messages before redirecting to `#/login`.
- [ ] Registered **Authors** can sign in on `#/login` with email and password, persisting their session token and redirecting to the **Story Feed** (`#/`).
- [ ] Every input on the registration and login forms is paired with an explicit `<label for="...">`, supports full keyboard operation, and displays a loading state while asynchronous requests are in flight.
- [ ] Unauthenticated attempts to visit protected routes (`#/`, `#/stories/:id`, `#/add`) automatically redirect to `#/login`, and authenticated attempts to visit `#/login` or `#/register` automatically redirect to `#/`.
- [ ] The navigation header dynamically reflects authentication state (showing feed, add story, about, and logout controls when signed in; showing login, register, and about links when signed out), and activating Logout clears the session and navigates to `#/login`.
- [ ] Registration and Login flows are driven by DOM-free Presenters injected with their View and Model dependencies (per ADR-0001) and covered by passing automated tests.
