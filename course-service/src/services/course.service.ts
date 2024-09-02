import { getObjectUrl, putObject } from "../utils/S3";
import CourseRepository from "../repositories/course.repository";
import { CreateCourseRequest } from "../interfaces/course.interface";
import { logger } from "@envy-core/common";

class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
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

  public async getCourseById(courseId: string) {
    try {
      const course = await this.courseRepository.findById(courseId);
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

      return course;
    } catch (error) {
      logger.error(`Error fetching course by ID ${courseId}: ${error}`);
      throw new Error("Error fetching course details");
    }
  }

  public async getTutorCourse(tutorId: string) {
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
}

export default CourseService;
