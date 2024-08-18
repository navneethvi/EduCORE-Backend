import CategoryRepository from "../repositories/category.repository";
import { HttpStatusCodes } from "@envy-core/common";
import { ICategoryService } from "../interfaces/category.service.interface";
import { ICategory, INewCategory } from "../interfaces/category.interface";

import CustomError from "@envy-core/common/build/errors/CustomError";

class CategoryService implements ICategoryService {
  private categoryRepository = new CategoryRepository();

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
}

export default CategoryService;
