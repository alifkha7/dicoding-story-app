import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PushManagerHelper, { urlBase64ToUint8Array } from '../src/scripts/utils/push-manager';

describe('PushManagerHelper and Web Push Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('urlBase64ToUint8Array', () => {
    it('should correctly convert a URL-safe base64 string to a Uint8Array', () => {
      // "hello" in base64 is "aGVsbG8="
      const sampleBase64 = 'aGVsbG8';
      const uint8 = urlBase64ToUint8Array(sampleBase64);

      expect(uint8).toBeInstanceOf(Uint8Array);
      expect(uint8.length).toBe(5);
      const decoded = String.fromCharCode(...uint8);
      expect(decoded).toBe('hello');
    });

    it('should convert standard Dicoding VAPID public key without throwing', () => {
      const vapidKey = 'BCCs_w-p5kKM-b8LpmHiVsmHiBMm_9sF9_v3nF2_7sI';
      const uint8 = urlBase64ToUint8Array(vapidKey);
      expect(uint8).toBeInstanceOf(Uint8Array);
      expect(uint8.length).toBeGreaterThan(0);
    });
  });

  describe('isSupported', () => {
    it('should return true when serviceWorker, PushManager, and Notification exist in environment', () => {
      window.PushManager = {};
      navigator.serviceWorker = {};
      window.Notification = {};

      const helper = new PushManagerHelper();
      expect(helper.isSupported()).toBe(true);
    });

    it('should return false when PushManager or Notification is missing', () => {
      delete window.PushManager;
      delete window.Notification;

      const helper = new PushManagerHelper();
      expect(helper.isSupported()).toBe(false);
    });
  });

  describe('requestPermission', () => {
    it('should resolve granted permission when user allows notifications', async () => {
      window.PushManager = {};
      navigator.serviceWorker = {};
      window.Notification = {
        requestPermission: vi.fn().mockResolvedValue('granted'),
      };

      const helper = new PushManagerHelper();
      const result = await helper.requestPermission();
      expect(result).toBe('granted');
    });

    it('should throw error when user denies notification permission', async () => {
      window.PushManager = {};
      navigator.serviceWorker = {};
      window.Notification = {
        requestPermission: vi.fn().mockResolvedValue('denied'),
      };

      const helper = new PushManagerHelper();
      await expect(helper.requestPermission()).rejects.toThrow(
        'Izin notifikasi tidak diberikan oleh pengguna.',
      );
    });
  });

  describe('subscribe & unsubscribe lifecycle', () => {
    it('should subscribe via pushManager and post subscription to Dicoding API', async () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint',
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint',
          keys: {
            p256dh: 'fake-p256dh',
            auth: 'fake-auth',
          },
        }),
        unsubscribe: vi.fn().mockResolvedValue(true),
      };

      const mockPushManager = {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue(mockSubscription),
      };

      const mockRegistration = {
        pushManager: mockPushManager,
      };

      window.PushManager = mockPushManager;
      navigator.serviceWorker = {
        ready: Promise.resolve(mockRegistration),
      };
      window.Notification = {
        requestPermission: vi.fn().mockResolvedValue('granted'),
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: false, message: 'Subscription added successfully' }),
      });

      const helper = new PushManagerHelper({
        fetchInstance: mockFetch,
        vapidPublicKey: 'BCCs_w-p5kKM-b8LpmHiVsmHiBMm_9sF9_v3nF2_7sI',
      });

      const sub = await helper.subscribe({ token: 'test-token' });

      expect(sub).toBe(mockSubscription);
      expect(mockPushManager.subscribe).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/subscribe'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should unsubscribe and notify Dicoding API delete endpoint', async () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint',
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/fake-endpoint',
        }),
        unsubscribe: vi.fn().mockResolvedValue(true),
      };

      const mockPushManager = {
        getSubscription: vi.fn().mockResolvedValue(mockSubscription),
      };

      const mockRegistration = {
        pushManager: mockPushManager,
      };

      window.PushManager = mockPushManager;
      navigator.serviceWorker = {
        ready: Promise.resolve(mockRegistration),
      };
      window.Notification = {};

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: false, message: 'Subscription removed successfully' }),
      });

      const helper = new PushManagerHelper({
        fetchInstance: mockFetch,
      });

      const result = await helper.unsubscribe({ token: 'test-token' });

      expect(result).toBe(true);
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/subscribe'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });
});
