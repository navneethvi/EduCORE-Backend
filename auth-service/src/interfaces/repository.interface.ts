export interface IRepository<T, U> {
  findUser(email: string): Promise<T | null>;
  createStudent(data: U): Promise<T>;
}
