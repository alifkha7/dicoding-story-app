class LoginPresenter {
  #view = null;
  #storyModel = null;
  #authModel = null;

  constructor({ view, storyModel, authModel }) {
    this.#view = view;
    this.#storyModel = storyModel;
    this.#authModel = authModel;
  }

  async login({ email, password }) {
    if (!email || !email.trim()) {
      this.#view.showError('Email tidak boleh kosong.');
      return false;
    }

    if (!password || !password.trim()) {
      this.#view.showError('Kata sandi tidak boleh kosong.');
      return false;
    }

    try {
      this.#view.showLoading();
      this.#view.clearFeedback();

      const response = await this.#storyModel.login({ email, password });
      const { loginResult } = response;

      this.#authModel.saveAuth({
        userId: loginResult.userId,
        name: loginResult.name,
        token: loginResult.token,
      });

      this.#view.showSuccess(`Selamat datang kembali, ${loginResult.name}!`);
      this.#view.navigateToHome();
      return true;
    } catch (error) {
      this.#view.showError(error.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
      return false;
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default LoginPresenter;
