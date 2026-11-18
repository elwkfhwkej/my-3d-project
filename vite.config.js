import { defineConfig } from 'vite';

export default defineConfig({
  base: '/my-3d-project/',
  build: {
    outDir: '.', // Собирать прямо в корень (для GitHub Actions)
    emptyOutDir: false, // Не удалять исходники (важно!)
  }
});