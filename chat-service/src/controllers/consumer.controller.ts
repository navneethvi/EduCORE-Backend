import { Message } from "kafkajs"; // Import the KafkaJS Message type
import { logger } from "@envy-core/common";
import { ITutor } from "../interfaces/tutor.interface";
import { IConsumerService } from "../interfaces/consumer.service.interface";
import ConsumerService from "../services/consumer.service";
import TutorRepository from "../repositories/tutor.repository";
import Tutor from "../models/tutor.model";
import StudentRepository from "../repositories/student.repository";
import Student from "../models/student.model";
import { IStudent } from "../interfaces/student.interface";

class ConsumerController {
  private consumerService: IConsumerService;

  constructor(consumerService: IConsumerService) {
    this.consumerService = consumerService;
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
        logger.error(
          `Unexpected error in handleTutorCreated: ${String(error)}`
        );
      }
    }
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
}

const tutorRepository = new TutorRepository(Tutor);
const studentRepository = new StudentRepository(Student);

const consumerService = new ConsumerService(tutorRepository, studentRepository);

export default new ConsumerController(consumerService);
