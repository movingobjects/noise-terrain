import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  plugins: [glsl()],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern' }
    }
  },
  build: {
    outDir: 'app/dist',
    emptyOutDir: true
  }
});
