import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'translations-varieties-assignment-circuit.trycloudflare.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/webhook')
      }
    }
  }
});
