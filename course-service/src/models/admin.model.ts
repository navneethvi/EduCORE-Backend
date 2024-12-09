import { Document, Schema, model } from "mongoose";

interface AdminDocument extends Document {
  _id: string;
  email: string;
  name: string;
  password: string;
  refreshToken?: string;
  accessToken?: string;
}

const adminSchema: Schema<AdminDocument> = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

const Admin = model<AdminDocument>("Admin", adminSchema);

export default Admin;
export { AdminDocument };
