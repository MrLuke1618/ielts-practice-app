import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // This conditional logic is the key to making both local dev and GitHub Pages work.
    // In 'development' (npm run dev), it uses the root path '/'.
    // In 'production' (npm run build), it uses the repository name as the base path.
    base: mode === 'production' ? '/ielts-practice-app/' : '/',
  }
})
