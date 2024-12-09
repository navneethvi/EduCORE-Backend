import { HttpStatusCodes } from "@envy-core/common";
import { ICategoryService } from "../interfaces/category.service.interface";
import { ICategory, INewCategory } from "../interfaces/category.interface";

import CustomError from "@envy-core/common/build/errors/CustomError";
import { ICategoryRepository } from "../interfaces/category.repository.interface";

class CategoryService implements ICategoryService {
  private categoryRepository: ICategoryRepository;

  constructor(categoryRepository: ICategoryRepository){
    this.categoryRepository = categoryRepository
  }

  public async createCategory(name: string): Promise<INewCategory> {
    const existingCategory = await this.categoryRepository.findCategory(name);
    if (existingCategory) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Category with this name already exists"
      );
    }

    const newCategory = await this.categoryRepository.createCategory(name);

    return newCategory;
  }

  public async getCategories(
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [categories, totalCount] = await Promise.all([
      this.categoryRepository.getCategories(skip, limit),
      this.categoryRepository.getCategoryCount(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return { categories, totalPages };
  }

  public async deleteCategory(category_id: string): Promise<void> {
    const success = await this.categoryRepository.deleteCategoryById(
      category_id
    );
    console.log("successsss", success);
    
    if (!success) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Category not found");
    }
  }

  public async getAllCategories(): Promise<ICategory[]> {
      const categories = await this.categoryRepository.getAllCategories()
      return categories
  }

  public async getCategoryCount(): Promise<number> {
      return await this.categoryRepository.totalCategoryCount()
  }
}

export default CategoryService;
