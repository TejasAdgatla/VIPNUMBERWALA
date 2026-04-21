import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let apiUrl = process.env.VITE_API_URL || '';
if (apiUrl && !apiUrl.startsWith('http') && !apiUrl.includes('localhost')) {
  apiUrl = `https://${apiUrl}.onrender.com`;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: apiUrl ? {
    'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
  } : {}
})
