import { Document,Schema } from "mongoose";

export interface ICategory extends Document {
    _id: string;
    name: string;
    courses: Schema.Types.ObjectId[]; 
}

export interface INewCategory {
    name: string;
}