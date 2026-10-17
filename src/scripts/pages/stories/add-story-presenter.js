class AddStoryPresenter {
  #view = null;
  #storyModel = null;
  #authModel = null;
  #streamManager = null;

  constructor({ view, storyModel, authModel, streamManager }) {
    this.#view = view;
    this.#storyModel = storyModel;
    this.#authModel = authModel;
    this.#streamManager = streamManager;
  }

  async submitDraftStory({ description, photoBlob, lat, lon }) {
    if (!description || !description.trim()) {
      this.#view.showError('Deskripsi cerita tidak boleh kosong.');
      return false;
    }

    if (!photoBlob) {
      this.#view.showError('Foto cerita wajib dilampirkan (unggah file atau ambil dari kamera).');
      return false;
    }

    // Validate 1 MB limit (1,048,576 bytes)
    if (photoBlob.size > 1024 * 1024) {
      this.#view.showError('Ukuran foto melebihi batas 1 MB. Silakan gunakan foto lain.');
      return false;
    }

    // Validate coordinates range if supplied
    let parsedLat = null;
    let parsedLon = null;

    if (lat !== undefined && lat !== null && lat !== '') {
      parsedLat = parseFloat(lat);
      if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        this.#view.showError('Nilai latitude tidak valid (harus berada di antara -90 dan 90).');
        return false;
      }
    }

    if (lon !== undefined && lon !== null && lon !== '') {
      parsedLon = parseFloat(lon);
      if (isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
        this.#view.showError('Nilai longitude tidak valid (harus berada di antara -180 dan 180).');
        return false;
      }
    }

    try {
      this.#view.showLoading();
      this.#view.clearFeedback();

      // Ensure any hardware camera stream is stopped prior to sending
      if (this.#streamManager && typeof this.#streamManager.stopAll === 'function') {
        this.#streamManager.stopAll();
      }

      const token = this.#authModel.getToken();

      await this.#storyModel.addStory({
        token,
        description: description.trim(),
        photo: photoBlob,
        lat: parsedLat,
        lon: parsedLon,
      });

      this.#view.showSuccess('Cerita Anda berhasil dibagikan!');
      this.#view.navigateToHome();
      return true;
    } catch (error) {
      this.#view.showError(error.message || 'Gagal menambahkan cerita. Silakan coba kembali.');
      return false;
    } finally {
      this.#view.hideLoading();
    }
  }

  handleTeardown() {
    if (this.#streamManager && typeof this.#streamManager.stopAll === 'function') {
      this.#streamManager.stopAll();
    }
  }
}

export default AddStoryPresenter;
