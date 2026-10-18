import LoginPresenter from './login-presenter';
import StoryModel from '../../data/story-model';
import AuthModel from '../../data/auth-model';
import { sleep } from '../../utils';

class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="container auth-container" aria-labelledby="login-title">
        <div class="auth-card">
          <div class="auth-header">
            <h1 id="login-title">Masuk ke Story App</h1>
            <p>Jelajahi dan bagikan momen menarik bersama komunitas Dicoding.</p>
          </div>

          <div id="auth-alert" class="auth-alert" role="alert" aria-live="assertive" style="display: none;"></div>

          <form id="login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="login-email">Alamat Email <span aria-hidden="true">*</span></label>
              <input
                type="email"
                id="login-email"
                name="email"
                required
                autocomplete="email"
                placeholder="nama@email.com"
                aria-required="true"
              />
              <span id="login-email-error" class="input-error" aria-live="polite"></span>
            </div>

            <div class="form-group">
              <label for="login-password">Kata Sandi <span aria-hidden="true">*</span></label>
              <input
                type="password"
                id="login-password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="Minimal 8 karakter"
                aria-required="true"
              />
              <span id="login-password-error" class="input-error" aria-live="polite"></span>
            </div>

            <button type="submit" id="btn-login-submit" class="btn btn-primary btn-block">
              <span class="btn-text">Masuk</span>
              <span class="btn-spinner" aria-hidden="true" style="display: none;">...</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Belum memiliki akun? <a href="#/register">Daftar sekarang</a></p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyModel = new StoryModel();
    const authModel = new AuthModel();

    this.#presenter = new LoginPresenter({
      view: this,
      storyModel,
      authModel,
    });

    const form = document.querySelector('#login-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.querySelector('#login-email')?.value || '';
      const password = document.querySelector('#login-password')?.value || '';

      await this.#presenter.login({ email, password });
    });
  }

  showLoading() {
    const submitBtn = document.querySelector('#btn-login-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      const text = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.btn-spinner');
      if (text) text.textContent = 'Memproses...';
      if (spinner) spinner.style.display = 'inline-block';
    }
  }

  hideLoading() {
    const submitBtn = document.querySelector('#btn-login-submit');
    if (submitBtn) {
      submitBtn.disabled = false;
      const text = submitBtn.querySelector('.btn-text');
      const spinner = submitBtn.querySelector('.btn-spinner');
      if (text) text.textContent = 'Masuk';
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

  async navigateToHome() {
    await sleep(600);
    location.hash = '#/';
  }

  destroy() {
    this.clearFeedback();
  }
}

export default LoginPage;
