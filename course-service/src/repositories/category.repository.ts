import { CategoryDocument } from "../models/category.model";
import { ICategoryRepository } from "../interfaces/category.repository.interface";
import { ICategory } from "../interfaces/category.interface";
import { Model } from "mongoose";

class CategoryRepository implements ICategoryRepository {
  private readonly categoryModel: Model<ICategory>;

  constructor(categoryModel: Model<ICategory>){
    this.categoryModel = categoryModel
  }

  public async findCategory(name: string): Promise<ICategory | null> {
    return await this.categoryModel.findOne({name}).exec()
  }

  public async createCategory(name: string): Promise<CategoryDocument> {
    console.log("name in repository ===>", name);
    
    const category = new this.categoryModel({name});
    return await category.save();
  }

  public async getCategories(skip: number, limit: number): Promise<ICategory[]> {
    return await this.categoryModel.find().skip(skip).limit(limit).exec();
  }

  public async getCategoryCount(): Promise<number> {
    return await this.categoryModel.countDocuments().exec();
  }

  public async deleteCategoryById(category_id : string): Promise<boolean> {
    const result = await this.categoryModel.findByIdAndDelete(category_id)
    return result !== null
  }

  public async getAllCategories(): Promise<ICategory[]> {
      return await this.categoryModel.find()
  }

  public async totalCategoryCount(): Promise<number> {
      return await this.categoryModel.countDocuments()
  }
}

export default CategoryRepository;
