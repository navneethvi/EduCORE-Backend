import { INewStudent, IStudent } from "../interfaces/student.interface";
import StudentRepository from "../repositories/student.repository";
import { CreateStudentDto } from "../dtos/student.dto";

import bcryptjs from "bcryptjs";
import { generateToken } from "../common/jwt";


class StudentService {
  private studentRepository = new StudentRepository();

  public async createStudent(studentData: CreateStudentDto): Promise<IStudent> {
    const existingUser = await this.studentRepository.findUser(studentData.email);

    if (existingUser) {
      throw new Error("User already exists");
    }
    
    const hashedPassword = await bcryptjs.hash(studentData.password, 10);
    
    const studentInput: INewStudent = {
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone,
      password: hashedPassword,
      interests: studentData.interests || [],
      following: [],
      role: studentData.role || 'student',
    };

    const newStudent = await this.studentRepository.createStudent(studentInput);
    const token = generateToken({ id: newStudent._id, email: newStudent.email });

    return { ...newStudent.toObject(), token };
  }
}

export default StudentService;
