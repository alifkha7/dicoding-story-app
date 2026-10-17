class StoryDetailPresenter {
  #view = null;
  #storyModel = null;
  #authModel = null;

  constructor({ view, storyModel, authModel }) {
    this.#view = view;
    this.#storyModel = storyModel;
    this.#authModel = authModel;
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
}

export default StoryDetailPresenter;
