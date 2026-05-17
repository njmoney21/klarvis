import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    env: {
      VITE_N8N_SCAN: 'http://test/scan',
      VITE_N8N_CHAT: 'http://test/chat',
      VITE_N8N_INVOICE: 'http://test/invoice',
    },
  },
})
