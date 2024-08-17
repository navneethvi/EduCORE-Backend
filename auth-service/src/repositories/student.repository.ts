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

  public async getStudents(page = 1, limit = 5): Promise<IStudent[]> {

    console.log("page in repo ==>", page);
    
    const skip = (page - 1) * limit;
    return await Student.find().skip(skip).limit(limit).exec();
  }

  public async countStudents(): Promise<number> {
    return await Student.countDocuments().exec();
  }
  
}

export default StudentRepository;
