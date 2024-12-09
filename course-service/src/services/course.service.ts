import {
  Course,
  CourseForCard,
  CourseWithTutor,
  CreateCourseRequest,
  Lesson,
  PaginatedData,
  SimplifiedCourse,
} from "../interfaces/course.interface";
import { logger } from "@envy-core/common";
import { ICourseService } from "../interfaces/course.service.interface";
import { CourseDocument } from "../models/course.model";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";
import { IReviewRepository } from "../interfaces/review.repository.interface";

import { sendMessage } from "../events/kafkaClient";
import { IReview } from "../models/review.model";
import mongoose from "mongoose";

class CourseService implements ICourseService {
  private courseRepository: ICourseRepository;
  private tutorRepository: ITutorRepository;
  private reviewRepository: IReviewRepository;

  constructor(
    courseRepository: ICourseRepository,
    tutorRepository: ITutorRepository,
    reviewRepository: IReviewRepository
  ) {
    this.courseRepository = courseRepository;
    this.tutorRepository = tutorRepository;
    this.reviewRepository = reviewRepository;
  }
  public async createCourse(req: CreateCourseRequest): Promise<string> {
    console.log("Request in service:", req.body);

    const uploadedFiles = this.extractUploadedFiles(req.body);

    const courseData = this.prepareCourseData(req, uploadedFiles);

    console.log("Before saving in service");

    const newCourse = await this.courseRepository.save(courseData);

    const edited = newCourse;

    await sendMessage("course-created", {
      edited,
    });

    return "Course created successfully";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractUploadedFiles(body: any): { filename: string }[] {
    return [
      { filename: body.thumbnail },
      ...body.lessons.map((lesson: Lesson) => ({
        video: lesson.video,
        materials: lesson.materials,
        homework: lesson.homework,
      })),
    ];
  }

  private prepareCourseData(
    req: CreateCourseRequest,
    uploadedFiles: { filename: string }[]
  ) {
    const thumbnailFile = uploadedFiles[0].filename;

    return {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      level: req.body.level,
      thumbnail: thumbnailFile,
      tutor_id: req.tutor_id,
      price: req.body.price,
      lessons: req.body.lessons.map((lesson: Lesson) => ({
        title: lesson.title,
        goal: lesson.goal,
        video: lesson.video || "",
        materials: lesson.materials || "",
        homework: lesson.homework || "",
      })),
    };
  }

  public async getCourseById(courseId: string): Promise<Course> {
    try {
      const course = (await this.courseRepository.findById(
        courseId
      )) as CourseDocument;
      if (!course) {
        throw new Error("Course not found");
      }

      const courseData: Course = {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        thumbnail: course.thumbnail,
        tutor_id: course.tutor_id,
        price: course.price,
        lessons: course.lessons.map((lesson) => ({
          title: lesson.title,
          goal: lesson.goal,
          video: lesson.video,
          materials: lesson.materials,
          homework: lesson.homework,
        })),
      };

      return courseData;
    } catch (error) {
      logger.error(`Error fetching course by ID ${courseId}: ${error}`);
      throw new Error("Error fetching course details");
    }
  }

  public async getTutorCourses(
    tutorId: string,
    page: number,
    limit: number,
    isApproved: boolean
  ): Promise<PaginatedData<Course>> {
    logger.info(
      `Fetching ${
        isApproved ? "approved" : "pending"
      } courses for tutor with ID ${tutorId}`
    );

    try {
      const courses = await this.courseRepository.getCoursesByTutor(
        tutorId,
        page,
        limit,
        isApproved
      );
      console.log(courses);

      if (!courses || courses.length === 0) {
        return {
          data: [],
          totalPages: 0,
          loading: false,
          error: `No ${
            isApproved ? "approved" : "pending"
          } courses found for this tutor`,
        };
      }

      const totalCourses = await this.courseRepository.countCoursesByTutor(
        tutorId,
        isApproved
      );
      const totalPages = Math.ceil(totalCourses / limit);

      return {
        data: courses,
        totalPages: totalPages,
        loading: false,
        error: "",
      };
    } catch (error) {
      logger.error(`Error fetching courses: ${error}`);
      throw new Error(
        `Unable to fetch ${
          isApproved ? "approved" : "pending"
        } courses for this tutor`
      );
    }
  }

  public async getAllCoursesForCards(
    isApproved: boolean,
    page: number,
    limit: number
  ): Promise<CourseForCard[]> {
    logger.info(`Fetching courses for admin with status ${isApproved}`);

    try {
      const skip = (page - 1) * limit;

      const courses = await this.courseRepository.getAllCourses(
        isApproved,
        page,
        limit,
        skip
      );

      if (!courses || courses.length === 0) {
        throw new Error("No courses found");
      }

      // Process courses to add tutor data
      const processedCourses = await Promise.all(
        courses.map(async (course) => {
          const thumbnailUrl = course.thumbnail;
          const tutorData = await this.tutorRepository.findTutor(
            course.tutor_id
          );

          return {
            ...course,
            thumbnail: thumbnailUrl,
            tutor_data: tutorData ? [tutorData] : [],
          };
        })
      );

      return processedCourses;
    } catch (error) {
      logger.error(`Error fetching courses: ${error}`);
      throw new Error("Error fetching courses");
    }
  }

  public async getCourseDetails(course_id: string): Promise<CourseWithTutor> {
    logger.info(`Fetching a course.....${course_id}`);
    try {
      const courseData = await this.courseRepository.getCourseDetails(
        course_id
      );

      if (!courseData) {
        throw new Error("No course found");
      }

      const tutorData = await this.tutorRepository.findTutor(
        courseData.tutor_id as string
      );

      if (!tutorData) {
        throw new Error("Tutor not found");
      }

      const courseWithTutor: CourseWithTutor = {
        course_id: courseData._id,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        thumbnail: courseData.thumbnail,
        tutor_id: courseData.tutor_id,
        is_approved: courseData.is_approved,
        price: courseData.price,
        lessons: courseData.lessons,
        tutor_name: tutorData.name,
        tutor_image: tutorData.image,
        tutor_bio: tutorData.bio,
      };

      return courseWithTutor;
    } catch (error) {
      logger.error(`Error fetching course: ${error}`);
      throw new Error("Error fetching course");
    }
  }

  public async deleteCourse(courseId: string): Promise<boolean> {
    logger.info(`Deleting a course with ID: ${courseId}`);

    try {
      const result = await this.courseRepository.deleteCourse(courseId);
      return result;
    } catch (error) {
      logger.error(`Error deleting course: ${error}`);
      throw new Error("Error deleting course");
    }
  }

  public async getLessonDetails(
    courseId: string,
    lessonIndex: number
  ): Promise<Lesson | null> {
    logger.info(
      `Fetching lesson details for courseId: ${courseId}, lessonIndex: ${lessonIndex}`
    );
    try {
      const response = await this.courseRepository.getLessonDetails(
        courseId,
        lessonIndex
      );
      console.log(response);

      return response;
    } catch (error) {
      logger.error(`Error fetching lesson details: ${error}`);
      throw new Error("Error fetching lesson details");
    }
  }

  public async approveCourse(courseId: string): Promise<boolean> {
    logger.info(`Approving course...`);
    try {
      const approve = await this.courseRepository.approveCourse(courseId);

      return approve;
    } catch (error) {
      logger.error(`Error approving course${error}`);
      throw new Error("Error approving course");
    }
  }

  public async getTrendingCourses(): Promise<Course[] | undefined> {
    try {
      const trendingCourses = await this.courseRepository.getTrendingCourses();

      if (!trendingCourses) {
        throw new Error("No trending courses found.");
      }

      const processedCourses = await Promise.all(
        trendingCourses.map(async (course) => {
          const tutorData = await this.tutorRepository.findTutor(
            course.tutor_id as string
          );

          return {
            ...course,
            tutor_data: tutorData ? [tutorData] : [],
          };
        })
      );
      return processedCourses;
    } catch (error) {
      logger.error(`Error fetching trending courses${error}`);
      throw new Error("Error fetching trending courses");
    }
  }

  public async getNewlyAddedCourses(): Promise<Course[]> {
    try {
      const newlyAddedCourses =
        await this.courseRepository.getNewlyAddedCourses();

      if (!newlyAddedCourses) {
        throw new Error("No newly added courses found.");
      }

      console.log(newlyAddedCourses);

      const processedCourses = await Promise.all(
        newlyAddedCourses.map(async (course) => {
          const tutorData = await this.tutorRepository.findTutor(
            course.tutor_id as string
          );

          return {
            ...course,
            tutor_data: tutorData ? [tutorData] : [],
          };
        })
      );

      return processedCourses;
    } catch (error) {
      logger.error(`Error fetching newly added courses: ${error}`);
      throw new Error("Error fetching newly added courses");
    }
  }

  public async updateCourse(
    courseId: string,
    editedCourse: Course
  ): Promise<Course | null> {
    logger.info("Updating course...");

    console.log(editedCourse);

    const existingCourse = await this.courseRepository.findById(courseId);

    if (!existingCourse) {
      throw new Error("Course not found");
    }

    existingCourse.title = editedCourse.title || existingCourse.title;
    existingCourse.description =
      editedCourse.description || existingCourse.description;
    existingCourse.category = editedCourse.category || existingCourse.category;
    existingCourse.level = editedCourse.level || existingCourse.level;
    existingCourse.price = editedCourse.price || existingCourse.price;
    existingCourse.createdAt =
      editedCourse.createdAt || existingCourse.createdAt;
    if (editedCourse.lessons && Array.isArray(editedCourse.lessons)) {
      existingCourse.lessons = editedCourse.lessons.map(
        (editedLesson: Lesson) => ({
          title: editedLesson.title,
          goal: editedLesson.goal,
          video: editedLesson.video || "",
          materials: editedLesson.materials || "",
          homework: editedLesson.homework || "",
        })
      );
    }

    if (editedCourse.thumbnail) {
      existingCourse.thumbnail = editedCourse.thumbnail;
    }
    const edited = await existingCourse.save();

    await sendMessage("course-updated", { edited });

    return edited;
  }

  async fetchCourses(
    limit: number,
    offset: number,
    searchTerm: string,
    categories: string[],
    sort: string
  ): Promise<SimplifiedCourse[]> {
    const courses = await this.courseRepository.fetchCourses(
      limit,
      offset,
      searchTerm,
      categories,
      sort
    );

    if (!courses) {
      throw new Error("No courses found.");
    }

    const simplifiedCourses = await Promise.all(
      courses.map(async (course) => {
        const tutorData = await this.tutorRepository.findTutor(
          course.tutor_id as string
        );

        return {
          _id: course._id,
          title: course.title,
          category: course.category,
          description: course.description,
          enrollments: course.enrollments,
          is_approved: course.is_approved,
          level: course.level,
          price: course.price,
          thumbnail: course.thumbnail,
          lessonsCount: course.lessons.length,
          tutor: tutorData
            ? {
                _id: tutorData._id,
                image: tutorData.image,
                name: tutorData.name,
                email: tutorData.email,
                phone: tutorData.phone,
              }
            : null,
        };
      })
    );

    return simplifiedCourses;
  }

  async getCourseCount(): Promise<number> {
    return await this.courseRepository.totalCourseCount();
  }

  async getCourseCountByTutor(tutorId: string): Promise<number> {
    return await this.courseRepository.countCoursesByTutor(tutorId, true);
  }

  async createReview({
    studentId,
    courseId,
    rating,
    review,
    tutorId,
  }: {
    studentId: string;
    courseId: string;
    rating: number;
    review: string;
    tutorId: string;
  }): Promise<IReview | null> {
    const newReview = await this.reviewRepository.createReview({
      reviewBy: new mongoose.Types.ObjectId(studentId),
      tutorId: new mongoose.Types.ObjectId(tutorId),
      courseId: new mongoose.Types.ObjectId(courseId),
      rating,
      review,
    });
    return newReview;
  }

  async getReviewsByCourse(courseId: string): Promise<IReview[] | []> {
      return await this.reviewRepository.getReviewsByCourse(courseId)
  }

 async  getReviewsForHome(): Promise<IReview[] | []> {
      return await this.reviewRepository.getReviewsForHome()
  }
}

export default CourseService;
