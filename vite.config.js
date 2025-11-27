// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // Aquí es donde corregimos el nombre según tu imagen:
        claves: resolve(__dirname, 'claves.html'), 
      },
    },
  },
});