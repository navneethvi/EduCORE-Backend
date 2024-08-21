import { IStudent, INewStudent } from "./student.interface";

export interface IStudentRepository {
  createStudent(studentData: INewStudent): Promise<IStudent>;
  findUser(email: string): Promise<IStudent | null>;
  getStudents(page?: number, limit?: number, searchTerm?: string): Promise<IStudent[]>;
  countStudents(searchTerm?: string): Promise<number>;
  updateStudentStatus(studentId: string, is_blocked: boolean): Promise<void>;
  getStudentById(studentId: string): Promise<IStudent | null>;
}
