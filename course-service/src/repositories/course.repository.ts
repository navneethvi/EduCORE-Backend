import { Model } from "mongoose";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { CourseDocument } from "../models/course.model";
import { CourseForCard } from "../interfaces/course.interface";

class CourseRepository implements ICourseRepository {
  private readonly courseModel: Model<CourseDocument>;

  constructor(courseModel: Model<CourseDocument>) {
    this.courseModel = courseModel;
  }

  public async save(
    courseData: Partial<CourseDocument>
  ): Promise<CourseDocument> {
    const course = new this.courseModel(courseData);
    return await course.save();
  }

  public async findById(courseId: string): Promise<CourseDocument | null> {
    return await this.courseModel.findById(courseId);
  }

  public async getCourseByTutor(
    tutor_id: string
  ): Promise<CourseDocument[] | null> {
    return await this.courseModel.find({ tutor_id: tutor_id });
  }

  public async getAllCourses(): Promise<CourseForCard[]> {
    const courses = await this.courseModel
      .aggregate([
        {
          $project: {
            _id: 1,
            title: 1,
            category: 1,
            level: 1,
            thumbnail: 1,
            tutor_id: 1,
            is_approved: 1,
            price: 1,
            lessons: { $size: "$lessons" }, 
          },
        },
      ])
      .exec();

    return courses;
  }
}

export default CourseRepository;
