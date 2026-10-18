import Database from '../data/database';

class OutboxSyncManager {
  #database = null;
  #storyModel = null;
  #authModel = null;
  #isSyncing = false;
  #onlineListener = null;

  constructor({
    database = Database,
    storyModel = null,
    authModel = null,
  } = {}) {
    this.#database = database;
    this.#storyModel = storyModel;
    this.#authModel = authModel;
  }

  init() {
    if (typeof window === 'undefined') return;

    this.#onlineListener = () => {
      this.syncPendingStories().catch((err) => {
        console.error('Failed to auto-sync pending stories on online event:', err);
      });
    };

    window.addEventListener('online', this.#onlineListener);
  }

  destroy() {
    if (typeof window !== 'undefined' && this.#onlineListener) {
      window.removeEventListener('online', this.#onlineListener);
      this.#onlineListener = null;
    }
  }

  async syncPendingStories({
    storyModel = this.#storyModel,
    authModel = this.#authModel,
    onSyncSuccess = null,
    onSyncError = null,
  } = {}) {
    if (this.#isSyncing) {
      return [];
    }

    const currentAuthModel = authModel || this.#authModel;
    const currentStoryModel = storyModel || this.#storyModel;

    // Check auth status
    const isAuthenticated = currentAuthModel ? currentAuthModel.isAuthenticated() : false;
    const token = currentAuthModel ? currentAuthModel.getToken() : null;

    if (!isAuthenticated || !token) {
      return [];
    }

    if (!currentStoryModel) {
      return [];
    }

    this.#isSyncing = true;
    const results = [];

    try {
      const pendingStories = await this.#database.getAllPendingStories();
      if (!pendingStories || pendingStories.length === 0) {
        return [];
      }

      // Process in FIFO order (by createdAt or outboxId)
      const sortedQueue = [...pendingStories].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return (a.outboxId || 0) - (b.outboxId || 0);
      });

      for (const draft of sortedQueue) {
        try {
          const response = await currentStoryModel.addStory({
            token,
            description: draft.description,
            photo: draft.photo,
            lat: draft.lat,
            lon: draft.lon,
          });

          await this.#database.removePendingStory(draft.outboxId);

          const successResult = {
            outboxId: draft.outboxId,
            description: draft.description,
            response,
          };
          results.push(successResult);

          if (typeof onSyncSuccess === 'function') {
            onSyncSuccess(successResult);
          }

          this.#showToast(
            `Cerita "${draft.description.slice(0, 30)}${draft.description.length > 30 ? '...' : ''}" dari antrean offline berhasil diunggah!`
          );
        } catch (error) {
          const errorResult = {
            outboxId: draft.outboxId,
            description: draft.description,
            error,
          };

          if (typeof onSyncError === 'function') {
            onSyncError(errorResult);
          }
        }
      }

      return results;
    } finally {
      this.#isSyncing = false;
    }
  }

  #showToast(message) {
    if (typeof document === 'undefined') return;

    let toastContainer = document.querySelector('#outbox-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'outbox-toast-container';
      toastContainer.className = 'outbox-toast-container';
      toastContainer.setAttribute('role', 'status');
      toastContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'outbox-toast alert-success';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
        if (toastContainer.children.length === 0) {
          toastContainer.remove();
        }
      }, 500);
    }, 4000);
  }
}

export default OutboxSyncManager;
