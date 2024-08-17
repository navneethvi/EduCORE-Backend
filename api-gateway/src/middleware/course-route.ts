import express from "express";
import { config } from "@/config/config";
import { createProxyMiddleware } from "http-proxy-middleware";

const courseRouter = express.Router();

courseRouter.use(
  createProxyMiddleware({
    target: config.COURSE_SERVICE_API,
    changeOrigin: true,
    pathRewrite: {
      "^/api/course/": "",
    },
  })
);

export default courseRouter;