import { openDB } from 'idb';

const DATABASE_NAME = 'dicoding-story-db';
const DATABASE_VERSION = 1;
const BOOKMARK_STORE_NAME = 'bookmarked_stories';
const OUTBOX_STORE_NAME = 'story_outbox';

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(BOOKMARK_STORE_NAME)) {
          const bookmarkStore = database.createObjectStore(BOOKMARK_STORE_NAME, {
            keyPath: 'id',
          });
          bookmarkStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!database.objectStoreNames.contains(OUTBOX_STORE_NAME)) {
          const outboxStore = database.createObjectStore(OUTBOX_STORE_NAME, {
            keyPath: 'outboxId',
            autoIncrement: true,
          });
          outboxStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

const Database = {
  async saveBookmark(story) {
    if (!story || !story.id) return null;
    const db = await getDb();
    return db.put(BOOKMARK_STORE_NAME, story);
  },

  async getBookmark(id) {
    if (!id) return null;
    const db = await getDb();
    const result = await db.get(BOOKMARK_STORE_NAME, id);
    return result || null;
  },

  async getAllBookmarks() {
    const db = await getDb();
    const results = await db.getAll(BOOKMARK_STORE_NAME);
    return results || [];
  },

  async deleteBookmark(id) {
    if (!id) return;
    const db = await getDb();
    return db.delete(BOOKMARK_STORE_NAME, id);
  },

  async isBookmarked(id) {
    if (!id) return false;
    const bookmark = await this.getBookmark(id);
    return Boolean(bookmark);
  },

  async queueDraftStory(draftData) {
    if (!draftData) return null;
    const db = await getDb();
    const entry = {
      ...draftData,
      createdAt: draftData.createdAt || new Date().toISOString(),
    };
    return db.add(OUTBOX_STORE_NAME, entry);
  },

  async getAllPendingStories() {
    const db = await getDb();
    const results = await db.getAll(OUTBOX_STORE_NAME);
    return results || [];
  },

  async removePendingStory(outboxId) {
    if (outboxId === undefined || outboxId === null) return;
    const db = await getDb();
    return db.delete(OUTBOX_STORE_NAME, outboxId);
  },

  async getPendingStoryCount() {
    const db = await getDb();
    return db.count(OUTBOX_STORE_NAME);
  },
};

export default Database;
