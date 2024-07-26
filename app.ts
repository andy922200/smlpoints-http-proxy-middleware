import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import multer from 'multer'
import { parseCorsOrigin, createDynamicProxyMiddleware } from './utils'

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
const upload = multer()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
)

app.use(
  '/api/gobooking',
  upload.any(),
  createDynamicProxyMiddleware({
    target: process.env.PROXY_TARGET,
    pathRewrite: { '^/': '/ntume/' },
  }),
)

app.use(
  '/api/qrlock',
  upload.any(),
  createDynamicProxyMiddleware({
    target: process.env.PROXY_TARGET_QRLOCK || '',
    pathRewrite: { '^/': '/' },
  }),
)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
