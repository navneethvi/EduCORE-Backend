import { logger } from "@envy-core/common";
import { Message } from "kafkajs";
import { IStudent } from "../interfaces/student.interface";
import StudentRepository from "../repositories/student.repository";
import Student from "../models/student.model";
import Course, { CourseDocument } from "../models/course.model";
import ConsumerService from "../services/consumer.service";
import { IConsumerService } from "../interfaces/consumer.service.interface";
import CourseRepository from "../repositories/course.repository";
import Enrollment from "../models/enrollment.model";
import TutorRepository from "../repositories/tutor.repository";
import Tutor from "../models/tutor.model";
import { ITutor } from "../interfaces/tutor.interface";

class consumerController {
  private consumerService: IConsumerService;

  constructor(consumerService: IConsumerService) {
    this.consumerService = consumerService;
  }

  public async handleStudentCreated(message: Message): Promise<void> {
    try {
      const value = message.value ? message.value.toString() : null;
      if (value) {
        logger.info(`Received message: ${value}`);
        const studentData: IStudent = JSON.parse(value);

        await this.consumerService.createStudent(studentData);
        logger.info(`Successfully processed tutor: ${studentData.id}`);
      } else {
        logger.error("Received empty message in 'student-created' topic.");
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in handleTutorCreated: ${error.message}`);
      } else {
        logger.error(
          `Unexpected error in handleTutorCreated: ${String(error)}`
        );
      }
    }
  }

  public async handleTutorCreated(message: Message): Promise<void> {
    try {
      const value = message.value ? message.value.toString() : null;
      if (value) {
        logger.info(`Received message: ${value}`);
        const tutorData: ITutor = JSON.parse(value);

        await this.consumerService.createTutor(tutorData);
        logger.info(`Successfully processed tutor: ${tutorData.id}`); 
      } else {
        logger.error("Received empty message in 'tutor-created' topic.");
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in handleTutorCreated: ${error.message}`);
      } else {
        logger.error(`Unexpected error in handleTutorCreated: ${String(error)}`);
      }
    }
  }

  public async handleCourseCreated(message: Message): Promise<void> {
    try {
      const value = message.value ? message.value.toString() : null;
      if (value) {
        logger.info(`Received message: ${value}`);
        const courseData: Partial<CourseDocument> = JSON.parse(value);

        await this.consumerService.createCourse(courseData);
        logger.info(`Successfully processed course: ${courseData}`);
      } else {
        logger.error("Received empty message in 'course-created' topic.");
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in handleTutorCreated: ${error.message}`);
      } else {
        logger.error(
          `Unexpected error in handleTutorCreated: ${String(error)}`
        );
      }
    }
  }

  public async handleCourseUpdated(message: Message): Promise<void> {
    try {
      const value = message.value ? message.value.toString() : null;
      if (value) {
        logger.info(`Received message: ${value}`);
        const courseData: Partial<CourseDocument> = JSON.parse(value);

        console.log("courseData========>", courseData.edited);

        const course = courseData.edited;

        let isExist = null;
        if (course._id) {
          isExist = await this.consumerService.findCourse(course._id);
        }

        console.log("isExists========>", isExist);

        if (isExist) {
          console.log("updatingggggggggggg");

          await this.consumerService.updateCourse(courseData);
          logger.info(
            `Successfully updated existing course: ${courseData._id}`
          );
        } else {
          console.log("creating...................");

          await this.consumerService.createCourse(courseData as CourseDocument);
          logger.info(
            `Successfully processed course create: ${courseData._id}`
          );
        }
      } else {
        logger.error("Received empty message in 'course-updated' topic.");
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error in handleCourseUpdated: ${error.message}`);
      } else {
        logger.error(
          `Unexpected error in handleCourseUpdated: ${String(error)}`
        );
      }
    }
  }
}

const studentRepository = new StudentRepository(Student);
const courseRepository = new CourseRepository(Course, Enrollment);
const tutorRepository = new TutorRepository(Tutor)

const consumerService = new ConsumerService(
  studentRepository,
  courseRepository,
  tutorRepository
);

export default new consumerController(consumerService);
