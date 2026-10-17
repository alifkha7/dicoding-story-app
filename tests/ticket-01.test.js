import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthModel from '../src/scripts/data/auth-model';
import StoryModel from '../src/scripts/data/story-model';
import StreamManager from '../src/scripts/utils/stream-manager';
import { getRoute } from '../src/scripts/routes/url-parser';

describe('Ticket 01 Unit Tests', () => {
  describe('url-parser', () => {
    it('should correctly parse standard routes', () => {
      expect(getRoute('/')).toBe('/');
      expect(getRoute('/login')).toBe('/login');
      expect(getRoute('/register')).toBe('/register');
      expect(getRoute('/add')).toBe('/add');
      expect(getRoute('/stories/story-123')).toBe('/stories/:id');
    });
  });

  describe('AuthModel', () => {
    let fakeStorage = {};
    let authModel;

    beforeEach(() => {
      fakeStorage = {};
      const mockStorage = {
        getItem: vi.fn((key) => fakeStorage[key] || null),
        setItem: vi.fn((key, val) => {
          fakeStorage[key] = val;
        }),
        removeItem: vi.fn((key) => {
          delete fakeStorage[key];
        }),
      };
      authModel = new AuthModel(mockStorage);
    });

    it('should initially be unauthenticated', () => {
      expect(authModel.isAuthenticated()).toBe(false);
      expect(authModel.getToken()).toBeNull();
      expect(authModel.getUser()).toBeNull();
    });

    it('should save auth data and report authenticated', () => {
      authModel.saveAuth({
        userId: 'user-1',
        name: 'Budi',
        token: 'token-abc',
      });

      expect(authModel.isAuthenticated()).toBe(true);
      expect(authModel.getToken()).toBe('token-abc');
      expect(authModel.getUser()).toEqual({ userId: 'user-1', name: 'Budi' });
    });

    it('should clear auth data upon logout', () => {
      authModel.saveAuth({
        userId: 'user-1',
        name: 'Budi',
        token: 'token-abc',
      });
      authModel.clearAuth();

      expect(authModel.isAuthenticated()).toBe(false);
      expect(authModel.getToken()).toBeNull();
      expect(authModel.getUser()).toBeNull();
    });
  });

  describe('StreamManager (ADR-0003)', () => {
    it('should register and stop all active stream tracks', () => {
      const stopTrack1 = vi.fn();
      const stopTrack2 = vi.fn();

      const fakeStream1 = {
        getTracks: () => [{ stop: stopTrack1 }],
      };
      const fakeStream2 = {
        getTracks: () => [{ stop: stopTrack2 }],
      };

      StreamManager.register(fakeStream1);
      StreamManager.register(fakeStream2);
      expect(StreamManager.getActiveCount()).toBe(2);

      StreamManager.stopAll();
      expect(stopTrack1).toHaveBeenCalledTimes(1);
      expect(stopTrack2).toHaveBeenCalledTimes(1);
      expect(StreamManager.getActiveCount()).toBe(0);
    });
  });

  describe('StoryModel', () => {
    it('should call fetch with correct register payload', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: false, message: 'User Created' }),
      });

      const storyModel = new StoryModel({ baseUrl: 'https://test-api.dev', fetchInstance: mockFetch });
      const result = await storyModel.register({ name: 'User', email: 'test@mail.com', password: 'password123' });

      expect(mockFetch).toHaveBeenCalledWith('https://test-api.dev/register', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'User', email: 'test@mail.com', password: 'password123' }),
      }));
      expect(result.error).toBe(false);
    });

    it('should throw error when login fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: true, message: 'Invalid credentials' }),
      });

      const storyModel = new StoryModel({ baseUrl: 'https://test-api.dev', fetchInstance: mockFetch });
      await expect(storyModel.login({ email: 'bad@mail.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('should include Authorization Bearer header when fetching stories', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: false, listStory: [] }),
      });

      const storyModel = new StoryModel({ baseUrl: 'https://test-api.dev', fetchInstance: mockFetch });
      await storyModel.getStories({ token: 'secret-token', page: 1, size: 10, location: 1 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://test-api.dev/stories?page=1&size=10&location=1'),
        expect.objectContaining({
          method: 'GET',
          headers: { Authorization: 'Bearer secret-token' },
        })
      );
    });
  });
});
