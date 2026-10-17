import RegisterPresenter from './register-presenter';
import StoryModel from '../../data/story-model';
import { sleep } from '../../utils';

class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="container auth-container" aria-labelledby="register-title">
        <div class="auth-card">
          <div class="auth-header">
            <h1 id="register-title">Daftar Akun Baru</h1>
            <p>Bergabunglah dengan komunitas Dicoding untuk mulai berbagi cerita.</p>
          </div>

          <div id="auth-alert" class="auth-alert" role="alert" aria-live="assertive" style="display: none;"></div>

          <form id="register-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="register-name">Nama Lengkap <span aria-hidden="true">*</span></label>
              <input
                type="text"
                id="register-name"
                name="name"
                required
                autocomplete="name"
                placeholder="Contoh: Arif Faizin"
                aria-required="true"
              />
            </div>

            <div class="form-group">
              <label for="register-email">Alamat Email <span aria-hidden="true">*</span></label>
              <input
                type="email"
                id="register-email"
                name="email"
                required
                autocomplete="email"
                placeholder="nama@email.com"
                aria-required="true"
              />
            </div>

            <div class="form-group">
              <label for="register-password">Kata Sandi <span aria-hidden="true">*</span></label>
              <input
                type="password"
                id="register-password"
                name="password"
                required
                autocomplete="new-password"
                placeholder="Minimal 8 karakter"
                aria-required="true"
              />
              <small class="form-hint">Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.</small>
            </div>

            <button type="submit" id="btn-register-submit" class="btn btn-primary btn-block">
              <span class="btn-text">Daftar Sekarang</span>
              <span class="btn-spinner" aria-hidden="true" style="display: none;">⏳</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyModel = new StoryModel();

    this.#presenter = new RegisterPresenter({
      view: this,
      storyModel,
    });

    const form = document.querySelector('#register-form');
    if (!form) return;

    const nameInput = document.querySelector('#register-name');
    const emailInput = document.querySelector('#register-email');
    const passwordInput = document.querySelector('#register-password');

    nameInput?.addEventListener('input', () => {
      if (nameInput.value.trim().length > 0) this.clearFeedback();
    });

    emailInput?.addEventListener('input', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(emailInput.value.trim())) this.clearFeedback();
    });

    passwordInput?.addEventListener('input', () => {
      if (passwordInput.value.length >= 8) this.clearFeedback();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.querySelector('#register-name')?.value || '';
      const email = document.querySelector('#register-email')?.value || '';
      const password = document.querySelector('#register-password')?.value || '';

      await this.#presenter.register({ name, email, password });
    });
  }

  showLoading() {
    const submitBtn = document.querySelector('#btn-register-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      const text = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.btn-spinner');
      if (text) text.textContent = 'Mendaftarkan...';
      if (spinner) spinner.style.display = 'inline-block';
    }
  }

  hideLoading() {
    const submitBtn = document.querySelector('#btn-register-submit');
    if (submitBtn) {
      submitBtn.disabled = false;
      const text = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.btn-spinner');
      if (text) text.textContent = 'Daftar Sekarang';
      if (spinner) spinner.style.display = 'none';
    }
  }

  showError(message) {
    const alertEl = document.querySelector('#auth-alert');
    if (alertEl) {
      alertEl.textContent = message;
      alertEl.className = 'auth-alert alert-danger';
      alertEl.style.display = 'block';
    }
  }

  showSuccess(message) {
    const alertEl = document.querySelector('#auth-alert');
    if (alertEl) {
      alertEl.textContent = message;
      alertEl.className = 'auth-alert alert-success';
      alertEl.style.display = 'block';
    }
  }

  clearFeedback() {
    const alertEl = document.querySelector('#auth-alert');
    if (alertEl) {
      alertEl.textContent = '';
      alertEl.style.display = 'none';
    }
  }

  async navigateToLogin() {
    await sleep(800);
    location.hash = '#/login';
  }

  destroy() {
    this.clearFeedback();
  }
}

export default RegisterPage;
