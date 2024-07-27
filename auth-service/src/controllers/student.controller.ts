import { Request, Response, NextFunction } from "express";
import StudentService from "../services/student.service";
import { CreateStudentDto } from "../dtos/student.dto";

class StudentController {
    private studentService = new StudentService()

    public signup = async (req : Request, res : Response, next : NextFunction) => {
        try {
            const {name, email, phone, password, confirmPassword, interests, role } : CreateStudentDto = req.body
            
            if(password !== confirmPassword){
                return res.status(400).json({ message: "Passwords do not match" });
            }

            const studentData : CreateStudentDto = {name, email, phone, password, confirmPassword, interests, role}

            const newStudent = await this.studentService.signup(studentData)
            console.log("Student Created :" ,newStudent);
            res.status(201).json({data : newStudent, message : "Student Created"})
        } catch (error) {
            next(error)
        }
    }
}

export default StudentController