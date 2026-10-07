import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 本機把 /api 轉給 Spring Boot；VITE_USE_MOCK=true 時用不到
    proxy: { '/api': 'http://localhost:8080' },
  },
})
