import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
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
