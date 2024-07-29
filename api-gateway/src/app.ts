import express from "express";
import cors from "cors";
import logger from "./core/logger";

const app = express();
const port = 3000;

import authRouter from "./middleware/auth-route";

app.use(cors());

// Proxy routes

app.get("/", (req, res) => {
  res.json("Hellooooooo");
});

app.use("/api/auth", authRouter);

app.listen(port, () => {
  logger.info(`API Gateway is running on http://localhost:${port}`);
});
