import Database from '../../data/database';

class HomePresenter {
  #view = null;
  #storyModel = null;
  #authModel = null;
  #database = null;
  #stories = [];
  #locationFilter = 'all'; // 'all' | 'located'
  #activeStoryId = null;

  constructor({ view, storyModel, authModel, database = Database }) {
    this.#view = view;
    this.#storyModel = storyModel;
    this.#authModel = authModel;
    this.#database = database;
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

  async isBookmarked(id) {
    if (!this.#database || !id) return false;
    return this.#database.isBookmarked(id);
  }

  async toggleBookmark(story) {
    if (!this.#database || !story || !story.id) return false;
    const isSaved = await this.#database.isBookmarked(story.id);
    if (isSaved) {
      await this.#database.deleteBookmark(story.id);
      return false; // now not bookmarked
    } else {
      await this.#database.saveBookmark(story);
      return true; // now bookmarked
    }
  }

  async getAllBookmarks() {
    if (!this.#database) return [];
    return this.#database.getAllBookmarks();
  }
}

export default HomePresenter;
