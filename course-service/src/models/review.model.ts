import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  courseId: mongoose.Schema.Types.ObjectId;
  rating: number;
  review: string;
  reviewBy: mongoose.Schema.Types.ObjectId;
  courseBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const reviewSchema: Schema = new Schema<IReview>({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  reviewBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  courseBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review
