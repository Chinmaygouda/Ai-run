import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '../ranking': path.resolve(__dirname, '../ranking'),
      // Ensure ranking folder resolves these packages from frontend/node_modules
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
      'sonner': path.resolve(__dirname, 'node_modules/sonner'),
      'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion'),
    },
  },
  server: {
    host: '0.0.0.0',
    fs: {
      allow: [
        path.resolve(__dirname, '.'),
        path.resolve(__dirname, '../ranking'),
      ],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
