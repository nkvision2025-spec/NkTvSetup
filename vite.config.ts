import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // અહીં આપણે '/' ની જગ્યાએ './' (ટપકા સાથે) કર્યું છે જે બંને જગ્યાએ ચાલશે
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  }
});
