import express from "express";
import { config } from "@/config/config";
import { createProxyMiddleware } from "http-proxy-middleware";

const chatRouter = express.Router();

chatRouter.use(
  createProxyMiddleware({
    target: config.CHAT_SERVICE_API,
    changeOrigin: true,
    pathRewrite: {
      "^/api/chat/": "",
    },
  })
);

export default chatRouter;
