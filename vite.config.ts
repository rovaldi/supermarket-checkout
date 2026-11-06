import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import type { Connect, Plugin } from 'vite'
import { defineConfig } from 'vite'
import { POST as postSale } from './api/sales.ts'
import { handleProductsRequest } from './lib/server/products.ts'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', reject)
  })
}

async function send(res: ServerResponse, response: Response): Promise<void> {
  const body = await response.text()
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  res.end(body)
}

async function handleApi(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction): Promise<void> {
  const url = req.url

  if (!url?.startsWith('/api/')) {
    next()
    return
  }

  const requestUrl = new URL(url, 'http://127.0.0.1')

  if (requestUrl.pathname === '/api/products' && req.method === 'GET') {
    await send(res, handleProductsRequest(requestUrl))
    return
  }

  if (requestUrl.pathname === '/api/sales' && req.method === 'POST') {
    const raw = await readBody(req)
    const request = new Request(requestUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: raw.length > 0 ? raw : '{}',
    })
    await send(res, await postSale(request))
    return
  }

  res.statusCode = 404
  res.end()
}

function apiDevPlugin(): Plugin {
  return {
    name: 'caja-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handleApi(req, res, next).catch(next)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
})
