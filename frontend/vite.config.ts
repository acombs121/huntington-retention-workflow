import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
const backendPort = process.env.LOCAL_PORT || '8080';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${backendPort}`,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/ws': {
        target: `http://127.0.0.1:${backendPort}`,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
