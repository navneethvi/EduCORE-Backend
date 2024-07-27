import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  status?: number;
  isOperational?: boolean;
}

export class ErrorHandler {
  static handleError(
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.error("Error handler:", err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      message: err.message || "An unexpected error occurred",
      error: err.isOperational ? err.message : "Internal Server Error",
    });
  }
}
