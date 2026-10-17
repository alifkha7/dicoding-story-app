const AUTH_KEY = 'STORY_APP_AUTH';

class AuthModel {
  #storage = null;

  constructor(storage = window.localStorage) {
    this.#storage = storage;
  }

  saveAuth({ userId, name, token }) {
    if (!token) return;
    const authData = JSON.stringify({ userId, name, token });
    this.#storage.setItem(AUTH_KEY, authData);
  }

  getAuth() {
    try {
      const authData = this.#storage.getItem(AUTH_KEY);
      return authData ? JSON.parse(authData) : null;
    } catch {
      return null;
    }
  }

  getToken() {
    const auth = this.getAuth();
    return auth ? auth.token : null;
  }

  getUser() {
    const auth = this.getAuth();
    if (!auth) return null;
    return {
      userId: auth.userId,
      name: auth.name,
    };
  }

  isAuthenticated() {
    return Boolean(this.getToken());
  }

  clearAuth() {
    this.#storage.removeItem(AUTH_KEY);
  }
}

export default AuthModel;
