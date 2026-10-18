# 05: Web Push Notification with VAPID, NotificationClick Navigation, and Netlify Deployment

**What to build:**
Deliver background Story notifications and prepare the application for public evaluation. An authenticated Author can toggle Push Notifications on/off in the app header, granting permission and subscribing to the Dicoding Story API with the provided VAPID public key. Incoming push messages render dynamic titles, icons, and body text. Clicking the notification triggers `notificationclick` in the Service Worker, which opens or focuses the browser window directly on the announced Story's detail page. The project is then built and deployed to Netlify with SPA redirects, with the active deployment URL recorded in `STUDENT.txt`.

**Blocked by:** 
- 01: PWA Web App Manifest, Service Worker Precaching, and Installability
- 02: Workbox Runtime Caching for Stories API, Photos, and Offline Reading
- 03: IndexedDB Bookmarked Stories with Search, Filter, and CRUD Operations
- 04: Story Outbox and Automatic Offline-to-Online Synchronization

**Status:** closed

- [x] Implement VAPID key conversion helper (`urlBase64ToUint8Array`).
- [x] Implement `PushManager` service to handle permission requests, `pushManager.subscribe()`, and Dicoding Story API subscription endpoints.
- [x] Add accessible Push Notification toggle button in navigation header displaying current subscription state.
- [x] Implement `push` event listener in `src/sw.js` parsing dynamic payload (title, options: body, icon, badge, data with url).
- [x] Implement `notificationclick` event listener in `src/sw.js` navigating to `event.notification.data.url` (e.g. `#/stories/:id`).
- [x] Configure `public/_redirects` for Netlify (`/* /index.html 200`).
- [x] Build production bundle (`npm run build`) and verify PWA installability and deployment.
- [x] Record live deployment URL in `STUDENT.txt`.

