import Student from "../models/user.model";
import { IStudent, INewStudent } from "../interfaces/student.interface";
import { IRepository } from "../interfaces/repository.interface";

class StudentRepository implements IRepository<IStudent, INewStudent> {
  public async findUser(email: string): Promise<IStudent | null> {
    return Student.findOne({ email }).exec();
  }

  public async createStudent(student: INewStudent): Promise<IStudent> {
    return Student.create(student);
  }

}

export default StudentRepository;
