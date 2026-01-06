import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 相关
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // LeanCloud SDK
          leancloud: ['leancloud-storage']
        }
      }
    }
  }
})
