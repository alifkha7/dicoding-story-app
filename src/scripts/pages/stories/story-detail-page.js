import StoryDetailPresenter from './story-detail-presenter';
import StoryModel from '../../data/story-model';
import AuthModel from '../../data/auth-model';
import { parseActivePathname } from '../../routes/url-parser';
import { createMultiTileMap } from '../../utils/map-helper';
import { showFormattedDate } from '../../utils';
import L from 'leaflet';

class StoryDetailPage {
  #presenter = null;
  #mapInstance = null;

  async render() {
    return `
      <section class="container story-detail-page" aria-labelledby="story-title">
        <div class="detail-nav">
          <a href="#/" class="btn btn-back" aria-label="Kembali ke Beranda">
            ← Kembali ke Beranda
          </a>
        </div>

        <div id="detail-loading" class="loading-state" aria-live="polite" style="display: none;">
          <div class="spinner" aria-hidden="true"></div>
          <p>Memuat detail cerita...</p>
        </div>

        <div id="detail-alert" class="auth-alert alert-danger" role="alert" style="display: none;"></div>

        <div id="detail-content" class="detail-container" style="display: none;">
          <div class="detail-media-card">
            <div class="detail-image-box">
              <img id="detail-image" src="" alt="" class="detail-main-image" />
            </div>
            
            <div class="detail-body">
              <div class="detail-meta">
                <span class="detail-author" id="detail-author"></span>
                <time class="detail-date" id="detail-date"></time>
              </div>
              <h1 id="story-title" class="detail-title">Cerita Komunitas</h1>
              <p id="detail-description" class="detail-text"></p>
            </div>
          </div>

          <!-- Location Map Section -->
          <div class="detail-location-section" aria-labelledby="location-heading">
            <h2 id="location-heading" class="location-heading">Lokasi Cerita</h2>
            <div id="detail-no-location" class="no-location-box" style="display: none;">
              <p>Cerita ini dibagikan tanpa informasi koordinat lokasi.</p>
            </div>
            <div id="detail-map-wrapper" class="detail-map-card" style="display: none;">
              <div id="detail-map" class="detail-digital-map" tabindex="0" role="region" aria-label="Peta lokasi cerita Leaflet"></div>
              <p id="detail-coords" class="detail-coords-text"></p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyModel = new StoryModel();
    const authModel = new AuthModel();

    this.#presenter = new StoryDetailPresenter({
      view: this,
      storyModel,
      authModel,
    });

    const { id } = parseActivePathname();
    await this.#presenter.loadStoryDetail(id);
  }

  showLoading() {
    const loadingEl = document.querySelector('#detail-loading');
    if (loadingEl) loadingEl.style.display = 'flex';
  }

  hideLoading() {
    const loadingEl = document.querySelector('#detail-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }

  showError(message) {
    const alertEl = document.querySelector('#detail-alert');
    if (alertEl) {
      alertEl.textContent = message;
      alertEl.style.display = 'block';
    }
  }

  clearError() {
    const alertEl = document.querySelector('#detail-alert');
    if (alertEl) {
      alertEl.textContent = '';
      alertEl.style.display = 'none';
    }
  }

  renderStoryDetail(story) {
    const detailContainer = document.querySelector('#detail-content');
    const imageEl = document.querySelector('#detail-image');
    const authorEl = document.querySelector('#detail-author');
    const dateEl = document.querySelector('#detail-date');
    const descEl = document.querySelector('#detail-description');

    if (!detailContainer) return;

    if (imageEl) {
      imageEl.src = story.photoUrl;
      imageEl.alt = `Foto cerita oleh ${story.name}: ${story.description ? story.description.slice(0, 50) : ''}`;
    }

    if (authorEl) {
      authorEl.textContent = `Oleh: ${story.name}`;
    }

    if (dateEl) {
      dateEl.textContent = showFormattedDate(story.createdAt, 'id-ID');
      dateEl.setAttribute('datetime', story.createdAt);
    }

    if (descEl) {
      descEl.textContent = story.description || 'Tidak ada deskripsi.';
    }

    detailContainer.style.display = 'flex';
  }

  renderLocationMap({ lat, lon, name, description }) {
    const mapWrapper = document.querySelector('#detail-map-wrapper');
    const coordsText = document.querySelector('#detail-coords');
    const noLocBox = document.querySelector('#detail-no-location');

    if (noLocBox) noLocBox.style.display = 'none';
    if (mapWrapper) mapWrapper.style.display = 'block';

    if (coordsText) {
      coordsText.textContent = `Koordinat: Latitude ${lat.toFixed(6)}, Longitude ${lon.toFixed(6)}`;
    }

    // Initialize Leaflet Map centered on coordinates
    const mapObj = createMultiTileMap('detail-map', { center: [lat, lon], zoom: 13 });
    if (mapObj) {
      this.#mapInstance = mapObj.map;

      const marker = L.marker([lat, lon]).addTo(this.#mapInstance);
      marker.bindPopup(`
        <div style="font-family: inherit;">
          <strong>${name}</strong>
          <p style="font-size: 0.85rem; margin-top: 4px;">${description ? description.slice(0, 60) : ''}</p>
        </div>
      `).openPopup();
    }
  }

  showNoLocationNotice() {
    const mapWrapper = document.querySelector('#detail-map-wrapper');
    const noLocBox = document.querySelector('#detail-no-location');

    if (mapWrapper) mapWrapper.style.display = 'none';
    if (noLocBox) noLocBox.style.display = 'block';
  }

  destroy() {
    if (this.#mapInstance) {
      this.#mapInstance.remove();
      this.#mapInstance = null;
    }
  }
}

export default StoryDetailPage;
