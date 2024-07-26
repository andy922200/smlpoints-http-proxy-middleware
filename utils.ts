import type { Request, Response } from 'express'
import { createProxyMiddleware, Options } from 'http-proxy-middleware'

const parseCorsOrigin = (origin: string): string | string[] => {
  const arrayPattern = /^\[.*\]$/
  const isArrayOfStrings = arrayPattern.test(origin)

  if (isArrayOfStrings) {
    // Remove single quotes and parse the string as JSON
    const parsedArr = JSON.parse(origin.replace(/'/g, '"'))

    if (!Array.isArray(parsedArr) || !parsedArr.every((item) => typeof item === 'string')) {
      throw new Error('CORS_ORIGIN array is invalid')
    }

    return parsedArr
  }

  return origin
}

function createDynamicProxyMiddleware({
  target,
  pathRewrite,
  ...otherOptions
}: Options<Request, Response>) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.body) {
          const contentType = req.headers['content-type']
          if (!contentType || (contentType && contentType.includes('multipart/form-data'))) return

          if (contentType && contentType.includes('application/json')) {
            const bodyData = JSON.stringify(req.body)
            proxyReq.setHeader('Content-Type', 'application/json')
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
            proxyReq.write(bodyData)
          }
        }
      },
      proxyRes: function (proxyRes) {
        const proxyCookie = proxyRes.headers['set-cookie']

        if (proxyCookie && proxyRes.headers['set-cookie']?.[0]) {
          proxyRes.headers['set-cookie'][0] = `${proxyCookie}; SameSite=None; Secure`
        }
      },
    },
    ...otherOptions,
  })
}

export { parseCorsOrigin, createDynamicProxyMiddleware }
