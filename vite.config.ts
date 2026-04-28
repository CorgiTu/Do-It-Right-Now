import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/main.ts',
        vite: {
          build: {
            outDir: 'dist/main',
          },
        },
      },
      {
        entry: 'src/main/preload.ts',
        onstart(options) {
          // 通知 Electron 重新加载 preload 页面
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              output: {
                format: 'cjs',
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
  root: '.',
  base: './',
})
