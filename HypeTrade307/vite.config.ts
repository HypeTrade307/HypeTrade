import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Remove the rewrite - this is causing issues with your API paths
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  base: '/',
  build: {
    outDir: 'dist'
  }
})