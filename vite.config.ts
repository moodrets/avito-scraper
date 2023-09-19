import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  let isDev = mode === 'development'
  
  return {
    mode: 'development',
    plugins: [vue()],
    build: {
      sourcemap: isDev ? true : false,
      rollupOptions: {
        input: {
          options: 'options.html',
          content: './src/content.ts',
          background: './src/background.ts',
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
  }
})