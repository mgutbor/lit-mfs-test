import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['lit', '@lit/context', '@lit/task', '@lit-mf/shared'],
      output: {
        preserveModules: true,
        entryFileNames: '[name].js',
      },
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
