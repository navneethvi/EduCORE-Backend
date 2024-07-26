import { Request, Response, NextFunction } from "express";
import StudentService from "../services/student.service";
import { CreateStudentDto } from "../dtos/student.dto";

class StudentController {
    private studentService = new StudentService()

    public signup = async (req : Request, res : Response, next : NextFunction) => {
        try {
            const studentData : CreateStudentDto = req.body
            const newStudent = await this.studentService.signup(studentData)
            console.log("Student Created :" ,newStudent);
            res.status(201).json({data : newStudent, message : "Student Created"})
        } catch (error) {
            next(error)
        }
    }
}

export default StudentController