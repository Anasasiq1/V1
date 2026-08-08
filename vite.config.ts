import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['.hm-q.in', 'store-wa.hm-q.in', '.run.app', '.com', '.in', '.dev', 'localhost', '127.0.0.1'],
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      allowedHosts: ['.hm-q.in', 'store-wa.hm-q.in', '.run.app', '.com', '.in', '.dev', 'localhost', '127.0.0.1'],
    },
  };
});
