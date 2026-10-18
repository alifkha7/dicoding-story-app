import FavoritesPresenter from './favorites-presenter';
import Database from '../../data/database';
import { showFormattedDate } from '../../utils';

class FavoritesPage {
  #presenter = null;

  async render() {
    return `
      <section class="container favorites-page" aria-labelledby="favorites-heading">
        <div class="favorites-header">
          <div class="favorites-title-group">
            <h1 id="favorites-heading">Cerita Tersimpan</h1>
            <p class="section-subtitle">Koleksi cerita favorit yang tersimpan di perangkat lokal Anda.</p>
          </div>

          <div class="favorites-toolbar">
            <div class="search-box">
              <input
                type="search"
                id="search-input"
                class="search-input"
                placeholder="Cari penulis atau deskripsi..."
                aria-label="Cari cerita tersimpan"
              />
            </div>

            <div class="filter-controls" role="group" aria-label="Filter lokasi cerita tersimpan">
              <button type="button" id="fav-filter-all" class="btn btn-filter active" aria-pressed="true">
                Semua
              </button>
              <button type="button" id="fav-filter-located" class="btn btn-filter" aria-pressed="false">
                Dengan Lokasi Saja
              </button>
            </div>

            <div class="sort-controls">
              <label for="sort-select" class="sort-label">Urutkan:</label>
              <select id="sort-select" class="form-input sort-select" aria-label="Urutkan cerita tersimpan">
                <option value="newest" selected>Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        <div id="favorites-alert" class="auth-alert alert-danger" role="alert" style="display: none;"></div>

        <div id="favorites-loading" class="loading-state" aria-live="polite" style="display: none;">
          <div class="spinner" aria-hidden="true"></div>
          <p>Memuat cerita tersimpan...</p>
        </div>

        <div id="favorites-empty" class="empty-state" style="display: none;">
          <p id="empty-state-message">Belum ada cerita yang tersimpan di bookmark.</p>
          <a href="#/" class="btn btn-primary btn-sm">Jelajahi Cerita Komunitas</a>
        </div>

        <div id="favorites-list" class="feed-grid favorites-grid" aria-label="Daftar Cerita Tersimpan">
          <!-- Favorite cards will be rendered here -->
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new FavoritesPresenter({
      view: this,
      database: Database,
    });

    const searchInput = document.querySelector('#search-input');
    const btnAll = document.querySelector('#fav-filter-all');
    const btnLocated = document.querySelector('#fav-filter-located');
    const sortSelect = document.querySelector('#sort-select');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.#presenter.searchBookmarks(e.target.value);
      });
    }

    if (btnAll) {
      btnAll.addEventListener('click', () => {
        this.updateFilterUI('all');
        this.#presenter.filterBookmarks('all');
      });
    }

    if (btnLocated) {
      btnLocated.addEventListener('click', () => {
        this.updateFilterUI('located');
        this.#presenter.filterBookmarks('located');
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.#presenter.sortBookmarks(e.target.value);
      });
    }

    await this.#presenter.loadBookmarks();
  }

  showLoading() {
    const loadingEl = document.querySelector('#favorites-loading');
    if (loadingEl) loadingEl.style.display = 'flex';
  }

  hideLoading() {
    const loadingEl = document.querySelector('#favorites-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }

  showEmptyState() {
    const listEl = document.querySelector('#favorites-list');
    const emptyEl = document.querySelector('#favorites-empty');
    if (listEl) listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
  }

  showError(message) {
    const alertEl = document.querySelector('#favorites-alert');
    if (alertEl) {
      alertEl.textContent = message;
      alertEl.style.display = 'block';
    }
  }

  clearError() {
    const alertEl = document.querySelector('#favorites-alert');
    if (alertEl) {
      alertEl.textContent = '';
      alertEl.style.display = 'none';
    }
  }

  updateFilterUI(filterType) {
    const btnAll = document.querySelector('#fav-filter-all');
    const btnLocated = document.querySelector('#fav-filter-located');

    if (btnAll && btnLocated) {
      if (filterType === 'all') {
        btnAll.classList.add('active');
        btnAll.setAttribute('aria-pressed', 'true');
        btnLocated.classList.remove('active');
        btnLocated.setAttribute('aria-pressed', 'false');
      } else {
        btnLocated.classList.add('active');
        btnLocated.setAttribute('aria-pressed', 'true');
        btnAll.classList.remove('active');
        btnAll.setAttribute('aria-pressed', 'false');
      }
    }
  }

  renderBookmarks(stories) {
    const listEl = document.querySelector('#favorites-list');
    const emptyEl = document.querySelector('#favorites-empty');
    if (!listEl) return;

    if (!stories || stories.length === 0) {
      this.showEmptyState();
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = stories.map((story) => {
      const hasLocation =
        story.lat !== null &&
        story.lat !== undefined &&
        story.lon !== null &&
        story.lon !== undefined;
      const formattedDate = showFormattedDate(story.createdAt, 'id-ID');

      return `
        <article class="story-card favorite-card" id="fav-card-${story.id}" data-id="${story.id}">
          <div class="story-image-wrapper">
            <img
              src="${story.photoUrl}"
              alt="Foto cerita oleh ${story.name}"
              loading="lazy"
              class="story-image"
            />
          </div>
          <div class="story-content">
            <div class="story-author-meta">
              <span class="author-name">${story.name}</span>
              <time datetime="${story.createdAt}" class="story-time">${formattedDate}</time>
            </div>
            <p class="story-description">${story.description || 'Tidak ada deskripsi.'}</p>

            <div class="story-footer">
              ${hasLocation ? `
                <span class="location-badge" style="font-size: 0.75rem; color: #0056b3; background: #e0f2fe; padding: 4px 8px; border-radius: 4px;">
                  📍 ${Number(story.lat).toFixed(2)}, ${Number(story.lon).toFixed(2)}
                </span>
              ` : `
                <span class="no-location-badge">Tanpa Koordinat</span>
              `}
              
              <div class="fav-action-buttons">
                <a href="#/stories/${story.id}" class="story-detail-link" aria-label="Lihat detail cerita ${story.name}">Detail →</a>
                <button
                  type="button"
                  class="btn btn-sm btn-delete-bookmark"
                  data-remove-id="${story.id}"
                  aria-label="Hapus cerita ${story.name} dari bookmark"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners for delete buttons
    listEl.querySelectorAll('[data-remove-id]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-remove-id');
        await this.#presenter.removeBookmark(id);
      });
    });
  }

  destroy() {
    this.#presenter = null;
  }
}

export default FavoritesPage;
