import mongoose, { Model } from "mongoose";
import { IReviewRepository } from "../interfaces/review.repository.interface";
import { IReview } from "../models/review.model";
import { ITutor } from "../interfaces/tutor.interface";
import { CourseDocument } from "../models/course.model";
import { IStudent } from "../interfaces/student.interface";

class ReviewRepository implements IReviewRepository {
  private readonly reviewModel: Model<IReview>;
  private readonly courseModel: Model<CourseDocument>;
  private readonly studentModel: Model<IStudent>;
  private readonly tutorModel: Model<ITutor>;

  constructor(
    reviewModel: Model<IReview>,
    tutorModel: Model<ITutor>,
    studentModel: Model<IStudent>,
    courseModel: Model<CourseDocument>
  ) {
    this.reviewModel = reviewModel;
    this.courseModel = courseModel;
    this.studentModel = studentModel;
    this.tutorModel = tutorModel;
  }

  public async createReview(reviewData: {
    reviewBy: mongoose.Types.ObjectId;
    tutorId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    rating: number;
    review: string;
  }): Promise<IReview | null> {
    try {
      // Log incoming review data
      console.log("Creating review with data:", reviewData);

      // Check if student (reviewBy) exists
      const student = await this.studentModel.findById(reviewData.reviewBy);
      if (!student) {
        throw new Error(
          `Student with ID ${reviewData.reviewBy} does not exist.`
        );
      }
      console.log("Student found:", student);

      // Check if tutor exists
      const tutor = await this.tutorModel.findById(reviewData.tutorId);
      if (!tutor) {
        throw new Error(`Tutor with ID ${reviewData.tutorId} does not exist.`);
      }
      console.log("Tutor found:", tutor);

      // Check if course exists
      const course = await this.courseModel.findById(reviewData.courseId);
      if (!course) {
        throw new Error(
          `Course with ID ${reviewData.courseId} does not exist.`
        );
      }
      console.log("Course found:", course);

      // Create and save the review
      const newReview = new this.reviewModel({
        courseId: reviewData.courseId,
        rating: reviewData.rating,
        review: reviewData.review,
        courseBy: reviewData.tutorId,
        reviewBy: reviewData.reviewBy,
        createdAt: new Date(),
      });

      // Log before saving
      console.log("Saving review:", newReview);

      const savedReview = await newReview.save();

      // Log saved review
      console.log("Saved review:", savedReview);

      return savedReview;
    } catch (error) {
      console.error("Error in creating review:", error);
      throw error;
    }
  }

  public async getReviewsByCourse(courseId: string): Promise<IReview[] | []> {
    const trimmedCourseId = courseId.trim();

    if (!mongoose.Types.ObjectId.isValid(trimmedCourseId)) {
      throw new Error("Invalid courseId format");
    }

    const objectId = new mongoose.Types.ObjectId(trimmedCourseId);

    return await this.reviewModel
      .find({ courseId: objectId })
      .populate("reviewBy", "name image")
      .exec();
  }

  public async getReviewsForHome(): Promise<IReview[] | []> {
    const reviews = await this.reviewModel
      .find()
      .sort({ createdAt: -1 }) // Sort reviews by creation date in descending order
      .limit(3) // Limit to 3 most recent reviews
      .populate("reviewBy", "name image") // Populate the reviewBy field with name and image
      .populate("courseId", "title") 
      .exec(); // Execute the query

    return reviews;
  }
}

export default ReviewRepository;
