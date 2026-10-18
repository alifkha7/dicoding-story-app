import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from '../src/scripts/data/database';
import AddStoryPresenter from '../src/scripts/pages/stories/add-story-presenter';
import OutboxSyncManager from '../src/scripts/utils/outbox-sync-manager';

// In-memory mock stores for idb
const mockBookmarkStore = new Map();
const mockOutboxStore = new Map();
let outboxAutoId = 1;

vi.mock('idb', () => ({
  openDB: vi.fn(async () => ({
    put: vi.fn(async (storeName, val) => {
      if (storeName === 'bookmarked_stories') {
        mockBookmarkStore.set(val.id, val);
        return val.id;
      }
      if (storeName === 'story_outbox') {
        const key = val.outboxId || outboxAutoId++;
        const item = { ...val, outboxId: key };
        mockOutboxStore.set(key, item);
        return key;
      }
      return null;
    }),
    add: vi.fn(async (storeName, val) => {
      if (storeName === 'story_outbox') {
        const key = val.outboxId || outboxAutoId++;
        const item = { ...val, outboxId: key };
        mockOutboxStore.set(key, item);
        return key;
      }
      return null;
    }),
    get: vi.fn(async (storeName, key) => {
      if (storeName === 'bookmarked_stories') return mockBookmarkStore.get(key) || null;
      if (storeName === 'story_outbox') return mockOutboxStore.get(key) || null;
      return null;
    }),
    getAll: vi.fn(async (storeName) => {
      if (storeName === 'bookmarked_stories') return Array.from(mockBookmarkStore.values());
      if (storeName === 'story_outbox') return Array.from(mockOutboxStore.values());
      return [];
    }),
    count: vi.fn(async (storeName) => {
      if (storeName === 'story_outbox') return mockOutboxStore.size;
      if (storeName === 'bookmarked_stories') return mockBookmarkStore.size;
      return 0;
    }),
    delete: vi.fn(async (storeName, key) => {
      if (storeName === 'bookmarked_stories') mockBookmarkStore.delete(key);
      if (storeName === 'story_outbox') mockOutboxStore.delete(key);
    }),
  })),
}));

describe('Ticket 04: Story Outbox Database CRUD Operations', () => {
  beforeEach(() => {
    mockOutboxStore.clear();
    outboxAutoId = 1;
  });

  it('should queue a draft story with createdAt timestamp and return outboxId', async () => {
    const draft = {
      description: 'Cerita offline di pedesaan',
      photo: new Blob(['fake-image-bytes'], { type: 'image/jpeg' }),
      lat: -6.2,
      lon: 106.8,
    };

    const outboxId = await Database.queueDraftStory(draft);
    expect(outboxId).toBeDefined();

    const pending = await Database.getAllPendingStories();
    expect(pending).toHaveLength(1);
    expect(pending[0].outboxId).toBe(outboxId);
    expect(pending[0].description).toBe('Cerita offline di pedesaan');
    expect(pending[0].createdAt).toBeDefined();
    // Validate ISO string format
    expect(new Date(pending[0].createdAt).toISOString()).toBe(pending[0].createdAt);
  });

  it('should return pending story count correctly', async () => {
    expect(await Database.getPendingStoryCount()).toBe(0);

    await Database.queueDraftStory({ description: 'Draft 1', photo: null });
    await Database.queueDraftStory({ description: 'Draft 2', photo: null });

    expect(await Database.getPendingStoryCount()).toBe(2);
  });

  it('should remove pending story by outboxId', async () => {
    const id1 = await Database.queueDraftStory({ description: 'Draft 1', photo: null });
    const id2 = await Database.queueDraftStory({ description: 'Draft 2', photo: null });

    await Database.removePendingStory(id1);

    const pending = await Database.getAllPendingStories();
    expect(pending).toHaveLength(1);
    expect(pending[0].outboxId).toBe(id2);
    expect(await Database.getPendingStoryCount()).toBe(1);
  });
});

describe('Ticket 04: AddStoryPresenter Offline Diversion', () => {
  let fakeView;
  let fakeStoryModel;
  let fakeAuthModel;
  let fakeDatabase;

  const validPhoto = {
    size: 500 * 1024,
    type: 'image/jpeg',
  };

  beforeEach(() => {
    fakeView = {
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn(),
      showSuccess: vi.fn(),
      clearFeedback: vi.fn(),
      navigateToHome: vi.fn(),
    };

    fakeStoryModel = {
      addStory: vi.fn(),
    };

    fakeAuthModel = {
      getToken: vi.fn().mockReturnValue('mock-token-secret'),
    };

    fakeDatabase = {
      queueDraftStory: vi.fn().mockResolvedValue(101),
    };
  });

  it('should divert submission to outbox when navigator is offline', async () => {
    // Mock navigator.onLine = false
    const originalNavigator = globalThis.navigator;
    vi.stubGlobal('navigator', { ...originalNavigator, onLine: false });

    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
      database: fakeDatabase,
    });

    const result = await presenter.submitDraftStory({
      description: 'Cerita saat mode pesawat',
      photoBlob: validPhoto,
      lat: '-6.2088',
      lon: '106.8456',
    });

    expect(result).toEqual({ success: true, isOfflineQueued: true });
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
    expect(fakeDatabase.queueDraftStory).toHaveBeenCalledWith({
      description: 'Cerita saat mode pesawat',
      photo: validPhoto,
      lat: -6.2088,
      lon: 106.8456,
    });
    expect(fakeView.showSuccess).toHaveBeenCalledWith(
      expect.stringContaining('Koneksi offline: Cerita berhasil disimpan ke antrean lokal (outbox)')
    );
    expect(fakeView.navigateToHome).toHaveBeenCalled();
    expect(fakeView.hideLoading).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('should submit normally via storyModel when navigator is online', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    fakeStoryModel.addStory.mockResolvedValue({ error: false, message: 'success' });

    const presenter = new AddStoryPresenter({
      view: fakeView,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
      database: fakeDatabase,
    });

    const result = await presenter.submitDraftStory({
      description: 'Cerita online',
      photoBlob: validPhoto,
      lat: '-6.2088',
      lon: '106.8456',
    });

    expect(result).toBe(true);
    expect(fakeStoryModel.addStory).toHaveBeenCalledTimes(1);
    expect(fakeDatabase.queueDraftStory).not.toHaveBeenCalled();
    expect(fakeView.showSuccess).toHaveBeenCalledWith(expect.stringContaining('berhasil dibagikan'));

    vi.unstubAllGlobals();
  });
});

