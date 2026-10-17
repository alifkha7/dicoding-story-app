import HomePresenter from './home-presenter';
import StoryModel from '../../data/story-model';
import AuthModel from '../../data/auth-model';
import { createMultiTileMap } from '../../utils/map-helper';
import { showFormattedDate } from '../../utils';
import L from 'leaflet';

class HomePage {
  #presenter = null;
  #mapInstance = null;
  #markerMap = new Map();

  async render() {
    return `
      <section class="container home-page" aria-labelledby="feed-heading">
        <div class="home-header">
          <div>
            <h1 id="feed-heading">Jelajahi Cerita Komunitas</h1>
            <p class="section-subtitle">Temukan momen, cerita inspiratif, dan lokasi tempat cerita dibagikan.</p>
          </div>

          <div class="filter-controls" role="group" aria-label="Filter lokasi cerita">
            <button type="button" id="filter-all" class="btn btn-filter active" aria-pressed="true">
              Semua Cerita
            </button>
            <button type="button" id="filter-located" class="btn btn-filter" aria-pressed="false">
              📍 Dengan Lokasi Saja
            </button>
          </div>
        </div>

        <div id="home-alert" class="auth-alert alert-danger" role="alert" style="display: none;"></div>

        <div class="home-layout">
          <!-- Digital Map Section -->
          <div class="map-wrapper" aria-label="Peta Digital Lokasi Cerita">
            <div class="map-card">
              <div class="map-card-header">
                <h2>Peta Interaktif</h2>
                <small class="map-hint">Klik marker atau tombol "Lihat di Peta" untuk sinkronisasi.</small>
              </div>
              <div id="home-map" class="digital-map" tabindex="0" role="region" aria-label="Peta digital interaktif Leaflet"></div>
            </div>
          </div>

          <!-- Story Feed Section -->
          <div class="feed-wrapper">
            <div id="feed-loading" class="loading-state" aria-live="polite" style="display: none;">
              <div class="spinner" aria-hidden="true"></div>
              <p>Memuat cerita komunitas...</p>
            </div>

            <div id="feed-empty" class="empty-state" style="display: none;">
              <p>Belum ada cerita yang tersedia.</p>
              <a href="#/add" class="btn btn-primary btn-sm">+ Buat Cerita Pertama</a>
            </div>

            <div id="feed-list" class="feed-grid" aria-label="Daftar Cerita">
              <!-- Story cards will be rendered here -->
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyModel = new StoryModel();
    const authModel = new AuthModel();

    this.#presenter = new HomePresenter({
      view: this,
      storyModel,
      authModel,
    });

    // Initialize Leaflet Map
    const mapObj = createMultiTileMap('home-map');
    if (mapObj) {
      this.#mapInstance = mapObj.map;
    }

    // Setup filter button listeners
    const btnAll = document.querySelector('#filter-all');
    const btnLocated = document.querySelector('#filter-located');

    if (btnAll) {
      btnAll.addEventListener('click', () => {
        this.#presenter.applyFilter('all');
      });
    }

    if (btnLocated) {
      btnLocated.addEventListener('click', () => {
        this.#presenter.applyFilter('located');
      });
    }

    await this.#presenter.loadStories();
  }

  showLoading() {
    const loadingEl = document.querySelector('#feed-loading');
    if (loadingEl) loadingEl.style.display = 'flex';
  }

  hideLoading() {
    const loadingEl = document.querySelector('#feed-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }

  showError(message) {
    const alertEl = document.querySelector('#home-alert');
    if (alertEl) {
      alertEl.innerHTML = `
        ${message}
        <button id="btn-retry-feed" class="btn btn-sm" style="margin-left: 12px; border: 1px solid currentColor;">Coba Lagi</button>
      `;
      alertEl.style.display = 'block';

      const retryBtn = alertEl.querySelector('#btn-retry-feed');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.#presenter.loadStories();
        });
      }
    }
  }

  clearError() {
    const alertEl = document.querySelector('#home-alert');
    if (alertEl) {
      alertEl.innerHTML = '';
      alertEl.style.display = 'none';
    }
  }

  updateFilterUI(filterType) {
    const btnAll = document.querySelector('#filter-all');
    const btnLocated = document.querySelector('#filter-located');

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

  renderStories(stories) {
    const feedList = document.querySelector('#feed-list');
    const emptyEl = document.querySelector('#feed-empty');
    if (!feedList) return;

    if (!stories || stories.length === 0) {
      feedList.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    feedList.innerHTML = stories.map((story) => {
      const hasLocation = story.lat !== null && story.lat !== undefined && story.lon !== null && story.lon !== undefined;
      const formattedDate = showFormattedDate(story.createdAt, 'id-ID');

      return `
        <article class="story-card" id="story-card-${story.id}" data-id="${story.id}">
          <div class="story-image-wrapper">
            <img
              src="${story.photoUrl}"
              alt="Foto cerita oleh ${story.name}: ${story.description ? story.description.slice(0, 50) : 'Cerita'}"
              loading="lazy"
              class="story-image"
            />
          </div>
          <div class="story-content">
            <div class="story-author-meta">
              <span class="author-name">👤 ${story.name}</span>
              <time datetime="${story.createdAt}" class="story-time">📅 ${formattedDate}</time>
            </div>
            <p class="story-description">${story.description || 'Tidak ada deskripsi.'}</p>
            
            <div class="story-footer">
              ${hasLocation ? `
                <button
                  type="button"
                  class="btn btn-locate btn-sm"
                  data-locate-id="${story.id}"
                  aria-label="Lihat lokasi cerita ${story.name} pada peta"
                >
                  📍 Lihat di Peta (${Number(story.lat).toFixed(2)}, ${Number(story.lon).toFixed(2)})
                </button>
              ` : `
                <span class="no-location-badge">Tanpa Koordinat</span>
              `}
              <a href="#/stories/${story.id}" class="story-detail-link" aria-label="Lihat detail cerita ${story.name}">Detail →</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners for "Locate on Map"
    feedList.querySelectorAll('[data-locate-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-locate-id');
        this.#presenter.selectActiveStory(id);
      });
    });
  }

  renderMapMarkers(locatedStories) {
    if (!this.#mapInstance) return;

    // Clear previous markers
    this.#markerMap.forEach((marker) => {
      marker.remove();
    });
    this.#markerMap.clear();

    if (!locatedStories || locatedStories.length === 0) return;

    const bounds = [];

    locatedStories.forEach((story) => {
      const lat = Number(story.lat);
      const lon = Number(story.lon);
      if (isNaN(lat) || isNaN(lon)) return;

      const marker = L.marker([lat, lon]).addTo(this.#mapInstance);

      const popupContent = `
        <div class="map-popup-card">
          <img src="${story.photoUrl}" alt="Foto ${story.name}" class="popup-thumb" />
          <h3 class="popup-author">${story.name}</h3>
          <p class="popup-coords" style="font-size: 0.75rem; color: #6b7280; margin-bottom: 4px;">📍 Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</p>
          <p class="popup-desc">${story.description ? story.description.slice(0, 80) : ''}...</p>
          <a href="#/stories/${story.id}" class="popup-link">Lihat Detail →</a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        this.#presenter.selectActiveStory(story.id);
      });

      this.#markerMap.set(story.id, marker);
      bounds.push([lat, lon]);
    });

    if (bounds.length > 0) {
      this.#mapInstance.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }

  highlightActiveCard(storyId) {
    document.querySelectorAll('.story-card').forEach((card) => {
      card.classList.remove('active-story');
    });

    // Reset marker styles
    this.#markerMap.forEach((marker) => {
      if (marker._icon) {
        marker._icon.style.filter = '';
      }
    });

    const activeCard = document.querySelector(`#story-card-${storyId}`);
    if (activeCard) {
      activeCard.classList.add('active-story');
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const activeMarker = this.#markerMap.get(storyId);
    if (activeMarker && activeMarker._icon) {
      activeMarker._icon.style.filter = 'drop-shadow(0 0 8px #ff3b30) hue-rotate(140deg)';
    }
  }

  focusMapOnCoordinates({ lat, lon, storyId }) {
    if (!this.#mapInstance) return;

    this.#mapInstance.flyTo([lat, lon], 14, { duration: 1.2 });

    const marker = this.#markerMap.get(storyId);
    if (marker) {
      marker.openPopup();
    }
  }

  destroy() {
    this.#markerMap.forEach((marker) => marker.remove());
    this.#markerMap.clear();
    if (this.#mapInstance) {
      this.#mapInstance.remove();
      this.#mapInstance = null;
    }
  }
}

export default HomePage;
