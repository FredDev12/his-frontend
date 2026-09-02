import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import {
  configDefaults,
  defineConfig,
} from 'vitest/config'

const projectRoot = fileURLToPath(
  new URL('./', import.meta.url),
)

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(
        new URL('./src', import.meta.url),
      ),
    },
  },

  test: {
    root: projectRoot,
    environment: 'jsdom',

    include: [
      'tests/**/*.spec.js',
      'src/__tests__/**/*.spec.js',
    ],

    exclude: [
      ...configDefaults.exclude,
      'e2e/**',
      'dist/**',
      '.patch-backups/**',
      '**/*-review/**',
    ],
  },
})
