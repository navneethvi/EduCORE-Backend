import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as { id: string; role: string };
  } catch (error) {
    throw new Error("Token verification failed");
  }
};

export const generateToken = (payload: any) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });
};
