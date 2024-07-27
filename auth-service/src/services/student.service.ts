import { INewStudent, IStudent } from "../interfaces/student.interface";
import StudentRepository from "../repositories/student.repository";
import { CreateStudentDto } from "../dtos/student.dto";

import bcryptjs from "bcryptjs";
import { generateToken } from "../common/jwt";
import { config } from "../config/config";

class StudentService {
  private studentRepository = new StudentRepository();

  public async signup(studentData: CreateStudentDto): Promise<IStudent> {

    const findUser = await this.studentRepository.findUser(studentData.email)

    console.log("findUser from service: ",findUser);

    if(findUser){
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
      role: 'student'
    };

    const student = await this.studentRepository.createStudent(studentInput);

    let token = generateToken({id: student._id, email: student.email})

    return { ...student.toObject(), token };
  }
}

export default StudentService;
