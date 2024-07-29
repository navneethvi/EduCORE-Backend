import { INewStudent, IStudent } from "../interfaces/student.interface";
import StudentRepository from "../repositories/student.repository";
import { CreateStudentDto } from "../dtos/student.dto";

import bcryptjs from "bcryptjs";
import { generateToken } from "../common/jwt";
import { sendMessage } from "../events/kafkaClient";


class StudentService {
  private studentRepository = new StudentRepository();

  public async createStudent(studentData: CreateStudentDto): Promise<IStudent> {

    
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

    await sendMessage('user-created', {email: newStudent.email})

    const token = generateToken({ id: newStudent._id, email: newStudent.email });

    return { ...newStudent.toObject(), token };
  }
}

export default StudentService;
