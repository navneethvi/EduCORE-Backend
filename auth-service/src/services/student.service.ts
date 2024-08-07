import { INewStudent, IStudent } from "../interfaces/student.interface";
import StudentRepository from "../repositories/student.repository";
import { CreateStudentDto } from "../dtos/student.dto";

import bcryptjs from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { sendMessage } from "../events/kafkaClient";
import { OtpService } from "./otp.service";

import { IStudentService } from "../interfaces/student.service.interface";


class StudentService implements IStudentService{
  private studentRepository = new StudentRepository();
  private otpService = new OtpService()

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

    await sendMessage('student-created', {email: newStudent.email})

    const token = generateToken({ id: newStudent._id, email: newStudent.email });

    const studentWithToken = { ...newStudent.toObject(), token };

    return studentWithToken;
  }

  public async signinStudent(email: string, password: string): Promise<IStudent | null> {

    const student = await this.studentRepository.findUser(email)
    
    if (!student) {
      throw new Error('Invalid email or password.');
    }

    const isPasswordMatch = await bcryptjs.compare(password, student.password)

    console.log("passmatch : ", isPasswordMatch);
    

    if(!isPasswordMatch){
      throw new Error('Invalid password.');
    } 

    const token = generateToken({id: student._id, email: student.email})

    const studentWithToken = { ...student.toObject(), token };

    return studentWithToken;
  }

  public async recoverAccount(email: string): Promise<void> {
    console.log("email in service : ", email);
    
    const student = await this.studentRepository.findUser(email)

    if(!student){
      throw new Error('User not found.');
    }

    await this.otpService.generateAccRecoverOtp(email)
  }

  public async updatePassword(email: string, newPassword: string): Promise<void> {

    const student = await this.studentRepository.findUser(email)

    if (!student) {
      throw new Error("User not found.");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    student.password = hashedPassword;

    await student.save();

    await this.otpService.deleteOtp(email)
  }
}

export default StudentService;
