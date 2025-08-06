import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/matrix_test_widget/',
  build: {
    outDir: 'build',
    assetsDir: 'static',
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});