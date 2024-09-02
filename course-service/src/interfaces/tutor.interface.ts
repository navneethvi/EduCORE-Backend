// src/interfaces/student.interface.ts
import { Document } from "mongoose";

export interface ITutor extends Document {
  _id: string;
  name: string;
  email: string;
  phone: number;
  password: string;
  bio: string;
  is_blocked?: boolean;
  is_verified?: boolean;
  image?: string;
  followers?: string[];
  role: string;
  refreshToken?: string;
  accessToken?: string;
}

export interface INewTutor {
  name: string;
  email: string;
  phone: number;
  password: string;
  bio: string;
  followers: string[];
  role: string;
}
