# 0006. Runtime Caching Topology for Offline Story Reading

We define a tiered Workbox routing strategy in `src/sw.js`:
1. `NetworkFirst` (with cache expiration) for Dicoding Story API endpoints (`https://story-api.dicoding.dev/v1/stories*`) so authenticated members can read recently viewed stories even without network access.
2. `StaleWhileRevalidate` for remote story photos (`https://story-api.dicoding.dev/images/stories/*`) with a cache limit of 60 entries to keep network usage lean.
3. `CacheFirst` for third-party static assets (Leaflet stylesheet/scripts, Google Fonts) with long-lived max age.

This guarantees compliance with Kriteria 3 Advance without stale feed responses dominating online browsing.
