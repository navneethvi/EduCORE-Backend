import mongoose from "mongoose";

export interface IEnrollment extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    status: string; 
    amount: number;
    createdAt: Date;
  }