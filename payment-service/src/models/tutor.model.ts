import { Schema, model } from "mongoose";

import { ITutor } from "../interfaces/tutor.interface";
const tutorSchema = new Schema<ITutor>({
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
    },
    bio : {
        type : String,
        default: ""
    },
    is_blocked : {
        type : Boolean,
        required : true,
        default : false
    },
    is_verified : {
        type : Boolean,
        required: true,
        default: false
    },
    image : {
        type : String,
        default : 'https://freesvg.org/img/abstract-user-flat-4.png'
    },
    followers : {
        type : [String],
        default: []
    }
})

const Tutor = model<ITutor>('Tutor', tutorSchema)

export default Tutor