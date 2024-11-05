import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10000,
  message: {
    status: 429,
    error: "Too many requests from this IP, please try again later.",
  },
});
