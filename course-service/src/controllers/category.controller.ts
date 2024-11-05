import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes, logger } from "@envy-core/common";
import { ICategoryService } from "../interfaces/category.service.interface";

class CategoryController {
  private categoryService: ICategoryService;

  constructor(categoryService: ICategoryService) {
    this.categoryService = categoryService;
  }

  public addCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = req.body;
      console.log("name in controller ===>", name);

      const category = await this.categoryService.createCategory(name);

      res.status(HttpStatusCodes.CREATED).json(category);
    } catch (error) {
      next(error);
    }
  };

  public getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      console.log("Fetching categories for page:", page);

      const { categories, totalPages } =
        await this.categoryService.getCategories(page, limit);

      res.status(HttpStatusCodes.OK).json({
        categories,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  };



  public deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { _id } = req.body;
      console.log("hereeeeeee ===>", _id);

      await this.categoryService.deleteCategory(_id);

      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Category deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("Fetching all categories...");

      const response = await this.categoryService.getAllCategories();

      res.status(HttpStatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export default CategoryController;
