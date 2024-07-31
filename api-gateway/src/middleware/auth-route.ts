import express from "express";
import { config } from "@/config/config";
import { createProxyMiddleware } from "http-proxy-middleware";

const authRouter = express.Router();

authRouter.use(
  createProxyMiddleware({
    target: config.USER_SERVICE_API,
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth/": "",
    },
  })
);

export default authRouter;
