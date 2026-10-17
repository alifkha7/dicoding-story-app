import '../styles/styles.css';

import App from './pages/app';
import AuthModel from './data/auth-model';

document.addEventListener('DOMContentLoaded', async () => {
  const authModel = new AuthModel();

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
