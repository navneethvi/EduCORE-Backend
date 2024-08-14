import express from "express";
import cors from "cors";

import { logger } from "@envy-core/common";

const app = express();
const port = 3000;

import authRouter from "./middleware/auth-route";

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Allow credentials (cookies) to be sent
}));

// Proxy routes

app.get("/", (req, res) => {
  res.json("Hellooooooo");
});


app.use("/api/auth", authRouter);

app.listen(port, () => {
  logger.info(`API Gateway is running on http://localhost:${port}`);
});