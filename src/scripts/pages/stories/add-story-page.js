import AddStoryPresenter from './add-story-presenter';
import StoryModel from '../../data/story-model';
import AuthModel from '../../data/auth-model';
import StreamManager from '../../utils/stream-manager';
import { createMultiTileMap } from '../../utils/map-helper';
import { compressImageToBlob } from '../../utils/image-compressor';
import { sleep } from '../../utils';
import L from 'leaflet';

class AddStoryPage {
  #presenter = null;
  #mapInstance = null;
  #pickerMarker = null;
  #currentStream = null;
  #capturedBlob = null;

  async render() {
    return `
      <section class="container add-story-page" aria-labelledby="add-story-heading">
        <div class="add-story-header">
          <h1 id="add-story-heading">Bagikan Cerita Baru</h1>
          <p class="section-subtitle">Abadikan momen dan bagikan dengan komunitas Dicoding lengkap dengan lokasinya.</p>
        </div>

        <div id="add-story-alert" class="auth-alert" role="alert" style="display: none;"></div>

        <form id="add-story-form" class="add-story-layout" novalidate>
          <!-- Left Column: Photo & Media Input -->
          <div class="form-media-column">
            <fieldset class="media-fieldset">
              <legend class="fieldset-legend">Foto Cerita <span aria-hidden="true">*</span></legend>

              <div class="media-tabs" role="tablist" aria-label="Sumber foto cerita">
                <button type="button" role="tab" id="tab-upload" class="tab-btn active" aria-selected="true" aria-controls="panel-upload">
                  📁 Unggah Berkas
                </button>
                <button type="button" role="tab" id="tab-camera" class="tab-btn" aria-selected="false" aria-controls="panel-camera">
                  📷 Ambil dari Kamera
                </button>
              </div>

              <!-- Upload File Panel -->
              <div id="panel-upload" role="tabpanel" aria-labelledby="tab-upload" class="tab-panel active">
                <div class="form-group">
                  <label for="story-file-input">Pilih berkas foto (JPG/PNG, maks 1 MB):</label>
                  <input
                    type="file"
                    id="story-file-input"
                    name="photoFile"
                    accept="image/*"
                    aria-describedby="upload-hint"
                  />
                  <small id="upload-hint" class="form-hint">Foto beresolusi tinggi akan dikompres otomatis di bawah 1 MB.</small>
                </div>
              </div>

              <!-- Camera Live Panel -->
              <div id="panel-camera" role="tabpanel" aria-labelledby="tab-camera" class="tab-panel" style="display: none;">
                <div class="camera-controls-box">
                  <div class="camera-select-group form-group">
                    <label for="camera-device-select">Pilih Kamera:</label>
                    <select id="camera-device-select" aria-label="Daftar perangkat kamera"></select>
                  </div>

                  <div class="camera-action-buttons">
                    <button type="button" id="btn-start-camera" class="btn btn-secondary btn-sm">Buka Kamera</button>
                    <button type="button" id="btn-capture-camera" class="btn btn-primary btn-sm" style="display: none;">📸 Ambil Foto</button>
                    <button type="button" id="btn-close-camera" class="btn btn-secondary btn-sm" style="display: none;">Tutup Kamera</button>
                  </div>
                </div>

                <div class="video-preview-wrapper" style="display: none;">
                  <video id="camera-video" playsinline autoplay muted aria-label="Tinjauan video kamera langsung"></video>
                </div>
              </div>

              <!-- Shared Image Preview Area -->
              <div class="image-preview-card">
                <span class="preview-label">Pratinjau Foto:</span>
                <div class="preview-box">
                  <img id="image-preview" src="" alt="Pratinjau foto cerita yang akan diunggah" style="display: none;" />
                  <span id="preview-placeholder" class="preview-placeholder">Belum ada foto yang dipilih.</span>
                </div>
                <button type="button" id="btn-remove-photo" class="btn btn-sm btn-link" style="display: none; color: #e63946;">Hapus Foto</button>
              </div>
            </fieldset>
          </div>

          <!-- Right Column: Description & Interactive Map Picker -->
          <div class="form-details-column">
            <div class="form-group">
              <label for="story-description">Deskripsi Cerita <span aria-hidden="true">*</span></label>
              <textarea
                id="story-description"
                name="description"
                rows="4"
                required
                placeholder="Ceritakan momen apa yang terjadi..."
                aria-required="true"
              ></textarea>
            </div>

            <!-- Map Coordinate Picker Section -->
            <fieldset class="location-fieldset">
              <legend class="fieldset-legend">Pilih Lokasi Cerita (Opsional)</legend>
              <p class="fieldset-desc">Klik langsung pada peta untuk menentukan titik koordinat, atau masukkan koordinat secara manual.</p>

              <div class="coords-inputs-row">
                <div class="form-group coord-group">
                  <label for="story-lat">Latitude</label>
                  <input
                    type="number"
                    id="story-lat"
                    name="lat"
                    step="any"
                    placeholder="-6.2088"
                  />
                </div>
                <div class="form-group coord-group">
                  <label for="story-lon">Longitude</label>
                  <input
                    type="number"
                    id="story-lon"
                    name="lon"
                    step="any"
                    placeholder="106.8456"
                  />
                </div>
              </div>

              <div class="location-buttons-row">
                <button type="button" id="btn-current-location" class="btn btn-secondary btn-sm">
                  🎯 Gunakan Lokasi Saat Ini
                </button>
                <button type="button" id="btn-clear-location" class="btn btn-secondary btn-sm">
                  ✖ Hapus Lokasi
                </button>
              </div>

              <div class="picker-map-container">
                <div id="picker-map" class="picker-digital-map" tabindex="0" role="region" aria-label="Peta digital untuk memilih koordinat cerita"></div>
              </div>
            </fieldset>

            <button type="submit" id="btn-submit-story" class="btn btn-primary btn-block btn-lg">
              <span class="btn-text">Bagikan Cerita</span>
              <span class="btn-spinner" aria-hidden="true" style="display: none;">⏳</span>
            </button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const storyModel = new StoryModel();
    const authModel = new AuthModel();

    this.#presenter = new AddStoryPresenter({
      view: this,
      storyModel,
      authModel,
      streamManager: StreamManager,
    });

    this.#setupMapPicker();
    this.#setupMediaTabs();
    this.#setupFileUpload();
    this.#setupCamera();
    this.#setupFormSubmission();
  }

  #setupMapPicker() {
    const mapObj = createMultiTileMap('picker-map', { center: [-2.548926, 118.0148634], zoom: 5 });
    if (!mapObj) return;
    this.#mapInstance = mapObj.map;

    const latInput = document.querySelector('#story-lat');
    const lonInput = document.querySelector('#story-lon');
    const btnCurrentLoc = document.querySelector('#btn-current-location');
    const btnClearLoc = document.querySelector('#btn-clear-location');

    // Click on map to pick location
    this.#mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.#updatePickerMarker(lat, lng);
      if (latInput) latInput.value = lat.toFixed(6);
      if (lonInput) lonInput.value = lng.toFixed(6);
    });

    // Manual input sync
    const handleManualInput = () => {
      const lat = parseFloat(latInput?.value);
      const lon = parseFloat(lonInput?.value);
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        this.#updatePickerMarker(lat, lon);
        this.#mapInstance.flyTo([lat, lon], 12);
      }
    };

    latInput?.addEventListener('input', handleManualInput);
    lonInput?.addEventListener('input', handleManualInput);

    // Current Geolocation button
    btnCurrentLoc?.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            if (latInput) latInput.value = latitude.toFixed(6);
            if (lonInput) lonInput.value = longitude.toFixed(6);
            this.#updatePickerMarker(latitude, longitude);
            this.#mapInstance.flyTo([latitude, longitude], 14);
          },
          () => {
            this.showError('Tidak dapat mengakses lokasi perangkat saat ini.');
          }
        );
      }
    });

    // Clear location
    btnClearLoc?.addEventListener('click', () => {
      if (latInput) latInput.value = '';
      if (lonInput) lonInput.value = '';
      if (this.#pickerMarker) {
        this.#pickerMarker.remove();
        this.#pickerMarker = null;
      }
    });
  }

  #updatePickerMarker(lat, lon) {
    if (!this.#mapInstance) return;

    if (this.#pickerMarker) {
      this.#pickerMarker.setLatLng([lat, lon]);
    } else {
      this.#pickerMarker = L.marker([lat, lon], { draggable: true }).addTo(this.#mapInstance);
      this.#pickerMarker.on('dragend', (event) => {
        const position = event.target.getLatLng();
        const latInput = document.querySelector('#story-lat');
        const lonInput = document.querySelector('#story-lon');
        if (latInput) latInput.value = position.lat.toFixed(6);
        if (lonInput) lonInput.value = position.lng.toFixed(6);
      });
    }

    this.#pickerMarker.bindPopup(`<strong>Titik Terpilih</strong><br/>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`).openPopup();
  }

  #setupMediaTabs() {
    const tabUpload = document.querySelector('#tab-upload');
    const tabCamera = document.querySelector('#tab-camera');
    const panelUpload = document.querySelector('#panel-upload');
    const panelCamera = document.querySelector('#panel-camera');

    tabUpload?.addEventListener('click', () => {
      tabUpload.classList.add('active');
      tabUpload.setAttribute('aria-selected', 'true');
      tabCamera.classList.remove('active');
      tabCamera.setAttribute('aria-selected', 'false');

      panelUpload.style.display = 'block';
      panelCamera.style.display = 'none';

      // Stop camera if open
      this.#stopCamera();
    });

    tabCamera?.addEventListener('click', async () => {
      tabCamera.classList.add('active');
      tabCamera.setAttribute('aria-selected', 'true');
      tabUpload.classList.remove('active');
      tabUpload.setAttribute('aria-selected', 'false');

      panelCamera.style.display = 'block';
      panelUpload.style.display = 'none';

      await this.#enumerateCameras();
    });
  }

  #setupFileUpload() {
    const fileInput = document.querySelector('#story-file-input');
    const removeBtn = document.querySelector('#btn-remove-photo');

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const compressedBlob = await compressImageToBlob(file);
        this.#capturedBlob = compressedBlob;
        this.#showImagePreview(URL.createObjectURL(compressedBlob));
      } catch (err) {
        this.showError(err.message || 'Gagal memproses file foto.');
      }
    });

    removeBtn?.addEventListener('click', () => {
      this.#capturedBlob = null;
      if (fileInput) fileInput.value = '';
      this.#hideImagePreview();
    });
  }

  async #enumerateCameras() {
    const select = document.querySelector('#camera-device-select');
    if (!select || !navigator.mediaDevices?.enumerateDevices) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      select.innerHTML = videoDevices.map((device, index) => `
        <option value="${device.deviceId}">${device.label || `Kamera ${index + 1}`}</option>
      `).join('');
    } catch (err) {
      console.warn('Cannot enumerate devices:', err);
    }
  }

  #setupCamera() {
    const btnStart = document.querySelector('#btn-start-camera');
    const btnCapture = document.querySelector('#btn-capture-camera');
    const btnClose = document.querySelector('#btn-close-camera');
    const video = document.querySelector('#camera-video');
    const videoWrapper = document.querySelector('.video-preview-wrapper');
    const select = document.querySelector('#camera-device-select');

    btnStart?.addEventListener('click', async () => {
      const deviceId = select?.value;
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };

      try {
        this.#stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.#currentStream = stream;
        StreamManager.register(stream);

        if (video) {
          video.srcObject = stream;
        }

        if (videoWrapper) videoWrapper.style.display = 'block';
        if (btnStart) btnStart.style.display = 'none';
        if (btnCapture) btnCapture.style.display = 'inline-flex';
        if (btnClose) btnClose.style.display = 'inline-flex';
      } catch (err) {
        this.showError('Tidak dapat membuka kamera. Pastikan izin kamera telah diberikan.');
      }
    });

    btnCapture?.addEventListener('click', async () => {
      if (!video) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const compressedBlob = await compressImageToBlob(blob);
            this.#capturedBlob = compressedBlob;
            this.#showImagePreview(URL.createObjectURL(compressedBlob));
            this.#stopCamera();
          } catch (err) {
            this.showError(err.message || 'Gagal memproses hasil foto kamera.');
          }
        }
      }, 'image/jpeg', 0.9);
    });

    btnClose?.addEventListener('click', () => {
      this.#stopCamera();
    });
  }

  #stopCamera() {
    if (this.#currentStream) {
      StreamManager.unregister(this.#currentStream);
      this.#currentStream.getTracks().forEach((track) => track.stop());
      this.#currentStream = null;
    }

    const video = document.querySelector('#camera-video');
    const videoWrapper = document.querySelector('.video-preview-wrapper');
    const btnStart = document.querySelector('#btn-start-camera');
    const btnCapture = document.querySelector('#btn-capture-camera');
    const btnClose = document.querySelector('#btn-close-camera');

    if (video) video.srcObject = null;
    if (videoWrapper) videoWrapper.style.display = 'none';
    if (btnStart) btnStart.style.display = 'inline-flex';
    if (btnCapture) btnCapture.style.display = 'none';
    if (btnClose) btnClose.style.display = 'none';
  }

  #showImagePreview(url) {
    const previewImg = document.querySelector('#image-preview');
    const placeholder = document.querySelector('#preview-placeholder');
    const removeBtn = document.querySelector('#btn-remove-photo');

    if (previewImg) {
      previewImg.src = url;
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-block';
  }

  #hideImagePreview() {
    const previewImg = document.querySelector('#image-preview');
    const placeholder = document.querySelector('#preview-placeholder');
    const removeBtn = document.querySelector('#btn-remove-photo');

    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
  }

  #setupFormSubmission() {
    const form = document.querySelector('#add-story-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const description = document.querySelector('#story-description')?.value || '';
      const lat = document.querySelector('#story-lat')?.value || '';
      const lon = document.querySelector('#story-lon')?.value || '';

      await this.#presenter.submitDraftStory({
        description,
        photoBlob: this.#capturedBlob,
        lat,
        lon,
      });
    });
  }

  showLoading() {
    const submitBtn = document.querySelector('#btn-submit-story');
    if (submitBtn) {
      submitBtn.disabled = true;
      const text = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.btn-spinner');
      if (text) text.textContent = 'Mengunggah Cerita...';
      if (spinner) spinner.style.display = 'inline-block';
    }
  }

  hideLoading() {
    const submitBtn = document.querySelector('#btn-submit-story');
    if (submitBtn) {
      submitBtn.disabled = false;
      const text = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.btn-spinner');
      if (text) text.textContent = 'Bagikan Cerita';
      if (spinner) spinner.style.display = 'none';
    }
  }

  showError(message) {
    const alertEl = document.querySelector('#add-story-alert');
    if (alertEl) {
      alertEl.textContent = message;
      alertEl.className = 'auth-alert alert-danger';
      alertEl.style.display = 'block';
      alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  showSuccess(message) {
    const alertEl = document.querySelector('#add-story-alert');
    if (alertEl) {
      alertEl.textContent = message;
      alertEl.className = 'auth-alert alert-success';
      alertEl.style.display = 'block';
    }
  }

  clearFeedback() {
    const alertEl = document.querySelector('#add-story-alert');
    if (alertEl) {
      alertEl.textContent = '';
      alertEl.style.display = 'none';
    }
  }

  async navigateToHome() {
    await sleep(800);
    location.hash = '#/';
  }

  destroy() {
    this.#stopCamera();
    this.#presenter.handleTeardown();
    if (this.#pickerMarker) {
      this.#pickerMarker.remove();
      this.#pickerMarker = null;
    }
    if (this.#mapInstance) {
      this.#mapInstance.remove();
      this.#mapInstance = null;
    }
  }
}

export default AddStoryPage;
