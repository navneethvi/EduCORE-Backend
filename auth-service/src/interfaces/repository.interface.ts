export interface IRepository<T, U> {
    createStudent(data : U) : Promise<T>
}