# 0004. Service Worker with InjectManifest for PWA Precaching and Web Push

We use `vite-plugin-pwa` with `InjectManifest` strategy pointing to a custom Service Worker script (`src/sw.js`) rather than zero-config `generateSW`.

This satisfies both Kriteria 2 (Web Push Notification with VAPID, dynamic payload rendering, and `notificationclick` navigation) and Kriteria 3 (Application Shell precaching and Workbox runtime caching) within a single coherent Service Worker lifecycle. Zero-config `generateSW` lacks straightforward support for custom `push` and `notificationclick` event listeners required for Bintang 5 criteria.
