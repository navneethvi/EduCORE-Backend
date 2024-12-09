import mongoose, {  ObjectId, Types } from 'mongoose';

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
  createdAt?: Date;
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
  createdAt: Date;
  thumbnail: string;
  tutor_id: string;
  price: number;
  lessons: number;
}

export interface SimplifiedCourse {
  title: string;
  category: string;
  description: string;
  enrollments: number;
  is_approved: boolean;
  level: string;
  price: number;
  thumbnail: string;
  lessonsCount: number;
  tutor: {
    _id: string;
    name: string;
    email: string;
    phone: number;
  } | null;
}

export interface PaginatedData<T> {
  data: T[];
  totalPages: number;
  loading: boolean;
  error: string;
}



interface Lesson2 {
  _id: string;
  title: string;
}

export interface CourseDetails {
  _id: ObjectId;
  title: string;
  category: string;
  level: string;
  thumbnail: string;
  tutor_id: string;
  is_approved: boolean;
  price: number;
  lessons: Lesson2[];
}

export interface Tutor {
  _id: ObjectId;
  name: string;
  email: string;
  phone: number;
  password: string;
  bio: string;
  is_blocked?: boolean;
  is_verified?: boolean;
  image?: string;
  followers?: ObjectId[];
  role: string;
  refreshToken?: string;
  // Add other tutor-related fields here
}

export interface CourseWithTutor {
  course_id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  description: string;
  level: string;
  thumbnail: string;
  tutor_id: mongoose.Types.ObjectId | string;
  is_approved: boolean;
  price: number;
  lessons: Lesson[];
  tutor_name: string;  // Combine tutor properties as needed
  tutor_image: string | undefined;
  tutor_bio: string;
  // Include other fields you want from Tutor here
}