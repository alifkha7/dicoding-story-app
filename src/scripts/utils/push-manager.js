import CONFIG from '../config';

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class PushManagerHelper {
  #vapidPublicKey = null;
  #baseUrl = null;
  #fetch = null;

  constructor({
    vapidPublicKey = CONFIG.PUSH_MSG_VAPID_PUBLIC_KEY,
    baseUrl = CONFIG.BASE_URL,
    fetchInstance = fetch,
  } = {}) {
    this.#vapidPublicKey = vapidPublicKey;
    this.#baseUrl = baseUrl;
    const globalContext = typeof window !== 'undefined' ? window : globalThis;
    this.#fetch = typeof fetchInstance?.bind === 'function' && fetchInstance === fetch
      ? fetchInstance.bind(globalContext)
      : fetchInstance;
  }

  isSupported() {
    const scope = typeof window !== 'undefined' ? window : globalThis;
    const nav = typeof navigator !== 'undefined' ? navigator : globalThis.navigator;
    return Boolean(
      nav &&
      'serviceWorker' in nav &&
      scope &&
      'PushManager' in scope &&
      'Notification' in scope,
    );
  }

  async getRegistration(timeoutMs = 5000) {
    if (!this.isSupported()) return null;
    let timerId = null;
    try {
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error('Timeout menunggu Service Worker siap.')), timeoutMs);
      });
      return await Promise.race([readyPromise, timeoutPromise]);
    } catch (err) {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
        console.warn('getRegistration fallback triggered:', err);
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration?.();
        return reg || null;
      } catch {
        return null;
      }
    } finally {
      if (timerId) {
        clearTimeout(timerId);
      }
    }
  }

  async getSubscription() {
    if (!this.isSupported()) return null;
    const registration = await this.getRegistration();
    if (!registration || !registration.pushManager) return null;
    return await registration.pushManager.getSubscription();
  }

  async isSubscribed() {
    const subscription = await this.getSubscription();
    return Boolean(subscription);
  }

  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push Notifications tidak didukung di peramban ini.');
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Izin notifikasi tidak diberikan oleh pengguna.');
    }
    return permission;
  }

  async subscribe({ token }) {
    if (!this.isSupported()) {
      throw new Error('Push Notifications tidak didukung pada browser ini.');
    }

    await this.requestPermission();

    const registration = await this.getRegistration();
    if (!registration) {
      throw new Error('Service Worker belum siap untuk registrasi push notification.');
    }

    const convertedVapidKey = urlBase64ToUint8Array(this.#vapidPublicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // Send subscription to Dicoding Story API
    await this.#registerSubscriptionToApi({ token, subscription });

    return subscription;
  }

  async unsubscribe({ token }) {
    if (!this.isSupported()) return false;

    const subscription = await this.getSubscription();
    if (!subscription) {
      return true;
    }

    // Inform Dicoding Story API before or after unsubscribing
    try {
      await this.#unregisterSubscriptionFromApi({ token, subscription });
    } catch (err) {
      console.warn('Gagal menghapus langganan di server:', err);
    }

    const unsubscribed = await subscription.unsubscribe();
    return unsubscribed;
  }

  async #registerSubscriptionToApi({ token, subscription }) {
    const subJson = subscription.toJSON ? subscription.toJSON() : subscription;
    const { endpoint, keys } = subJson;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.#fetch(`${this.#baseUrl}/notifications/subscribe`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        endpoint,
        keys: {
          p256dh: keys?.p256dh,
          auth: keys?.auth,
        },
      }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal mendaftarkan langganan notifikasi ke server.');
    }
    return responseJson;
  }

  async #unregisterSubscriptionFromApi({ token, subscription }) {
    const subJson = subscription.toJSON ? subscription.toJSON() : subscription;
    const { endpoint } = subJson;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.#fetch(`${this.#baseUrl}/notifications/subscribe`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        endpoint,
      }),
    });

    const responseJson = await response.json();
    if (!response.ok) {
      throw new Error(responseJson.message || 'Gagal menghapus langganan notifikasi dari server.');
    }
    return responseJson;
  }
}

export default PushManagerHelper;
