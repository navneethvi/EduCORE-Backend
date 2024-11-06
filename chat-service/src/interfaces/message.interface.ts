import { Document, Types } from "mongoose";

export interface IMessage extends Document {
    _id: Types.ObjectId;
    messageBy: Types.ObjectId; 
    messageByModel: string;
    content: string;
    chatRoom: Types.ObjectId; 
    createdAt: Date;
}
