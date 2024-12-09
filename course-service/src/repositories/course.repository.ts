import mongoose, { Model } from "mongoose";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { CourseDocument } from "../models/course.model";
import { CourseForCard, Lesson } from "../interfaces/course.interface";
import { logger } from "@envy-core/common";

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

  public async getCoursesByTutor(
    tutor_id: string,
    page: number,
    limit: number,
    isApproved: boolean
  ): Promise<CourseDocument[] | null> {
    logger.info(
      `Fetching courses with params: tutorId: ${tutor_id}, page: ${page}, limit: ${limit}, isApproved: ${isApproved}`
    );

    return await this.courseModel
      .aggregate([
        {
          $match: {
            is_approved: isApproved,
            tutor_id: new mongoose.Types.ObjectId(tutor_id),
          },
        },
        {
          $project: {
            _id: 1,
            category: 1,
            title: 1,
            price: 1,
            thumbnail: 1,
            lessoncount: { $size: "$lessons" },
            enrollments: 1,
          },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ])
      .exec();
  }

  public async countCoursesByTutor(
    tutor_id: string,
    isApproved: boolean
  ): Promise<number> {
    return await this.courseModel
      .find({ tutor_id: tutor_id, is_approved: isApproved })
      .countDocuments()
      .exec();
  }

  public async getAllCourses(
    isApproved: boolean,
    page: number,
    limit: number
  ): Promise<CourseForCard[]> {
    const skip = (page - 1) * limit;

    logger.info(isApproved);

    const courses = await this.courseModel
      .aggregate([
        {
          $match: { is_approved: isApproved }, // Filter by is_approved status
        },
        {
          $project: {
            _id: 1,
            title: 1,
            category: 1,
            level: 1,
            thumbnail: 1,
            tutor_id: 1,
            is_approved: 1,
            enrollments: 1,
            price: 1,
            lessons: { $size: "$lessons" },
          },
        },
        { $skip: skip },
        { $limit: limit },
      ])
      .exec();

    return courses;
  }
  

  public async getCourseDetails(
    course_id: string
  ): Promise<CourseDocument | null> {
    return this.courseModel.findOne({ _id: course_id }).exec();
  }

  public async deleteCourse(course_id: string): Promise<boolean> {
    try {
      const result = await this.courseModel.deleteOne({ _id: course_id });

      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting course:", error);
      return false;
    }
  }

  public async getLessonDetails(
    courseId: string,
    lessonIndex: number
  ): Promise<Lesson | null> {
    try {
      const lessonDetails = await this.courseModel
        .aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(courseId),
            },
          },
          {
            $project: {
              lesson: { $arrayElemAt: ["$lessons", lessonIndex] },
            },
          },
          {
            $project: {
              title: "$lesson.title",
              goal: "$lesson.goal",
              video: "$lesson.video",
              materials: "$lesson.materials",
              homework: "$lesson.homework",
            },
          },
        ])
        .exec();

      if (lessonDetails.length === 0 || !lessonDetails[0]) {
        return null;
      }

      return lessonDetails[0] as Lesson;
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      return null;
    }
  }

  public async approveCourse(courseId: string): Promise<boolean> {
    try {
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        { is_approved: true },
        { new: true }
      );

      if (!updatedCourse) {
        console.log(`Course with ID ${courseId} not found.`);
        return false;
      }

      console.log(`Course approved:`, updatedCourse);
      return true;
    } catch (error) {
      console.error("Error approving course:", error);
      return false;
    }
  }

  public async getTrendingCourses(): Promise<CourseDocument[] | undefined> {
    try {
      const trendingCourses = await this.courseModel
        .find({ is_approved: true })
        .sort({ enrollments: -1 })
        .limit(4)
        .select("_id title thumbnail price enrollments category tutor_id")
        .lean();

      return trendingCourses;
    } catch (error) {
      console.error("Error fetching trending courses:", error);
      return undefined;
    }
  }

  public async getNewlyAddedCourses(): Promise<CourseDocument[] | undefined> {
    try {
      const newlyAddedCourses = await this.courseModel
        .find({ is_approved: true })
        .sort({ _id: -1 })
        .limit(4)
        .select("_id title thumbnail price enrollments category tutor_id")
        .lean();

      return newlyAddedCourses;
    } catch (error) {
      console.error("Error fetching newly added courses:", error);
      return undefined;
    }
  }

  async fetchCourses(
    limit: number,
    offset: number,
    searchTerm: string,
    categories: string | string[],
    sort: string
  ): Promise<CourseDocument[]> {

    const searchQuery: Record<string, unknown> = { is_approved: true };
  
    if (searchTerm) {
      searchQuery.title = { $regex: searchTerm, $options: 'i' };
    }
  
    if (typeof categories === 'string') {
      categories = categories.split(',') as string[]; 
    }
  
    if (Array.isArray(categories) && categories.length > 0) {
      searchQuery.category = { $in: categories };
    }

    const coursesQuery = this.courseModel.find(searchQuery).skip(offset).limit(limit);
  
    if (sort) {
      coursesQuery.sort(sort);
    }
  
    const courses = await coursesQuery;
    return courses;
  }

  public async totalCourseCount(): Promise<number> {
    return this.courseModel.countDocuments()
  }
  
}

export default CourseRepository;
