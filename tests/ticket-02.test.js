import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPresenter from '../src/scripts/pages/auth/login-presenter';
import RegisterPresenter from '../src/scripts/pages/auth/register-presenter';

describe('Ticket 02 Unit Tests — Authentication Presenters', () => {
  let fakeView;
  let fakeStoryModel;
  let fakeAuthModel;

  beforeEach(() => {
    fakeView = {
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showError: vi.fn(),
      showSuccess: vi.fn(),
      clearFeedback: vi.fn(),
      navigateToHome: vi.fn(),
      navigateToLogin: vi.fn(),
    };

    fakeStoryModel = {
      login: vi.fn(),
      register: vi.fn(),
    };

    fakeAuthModel = {
      saveAuth: vi.fn(),
      clearAuth: vi.fn(),
      isAuthenticated: vi.fn(),
    };
  });

  describe('LoginPresenter', () => {
    it('should validate empty email and password', async () => {
      const presenter = new LoginPresenter({
        view: fakeView,
        storyModel: fakeStoryModel,
        authModel: fakeAuthModel,
      });

      await presenter.login({ email: '', password: 'password123' });
      expect(fakeView.showError).toHaveBeenCalledWith('Email tidak boleh kosong.');
      expect(fakeStoryModel.login).not.toHaveBeenCalled();

      await presenter.login({ email: 'user@mail.com', password: '' });
      expect(fakeView.showError).toHaveBeenCalledWith('Kata sandi tidak boleh kosong.');
      expect(fakeStoryModel.login).not.toHaveBeenCalled();
    });

    it('should successfully login and persist auth data', async () => {
      fakeStoryModel.login.mockResolvedValue({
        error: false,
        message: 'success',
        loginResult: {
          userId: 'user-123',
          name: 'Arif Faizin',
          token: 'token-xyz',
        },
      });

      const presenter = new LoginPresenter({
        view: fakeView,
        storyModel: fakeStoryModel,
        authModel: fakeAuthModel,
      });

      const success = await presenter.login({ email: 'arif@mail.com', password: 'password123' });

      expect(success).toBe(true);
      expect(fakeView.showLoading).toHaveBeenCalled();
      expect(fakeAuthModel.saveAuth).toHaveBeenCalledWith({
        userId: 'user-123',
        name: 'Arif Faizin',
        token: 'token-xyz',
      });
      expect(fakeView.showSuccess).toHaveBeenCalledWith(expect.stringContaining('Arif Faizin'));
      expect(fakeView.navigateToHome).toHaveBeenCalled();
      expect(fakeView.hideLoading).toHaveBeenCalled();
    });

    it('should show error when login fails', async () => {
      fakeStoryModel.login.mockRejectedValue(new Error('Email atau password salah'));

      const presenter = new LoginPresenter({
        view: fakeView,
        storyModel: fakeStoryModel,
        authModel: fakeAuthModel,
      });

      const success = await presenter.login({ email: 'arif@mail.com', password: 'wrong' });

      expect(success).toBe(false);
      expect(fakeView.showError).toHaveBeenCalledWith('Email atau password salah');
      expect(fakeAuthModel.saveAuth).not.toHaveBeenCalled();
      expect(fakeView.navigateToHome).not.toHaveBeenCalled();
      expect(fakeView.hideLoading).toHaveBeenCalled();
    });
  });

  describe('RegisterPresenter', () => {
    it('should validate name, email format, and password length (>= 8 chars)', async () => {
      const presenter = new RegisterPresenter({
        view: fakeView,
        storyModel: fakeStoryModel,
      });

      await presenter.register({ name: '', email: 'test@mail.com', password: 'password123' });
      expect(fakeView.showError).toHaveBeenCalledWith('Nama lengkap tidak boleh kosong.');

      await presenter.register({ name: 'User', email: 'invalid-email', password: 'password123' });
      expect(fakeView.showError).toHaveBeenCalledWith('Format email tidak valid.');

      await presenter.register({ name: 'User', email: 'test@mail.com', password: '123' });
      expect(fakeView.showError).toHaveBeenCalledWith('Kata sandi minimal harus 8 karakter.');

      expect(fakeStoryModel.register).not.toHaveBeenCalled();
    });

    it('should successfully register and navigate to login', async () => {
      fakeStoryModel.register.mockResolvedValue({ error: false, message: 'User Created' });

      const presenter = new RegisterPresenter({
        view: fakeView,
        storyModel: fakeStoryModel,
      });

      const success = await presenter.register({
        name: 'Arif Faizin',
        email: 'arif@mail.com',
        password: 'password123',
      });

      expect(success).toBe(true);
      expect(fakeStoryModel.register).toHaveBeenCalledWith({
        name: 'Arif Faizin',
        email: 'arif@mail.com',
        password: 'password123',
      });
      expect(fakeView.showSuccess).toHaveBeenCalledWith(expect.stringContaining('Pendaftaran berhasil'));
      expect(fakeView.navigateToLogin).toHaveBeenCalled();
      expect(fakeView.hideLoading).toHaveBeenCalled();
    });
  });
});
