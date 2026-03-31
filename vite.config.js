import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import { visualizer } from "rollup-plugin-visualizer"
import viteCompression from "vite-plugin-compression"
import path from "path"

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),

    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),

    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br"
    })
  ],

  base: "/",

  server: {
    port: 5173,
    hmr: {
      overlay: false
    }
  },
  resolve:{
    alias:{
      "@": path.resolve(__dirname, "./src")
    }
  },

  build: {
    target: "esnext",
    minify: "esbuild",
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks(id) {

          if (id.includes("node_modules")) {

            if (id.includes("vue")) {
              return "vue"
            }

            if (id.includes("firebase")) {
              return "firebase"
            }

            if (
              id.includes("jspdf") ||
              id.includes("html2canvas")
            ) {
              return "pdf"
            }

            return "vendor"
          }
        }
      }
    }
  },

  optimizeDeps: {
    include: ["vue"]
  }
})