import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_TARGET = 'http://localhost:3000';

// https://vite.dev/config/ — framework requires a default export.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      // Bundle the shared package from source so Vite gets clean, statically
      // analyzable ESM named exports (the published dist is CommonJS for the API).
      '@cortex/shared': path.resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    // Proxy /api to the NestJS server so the browser only ever talks to the
    // dev origin: same-origin requests, first-party refresh cookie, no CORS.
    // This mirrors the production Vercel rewrite.
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
});
