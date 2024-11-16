import express from "express";
import { config } from "@/config/config";
import { createProxyMiddleware } from "http-proxy-middleware";

const paymentRouter = express.Router();

paymentRouter.use(
  createProxyMiddleware({
    target: config.PAYMENT_SERVICE_API,
    changeOrigin: true,
    pathRewrite: {
      "^/api/payment/": "",
    },
  })
);

export default paymentRouter;
