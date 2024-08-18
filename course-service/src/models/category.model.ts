import { Document, Schema, model } from "mongoose";

interface CategoryDocument extends Document {
  _id: string;
  name: string;
  courses: Schema.Types.ObjectId[];
}

const categorySchema: Schema<CategoryDocument> = new Schema({
  name: { type: String, required: true, unique: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

const Category = model<CategoryDocument>("Category", categorySchema);

export default Category;

export { CategoryDocument };
