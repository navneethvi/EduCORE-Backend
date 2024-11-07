import { Schema, model } from "mongoose";

import { IStudent } from "../interfaces/student.interface";

const studentSchema = new Schema<IStudent>({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    phone : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    interests : {
        type : [String],
    },
    is_blocked : {
        type : Boolean,
        required : true,
        default : false
    },
    image : {
        type : String,
        default : 'https://freesvg.org/img/abstract-user-flat-4.png'
    },
    following : {
        type : [String]
    }
})

const Student = model<IStudent>('Student', studentSchema)

export default Student