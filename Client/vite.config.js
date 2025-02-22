import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy:{
      "/api":{
        target:"http://localhost:8080",
        changeOrigin:true,
        secure:false,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),

      }
    }
  },
  plugins: [react(),
    tailwindcss()
  ],
})
