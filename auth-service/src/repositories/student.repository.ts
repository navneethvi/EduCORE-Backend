import Student from "../models/student.model";
import { IStudent, INewStudent } from "../interfaces/student.interface";
import { IStudentRepository } from "../interfaces/student.repository.interface";

class StudentRepository implements IStudentRepository {
  public async createStudent(studentData: INewStudent): Promise<IStudent> {
    const student = new Student(studentData);
    return await student.save();
  }

  public async findUser(email: string): Promise<IStudent | null> {
    return await Student.findOne({ email }).exec();
  }
}

export default StudentRepository;
