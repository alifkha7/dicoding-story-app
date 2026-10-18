# 02: Workbox Runtime Caching for Stories API, Photos, and Offline Reading

**What to build:**
Implement tiered Workbox runtime caching in the Service Worker so that previously viewed Stories in the Story Feed, Story Details, and photo assets remain accessible when connectivity is lost. An Author browsing the app while connected can switch their device into airplane mode, navigate between the home feed and story details, view story images, and inspect location coordinates without network failure.

**Blocked by:** 01: PWA Web App Manifest, Service Worker Precaching, and Installability

**Status:** done

- [x] Implement `NetworkFirst` runtime caching for `https://story-api.dicoding.dev/v1/stories*` with a 24-hour expiration plugin.
- [x] Implement `StaleWhileRevalidate` runtime caching for remote story images (`https://story-api.dicoding.dev/images/stories/*`) with a 60-entry cache limit.
- [x] Implement `CacheFirst` runtime caching for third-party assets (Leaflet CDN assets and fonts).
- [x] Provide graceful offline feedback when requesting new un-cached API data.
- [x] Verify that opening the home feed and story detail page in offline mode renders previously fetched stories and photos seamlessly.