describe('Ticket 04: OutboxSyncManager Automatic Sync on Online Event', () => {
  let fakeStoryModel;
  let fakeAuthModel;
  let fakeDatabase;
  let syncManager;

  const mockPendingQueue = [
    {
      outboxId: 1,
      description: 'Draft tertunda 1',
      photo: { size: 100 },
      lat: -6.1,
      lon: 106.7,
      createdAt: '2026-10-18T10:00:00.000Z',
    },
    {
      outboxId: 2,
      description: 'Draft tertunda 2',
      photo: { size: 200 },
      lat: null,
      lon: null,
      createdAt: '2026-10-18T10:05:00.000Z',
    },
  ];

  beforeEach(() => {
    fakeStoryModel = {
      addStory: vi.fn().mockResolvedValue({ error: false, message: 'success' }),
    };

    fakeAuthModel = {
      getToken: vi.fn().mockReturnValue('mock-token-123'),
      isAuthenticated: vi.fn().mockReturnValue(true),
    };

    fakeDatabase = {
      getAllPendingStories: vi.fn().mockResolvedValue([...mockPendingQueue]),
      removePendingStory: vi.fn().mockResolvedValue(undefined),
      getPendingStoryCount: vi.fn().mockResolvedValue(2),
    };

    syncManager = new OutboxSyncManager({
      database: fakeDatabase,
      storyModel: fakeStoryModel,
      authModel: fakeAuthModel,
    });
  });

  afterEach(() => {
    if (syncManager) {
      syncManager.destroy();
    }
  });

  it('should sync all pending stories in FIFO order and delete them from outbox', async () => {
    const onSyncSuccess = vi.fn();
    const onSyncError = vi.fn();

    const results = await syncManager.syncPendingStories({
      onSyncSuccess,
      onSyncError,
    });

    expect(results).toHaveLength(2);
    expect(results[0].outboxId).toBe(1);
    expect(results[1].outboxId).toBe(2);

    expect(fakeStoryModel.addStory).toHaveBeenNthCalledWith(1, {
      token: 'mock-token-123',
      description: 'Draft tertunda 1',
      photo: mockPendingQueue[0].photo,
      lat: -6.1,
      lon: 106.7,
    });

    expect(fakeStoryModel.addStory).toHaveBeenNthCalledWith(2, {
      token: 'mock-token-123',
      description: 'Draft tertunda 2',
      photo: mockPendingQueue[1].photo,
      lat: null,
      lon: null,
    });

    expect(fakeDatabase.removePendingStory).toHaveBeenCalledWith(1);
    expect(fakeDatabase.removePendingStory).toHaveBeenCalledWith(2);
    expect(onSyncSuccess).toHaveBeenCalledTimes(2);
    expect(onSyncError).not.toHaveBeenCalled();
  });

  it('should handle item upload error without removing from outbox and continue remaining queue', async () => {
    fakeStoryModel.addStory
      .mockRejectedValueOnce(new Error('Network error on 1'))
      .mockResolvedValueOnce({ error: false });

    const onSyncSuccess = vi.fn();
    const onSyncError = vi.fn();

    const results = await syncManager.syncPendingStories({
      onSyncSuccess,
      onSyncError,
    });

    expect(fakeStoryModel.addStory).toHaveBeenCalledTimes(2);
    // Draft 1 failed, so not removed
    expect(fakeDatabase.removePendingStory).not.toHaveBeenCalledWith(1);
    // Draft 2 succeeded, so removed
    expect(fakeDatabase.removePendingStory).toHaveBeenCalledWith(2);

    expect(onSyncError).toHaveBeenCalledWith(expect.objectContaining({
      outboxId: 1,
      error: expect.any(Error),
    }));
    expect(onSyncSuccess).toHaveBeenCalledTimes(1);
  });

  it('should not sync if user is not authenticated', async () => {
    fakeAuthModel.isAuthenticated.mockReturnValue(false);
    fakeAuthModel.getToken.mockReturnValue(null);

    const onSyncSuccess = vi.fn();
    const results = await syncManager.syncPendingStories({ onSyncSuccess });

    expect(results).toEqual([]);
    expect(fakeStoryModel.addStory).not.toHaveBeenCalled();
    expect(onSyncSuccess).not.toHaveBeenCalled();
  });

  it('should trigger syncPendingStories automatically when window online event fires', async () => {
    const syncSpy = vi.spyOn(syncManager, 'syncPendingStories');
    syncManager.init();

    // Dispatch online event
    window.dispatchEvent(new Event('online'));

    expect(syncSpy).toHaveBeenCalled();
  });
});
