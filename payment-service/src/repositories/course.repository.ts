import mongoose, { Model } from "mongoose";
import { ICourse } from "../interfaces/course.interface";
import { logger } from "@envy-core/common";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { CourseDocument } from "../models/course.model";
import { IEnrollment } from "../interfaces/enrollment.interface";

class CourseRepository implements ICourseRepository {
  private readonly courseModel: Model<CourseDocument>;
  private readonly enrollmentModel: Model<IEnrollment>;

  constructor(
    CourseModel: Model<CourseDocument>,
    EnrollmentModel: Model<IEnrollment>
  ) {
    this.courseModel = CourseModel;
    this.enrollmentModel = EnrollmentModel;
  }

  public async findCourse(courseId: string): Promise<boolean> {
    try {
      console.log("courseId in findCourse repo====>", courseId);

      const finded = await this.courseModel.findOne({ _id: courseId }).exec();

      console.log(finded);

      return !!finded;
    } catch (error) {
      logger.error(`Error finding Course: ${error}`);
      throw new Error("Error finding Course");
    }
  }

  public async getCourse(courseId: string): Promise<ICourse | null> {
    try {
      return await this.courseModel.findOne({ _id: courseId }).exec();
    } catch (error) {
      logger.error(`Error finding Course: ${error}`);
      throw new Error("Error finding Course");
    }
  }

  public async createCourse(courseData: CourseDocument): Promise<ICourse> {
    try {
      console.log("course before saving", courseData);
      const editedData = courseData.edited;

      console.log("edited data=>", editedData);

      const sanitizedData: Partial<CourseDocument> = {
        _id: editedData._id
          ? new mongoose.Types.ObjectId(editedData._id)
          : undefined,
        title: editedData.title,
        description: editedData.description,
        category: editedData.category,
        level: editedData.level,
        thumbnail: editedData.thumbnail,
        tutor_id: editedData.tutor_id,
        is_approved: editedData.is_approved,
        enrollments: editedData.enrollments || 0,
        price: editedData.price,
        createdAt: editedData.createdAt || new Date(),
        lessons: editedData.lessons,
      };

      console.log(
        "sanitizedData before saving:",
        JSON.stringify(sanitizedData, null, 2)
      );

      const course = new this.courseModel(sanitizedData);
      const after = await course.save();

      console.log("course after saving", after);
      return after;
    } catch (error) {
      logger.error(`Error creating Course: ${error}`);
      throw new Error("Error creating Course");
    }
  }

  public async updateCourse(
    courseData: Partial<CourseDocument>
  ): Promise<void> {
    if (!courseData.edited || !courseData.edited._id) {
      throw new Error("Course ID is required for updating");
    }
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(courseData.edited._id, courseData.edited, {
        new: true,
      })
      .exec();

    if (!updatedCourse) {
      throw new Error(`Course with ID ${courseData.edited._id} not found.`);
    }

    console.log("Updated Course:", updatedCourse);
  }

  public async getEnrolledCourses(studentId: string): Promise<ICourse[]> {
    try {
      const enrollments = await this.enrollmentModel
        .find({ studentId })
        .populate<{ courseId: ICourse }>("courseId")
        .exec();

      const courses = enrollments
        .filter(
          (enrollment) => enrollment.courseId && enrollment.status === "success"
        )
        .map((enrollment) => enrollment.courseId);

      return courses;
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      throw error;
    }
  }

  public async getStatsForAdmin(
    groupByFormat: string
  ): Promise<{ courses: ICourse[]; enrollments: IEnrollment[] }> {
    try {
      const courses = await this.courseModel.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: groupByFormat, date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const enrollments = await this.enrollmentModel.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: groupByFormat, date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      return { courses, enrollments };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  }

  public async getStatsForTutor(
    tutorId: string,
    groupByFormat: string
  ): Promise<{ courses: ICourse[]; enrollments: IEnrollment[] }> {
    try {
      const tutorIdObject = new mongoose.Types.ObjectId(tutorId);

      const courses = await this.courseModel.aggregate([
        {
          $match: {
            tutor_id: tutorIdObject,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupByFormat, date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const enrollments = await this.enrollmentModel.aggregate([
        {
          $match: {
            tutorId: tutorIdObject,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupByFormat, date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      return { courses, enrollments };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  }
}

export default CourseRepository;
