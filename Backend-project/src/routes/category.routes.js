import express from "express";
import Category from "../models/category.model.js";
import ApiResponse from "../utils/apiResponse.js";
import cacheResponse from "../middleware/cache.middleware.js";

const router = express.Router();

router.get("/", cacheResponse(900), async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ displayOrder: 1, name: 1 });
        return ApiResponse.success(res, categories, "Categories fetched successfully.");
    } catch (err) {
        next(err);
    }
});

router.get("/:slug", cacheResponse(300), async (req, res, next) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug.toLowerCase(), isActive: true });
        if (!category) {
            return ApiResponse.error(res, "Category not found", 404);
        }
        return ApiResponse.success(res, category, "Category details fetched successfully.");
    } catch (err) {
        next(err);
    }
});

export default router;
