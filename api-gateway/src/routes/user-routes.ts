import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

import { config } from '@/config/config'

const userRoute = express.Router()

userRoute.use(
    createProxyMiddleware({
        target : config.USER_SERVICE_API,
        changeOrigin : true
    })
)

export default userRoute