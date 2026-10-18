# 03: IndexedDB Bookmarked Stories with Search, Filter, and CRUD Operations

**What to build:**
Provide local bookmarking capabilities for community Stories backed by an IndexedDB database wrapper (`idb`). An Author can click a bookmark toggle button on any story card or detail view to save or remove a story. On a dedicated "Cerita Tersimpan" (`#/favorites`) route, the Author can browse all saved stories, search them by author name or description text, filter them by location availability, and remove bookmarks with immediate visual feedback.

**Blocked by:** None (can start immediately in parallel with PWA shell)

**Status:** ready-for-agent

- [ ] Initialize `dicoding-story-db` with `bookmarked_stories` object store using `idb`.
- [ ] Provide Database Model methods: `saveBookmark(story)`, `getBookmark(id)`, `getAllBookmarks()`, `deleteBookmark(id)`, `isBookmarked(id)`.
- [ ] Add bookmark toggle button with accessible labels and active state to Story Card and Story Detail views.
- [ ] Build dedicated `FavoritesPage` and `FavoritesPresenter` mounted at `#/favorites`.
- [ ] Implement live client-side search input and location filter ("Semua" vs "Dengan Lokasi") on the favorites view.
- [ ] Unit tests for `FavoritesPresenter` and database operations covering bookmark CRUD and filtering.
