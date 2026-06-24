import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/',
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      reportCompressedSize: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router') || id.includes('node_modules/pinia')) {
              return 'vendor-core'
            }
            if (id.includes('node_modules/primevue')) {
              return 'vendor-ui'
            }
            if (id.includes('node_modules/pusher-js') || id.includes('node_modules/laravel-echo')) {
              return 'vendor-realtime'
            }
            if (id.includes('node_modules/axios') || id.includes('node_modules/gsap') || id.includes('node_modules/zod')) {
              return 'vendor-utils'
            }
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.woff2') || assetInfo.name?.endsWith('.woff')) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || 'http://localhost:8000'
      ),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
      ),
    },
    server: {
      // Proxy API calls to the Laravel backend to avoid CORS during local development
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
        '/sanctum': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
