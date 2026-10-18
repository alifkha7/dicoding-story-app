# 0005. Dual IndexedDB Object Stores for Bookmarks and Offline Outbox

We use the lightweight `idb` Promise-based wrapper around `window.indexedDB` to manage a local database (`story-app-db`) containing two distinct object stores:
1. `bookmarked_stories`: for persistent local bookmarking with CRUD operations and client-side searching/filtering.
2. `story_outbox`: for queuing Draft Stories created while offline, automatically synchronized when the browser emits the `online` event.

This satisfies Kriteria 4 Advance (CRUD operations with sorting/filtering plus offline-to-online background synchronization) while keeping bookmark storage cleanly isolated from ephemeral outgoing network retry state.
