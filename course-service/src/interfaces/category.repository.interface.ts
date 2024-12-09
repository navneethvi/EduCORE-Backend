import { CategoryDocument } from "../models/category.model";
import { ICategory } from "./category.interface";

export interface ICategoryRepository {
  findCategory(name: string): Promise<ICategory | null>;
  createCategory(name: string): Promise<CategoryDocument>;
  getCategories(skip: number, limit: number): Promise<ICategory[]>;
  getCategoryCount(): Promise<number>;
  deleteCategoryById(category_id: string): Promise<boolean>;
  getAllCategories(): Promise<ICategory[]>;
  totalCategoryCount(): Promise<number>;
}
