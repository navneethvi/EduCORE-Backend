import { Types } from "mongoose";

export interface Lesson {
    title: string;
    goal: string;
    video?: string;
    materials?: string;
    homework?: string;
  }

export interface ICourse {
  _id:  Types.ObjectId;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string;
  tutor_id: Types.ObjectId | string; // Adjusted to match Mongoose ObjectId type
  price: number;
  lessons: Lesson[];
}