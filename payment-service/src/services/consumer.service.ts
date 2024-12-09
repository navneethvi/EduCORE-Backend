import { IConsumerService } from "../interfaces/consumer.service.interface";
import { ICourseRepository } from "../interfaces/course.repository.interface";
import { IStudent } from "../interfaces/student.interface";
import { ITutor } from "../interfaces/tutor.interface";
import { IStudentRepository } from "../interfaces/student.repository.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";
import { CourseDocument } from "../models/course.model";

class ConsumerService implements IConsumerService {
  private studentRepository: IStudentRepository;
  private courseRepository: ICourseRepository;
  private tutorRepository: ITutorRepository;

  constructor(
    studentRepository: IStudentRepository,
    courseRepository: ICourseRepository,
    tutorRepository: ITutorRepository
  ) {
    this.studentRepository = studentRepository;
    this.courseRepository = courseRepository;
    this.tutorRepository = tutorRepository
  }

  public async createStudent(studentData: IStudent): Promise<void> {
    console.log(studentData);
    await this.studentRepository.createStudent(studentData);
  }

  public async createCourse(courseData: Partial<CourseDocument>): Promise<void> {
    console.log("course in service======>",courseData);
     await this.courseRepository.createCourse(courseData);
  }

  public async findCourse(courseId: string): Promise<boolean> {
    console.log(courseId);
    return await this.courseRepository.findCourse(courseId);
  }

  public async updateCourse(courseData: Partial<CourseDocument>): Promise<void> {
    console.log("Updating course:", courseData);
    await this.courseRepository.updateCourse(courseData);
  }

  public async createTutor(tutorData: ITutor): Promise<void> {
    console.log(tutorData);

    await this.tutorRepository.createTutor(tutorData);
  }}

export default ConsumerService;
