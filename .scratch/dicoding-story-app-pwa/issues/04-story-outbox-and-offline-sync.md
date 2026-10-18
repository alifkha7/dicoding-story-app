# 04: Story Outbox and Automatic Offline-to-Online Synchronization

**What to build:**
Enable reliable Draft Story composition and publishing when offline. If an Author submits a new story while connectivity is unavailable, the draft (photo Blob, description, coordinates) is captured into a local `story_outbox` IndexedDB store with prominent reassuring feedback ("Cerita tersimpan di antrean offline"). When the device reconnects to the internet (detected via the `online` event), the outbox synchronization engine automatically uploads pending stories to the Dicoding Story API and updates the view.

**Blocked by:** 03: IndexedDB Bookmarked Stories with Search, Filter, and CRUD Operations

**Status:** ready-for-agent

- [ ] Add `story_outbox` object store with auto-incrementing `outboxId` to `dicoding-story-db`.
- [ ] Provide database methods for queueing, fetching, and deleting outbox items.
- [ ] Update `AddStoryPresenter` to detect offline status (`navigator.onLine === false`) and divert submission to `story_outbox`.
- [ ] Build `OutboxSyncManager` that listens to `window.addEventListener('online')` and processes the outbox queue in FIFO order.
- [ ] Display visual toast/notification when an offline story is successfully uploaded upon reconnect.
- [ ] Unit tests verifying outbox queueing, offline diversion, and online event auto-upload.
