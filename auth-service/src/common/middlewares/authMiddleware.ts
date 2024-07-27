import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../jwt";

interface CustomRequest extends Request {
  user?: any;
}

export const isStudentLogin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: "Invalid token format" });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log("decInUser from authMiddleware ===>", req.user);
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res
        .status(401)
        .json({ message: "Unauthorized", error: error.message });
    } else {
      return res
        .status(401)
        .json({ message: "Unauthorized", error: "Unknown error" });
    }
  }
};
