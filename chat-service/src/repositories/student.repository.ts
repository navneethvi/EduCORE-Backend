import { Model } from "mongoose";
import { IStudentRepository } from "../interfaces/student.repository.interface";
import { IStudent } from "../interfaces/student.interface";
import { logger } from "@envy-core/common";

class StudentRepository implements IStudentRepository {
  private readonly studentModel: Model<IStudent>;

  constructor(StudentModel: Model<IStudent>) {
    this.studentModel = StudentModel;
  }

  public async findStudent(student_id: string): Promise<IStudent | null> {
    try {
      
      return await this.studentModel.findOne({ _id: student_id }).exec();
    } catch (error) {
      logger.error(`Error finding Student: ${error}`);
      throw new Error("Error finding Student");
    }
  }

  public async createStudent(studentData: IStudent): Promise<IStudent> {
    try {
      const student = new this.studentModel(studentData);
      return await student.save();
    } catch (error) {
      logger.error(`Error creating Student: ${error}`);
      throw new Error("Error creating Student");
    }
  }
  
}

export default StudentRepository;


