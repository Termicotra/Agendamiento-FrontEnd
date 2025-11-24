import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      host: true,
      // Configuración de proxy para desarrollo (opcional)
      // Útil si tienes problemas de CORS en desarrollo
      // proxy: {
      //   '/api': {
      //     target: env.VITE_API_BASE_URL || 'http://localhost:8000',
      //     changeOrigin: true,
      //   },
      //   '/auth': {
      //     target: env.VITE_API_BASE_URL || 'http://localhost:8000',
      //     changeOrigin: true,
      //   },
      // },
    },
    
    // Configuración de build para producción
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Optimizaciones para producción
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-vendor': ['@mui/material', '@mui/icons-material'],
          },
        },
      },
    },
    
    // Variables de entorno expuestas al cliente
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  }
})
