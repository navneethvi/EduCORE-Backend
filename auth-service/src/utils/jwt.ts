import jwt from "jsonwebtoken";
import { config } from "../config/config";

interface JwtPayload {
  id: string;
  email: string;
}

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, config.JWT_SECRET) as { id: string; role: string };
  } catch (error) {
    console.log(error);
    throw new Error("Token verification failed");
  }
};

export const generateToken = (payload: JwtPayload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });
};
