import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteSingleFile()
  ],
  server: {
    host: '0.0.0.0', // 监听所有地址，而不仅仅是 localhost，这是为了让 tun 模式也能访问网页
  },
  base: './',
  build: {
    // 4. 防止小图片被转成 base64 后体积过大导致警告（可选，调大限制）
    assetsInlineLimit: 100000000,
  }
})
