import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: path.resolve(__dirname, 'landing/index.html'),
    },
  },
  server: {
    port: 3000,
    open: '/landing/index.html',
  },
});
