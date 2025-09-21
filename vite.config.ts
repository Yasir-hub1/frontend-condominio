import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  // 🔧 Dev server expuesto y con proxy a tu backend
  server: {
    host: true,          // escucha en 0.0.0.0 (necesario para túneles / LAN)
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://192.168.100.45:8000', // tu Django en LAN
        changeOrigin: true,
        secure: false,   // el backend es HTTP (no HTTPS)
        // Si tu backend NO tiene prefijo /api, descomenta:
        // rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },

  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
})
