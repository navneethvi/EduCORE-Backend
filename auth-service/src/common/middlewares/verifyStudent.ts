import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  user?: any;
}

export const verifyStudent = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Forbidden", error: "Access denied" });
  }
  next();
};
