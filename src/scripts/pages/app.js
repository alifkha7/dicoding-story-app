import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import StreamManager from '../utils/stream-manager';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLink = null;
  #currentPage = null;
  #authModel = null;

  constructor({ navigationDrawer, drawerButton, content, skipLink, authModel }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLink = skipLink || document.querySelector('#skip-link');
    this.#authModel = authModel;

    this.#setupDrawer();
    this.#setupSkipLink();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.#navigationDrawer.classList.contains('open')) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
        this.#drawerButton.focus();
      }
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a, button').forEach((item) => {
        if (item.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  #setupSkipLink() {
    if (!this.#skipLink || !this.#content) return;

    this.#skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.#content.focus();
      this.#content.scrollIntoView({ behavior: 'smooth' });
    });
  }

  async renderPage() {
    // 1. Lifecycle Teardown: Stop active hardware streams and call page destroy hook
    StreamManager.stopAll();
    if (this.#currentPage && typeof this.#currentPage.destroy === 'function') {
      try {
        this.#currentPage.destroy();
      } catch (err) {
        console.error('Error destroying previous page:', err);
      }
    }

    // 2. Auth Guard Check
    const url = getActiveRoute();
    const isAuthenticated = this.#authModel ? this.#authModel.isAuthenticated() : false;
    const isPublicRoute = url === '/login' || url === '/register' || url === '/about';

    if (!isAuthenticated && !isPublicRoute) {
      location.hash = '#/login';
      return;
    }

    if (isAuthenticated && (url === '/login' || url === '/register')) {
      location.hash = '#/';
      return;
    }

    // Update navigation items based on auth state
    this.updateNavigationUI();

    const page = routes[url] || routes['/'];
    this.#currentPage = page;

    // 3. Custom View Transition execution
    const updateDOM = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    };

    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(async () => {
        await updateDOM();
      });
    } else {
      await updateDOM();
    }
  }

  updateNavigationUI() {
    const navList = document.querySelector('#nav-list');
    if (!navList) return;

    const isAuthenticated = this.#authModel ? this.#authModel.isAuthenticated() : false;
    const user = this.#authModel ? this.#authModel.getUser() : null;

    if (isAuthenticated) {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/favorites">Cerita Tersimpan</a></li>
        <li><a href="#/add">+ Tambah Cerita</a></li>
        <li><a href="#/about">Tentang</a></li>
        <li>
          <button id="logout-button" class="btn-logout" aria-label="Keluar dari akun">
            Keluar (${user?.name || 'User'})
          </button>
        </li>
      `;

      const logoutBtn = navList.querySelector('#logout-button');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (this.#authModel) {
            this.#authModel.clearAuth();
          }
          location.hash = '#/login';
        });
      }
    } else {
      navList.innerHTML = `
        <li><a href="#/login">Masuk</a></li>
        <li><a href="#/register">Daftar</a></li>
        <li><a href="#/about">Tentang</a></li>
      `;
    }
  }
}

export default App;
