import { IStudent } from "../interfaces/student.interface";
import { CreateStudentDto } from "../dtos/student.dto";

export interface IStudentService {
  checkUserExists(studentData: CreateStudentDto): Promise<void>;
  createStudent(studentData: CreateStudentDto): Promise<IStudent>;
  signinStudent(email: string, password: string): Promise<IStudent | null>;
  googleSignin(token: string): Promise<IStudent | null>;
  recoverAccount(email: string): Promise<void>;
  updatePassword(email: string, newPassword: string): Promise<void>;
  getStudents(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{
    students: IStudent[];
    totalPages: number;
    currentPage: number;
  }>;
  toggleBlockStudent(studentId: string): Promise<void>;
}
