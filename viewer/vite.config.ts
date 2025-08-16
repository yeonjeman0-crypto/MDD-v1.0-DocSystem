import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Electron 렌더러 프로세스 설정
  base: './',
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['react-pdf', 'pdfjs-dist'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  
  server: {
    port: 5176, // API 서버(5173)와 구분
    strictPort: false,
  },
  
  // Electron 환경을 위한 설정
  define: {
    global: 'globalThis',
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  
  // Node.js 모듈 호환성
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-pdf']
  }
});