import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const hostingerSpaFallback = () => ({
  name: 'hostinger-spa-fallback',
  closeBundle() {
    copyFileSync(resolve(__dirname, 'public/.htaccess'), resolve(__dirname, 'dist/.htaccess'))
    copyFileSync(resolve(__dirname, 'dist/index.html'), resolve(__dirname, 'dist/404.html'))
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue(), tailwindcss(), hostingerSpaFallback()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
