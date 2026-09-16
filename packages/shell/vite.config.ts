import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

const sharedDist = resolve(__dirname, '../shared/dist');
const developmentCsp = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'nonce-lit-mf-importmap' https://cdn.jsdelivr.net http://localhost:5174 http://localhost:5175; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:5174 http://localhost:5175 https://dummyjson.com ws://localhost:5173 ws://localhost:5174 ws://localhost:5175; img-src 'self' data: https:; font-src 'self';";

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
    headers: {
      'Content-Security-Policy': developmentCsp,
    },
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
