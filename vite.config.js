import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: resolve(__dirname, 'src'),
      filename: 'sw.js',
      injectRegister: null,
      manifest: {
        name: 'Story App — Berbagi Cerita',
        short_name: 'Story App',
        description: 'Dicoding Story App - Berbagi cerita dan eksplorasi lokasi cerita seputar komunitas Dicoding.',
        start_url: '/#/',
        display: 'standalone',
        background_color: '#f8f9fa',
        theme_color: '#2563eb',
        lang: 'id',
        icons: [
          {
            src: '/images/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/images/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/images/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Tambah Cerita',
            short_name: 'Tambah',
            description: 'Tambah cerita baru ke komunitas',
            url: '#/add',
            icons: [{ src: '/images/icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Cerita Tersimpan',
            short_name: 'Tersimpan',
            description: 'Lihat cerita tersimpan di bookmarks',
            url: '#/favorites',
            icons: [{ src: '/images/icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
        screenshots: [
          {
            src: '/images/screenshots/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: '/images/screenshots/screenshot-narrow.png',
            sizes: '640x1136',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
      },
    }),
  ],
});
