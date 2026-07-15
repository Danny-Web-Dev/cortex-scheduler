import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_TARGET = 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@cortex/shared': path.resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
});
