# 05: Add Draft Story with Dual-Mode Camera/File Compression & Two-Way Map Picker (#/add)

**What to build:** Enable authenticated **Authors** on `#/add` to compose and publish a new **Draft Story** with a description, a photo provided via either file upload or live device camera capture (automatically compressed under 1 MB with guaranteed hardware stream cleanup), and an optional **Story Location** selected via two-way synchronized map click and coordinate inputs.

**Blocked by:** 01: App Shell, Custom View Transitions, Accessibility Landmarks, & Core Models Prefactor, 02: Author Registration, Login, Logout, & Router Auth Guard

**Status:** ready-for-agent

- [ ] **Authors** can enter a **Draft Story** description and choose between *Upload File* and *Live Camera* (`getUserMedia`) modes, with every form input (`description`, file picker, camera selector, `latitude`, `longitude`) paired with an explicit `<label for="...">`.
- [ ] In *Live Camera* mode, **Authors** can start the camera preview, switch between available video input devices, capture a photo onto a canvas preview, retake the photo, or close the camera; all active `MediaStream` tracks are stopped immediately upon photo capture, manual camera close, form submission, or route navigation away from `#/add` (per ADR-0003).
- [ ] Both uploaded image files and camera snapshots are validated as images and automatically resized/compressed via HTML5 Canvas so the resulting photo payload is strictly under the 1 MB API limit before submission.
- [ ] **Authors** can set the **Story Location** either by clicking/dragging a marker on the multi-layer Leaflet map or by entering `Latitude` and `Longitude` values in labeled inputs (with two-way synchronization, a "Use My Current Location" geolocation button, and a "Clear Location" action).
- [ ] Submitting the form validates all fields, sends the asynchronous `multipart/form-data` request to `POST /stories`, shows loading and success/error feedback, and redirects to `#/` upon success.
- [ ] `AddStoryPresenter` is strictly DOM-free (per ADR-0001) and covered by passing automated tests for validation rules, coordinate validation, submission lifecycle, and teardown stream cleanup hooks.
