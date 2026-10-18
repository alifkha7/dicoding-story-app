import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Service Worker Workbox Runtime Caching', () => {
  const swSource = fs.readFileSync(path.resolve(__dirname, '../src/sw.js'), 'utf8');

  it('configures NetworkFirst runtime caching for Dicoding Story API endpoints with 24-hour expiration', () => {
    expect(swSource).toContain('NetworkFirst');
    expect(swSource).toContain('https://story-api.dicoding.dev');
    expect(swSource).toContain('/v1/stories');
    expect(swSource).toContain('dicoding-story-api');
    expect(swSource).toContain('maxEntries: 50');
    expect(swSource).toContain('24 * 60 * 60');
  });

  it('configures StaleWhileRevalidate runtime caching for remote story images with 60-entry limit', () => {
    expect(swSource).toContain('StaleWhileRevalidate');
    expect(swSource).toContain('dicoding-story-images');
    expect(swSource).toContain('maxEntries: 60');
    expect(swSource).toContain('7 * 24 * 60 * 60');
  });

  it('configures CacheFirst runtime caching for third-party Leaflet CDN assets and map tiles', () => {
    expect(swSource).toContain('CacheFirst');
    expect(swSource).toContain('unpkg.com');
    expect(swSource).toContain('leaflet');
    expect(swSource).toContain('tile.openstreetmap.org');
    expect(swSource).toContain('tile.opentopomap.org');
    expect(swSource).toContain('arcgisonline.com');
  });

  it('configures CacheFirst runtime caching for Google Fonts', () => {
    expect(swSource).toContain('fonts.googleapis.com');
    expect(swSource).toContain('fonts.gstatic.com');
  });

  it('provides graceful offline fallback with setCatchHandler', () => {
    expect(swSource).toContain('setCatchHandler');
    expect(swSource).toContain('matchPrecache');
    expect(swSource).toContain('index.html');
    expect(swSource).toContain('image/svg+xml');
  });
});
