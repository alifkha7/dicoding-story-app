import CONFIG from '../config';

class StoryModel {
  #baseUrl = null;
  #fetch = null;

  constructor({ baseUrl = CONFIG.BASE_URL, fetchInstance = fetch } = {}) {
    this.#baseUrl = baseUrl;
    const globalContext = typeof window !== 'undefined' ? window : globalThis;
    this.#fetch = typeof fetchInstance?.bind === 'function' && fetchInstance === fetch
      ? fetchInstance.bind(globalContext)
      : fetchInstance;
  }

  async register({ name, email, password }) {
    const response = await this.#fetch(`${this.#baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal melakukan pendaftaran akun.');
    }
    return responseJson;
  }

  async login({ email, password }) {
    const response = await this.#fetch(`${this.#baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal masuk akun. Periksa email dan kata sandi Anda.');
    }
    return responseJson;
  }

  async getStories({ token, page = 1, size = 20, location = 0 } = {}) {
    const url = new URL(`${this.#baseUrl}/stories`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', location);

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.#fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal memuat daftar cerita.');
    }
    return responseJson;
  }

  async getStoryDetail({ token, id }) {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.#fetch(`${this.#baseUrl}/stories/${id}`, {
      method: 'GET',
      headers,
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal memuat detail cerita.');
    }
    return responseJson;
  }

  async addStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);

    if (lat !== undefined && lat !== null && lat !== '') {
      formData.append('lat', lat);
    }
    if (lon !== undefined && lon !== null && lon !== '') {
      formData.append('lon', lon);
    }

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.#fetch(`${this.#baseUrl}/stories`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal menambahkan cerita baru.');
    }
    return responseJson;
  }
}

export default StoryModel;
