import '../styles/styles.css';

import App from './pages/app';
import AuthModel from './data/auth-model';
import StoryModel from './data/story-model';
import OutboxSyncManager from './utils/outbox-sync-manager';

document.addEventListener('DOMContentLoaded', async () => {
  const authModel = new AuthModel();
  const storyModel = new StoryModel();

  const outboxSyncManager = new OutboxSyncManager({
    storyModel,
    authModel,
  });
  outboxSyncManager.init();

  // If already online at startup, attempt initial sync for any previously queued drafts
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    outboxSyncManager.syncPendingStories().catch((err) => {
      console.warn('Initial outbox sync failed:', err);
    });
  }

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    skipLink: document.querySelector('#skip-link'),
    authModel,
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope:', registration.scope);
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
});

