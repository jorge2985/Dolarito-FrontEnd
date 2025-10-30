import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Proxy to the backend shown in Swagger (https://localhost:7043)
        // target should NOT include the '/api' segment, otherwise proxy forwards to '/api/api/...'
        target: 'https://localhost:7043',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
          });
        }
      },
      // Proxy public external currency APIs to avoid CORS/connection issues in dev
      '/dolarsi': {
        target: 'https://www.dolarsi.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/dolarsi/, '')
      },
      '/exhost': {
        target: 'https://api.exchangerate.host',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/exhost/, '')
      },
      '/dolarapi': {
        target: 'https://dolarapi.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/dolarapi/, '')
      }
    }
  },
})
