import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import type { Request, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { parseCorsOrigin } from './utils'

dotenv.config()
if (!process.env.PROXY_TARGET) {
  console.error('PROXY_TARGET is not defined')
  process.exit(1)
}

let corsOrigin: string | string[] = ''

try {
  corsOrigin = parseCorsOrigin(process.env.CORS_ORIGIN || '*')
} catch (error) {
  console.error(error)
  process.exit(1)
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
)

const proxyMiddleware = createProxyMiddleware<Request, Response>({
  target: process.env.PROXY_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
})

app.use('/api', proxyMiddleware)
app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
