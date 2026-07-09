import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Framework requires a default export for config files.
export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { decoratorMetadata: true },
        target: 'es2022',
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
