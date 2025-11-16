import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util',
    },
    dedupe: ['simple-peer']
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'stream-browserify', 'util', 'simple-peer'],
    force: true
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, 'simple-peer']
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://meeting-backend-glfz.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://meeting-backend-glfz.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})