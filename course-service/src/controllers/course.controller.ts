import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes, logger } from "@envy-core/common";
import {
  Course,
  CreateCourseRequest,
  PaginatedData,
} from "../interfaces/course.interface";
import mongoose, { Types } from "mongoose";
import { ICourseService } from "../interfaces/course.service.interface";
import { getObjectUrl, getUploadSignedUrl } from "../utils/S3";
import { ICategoryService } from "../interfaces/category.service.interface";
import { ITutorService } from "../interfaces/tutor.service.interface";
import { IConsumerService } from "../interfaces/consumer.service.interface";
// import Joi from "joi";

// const courseSchema = Joi.object({
//   title: Joi.string().required(),
//   description: Joi.string().required(),
//   category: Joi.string().required(),
//   level: Joi.string().required(),
//   lessons: Joi.array().items(
//     Joi.object({
//       title: Joi.string().required(),
//       goal: Joi.string().required(),
//       video: Joi.string().required(),
//       materials: Joi.string().required(),
//       homework: Joi.string().required(),
//     })
//   ),
// });

interface TutorRequest extends Request {
  tutor?: string;
}

interface StudentRequest extends Request {
  student?: string;
}

class CourseController {
  private courseService: ICourseService;
  private categoryService: ICategoryService;
  private tutorService: ITutorService;
  private consumerService: IConsumerService;

  constructor(
    courseService: ICourseService,
    categoryService: ICategoryService,
    tutorService: ITutorService,
    consumerService: IConsumerService
  ) {
    this.courseService = courseService;
    this.categoryService = categoryService;
    this.tutorService = tutorService;
    this.consumerService = consumerService;
  }

