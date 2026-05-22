import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({

  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'markdown-editor-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/docs' && req.method === 'GET') {
            const docsPath = path.resolve(__dirname, 'public/troubleshooting_docs.md')
            fs.readFile(docsPath, 'utf-8', (err, data) => {
              if (err) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Failed to read file' }))
              } else {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ content: data }))
              }
            })
          } else if (req.url === '/api/docs' && req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                const { content } = JSON.parse(body)
                const docsPath = path.resolve(__dirname, 'public/troubleshooting_docs.md')
                fs.writeFile(docsPath, content, 'utf-8', (err) => {
                  if (err) {
                    res.statusCode = 500
                    res.end(JSON.stringify({ error: 'Failed to write file' }))
                  } else {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ success: true }))
                  }
                })
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON body' }))
              }
            })
          } else {
            next()
          }
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        bypass: (req, res, proxyOptions) => {
          if (req.url.startsWith('/api/docs')) {
            return req.url;
          }
        }
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

