class FavoritesPresenter {
  #view = null;
  #database = null;
  #bookmarks = [];
  #searchQuery = '';
  #locationFilter = 'all'; // 'all' | 'located'

  constructor({ view, database }) {
    this.#view = view;
    this.#database = database;
  }

  async loadBookmarks() {
    try {
      this.#view.showLoading();
      this.#bookmarks = await this.#database.getAllBookmarks();
      this.#applyFilterAndSearch();
    } catch (error) {
      this.#view.showError(error.message || 'Gagal memuat cerita tersimpan.');
    } finally {
      this.#view.hideLoading();
    }
  }

  searchBookmarks(query) {
    this.#searchQuery = (query || '').trim().toLowerCase();
    this.#applyFilterAndSearch();
  }

  filterBookmarks(locationFilter) {
    this.#locationFilter = locationFilter;
    this.#applyFilterAndSearch();
  }

  async removeBookmark(id) {
    try {
      await this.#database.deleteBookmark(id);
      this.#bookmarks = await this.#database.getAllBookmarks();
      this.#applyFilterAndSearch();
    } catch (error) {
      this.#view.showError(error.message || 'Gagal menghapus cerita tersimpan.');
    }
  }

  #applyFilterAndSearch() {
    let result = [...this.#bookmarks];

    if (this.#locationFilter === 'located') {
      result = result.filter(
        (story) =>
          story.lat !== null &&
          story.lat !== undefined &&
          story.lon !== null &&
          story.lon !== undefined
      );
    }

    if (this.#searchQuery) {
      result = result.filter((story) => {
        const name = (story.name || '').toLowerCase();
        const description = (story.description || '').toLowerCase();
        return name.includes(this.#searchQuery) || description.includes(this.#searchQuery);
      });
    }

    if (result.length === 0) {
      this.#view.showEmptyState();
    } else {
      this.#view.renderBookmarks(result);
    }
  }

  getBookmarks() {
    return this.#bookmarks;
  }

  getSearchQuery() {
    return this.#searchQuery;
  }

  getLocationFilter() {
    return this.#locationFilter;
  }
}

export default FavoritesPresenter;
