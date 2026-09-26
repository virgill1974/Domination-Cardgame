import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

// "--mode http": ohne HTTPS für die Vorschau am PC. Die Kamera am Handy braucht HTTPS (Standard).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    preact(),
    ...(mode === 'http' ? [] : [basicSsl()]),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'Domination – Das Kartenspiel',
        short_name: 'Domination',
        description: 'Domination – Das Science-Fiction-Kartenspiel: Das Handy ersetzt den Spielkasten.',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#050814',
        theme_color: '#070a1a',
        icons: [
          { src: 'ui/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'ui/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'ui/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'ui/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Alles für ein Spiel ohne Netz: App, ZXing-WASM, Schriften, Design, Kartenbilder, Sounds
        globPatterns: ['**/*.{js,css,html,wasm,woff2,svg,png,jpg,webp,ico,mp3,webmanifest}'],
        // Musik (sounds/music.mp3) darf groß sein; sie muss für das Offline-Spiel mit in den Cache
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // Seite schon beim ersten Besuch steuern, sonst gibt es beim Update kein controllerchange zum Neuladen
        clientsClaim: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        cards: resolve(import.meta.dirname, 'Tools/generate_barcodes.html'),
        techtree: resolve(import.meta.dirname, 'Tools/techtree.html'),
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
}));
