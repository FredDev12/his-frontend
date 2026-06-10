import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),

    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  base: '/',

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'https://hopital.congoastral-app.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }

            if (id.includes('firebase')) {
              return 'firebase'
            }

            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf'
            }

            return 'vendor'
          }
        },
      },
    },
  },

  optimizeDeps: {
    include: ['vue'],
  },
})
