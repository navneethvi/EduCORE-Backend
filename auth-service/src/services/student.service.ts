import { INewStudent, IStudent } from "../interfaces/student.interface";
import StudentRepository from "../repositories/student.repository";
import { CreateStudentDto } from "../dtos/student.dto";

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

class StudentService {
  private studentRepository = new StudentRepository();

  public async signup(studentData: CreateStudentDto): Promise<IStudent> {
    const hashedPassword = await bcryptjs.hash(studentData.password, 10);

    const studentInput: INewStudent = {
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      password: hashedPassword,
      interests: studentData.interests || [],
      following: [],
    };

    const student = await this.studentRepository.createStudent(studentInput);

    const token = jwt.sign(
      { id: student._id, email: student.email },
      config.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { ...student.toObject(), token };
  }
}

export default StudentService;
