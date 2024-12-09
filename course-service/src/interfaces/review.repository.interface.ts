import mongoose from "mongoose";
import { IReview } from "../models/review.model";

export interface IReviewRepository{
    createReview(reviewData: {
        reviewBy: mongoose.Types.ObjectId;
        tutorId: mongoose.Types.ObjectId;
        courseId:  mongoose.Types.ObjectId;
        rating: number;
        review: string;
      }): Promise<IReview | null>
    getReviewsByCourse(courseId: string): Promise<IReview[] | []>
    getReviewsForHome(): Promise<IReview[] | []>

}