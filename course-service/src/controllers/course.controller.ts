import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes, logger } from "@envy-core/common";
import { CreateCourseRequest } from "../interfaces/course.interface";
import { Types } from "mongoose";
import { ICourseService } from "../interfaces/course.service.interface";
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

class CourseController {
  private courseService: ICourseService;

  constructor(courseService: ICourseService) {
    this.courseService = courseService;
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

  public getTutorCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("hereeee at controller");

      const tutorId = req.params.tutorId;

      const response = await this.courseService.getTutorCourse(tutorId);

      logger.info(`Log in controller ====>${response}`);

      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getAllCoursesForCards = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("Hereeee at getAllCourses controller");

      const response = await this.courseService.getAllCoursesForCards();

      logger.info(`Log in controller ====>${response}`);

      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getCourseDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
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
}

export default CourseController;
