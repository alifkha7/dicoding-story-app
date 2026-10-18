# 01: PWA Web App Manifest, Service Worker Precaching, and Installability

**What to build:**
Enable full Progressive Web App installability and instant application shell offline loading. An Author visiting the application on desktop or mobile sees an install prompt/option, can install the app to their home screen with high-resolution icons (including maskable), and can launch directly via app shortcuts for "Tambah Cerita" and "Cerita Tersimpan". The service worker precaches the entire application shell, ensuring zero browser errors even when launched with no network connection.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Complete `manifest.webmanifest` with name, short name, start_url, standalone display, theme/background colors, 192x192 & 512x512 maskable icons, shortcuts, and wide/narrow screenshots.
- [x] Zero warnings in Chrome DevTools Application -> Manifest panel.
- [x] Configure `vite-plugin-pwa` with `InjectManifest` strategy targeting `src/sw.js`.
- [x] Implement `precacheAndRoute(self.__WB_MANIFEST)` in `src/sw.js` to cache build artifacts.
- [x] Register Service Worker cleanly in client startup without throwing or blocking initial DOM paint.
- [x] Verify application shell loads successfully in browser offline mode (Network -> Offline).
