import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'packages/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      exclude: ['**/*.d.ts', '**/dist/**', '**/vite.config.ts'],
    },
  },
});
