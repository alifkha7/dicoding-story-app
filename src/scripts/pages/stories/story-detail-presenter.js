import Database from '../../data/database';

class StoryDetailPresenter {
  #view = null;
  #storyModel = null;
  #authModel = null;
  #database = null;

  constructor({ view, storyModel, authModel, database = Database }) {
    this.#view = view;
    this.#storyModel = storyModel;
    this.#authModel = authModel;
    this.#database = database;
  }

  async loadStoryDetail(id) {
    if (!id) {
      this.#view.showError('ID cerita tidak valid.');
      return;
    }

    try {
      this.#view.showLoading();
      this.#view.clearError();

      const token = this.#authModel.getToken();
      const response = await this.#storyModel.getStoryDetail({ token, id });
      const story = response.story;

      if (!story) {
        this.#view.showError('Cerita tidak ditemukan.');
        return;
      }

      this.#view.renderStoryDetail(story);

      if (story.lat !== null && story.lat !== undefined && story.lon !== null && story.lon !== undefined) {
        this.#view.renderLocationMap({
          lat: Number(story.lat),
          lon: Number(story.lon),
          name: story.name,
          description: story.description,
        });
      } else {
        this.#view.showNoLocationNotice();
      }
    } catch (error) {
      this.#view.showError(error.message || 'Gagal memuat detail cerita.');
    } finally {
      this.#view.hideLoading();
    }
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
}

export default StoryDetailPresenter;
