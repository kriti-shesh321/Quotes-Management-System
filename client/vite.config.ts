import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://54.79.12.50:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
