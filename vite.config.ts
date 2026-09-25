import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// "--mode http": ohne HTTPS für die Vorschau am PC. Die Kamera am Handy braucht HTTPS (Standard).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [preact(), ...(mode === 'http' ? [] : [basicSsl()])],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        cards: resolve(import.meta.dirname, 'Tools/generate_barcodes.html'),
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
}));
