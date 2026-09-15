import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

const sharedDist = resolve(__dirname, '../shared/dist');

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
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [resolve(__dirname, '..')],
    },
  },
  plugins: [
    {
      name: 'serve-shared-dist',
      configureServer(server) {
        server.middlewares.use('/shared', (req, res, next) => {
          const filePath = resolve(sharedDist, req.url?.slice(1) ?? 'index.js');
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/javascript');
            res.end(readFileSync(filePath));
            return;
          }
          next();
        });
      },
    },
  ],
});
