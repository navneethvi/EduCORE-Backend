import {
  Course,
  CourseForCard,
  CourseWithTutor,
  CreateCourseRequest,
  Lesson,
  PaginatedData,
} from "../interfaces/course.interface";
import { logger } from "@envy-core/common";
import { ICourseService } from "../interfaces/course.service.interface";
import { CourseDocument } from "../models/course.model";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";

class CourseService implements ICourseService {
  private courseRepository: ICourseRepository;
  private tutorRepository: ITutorRepository;

  constructor(
    courseRepository: ICourseRepository,
    tutorRepository: ITutorRepository
  ) {
    this.courseRepository = courseRepository;
    this.tutorRepository = tutorRepository;
  }
  public async createCourse(req: CreateCourseRequest): Promise<string> {
    console.log("Request in service:", req.body);

    // Assuming `uploadedFiles` are filenames from `req.body` or another source
    const uploadedFiles = this.extractUploadedFiles(req.body);

    const courseData = this.prepareCourseData(req, uploadedFiles);

    console.log("Before saving in service");

    await this.courseRepository.save(courseData);

    return "Course created successfully";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractUploadedFiles(body: any): { filename: string }[] {
    // Extract filenames from the request body or elsewhere
    // This needs to be implemented based on how `uploadedFiles` are determined
    return [
      { filename: body.thumbnail }, // Example for thumbnail
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
        video: lesson.video || "", // Default to empty string if undefined
        materials: lesson.materials || "", // Default to empty string if undefined
        homework: lesson.homework || "", // Default to empty string if undefined
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
      const newlyAddedCourses = await this.courseRepository.getNewlyAddedCourses();
  
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
  
}

export default CourseService;
