import { INewCategory } from "./category.interface";
import { ICategory } from "./category.interface";

export interface ICategoryService {
  createCategory(name: string): Promise<INewCategory>;
  getCategories(page: number,pageSize: number): Promise<{ categories: ICategory[]; totalPages: number }>;
  deleteCategory(category_id: string): Promise<void>;
  getAllCategories(): Promise<ICategory[]>;
  getCategoryCount(): Promise<number>;
}
