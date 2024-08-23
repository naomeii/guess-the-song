import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 10000, // the port Render expects
    strictPort: true,
  },
  preview: {
    port: 10000, // same port for npm run preview
  },
})
