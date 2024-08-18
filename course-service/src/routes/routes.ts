import { Router } from "express";

import CategoryController from "../controllers/category.controller";

const router = Router()

const categoryController = new CategoryController()

router.post('/add_category', categoryController.addCategory)
router.get('/get_categories', categoryController.getCategories)

export default router