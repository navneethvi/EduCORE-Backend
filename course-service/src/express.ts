import express from "express";

import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

import Router from "./routes/routes";

import { ErrorHandler } from "@envy-core/common";

const app = express();

configDotenv();

app.use(cookieParser())

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json("helloooo");
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/course', Router)

app.use(ErrorHandler.handleError);

export default app;
