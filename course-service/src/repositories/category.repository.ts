import Category, { CategoryDocument } from "../models/category.model";

import { ICategoryRepository } from "../interfaces/category.repository.interface";
import { ICategory } from "../interfaces/category.interface";

class CategoryRepository implements ICategoryRepository {
  public async findCategory(name: string): Promise<ICategory | null> {
    return await Category.findOne({name}).exec()
  }

  public async createCategory(name: string): Promise<CategoryDocument> {
    console.log("name in repository ===>", name);
    
    const category = new Category({name});
    return await category.save();
  }

  public async getCategories(skip: number, limit: number): Promise<ICategory[]> {
    return await Category.find().skip(skip).limit(limit).exec();
  }

  public async getCategoryCount(): Promise<number> {
    return await Category.countDocuments().exec();
  }
}

export default CategoryRepository;
