import vue from '@vitejs/plugin-vue'
import { quasar } from '@quasar/vite-plugin'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), quasar()],
})
