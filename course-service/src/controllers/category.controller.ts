import { Request, Response, NextFunction } from "express";

import { HttpStatusCodes } from "@envy-core/common";

class CategoryController {
  public addCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.status(HttpStatusCodes.CREATED).json("hello");
    } catch (error) {
      next(error);
    }
  };
}

export default CategoryController;
