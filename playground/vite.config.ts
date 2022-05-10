import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tampermonkey from 'vite-plugin-tampermonkey'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tampermonkey({
      externalGlobals: ['vue']
    })
  ],
})
