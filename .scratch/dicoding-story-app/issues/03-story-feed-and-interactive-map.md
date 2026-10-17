# 03: Synchronized Story Feed, Location Filter, & Multi-Layer Interactive Map (#/)

**What to build:** Allow authenticated **Authors** on the home page (`#/`) to browse the **Story Feed**, filter **Stories** via the **Location Filter**, inspect **Story Locations** on a multi-layer interactive digital map, and synchronize the **Active Story** selection in both directions between the feed list and map markers.

**Blocked by:** 01: App Shell, Custom View Transitions, Accessibility Landmarks, & Core Models Prefactor, 02: Author Registration, Login, Logout, & Router Auth Guard

**Status:** ready-for-agent

- [ ] Visiting `#/` fetches and displays the **Story Feed**, where each **Story** card renders the photo with a descriptive `alt` attribute, the **Author** name, the description, the formatted creation date, and **Story Location** metadata, along with loading and retryable error states.
- [ ] All displayed **Stories** that include a valid **Story Location** are plotted as markers with rich popups (thumbnail, **Author** name, description excerpt, coordinates, and detail link) on a Leaflet map featuring a layer control with at least three keyless tile layers (per ADR-0002).
- [ ] **Authors** can toggle the **Location Filter** between showing all **Stories** and showing only **Stories** that possess a **Story Location**, updating both the **Story Feed** and map markers accordingly.
- [ ] Selecting "Locate on Map" on a **Story** card sets that item as the **Active Story**, smoothly pans/zooms (`flyTo`) the map to its marker, opens its popup, and visually highlights both the card and marker; clicking a map marker similarly sets the **Active Story** and highlights the matching card in the **Story Feed**.
- [ ] The Home layout is responsive without overlapping elements at `375px`, `768px`, and `1024px` viewports, and all feed and filter controls are keyboard-operable.
- [ ] `HomePresenter` is strictly DOM-free (per ADR-0001) and covered by passing automated tests for feed loading, **Location Filter** toggling, and **Active Story** synchronization.
