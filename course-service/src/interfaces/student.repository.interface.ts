import { IStudent } from "./student.interface";

export interface IStudentRepository {
  findStudent(student_id: string): Promise<IStudent | null>;
  createStudent(studentData: IStudent): Promise<IStudent>;
  totalStudentsCount(): Promise<number>;
}
