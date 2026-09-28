import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { nonBlockingCss } from './vite-plugin-non-blocking-css'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    react(),
    tailwindcss(),
    nonBlockingCss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  // SSR bundle (dist-ssr/entry-server.js) o'zi yetarli bo'lsin: barcha paketlar ichiga
  // qo'shiladi, serverdagi node_modules tuzilmasiga (peer dep'lar va h.k.) bog'liq emas.
  ssr: {
    noExternal: true,
  },

  build: {
    chunkSizeWarningLimit: 600,
    modulePreload: true,
    // public/ faqat client build'ga (dist/) kerak; dist-ssr'ga nusxalanmasin
    copyPublicDir: !isSsrBuild,
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router'],
              motion: ['motion/react'],
              ui: ['lucide-react', 'react-i18next', 'i18next'],
            },
          },
        },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}))
