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

  public async getStudents(
    page = 1,
    limit = 5,
    searchTerm = ""
  ): Promise<IStudent[]> {
    console.log("page in repo ==>", page);

    const skip = (page - 1) * limit;
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};

    return await Student.find(query).skip(skip).limit(limit).exec();
  }

  public async countStudents(searchTerm = ""): Promise<number> {
    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};

    return await Student.countDocuments(query).exec();
  }

  async updateStudentStatus(
    tutorId: string,
    is_blocked: boolean
  ): Promise<void> {
    await Student.findByIdAndUpdate(tutorId, { is_blocked });
  }

  async getStudentById(tutorId: string): Promise<IStudent | null> {
    return Student.findById(tutorId);
  }
}

export default StudentRepository;
