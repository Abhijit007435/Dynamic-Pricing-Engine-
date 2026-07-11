import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forwards any /api/... request to the real backend at :8080,
      // so the browser thinks it's all coming from the same origin —
      // this avoids CORS errors without needing backend to change anything.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
