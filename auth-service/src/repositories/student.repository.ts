import { Model } from "mongoose";
import { IStudent, INewStudent } from "../interfaces/student.interface";
import { IStudentRepository } from "../interfaces/student.repository.interface";

class StudentRepository implements IStudentRepository {
  private readonly studentModel: Model<IStudent>;

  constructor(studentModel: Model<IStudent>) {
    this.studentModel = studentModel;
  }

  public async createStudent(studentData: INewStudent): Promise<IStudent> {
    const student = new this.studentModel(studentData);
    return await student.save();
  }

  public async findUser(email: string): Promise<IStudent | null> {
    return await this.studentModel.findOne({ email }).exec();
  }

  public async getStudents(
    page = 1,
    limit = 5,
    searchTerm = ""
  ): Promise<IStudent[]> {
    const skip = (page - 1) * limit;
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};
    return await this.studentModel.find(query).skip(skip).limit(limit).exec();
  }

  public async countStudents(searchTerm = ""): Promise<number> {
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};
    return await this.studentModel.countDocuments(query).exec();
  }

  public async updateStudentStatus(
    studentId: string,
    is_blocked: boolean
  ): Promise<void> {
    await this.studentModel.findByIdAndUpdate(studentId, { is_blocked });
  }

  public async getStudentById(studentId: string): Promise<IStudent | null> {
    return this.studentModel.findById(studentId).exec();
  }
}

export default StudentRepository;
