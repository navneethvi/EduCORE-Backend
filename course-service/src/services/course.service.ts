import { getObjectUrl, putObject } from "../utils/S3";
import { Course, CourseForCard, CreateCourseRequest } from "../interfaces/course.interface";
import { logger } from "@envy-core/common";
import { ICourseService } from "../interfaces/course.service.interface";
import { CourseDocument } from "../models/course.model";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";

class CourseService implements ICourseService {
  private courseRepository: ICourseRepository;
  private tutorRepository: ITutorRepository;

  constructor(courseRepository: ICourseRepository, tutorRepository: ITutorRepository) {
    this.courseRepository = courseRepository;
    this.tutorRepository = tutorRepository;
  }

  public async createCourse(req: CreateCourseRequest): Promise<string> {
    if (!req.files || !Array.isArray(req.files)) {
      throw new Error("No files uploaded");
    }

    console.log("Request in service:", req);

    const uploadedFiles = await this.uploadFilesToS3(
      req.files as unknown as Express.Multer.File[]
    );

    const courseData = this.prepareCourseData(req, uploadedFiles);

    console.log("Before saving in service");

    await this.courseRepository.save(courseData);

    return "Course created successfully";
  }

  private async uploadFilesToS3(
    files: Express.Multer.File[]
  ): Promise<{ filename: string; url: string }[]> {
    const uploadedFiles: { filename: string; url: string }[] = [];

    for (const file of files) {
      const success = await putObject(
        file.originalname,
        file.mimetype,
        file.buffer
      );
      if (success) {
        const url = await getObjectUrl(file.originalname);
        uploadedFiles.push({ filename: file.originalname, url: url || "" });
      } else {
        logger.error(`Failed to upload file: ${file.originalname}`);
      }
    }

    return uploadedFiles;
  }

  private prepareCourseData(
    req: CreateCourseRequest,
    uploadedFiles: { filename: string; url: string }[]
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
      lessons: req.body.lessons.map((lesson) => ({
        title: lesson.title,
        goal: lesson.goal,
        video: lesson.video,
        materials: lesson.materials,
        homework: lesson.homework,
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

      course.thumbnail = (await getObjectUrl(course.thumbnail)) || "";

      for (const lesson of course.lessons) {
        if (lesson.video) {
          lesson.video = (await getObjectUrl(lesson.video)) || "";
        }
        if (lesson.materials) {
          lesson.materials = (await getObjectUrl(lesson.materials)) || "";
        }
        if (lesson.homework) {
          lesson.homework = (await getObjectUrl(lesson.homework)) || "";
        }
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

  public async getTutorCourse(tutorId: string): Promise<Course[]> {
    logger.info(`Fetching courses for tutor with ID ${tutorId}`);

    try {
      const courses = await this.courseRepository.getCourseByTutor(tutorId);
      if (!courses || courses.length === 0) {
        throw new Error("No courses found for this tutor");
      }

      for (const course of courses) {
        course.thumbnail = (await getObjectUrl(course.thumbnail)) || "";

        for (const lesson of course.lessons) {
          if (lesson.video) {
            lesson.video = (await getObjectUrl(lesson.video)) || "";
          }
          if (lesson.materials) {
            lesson.materials = (await getObjectUrl(lesson.materials)) || "";
          }
          if (lesson.homework) {
            lesson.homework = (await getObjectUrl(lesson.homework)) || "";
          }
        }
      }

      return courses;
    } catch (error) {
      logger.error(
        `Error fetching courses for tutor with ID ${tutorId}: ${error}`
      );
      throw new Error("Error fetching tutor courses");
    }
  }

  public async getAllCoursesForCards(): Promise<CourseForCard[]> {
    logger.info(`Fetching all courses for admin`);
    
    try {
      const courses = await this.courseRepository.getAllCourses();

      if (!courses || courses.length === 0) {
        throw new Error("No courses found");
      }

      const processedCourses = await Promise.all(
        courses.map(async (course) => {
          const thumbnailUrl = await getObjectUrl(course.thumbnail) || "";
          const tutorData = await this.tutorRepository.findTutor(course.tutor_id);
  
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
}

export default CourseService;