  public createCourse = async (
    req: TutorRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // const { error } = courseSchema.validate(req.body);
      // if (error) {
      //   return res
      //     .status(HttpStatusCodes.BAD_REQUEST)
      //     .json({ message: error.message });
      // }
      console.log("req in controller ==>", req);

      if (!req.files || !Array.isArray(req.files)) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "No files uploaded" });
      }

      const createCourseRequest: CreateCourseRequest = {
        body: req.body,
        files: req.files as unknown as File[],
        tutor_id: req.tutor as unknown as Types.ObjectId,
      };

      console.log("createCourseReq ====>", createCourseRequest);

      const message = await this.courseService.createCourse(
        createCourseRequest
      );
      res.status(HttpStatusCodes.CREATED).json(message);
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  public getTutorCoursesByStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("hit hit hit");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const tutorId = req.params.tutorId;
      const status = req.params.status;

      let response: PaginatedData<Course>;

      if (status == "true") {
        response = await this.courseService.getTutorCourses(
          tutorId,
          page,
          limit,
          true
        );
      } else if (status == "false") {
        response = await this.courseService.getTutorCourses(
          tutorId,
          page,
          limit,
          false
        );
      } else {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Invalid status parameter. Use 'approved' or 'pending'.",
        });
      }

      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      logger.error(`Failed to fetch courses for tutor: ${error}`);
      next(error);
    }
  };

  public getAllCoursesForCards = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("At getAllCourses controller");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const status = req.params.status === "true"; // Converts status to boolean

      logger.info(
        `Fetching courses with status: ${status}, page: ${page}, limit: ${limit}`
      );

      const response = await this.courseService.getAllCoursesForCards(
        status,
        page,
        limit
      );

      logger.info("Courses fetched successfully");
      console.log(response);

      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      logger.error("Error in getAllCoursesForCards controller:", error);
      next(error);
    }
  };

  public getCourseDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const courseId = req.params.courseId;

      logger.info(`Fetching course with ID: ${courseId}`);

      const courseDetails = await this.courseService.getCourseDetails(courseId);

      if (!courseDetails) {
        return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json(courseDetails);
    } catch (error) {
      logger.error(`Error in getCourseDetails controller: ${error}`);
      next(error);
    }
  };

  public deleteCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const courseId = req.params.courseId;

    logger.info(`Deleting course with ID: ${courseId}`);

    try {
      const success = await this.courseService.deleteCourse(courseId);

      if (success) {
        res.status(200).json({ message: "Course deleted successfully" });
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } catch (error) {
      next(error);
    }
  };

  public getS3UploadUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { key, contentType } = req.query;

    logger.info(`${key}===> ${contentType}`);

    if (!key || !contentType) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters: key, contentType" });
    }

    try {
      const uploadUrl = await getUploadSignedUrl(
        key as string,
        contentType as string
      );
      if (!uploadUrl) {
        return res.status(500).json({ error: "Failed to generate upload URL" });
      }

      return res.status(200).json({ url: uploadUrl });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      next(error);
    }
  };

  public getS3PresignedUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { filename } = req.query;

    logger.info(`${filename}`);

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    try {
      const url = await getObjectUrl(filename as string);
      res.json({ url });
    } catch (error) {
      next(error);
    }
  };

  public getLessonDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.warn("here at getLessonDetails controlller");

      const { lessonIndex } = req.body;
      const { courseId } = req.params;

      console.log("courseId ===>", courseId, "lessonIndex===>", lessonIndex);
      const response = await this.courseService.getLessonDetails(
        courseId,
        lessonIndex
      );
      console.log("res i con===>", response);

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public approveCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("hitted approve course controller");

      const { courseId } = req.params;

      const response = await this.courseService.approveCourse(courseId);

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public dataForHome = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info("Im here for fetching home page datas.......");
    try {
      const trendingCourses = await this.courseService.getTrendingCourses();

      const newlyAddedCourses = await this.courseService.getNewlyAddedCourses();

      const trendingCategories = await this.categoryService.getAllCategories();

      res
        .status(HttpStatusCodes.OK)
        .json({ trendingCourses, newlyAddedCourses, trendingCategories });
    } catch (error) {
      next(error);
    }
  };

  public editCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.warn("Controller is ready to edit the course...");
    try {
      console.log("course for edit ===>", req.params);
      const { courseId } = req.params;

      const editedCourse = req.body;

      const updatedCourse = await this.courseService.updateCourse(
        courseId,
        editedCourse
      );

      res.status(200).json({
        message: "Course updated successfully",
        updatedCourse,
      });
    } catch (error) {
      next(error);
    }
  };

  public fetchCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.warn("Controller is fetch courses for store...");
    try {
      const { limit, offset, searchTerm, categories, sort } = req.query;
      console.log("Search term for courses:", req.query);
      const parsedLimit = parseInt(limit as string, 10) || 10;
      const parsedOffset = parseInt(offset as string, 10) || 0;
      const courses = await this.courseService.fetchCourses(
        parsedLimit,
        parsedOffset,
        searchTerm as string,
        categories as string[],
        sort as string
      );
      const allCategories = await this.categoryService.getAllCategories();
      return res.status(200).json({ courses, categories: allCategories });
    } catch (error) {
      next(error);
    }
  };

  public getDatasForAdminDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("im here for fetching admin dashboard datas");
      const numOfCourses = await this.courseService.getCourseCount();
      logger.warn(`total courses count: ${numOfCourses}`);
      const numOfTutors = await this.tutorService.totalTutorCount();
      logger.warn(`total tutors count: ${numOfTutors}`);
      const numOfStudents = await this.consumerService.getStudentsCount();
      logger.warn(`total students count: ${numOfStudents}`);
      const numOfCategories = await this.categoryService.getCategoryCount();
      logger.warn(`total category count: ${numOfCategories}`);
      res
        .status(HttpStatusCodes.OK)
        .json({ numOfStudents, numOfTutors, numOfCourses, numOfCategories });
    } catch (error) {
      next(error);
    }
  };

  public getDatasForTutorDashboard = async (
    req: TutorRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("im here for fetching tutor dashboard datas");
      const tutorId = req.tutor as string;
      const numOfCourses = await this.courseService.getCourseCountByTutor(
        tutorId
      );
      const avgRating = 0;
      res.status(HttpStatusCodes.OK).json({ numOfCourses, avgRating });
    } catch (error) {
      next(error);
    }
  };

  public createReview = async (
    req: StudentRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("Creating review for course");
      const { _id: studentId } = req.student as unknown as { _id: string };
      const { rating, review, tutorId, courseId } = req.body as {
        rating: number;
        review: string;
        tutorId: string;
        courseId: string;
      };

      // Log incoming data
      console.log("Incoming data:", {
        studentId,
        rating,
        review,
        tutorId,
        courseId,
      });

      // Validate input
      if (!rating || !review || !tutorId) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "All fields (rating, review, tutorId) are required.",
        });
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(tutorId)) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Invalid tutor ID.",
        });
      }

      const response = await this.courseService.createReview({
        studentId,
        courseId,
        rating,
        review,
        tutorId,
      });

      // Log response after creating the review
      console.log("Review saved:", response);

      res.status(HttpStatusCodes.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getReviewsByCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { courseId } = req.query;
      if (!courseId || typeof courseId !== "string") {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Valid Course Id required.",
        });
      }
      console.log("courseId=====>", courseId);

      const response = await this.courseService.getReviewsByCourse(
        courseId as string
      );
      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getReviewsForHome = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await this.courseService.getReviewsForHome();
      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getNewlyAddedCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await this.courseService.getNewlyAddedCourses();
      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default CourseController;
