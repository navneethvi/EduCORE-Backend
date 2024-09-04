import express from "express";
import cors from "cors";

import { logger } from "@envy-core/common";

const app = express();
const port = 3000;

import authRouter from "./middleware/auth-route";
import courseRouter from "./middleware/course-route";
import { apiLimiter } from "./config/limiter";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);

// Proxy routes

app.use(apiLimiter)

app.get("/", (req, res) => {
  res.json("Hellooooooo");
});

app.use("/api/auth", authRouter);

app.use("/api/course", courseRouter);

app.listen(port, () => {
  logger.info(`API Gateway is running on http://localhost:${port}`);
});
