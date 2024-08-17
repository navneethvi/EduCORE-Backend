import { IStudent, INewStudent } from "./student.interface";

export interface IStudentRepository {
  createStudent(studentData: INewStudent): Promise<IStudent>;
  findUser(email: string): Promise<IStudent | null>;
  getStudents(page?: number, limit?: number): Promise<IStudent[]>;
  countStudents(): Promise<number>;
}
