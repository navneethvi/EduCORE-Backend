import {  Types } from 'mongoose';

export interface CreateCourseRequest {
  body: {
    price: number;
    title: string;
    description: string;
    category: string;
    level: string;
    lessons: {
      title: string;
      goal: string;
      video: string;
      materials: string;
      homework: string;
    }[];
  };
  files: { [fieldname: string]: File[] } | File[] | undefined;
  tutor_id: Types.ObjectId; // Assuming this is a string type as used in request
}

export interface Lesson {
  title: string;
  goal: string;
  video?: string;
  materials?: string;
  homework?: string;
}

export interface Course {
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

export interface CourseForCard {
  _id:  Types.ObjectId;
  title: string;
  category: string;
  level: string;
  is_approved: boolean;
  thumbnail: string;
  tutor_id: string;
  price: number;
  lessons: number;
}
