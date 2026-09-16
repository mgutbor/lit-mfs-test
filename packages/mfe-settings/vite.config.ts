import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        useDefineForClassFields: false,
      },
    },
  },
  resolve: {
    alias: {
      '@lit-mf/shared': resolve(__dirname, '../shared/src'),
    },
  },
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    lib: {
      entry: resolve(__dirname, 'src/entry.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', 'lit/', '@lit/context', '@lit/task', '@lit-mf/shared'],
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
});
