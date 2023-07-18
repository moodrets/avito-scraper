import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        popup: 'options.html',
        content: './src/content.ts',
        browser: './src/helpers/browser.ts'
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src')
    },
  }
})