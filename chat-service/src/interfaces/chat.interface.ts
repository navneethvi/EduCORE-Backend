import { Document } from "mongoose";

export interface IChat extends Document {
    _id : string;
    chatMembers: string[];
    chatMemberModel: string[];
    createdAt: Date;
    lastMessageAt: Date;
    lastMessage: string;
}