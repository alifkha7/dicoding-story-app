class RegisterPresenter {
  #view = null;
  #storyModel = null;

  constructor({ view, storyModel }) {
    this.#view = view;
    this.#storyModel = storyModel;
  }

  async register({ name, email, password }) {
    if (!name || !name.trim()) {
      this.#view.showError('Nama lengkap tidak boleh kosong.');
      return false;
    }

    if (!email || !email.trim()) {
      this.#view.showError('Email tidak boleh kosong.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      this.#view.showError('Format email tidak valid.');
      return false;
    }

    if (!password || password.length < 8) {
      this.#view.showError('Kata sandi minimal harus 8 karakter.');
      return false;
    }

    try {
      this.#view.showLoading();
      this.#view.clearFeedback();

      await this.#storyModel.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      this.#view.showSuccess('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
      this.#view.navigateToLogin();
      return true;
    } catch (error) {
      this.#view.showError(error.message || 'Pendaftaran gagal. Email mungkin sudah terdaftar.');
      return false;
    } finally {
      this.#view.hideLoading();
    }
  }
}

export default RegisterPresenter;
