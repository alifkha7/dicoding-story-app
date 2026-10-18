import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from '../src/scripts/data/database';
import FavoritesPresenter from '../src/scripts/pages/favorites/favorites-presenter';

const mockDbStore = new Map();

vi.mock('idb', () => ({
  openDB: vi.fn(async () => ({
    put: vi.fn(async (storeName, val) => {
      mockStorePut(val);
      return val.id;
    }),
    get: vi.fn(async (storeName, id) => mockDbStore.get(id) || null),
    getAll: vi.fn(async (storeName) => Array.from(mockDbStore.values())),
    delete: vi.fn(async (storeName, id) => {
      mockDbStore.delete(id);
    }),
  })),
}));

function mockStorePut(val) {
  if (val && val.id) {
    mockDbStore.set(val.id, val);
  }
}

describe('Database Model Tests', () => {
  const sampleStory1 = {
    id: 'story-fav-1',
    name: 'Alif',
    description: 'Cerita pemandangan gunung',
    photoUrl: 'https://img.test/fav1.png',
    createdAt: '2026-02-01T10:00:00.000Z',
    lat: -7.250445,
    lon: 112.768845,
  };

  const sampleStory2 = {
    id: 'story-fav-2',
    name: 'Budi',
    description: 'Cerita di kedai kopi tanpa lokasi',
    photoUrl: 'https://img.test/fav2.png',
    createdAt: '2026-02-02T12:00:00.000Z',
    lat: null,
    lon: null,
  };

  beforeEach(() => {
    mockDbStore.clear();
  });

  it('should save a story to bookmarks', async () => {
    await Database.saveBookmark(sampleStory1);
    const retrieved = await Database.getBookmark('story-fav-1');
    expect(retrieved).toEqual(sampleStory1);
  });

  it('should return null when getting non-existent bookmark or invalid id', async () => {
    const result = await Database.getBookmark('unknown-id');
    expect(result).toBeNull();

    const nullResult = await Database.getBookmark(null);
    expect(nullResult).toBeNull();
  });

  it('should retrieve all bookmarks', async () => {
    await Database.saveBookmark(sampleStory1);
    await Database.saveBookmark(sampleStory2);

    const all = await Database.getAllBookmarks();
    expect(all).toHaveLength(2);
    expect(all).toEqual(expect.arrayContaining([sampleStory1, sampleStory2]));
  });

  it('should delete a bookmark by id', async () => {
    await Database.saveBookmark(sampleStory1);
    await Database.saveBookmark(sampleStory2);

    await Database.deleteBookmark('story-fav-1');
    const all = await Database.getAllBookmarks();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('story-fav-2');

    const deleted = await Database.getBookmark('story-fav-1');
    expect(deleted).toBeNull();
  });

  it('should correctly check if a story is bookmarked', async () => {
    expect(await Database.isBookmarked('story-fav-1')).toBe(false);

    await Database.saveBookmark(sampleStory1);
    expect(await Database.isBookmarked('story-fav-1')).toBe(true);

    await Database.deleteBookmark('story-fav-1');
    expect(await Database.isBookmarked('story-fav-1')).toBe(false);

    expect(await Database.isBookmarked(null)).toBe(false);
  });
});

