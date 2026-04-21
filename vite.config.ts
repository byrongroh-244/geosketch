import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/geosketch/', // change to '/' if not using GitHub Pages subpath
})
