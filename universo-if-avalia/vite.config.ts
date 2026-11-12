import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Publicação prevista em /equipe-67/universo-if-avalia/ (ajustar no workflow se necessário).
  base: './',
  test: { environment: 'node' }
});