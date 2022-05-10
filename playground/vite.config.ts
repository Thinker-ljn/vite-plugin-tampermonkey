import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tampermonkey from 'vite-plugin-tampermonkey'
import Unocss from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Unocss(),
    tampermonkey({
      externalGlobals: ['vue']
    }),
  ],
})
