class HomePresenter {
  #view = null;
  #storyModel = null;
  #authModel = null;
  #stories = [];
  #locationFilter = 'all'; // 'all' | 'located'
  #activeStoryId = null;

  constructor({ view, storyModel, authModel }) {
    this.#view = view;
    this.#storyModel = storyModel;
    this.#authModel = authModel;
  }

  async loadStories() {
    try {
      this.#view.showLoading();
      this.#view.clearError();

      const token = this.#authModel.getToken();
      // Fetch location=0 to obtain all stories, then filter client-side
      const response = await this.#storyModel.getStories({ token, location: 0, size: 50 });
      this.#stories = response.listStory || [];

      this.applyFilter(this.#locationFilter);
    } catch (error) {
      this.#view.showError(error.message || 'Gagal memuat cerita. Silakan coba lagi.');
    } finally {
      this.#view.hideLoading();
    }
  }

  applyFilter(filterType) {
    this.#locationFilter = filterType;

    const filteredStories = this.#locationFilter === 'located'
      ? this.#stories.filter((story) => story.lat !== null && story.lat !== undefined && story.lon !== null && story.lon !== undefined)
      : this.#stories;

    this.#view.renderStories(filteredStories);
    this.#view.renderMapMarkers(filteredStories.filter((story) => story.lat !== null && story.lon !== null));
    this.#view.updateFilterUI(this.#locationFilter);
  }

  selectActiveStory(storyId) {
    this.#activeStoryId = storyId;
    const story = this.#stories.find((s) => s.id === storyId);

    this.#view.highlightActiveCard(storyId);

    if (story && story.lat !== null && story.lon !== null) {
      this.#view.focusMapOnCoordinates({
        lat: story.lat,
        lon: story.lon,
        storyId: story.id,
      });
    }
  }

  getActiveStoryId() {
    return this.#activeStoryId;
  }

  getLocationFilter() {
    return this.#locationFilter;
  }
}

export default HomePresenter;
