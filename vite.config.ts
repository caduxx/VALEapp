import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'valefisico.com.br',
      'www.valefisico.com.br',
      '45.134.226.235',
      'localhost',
      '127.0.0.1',
      'all'
    ]
  }
});