describe('FavoritesPresenter Tests', () => {
  let fakeView;
  let fakeDatabase;

  const mockBookmarks = [
    {
      id: 'story-1',
      name: 'Dimas Kurniawan',
      description: 'Menikmati senja di pantai Kuta',
      photoUrl: 'https://img.test/1.png',
      createdAt: '2026-01-01T00:00:00.000Z',
      lat: -8.7185,
      lon: 115.1686,
    },
    {
      id: 'story-2',
      name: 'Siti Rahma',
      description: 'Diskusi komunitas teknologi di perpustakaan',
      photoUrl: 'https://img.test/2.png',
      createdAt: '2026-01-02T00:00:00.000Z',
      lat: null,
      lon: null,
    },
    {
      id: 'story-3',
      name: 'Ahmad Fauzi',
      description: 'Pemandangan pegunungan Bromo',
      photoUrl: 'https://img.test/3.png',
      createdAt: '2026-01-03T00:00:00.000Z',
      lat: -7.9425,
      lon: 112.9530,
    },
  ];

  beforeEach(() => {
    fakeView = {
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      renderBookmarks: vi.fn(),
      showEmptyState: vi.fn(),
      showError: vi.fn(),
    };

    fakeDatabase = {
      getAllBookmarks: vi.fn().mockResolvedValue([...mockBookmarks]),
      deleteBookmark: vi.fn().mockResolvedValue(undefined),
      getBookmark: vi.fn().mockImplementation((id) => Promise.resolve(mockBookmarks.find((b) => b.id === id) || null)),
      saveBookmark: vi.fn().mockResolvedValue(undefined),
      isBookmarked: vi.fn().mockImplementation((id) => Promise.resolve(mockBookmarks.some((b) => b.id === id))),
    };
  });

  it('should load all bookmarks and render them on initial load', async () => {
    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    expect(fakeView.showLoading).toHaveBeenCalled();
    expect(fakeDatabase.getAllBookmarks).toHaveBeenCalled();
    expect(fakeView.renderBookmarks).toHaveBeenCalledWith([
      mockBookmarks[2],
      mockBookmarks[1],
      mockBookmarks[0],
    ]);
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should show empty state when there are no bookmarks', async () => {
    fakeDatabase.getAllBookmarks.mockResolvedValue([]);

    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    expect(fakeView.showLoading).toHaveBeenCalled();
    expect(fakeView.showEmptyState).toHaveBeenCalled();
    expect(fakeView.renderBookmarks).not.toHaveBeenCalled();
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should handle database error when loading bookmarks', async () => {
    fakeDatabase.getAllBookmarks.mockRejectedValue(new Error('IndexedDB read failed'));

    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    expect(fakeView.showError).toHaveBeenCalledWith('IndexedDB read failed');
    expect(fakeView.hideLoading).toHaveBeenCalled();
  });

  it('should filter bookmarks by search query matching name or description', async () => {
    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    // Search by author name
    presenter.searchBookmarks('dimas');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([mockBookmarks[0]]);

    // Search by description keyword
    presenter.searchBookmarks('bromo');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([mockBookmarks[2]]);

    // Search with no matches
    presenter.searchBookmarks('nonexistent-keyword');
    expect(fakeView.showEmptyState).toHaveBeenCalled();

    // Clear search returns full list sorted newest first
    presenter.searchBookmarks('');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([
      mockBookmarks[2],
      mockBookmarks[1],
      mockBookmarks[0],
    ]);
  });

  it('should filter bookmarks by location status', async () => {
    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    // Filter to only located stories (sorted newest: story-3, story-1)
    presenter.filterBookmarks('located');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([mockBookmarks[2], mockBookmarks[0]]);

    // Filter back to all (sorted newest: story-3, story-2, story-1)
    presenter.filterBookmarks('all');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([
      mockBookmarks[2],
      mockBookmarks[1],
      mockBookmarks[0],
    ]);
  });

  it('should combine search query and location filter', async () => {
    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    // Filter by located first
    presenter.filterBookmarks('located');
    // Search for Pantai (in story-1)
    presenter.searchBookmarks('pantai');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([mockBookmarks[0]]);

    // Search for perpustakaan (in story-2 which has no location) -> empty state
    presenter.searchBookmarks('perpustakaan');
    expect(fakeView.showEmptyState).toHaveBeenCalled();
  });

  it('should remove a bookmark, delete from database, and reload/update list', async () => {
    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    // When deleteBookmark is called, fakeDatabase returns remaining
    fakeDatabase.getAllBookmarks.mockResolvedValue([mockBookmarks[1], mockBookmarks[2]]);

    await presenter.removeBookmark('story-1');

    expect(fakeDatabase.deleteBookmark).toHaveBeenCalledWith('story-1');
    expect(fakeDatabase.getAllBookmarks).toHaveBeenCalledTimes(2);
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([mockBookmarks[2], mockBookmarks[1]]);
  });

  it('should handle error when removing bookmark fails', async () => {
    fakeDatabase.deleteBookmark.mockRejectedValue(new Error('Failed to delete'));

    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();
    await presenter.removeBookmark('story-1');

    expect(fakeView.showError).toHaveBeenCalledWith('Failed to delete');
  });

  it('should sort bookmarks by newest (default) and oldest', async () => {
    const presenter = new FavoritesPresenter({
      view: fakeView,
      database: fakeDatabase,
    });

    await presenter.loadBookmarks();

    // Default sorting is newest first: story-3 (Jan 3), story-2 (Jan 2), story-1 (Jan 1)
    expect(fakeView.renderBookmarks).toHaveBeenCalledWith([
      mockBookmarks[2],
      mockBookmarks[1],
      mockBookmarks[0],
    ]);
    expect(presenter.getSortBy()).toBe('newest');

    // Change sorting to oldest first: story-1, story-2, story-3
    presenter.sortBookmarks('oldest');
    expect(presenter.getSortBy()).toBe('oldest');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([
      mockBookmarks[0],
      mockBookmarks[1],
      mockBookmarks[2],
    ]);

    // Switch back to newest
    presenter.sortBookmarks('newest');
    expect(presenter.getSortBy()).toBe('newest');
    expect(fakeView.renderBookmarks).toHaveBeenLastCalledWith([
      mockBookmarks[2],
      mockBookmarks[1],
      mockBookmarks[0],
    ]);
  });
});

describe('Database getPendingStories Alias', () => {
  it('should have getPendingStories as an alias to getAllPendingStories', async () => {
    expect(typeof Database.getPendingStories).toBe('function');
    const pending = await Database.getPendingStories();
    expect(Array.isArray(pending)).toBe(true);
  });
});
