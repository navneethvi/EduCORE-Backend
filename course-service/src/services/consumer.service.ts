import { ITutor } from "../interfaces/tutor.interface";
import { IConsumerService } from "../interfaces/consumer.service.interface";
import { ITutorRepository } from "../interfaces/tutor.repository.interface";
import { IStudent } from "../interfaces/student.interface";
import { IStudentRepository } from "../interfaces/student.repository.interface";

class ConsumerService implements IConsumerService {
  private tutorRepository: ITutorRepository;
  private studentRepository: IStudentRepository;

  constructor(
    tutorRepository: ITutorRepository,
    studentRepository: IStudentRepository
  ) {
    this.tutorRepository = tutorRepository;
    this.studentRepository = studentRepository;
  }

  public async createTutor(tutorData: ITutor): Promise<void> {
    console.log(tutorData);

    await this.tutorRepository.createTutor(tutorData);
  }

  public async createStudent(studentData: IStudent): Promise<void> {
    console.log(studentData);
    await this.studentRepository.createStudent(studentData);
  }

  public async getStudentsCount(): Promise<number> {
    return await this.studentRepository.totalStudentsCount()
  }
}

export default ConsumerService;
